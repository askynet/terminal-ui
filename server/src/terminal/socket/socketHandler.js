const { getRedis } = require("../../utils/redis.service");
const { enqueueSSHJob } = require("../queue/redisQueue");
const { bindSocket, unbindBySocket } = require("../session/sessionManager");

const pub = getRedis().redisPub;

const registerSocketHandlers = (socket) => {

    // Start SSH session
    socket.on("ssh-connect", async ({ sessionId, cols, rows, term, sshToken }) => {
        console.log("SSH connect requested:", sessionId);

        // bind mapping so gateway knows how to forward outputs
        await bindSocket(sessionId, socket);

        // enqueue job for worker
        const job = await enqueueSSHJob({
            sessionId,
            socketId: socket.id,
            cols,
            rows,
            term,
            sshToken,
        });
        console.log('SSH job enqueued', job?.id);

        // reply quickly
        socket.emit("queued", { sessionId });
    });

    // Forward raw input to worker
    socket.on("ssh-input", ({ sessionId, input }) => {
        pub.publish(`ssh-input.${sessionId}`, input);
    });

    // Resize events
    socket.on("ssh-resize", ({ sessionId, cols, rows }) => {
        pub.publish(`ssh-resize.${sessionId}`, JSON.stringify({ cols, rows }));
    });

    // Disconnect request
    socket.on("ssh-disconnect", async ({ sessionId }) => {
        console.log('SSH disconnect request', sessionId);
        pub.publish(`ssh-control.${sessionId}`, JSON.stringify({ action: "disconnect" }));
    });

    // Cleanup if socket disconnects
    socket.on("disconnect", async () => {
        console.log("Socket disconnected:", socket.id);
        await unbindBySocket(socket);
    });
};

module.exports = { registerSocketHandlers };