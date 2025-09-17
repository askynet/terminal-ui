const { sshQueue } = require("../queue/redisQueue");
const { connectSSH } = require("../ssh/sshHandler");
const { getIO } = require("../utils/sessionManager");

sshQueue.process(async (job) => {
    const { socketId, sessionId, cols, rows, term } = job.data;
    const io = getIO();

    connectSSH({
        sessionId,
        socketId,
        cols,
        rows,
        term,
        onReady: () => io.to(socketId).emit("ssh-ready", { sessionId }),
        onData: (data) => io.to(socketId).emit("ssh-data", { sessionId, data }),
        onError: (error) =>
            io.to(socketId).emit("ssh-error", { sessionId, error: error.message }),
        onClose: () =>
            io.to(socketId).emit("ssh-close", { sessionId, message: "Connection closed" }),
    });
});
