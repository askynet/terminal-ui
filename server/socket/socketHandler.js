const fs = require("fs");
const { enqueueSSHJob } = require("../queue/redisQueue");
const { bind, unbindBySocket } = require("../utils/sessionManager");
const IORedis = require("ioredis");

const pub = new IORedis({ host: process.env.REDIS_HOST || "redis", port: process.env.REDIS_PORT || 6379 });
// We'll publish inputs to channels: ssh-input.{sessionId}

function registerSocketHandlers(io, socket) {
    console.log("Socket connected:", socket.id);

    // Start new SSH session: enqueue a job
    socket.on("ssh-connect", async ({ sessionId, cols, rows, term, sshCreds }) => {
        // sshCreds { host, port, username, password, privateKey } - coming from frontend or server-side secrets
        // bind mapping so gateway knows how to forward outputs
        await bind(sessionId, socket.id);

        // enqueue job for worker
        await enqueueSSHJob({
            sessionId,
            socketId: socket.id,
            cols,
            rows,
            term,
            sshCreds,
        });

        // reply quickly
        socket.emit("queued", { sessionId });
    });

    // Forward raw input -> publish to per-session input channel
    socket.on("ssh-input", ({ sessionId, input }) => {
        // publish input so the worker that owns this session (if any) receives it
        pub.publish(`ssh-input.${sessionId}`, input);
    });

    // Resize: publish to worker
    socket.on("ssh-resize", ({ sessionId, cols, rows }) => {
        pub.publish(`ssh-resize.${sessionId}`, JSON.stringify({ cols, rows }));
    });

    socket.on("ssh-disconnect", async ({ sessionId }) => {
        // notify worker to close session (publish control)
        pub.publish(`ssh-control.${sessionId}`, JSON.stringify({ action: "disconnect" }));
        await unbindBySocket(socket.id);
    });

    socket.on("disconnect", async () => {
        // cleanup mapping if exists
        await unbindBySocket(socket.id);
        console.log("Socket disconnected:", socket.id);
    });
}

module.exports = registerSocketHandlers;
