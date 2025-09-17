const { Client } = require("ssh2");

function connectSSH({ sessionId, socketId, cols, rows, term, onReady, onData, onError, onClose }) {
    const conn = new Client();

    conn.on("ready", () => {
        onReady();
        conn.shell({ term, cols, rows }, (err, stream) => {
            if (err) return onError(err);

            stream.on("data", (data) => onData(data.toString()));
            stream.on("close", () => {
                onClose();
                conn.end();
            });

            // listen for forwarded events from socket
            const io = require("../utils/sessionManager").getIO();
            io.to(sessionId).on("ssh-input-forward", ({ input }) => {
                stream.write(input);
            });
            io.to(sessionId).on("ssh-resize-forward", ({ cols, rows }) => {
                stream.setWindow(rows, cols);
            });
        });
    });

    conn.on("error", (err) => onError(err));
    conn.on("end", () => onClose());

    // TODO: replace with real SSH credentials (could come from DB or secrets)
    conn.connect({
        host: "127.0.0.1",
        port: 22,
        username: "testuser",
        password: "testpass",
    });
}

module.exports = { connectSSH };
