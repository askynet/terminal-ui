/**
 * monitor.js
 * Monitor stalled SSH jobs and unreachable sockets
 */

const { Queue } = require("bullmq");
const { getRedis } = require("../../utils/redis.service");
const { sessions } = require("../workers/sshWorker");

const connection = getRedis().redisPub;
const sshQueue = new Queue("ssh-jobs", { connection });

// Time thresholds
const IDLE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

async function checkStalledJobs() {
    console.log("Checking stalled jobs...");

    // Get active jobs
    const activeJobs = await sshQueue.getJobs(["active"]);

    if (activeJobs.length === 0) {
        console.log("✅ No active/stalled jobs");
        return;
    }

    const now = Date.now();
    for (const job of activeJobs) {
        const lockDuration = job.opts.lockDuration || 15 * 60 * 1000;
        if (job.processedOn && now - job.processedOn > lockDuration) {
            console.log(`⚠️ Job ${job.id} (${job.data.sessionId}) may be stalled`);
            try {
                await job.remove();
            } catch (err) {
                console.error("Failed to remove job:", err);
            }
        }
    }
}

function checkSocketConnections() {
    console.log("Checking SSH sessions and socket reachability...");
    const now = Date.now();
    Object.entries(sessions).forEach(([sessionId, sess]) => {
        if (!sess.conn || !sess.stream) {
            console.log(`⚠️ Session ${sessionId} has no active connection`);
        } else if (sess.idleTimer && sess.idleTimer._idleStart + sess.idleTimer._idleTimeout < now) {
            console.log(`⚠️ Session ${sessionId} is idle for too long, cleaning up`, sess.idleTimer);
            // cleanup session
            // if (sess.stream) sess.stream.end();
            // if (sess.conn) sess.conn.end();
            // delete sessions[sessionId];
        } else if (!sess.ws || sess.ws.disconnected) {
            console.warn(`⚠️ Session ${sessionId} has dead socket`);
            if (sess.stream) sess.stream.end();
            if (sess.conn) sess.conn.end();
            if (sess.idleTimer) clearTimeout(sess.idleTimer);
            if (sess.ws && sess.ws.emit) {
                sess.ws.emit("ssh-close", { sessionId, reason: "socket disconnected" });
            }
            delete sessions[sessionId];
        }
    });
}

const trigger = async () => {
    await checkStalledJobs();
    checkSocketConnections();
}

async function monitorLoop() {
    try {
        trigger();
        setInterval(async () => {
            trigger();
        }, IDLE_THRESHOLD_MS);
    } catch (err) {
        console.error("Monitor error:", err);
    }
}

module.exports = { monitorLoop }
