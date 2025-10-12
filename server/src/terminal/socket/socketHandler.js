const { getRedis } = require("../../utils/redis.service");
const { enqueueSSHJob } = require("../queue/redisQueue");
const { unbindBySocket, bindSocket } = require("../session/sessionManager");

const pub = getRedis().redisPub;
const sub = getRedis().redisSub;
// We'll publish inputs to channels: ssh-input.{sessionId}

const registerSocketHandlers = (socket) => {
    // Start new SSH session: enqueue a job
    socket.on("ssh-connect", async ({ sessionId, cols, rows, term, sshToken }) => {
        // bind mapping so gateway knows how to forward outputs
        await bindSocket(sessionId, socket);

        // enqueue job for worker
        await enqueueSSHJob({
            sessionId,
            socketId: socket.id,
            cols,
            rows,
            term,
            sshToken,
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
        const inputChannel = `ssh-input.${sessionId}`;
        const resizeChannel = `ssh-resize.${sessionId}`;
        const controlChannel = `ssh-control.${sessionId}`;
        // const count = await sub.unsubscribe(inputChannel, resizeChannel, controlChannel);
        // console.log(`session ${sessionId} unsubscribed to ${count} channels`)
        await unbindBySocket(socket);
    });

    socket.on("disconnect", async () => {
        // cleanup mapping if exists
        await unbindBySocket(socket);
    });
}


module.exports = { registerSocketHandlers };