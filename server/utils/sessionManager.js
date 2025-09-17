const IORedis = require("ioredis");

const USE_REDIS = !!process.env.REDIS_HOST;
let redis;
if (USE_REDIS) {
    redis = new IORedis({ host: process.env.REDIS_HOST || "redis", port: process.env.REDIS_PORT || 6379 });
}

// in-memory fallback (works for single gateway instance)
const socketToSession = new Map(); // socketId -> sessionId
const sessionToSocket = new Map(); // sessionId -> socketId

async function bind(sessionId, socketId) {
    socketToSession.set(socketId, sessionId);
    sessionToSocket.set(sessionId, socketId);
    if (USE_REDIS) {
        await redis.hset("session_map", sessionId, socketId);
    }
}

async function unbindBySocket(socketId) {
    const sessionId = socketToSession.get(socketId);
    if (!sessionId) return;
    socketToSession.delete(socketId);
    sessionToSocket.delete(sessionId);
    if (USE_REDIS) {
        await redis.hdel("session_map", sessionId);
    }
}

async function getSocketId(sessionId) {
    if (sessionToSocket.has(sessionId)) return sessionToSocket.get(sessionId);
    if (USE_REDIS) {
        const sid = await redis.hget("session_map", sessionId);
        if (sid) return sid;
    }
    return null;
}

module.exports = { bind, unbindBySocket, getSocketId };
