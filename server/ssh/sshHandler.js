const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { Client } = require("ssh2");

const REDIS_HOST = process.env.REDIS_HOST || "redis";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const pub = new IORedis({ host: REDIS_HOST, port: REDIS_PORT }); // publishing outputs
const sub = new IORedis({ host: REDIS_HOST, port: REDIS_PORT }); // subscribe to per-session input

// mapping: sessionId -> { conn, stream, idleTimer, inputChannel }
const sessions = Object.create(null);
const IDLE_TIMEOUT_MS = Number(process.env.SSH_IDLE_TIMEOUT_MS || 10 * 60 * 1000); // 10 min idle by default

const worker = new Worker(
    "ssh-jobs",
    async (job) => {
        if (job.name !== "ssh-connect") return;
        const { sessionId, cols, rows, term, sshCreds } = job.data;

        // create SSH connection
        const conn = new Client();

        // set up input subscriber for this session
        const inputChannel = `ssh-input.${sessionId}`;
        const resizeChannel = `ssh-resize.${sessionId}`;
        const controlChannel = `ssh-control.${sessionId}`;

        // Keep track
        sessions[sessionId] = { conn: null, stream: null, idleTimer: null, channels: { inputChannel, resizeChannel, controlChannel } };

        // helper to cleanup
        function cleanup() {
            try {
                if (sessions[sessionId].stream) sessions[sessionId].stream.end();
            } catch (e) { }
            try {
                if (sessions[sessionId].conn) sessions[sessionId].conn.end();
            } catch (e) { }
            // unsubscribe channels for this session
            sub.unsubscribe(inputChannel).catch(() => { });
            sub.unsubscribe(resizeChannel).catch(() => { });
            sub.unsubscribe(controlChannel).catch(() => { });
            clearIdleTimer();
            delete sessions[sessionId];
        }

        function publishOutput(msg) {
            // publish raw output to channel ssh-output.{sessionId}
            pub.publish(`ssh-output.${sessionId}`, msg);
        }

        function publishEvent(type, payload = {}) {
            const ev = Object.assign({ type, sessionId }, payload);
            pub.publish(`ssh-event.${sessionId}`, JSON.stringify(ev));
        }

        function resetIdleTimer() {
            if (sessions[sessionId].idleTimer) clearTimeout(sessions[sessionId].idleTimer);
            sessions[sessionId].idleTimer = setTimeout(() => {
                publishEvent("ssh-timeout", { reason: "idle" });
                cleanup();
            }, IDLE_TIMEOUT_MS);
        }

        // subscribe to inputs/control/resizes
        await sub.subscribe(inputChannel);
        await sub.subscribe(resizeChannel);
        await sub.subscribe(controlChannel);

        const messageHandler = async (channel, message) => {
            if (channel === inputChannel) {
                // write to stream
                if (sessions[sessionId].stream) {
                    sessions[sessionId].stream.write(message);
                    resetIdleTimer();
                }
            } else if (channel === resizeChannel) {
                // message is JSON { cols, rows }
                try {
                    const { cols, rows } = JSON.parse(message);
                    if (sessions[sessionId].stream && typeof sessions[sessionId].stream.setWindow === "function") {
                        sessions[sessionId].stream.setWindow(rows, cols);
                    }
                } catch (e) { }
            } else if (channel === controlChannel) {
                try {
                    const ctl = JSON.parse(message);
                    if (ctl.action === "disconnect") {
                        publishEvent("ssh-close", { reason: "client requested disconnect" });
                        cleanup();
                    }
                } catch (e) { }
            }
        };

        sub.on("message", messageHandler);

        // make SSH connection
        return new Promise((resolve, reject) => {
            conn
                .on("ready", () => {
                    publishEvent("ssh-ready");
                    conn.shell({ term: term || "xterm-256color", cols: cols || 80, rows: rows || 24 }, (err, stream) => {
                        if (err) {
                            publishEvent("ssh-error", { error: err.message });
                            cleanup();
                            return reject(err);
                        }
                        sessions[sessionId].conn = conn;
                        sessions[sessionId].stream = stream;

                        stream.on("data", (chunk) => {
                            publishOutput(chunk.toString()); // forward to gateway
                            resetIdleTimer();
                        });

                        stream.on("close", () => {
                            publishEvent("ssh-close", {});
                            cleanup();
                            resolve();
                        });

                        // initialize idle timer
                        resetIdleTimer();
                    });
                })
                .on("error", (err) => {
                    publishEvent("ssh-error", { error: err.message });
                    cleanup();
                    reject(err);
                })
                .on("end", () => {
                    publishEvent("ssh-close", {});
                    cleanup();
                    resolve();
                })
                .connect({
                    host: sshCreds.host || "",
                    port: sshCreds.port || 22,
                    username: sshCreds.username,
                    password: sshCreds.password,
                    privateKey: sshCreds.privateKey,
                    readyTimeout: 20000,
                });

            // if the job itself is removed or failed due to TTL, worker 'failed' event handler will run
            job.on("failed", (err) => {
                publishEvent("ssh-timeout", { reason: "job ttl expired", error: err?.message });
                cleanup();
                reject(err);
            });
        });
    },
    {
        connection: { host: REDIS_HOST, port: REDIS_PORT },
        concurrency: Number(process.env.WORKER_CONCURRENCY || 5),
    }
);

// Clean up listening
// We used a shared subscriber and pub client. We leave them open for worker lifetime.

worker.on("error", (err) => console.error("Worker error:", err));
worker.on("failed", (job, err) => {
    console.warn("Job failed:", job.id, err?.message);
});
worker.on("completed", () => {
    // Job finished
});

console.log("SSH Worker started");
