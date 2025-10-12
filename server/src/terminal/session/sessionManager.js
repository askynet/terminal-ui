const { getRedis } = require("../../utils/redis.service");

// Redis connection
const redis = getRedis().redisStore;

// In-memory socket store (per process)
const socketStore = new Map(); // socketId -> socket

/**
 * Bind a sessionId to a socket
 */
async function bindSocket(sessionId, socket) {
  const socketId = socket.id;
  socketStore.set(socketId, socket);
  await redis.hset("session_map", sessionId, socketId);
}

/**
 * Unbind a session by socket
 */
async function unbindBySocket(socket) {
  const socketId = socket.id;
  socketStore.delete(socketId);

  // remove sessionId from Redis
  const keys = await redis.hkeys("session_map");
  for (const sid of keys) {
    const val = await redis.hget("session_map", sid);
    if (val === socketId) {
      await redis.hdel("session_map", sid);
      break;
    }
  }
}

/**
 * Get session object (with ws = socket)
 */
async function getSession(sessionId) {
  const socketId = await redis.hget("session_map", sessionId);
  if (!socketId) return null;

  const socket = socketStore.get(socketId);
  if (!socket) return null;

  return { ws: socket, socketId, sessionId };
}

module.exports = {
  bindSocket,
  unbindBySocket,
  getSession,
};
