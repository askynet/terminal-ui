const IORedis = require("ioredis");

const REDIS_HOST = process.env.REDIS_HOST || "redis";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const redis = new IORedis({ host: REDIS_HOST, port: REDIS_PORT });

// Key prefix for session map in Redis
const SESSION_MAP_KEY = "session_map";

// Bind sessionId <-> socketId
async function bind(sessionId, socketId) {
  await redis.hset(SESSION_MAP_KEY, sessionId, socketId);
}

// Unbind session by socketId
async function unbindBySocket(socketId) {
  const sessionMap = await redis.hgetall(SESSION_MAP_KEY);
  const sessionId = Object.entries(sessionMap).find(([sid, sIdValue]) => sIdValue === socketId)?.[0];
  if (sessionId) {
    await redis.hdel(SESSION_MAP_KEY, sessionId);
  }
}

// Get socketId for a sessionId
async function getSocketId(sessionId) {
  const socketId = await redis.hget(SESSION_MAP_KEY, sessionId);
  return socketId || null;
}

module.exports = { bind, unbindBySocket, getSocketId };
