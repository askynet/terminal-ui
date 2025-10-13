const { Worker } = require("bullmq");
const { Client } = require("ssh2");
const { readFileSync } = require("fs");
const { getRedis } = require("../../utils/redis.service");
const { decryptJson } = require("../terminal.controller");
const { isRestricted } = require("../../utils/common");
const path = require("path");
const Redis = require("ioredis");
const { keys } = require("lodash");

const rootDir = process.cwd();
const filePath = path.join(rootDir, 'keys/id_rsa.pem');

const pub = getRedis().redisPub;
const redisConfig = getRedis().options;

const IDLE_TIMEOUT_MS = Number(process.env.SSH_IDLE_TIMEOUT_MS || 10 * 60 * 1000);

// --- Session registry ---
const sessions = {}; // sessionId -> { conn, stream, idleTimer, jobId }
const commandBuffers = {}; // per-session input buffer

// --- Redis Subscribers ---
const inputSub = new Redis(redisConfig);
const resizeSub = new Redis(redisConfig);
const controlSub = new Redis(redisConfig);

// Subscribe to all session channels
(async () => {
    await inputSub.psubscribe("ssh-input.*");
    await resizeSub.psubscribe("ssh-resize.*");
    await controlSub.psubscribe("ssh-control.*");
})();

// --- Input routing ---
inputSub.on("pmessage", (pattern, channel, message) => {
    const sessionId = channel.split(".")[1];
    const sess = sessions[sessionId];
    if (!sess || !sess.stream) return;

    if (!commandBuffers[sessionId]) commandBuffers[sessionId] = '';

    if (message === '\u007F') {
        commandBuffers[sessionId] = commandBuffers[sessionId].slice(0, -1);
        sess.stream.write(message);
        return;
    }

    if (message === '\r' || message === '\n') {
        const fullCommand = commandBuffers[sessionId].trim();
        if (isRestricted(fullCommand)) {
            pub.publish(`ssh-event.${sessionId}`, JSON.stringify({ sessionId, type: "ssh-error", error: "Command not allowed" }));
        } else {
            sess.stream.write(message);
        }
        commandBuffers[sessionId] = '';
        resetIdleTimer(sessionId);
        return;
    }

    commandBuffers[sessionId] += message;
    sess.stream.write(message);
    resetIdleTimer(sessionId);
});

// --- Resize routing ---
resizeSub.on("pmessage", (pattern, channel, message) => {
    const sessionId = channel.split(".")[1];
    const sess = sessions[sessionId];
    if (!sess || !sess.stream) return;

    try {
        const { cols, rows } = JSON.parse(message);
        if (sess.stream.setWindow) sess.stream.setWindow(rows, cols);
    } catch (e) { }
});

// --- Control routing ---
controlSub.on("pmessage", (pattern, channel, message) => {
    const sessionId = channel.split(".")[1];
    const sess = sessions[sessionId];
    if (!sess) return;

    try {
        const ctl = JSON.parse(message);
        if (ctl.action === "disconnect") {
            if (sess.conn) sess.conn.end();
            pub.publish(`ssh-event.${sessionId}`, JSON.stringify({ sessionId, type: "ssh-close", reason: "client requested disconnect" }));
            cleanup(sessionId);
        }
    } catch (e) { }
});

// --- Cleanup session ---
function cleanup(sessionId) {
    const sess = sessions[sessionId];
    if (!sess) return;

    if (sess.stream) sess.stream.end();
    if (sess.conn) sess.conn.end();
    if (sess.idleTimer) clearTimeout(sess.idleTimer);

    delete sessions[sessionId];
    delete commandBuffers[sessionId];

    console.log(`Session ${sessionId} cleaned up`);
}

// --- Idle timer ---
function resetIdleTimer(sessionId) {
    const sess = sessions[sessionId];
    if (!sess) return;

    if (sess.idleTimer) clearTimeout(sess.idleTimer);

    sess.idleTimer = setTimeout(() => {
        pub.publish(`ssh-event.${sessionId}`, JSON.stringify({ sessionId, type: "ssh-timeout", reason: "idle" }));
        cleanup(sessionId);
    }, IDLE_TIMEOUT_MS);
}

// --- Start SSH Worker ---
function startSSHWorkers() {
    const worker = new Worker(
        "ssh-jobs",
        async (job) => {
            if (job.name !== "ssh-connect") return;

            console.log('SSH connect requested:', job.data.sessionId);

            const { sessionId, cols, rows, term, sshToken } = job.data;

            if (!sshToken) {
                pub.publish(`ssh-event.${sessionId}`, JSON.stringify({ sessionId, type: "ssh-error", error: "Invalid session" }));
                return;
            }

            const decrypted = decryptJson(sshToken);
            if (!decrypted) {
                pub.publish(`ssh-event.${sessionId}`, JSON.stringify({ sessionId, type: "ssh-error", error: "Failed to validate authentication" }));
                return;
            }

            const { username, password } = decrypted;
            const conn = new Client();

            return new Promise((resolve, reject) => {
                conn.on("ready", () => {
                    console.log('connection is ready');
                    // assign session AFTER ready
                    sessions[sessionId] = { conn, stream: null, idleTimer: null, jobId: job.id };
                    console.log('sessions', keys(sessions))
                    pub.publish(`ssh-event.${sessionId}`, JSON.stringify({ sessionId, type: "ssh-ready" }));

                    conn.shell({ term: term || "xterm-256color", cols: cols || 80, rows: rows || 24 }, (err, stream) => {
                        if (err) {
                            console.log('shel connection error');
                            pub.publish(`ssh-event.${sessionId}`, JSON.stringify({ sessionId, type: "ssh-error", error: err.message }));
                            cleanup(sessionId);
                            return reject(err);
                        }

                        const sess = sessions[sessionId];
                        sess.stream = stream;

                        stream.on("data", (chunk) => {
                            pub.publish(`ssh-output.${sessionId}`, JSON.stringify({ sessionId, type: "ssh-data", data: chunk.toString() }));
                            resetIdleTimer(sessionId);
                        });

                        stream.on("close", () => {
                            pub.publish(`ssh-event.${sessionId}`, JSON.stringify({ sessionId, type: "ssh-close" }));
                            cleanup(sessionId);
                            resolve();
                        });

                        resetIdleTimer(sessionId);
                    });
                })
                    .on("error", (err) => {
                        console.log('connection error', err)
                        pub.publish(`ssh-event.${sessionId}`, JSON.stringify({ sessionId, type: "ssh-error", error: err.message }));
                        cleanup(sessionId);
                        reject(err);
                    })
                    .connect({
                        host: process.env.SSH_HOST || "",
                        port: Number(process.env.SSH_PORT || 22),
                        username: 'ubuntu',
                        privateKey: readFileSync(filePath, "utf-8"),
                        readyTimeout: 20000,
                    });
            });
        },
        {
            connection: redisConfig,
            concurrency: Number(process.env.WORKER_CONCURRENCY || 5),
            lockDuration: 15 * 60 * 1000,
            maxStalledCount: 5,
            removeOnFail: { count: 0 },
            removeOnComplete: { age: 3600, count: 100 },
        }
    );

    worker.on("completed", (job) => {
        const sessionId = job.data.sessionId;
        if (sessionId) cleanup(sessionId);
    });

    worker.on("failed", (job, err) => {
        console.log("Worker failed:", job.data.sessionId, err?.message);
        const sessionId = job.data.sessionId;
        if (sessionId) cleanup(sessionId);
    });

    worker.on("error", (err) => console.error("Worker error:", err));

    console.log("SSH Worker started");
}

module.exports = { startSSHWorkers, sessions };