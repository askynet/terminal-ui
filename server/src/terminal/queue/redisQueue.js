const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const REDIS_HOST = process.env.REDIS_HOST || "redis";
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const connection = new IORedis({ host: REDIS_HOST, port: REDIS_PORT });

const sshQueue = new Queue("ssh-jobs", {
  connection,
});

// Enqueue ssh connect job. job options set TTL to hard limit (30min default)
async function enqueueSSHJob(payload, opts = {}) {
  // sshQueue.clean(0, 1000, 'failed');
  const defaultOpts = {
    removeOnComplete: true,
    removeOnFail: true,
    // ttl in ms (hard limit) - default 30 minutes
    ttl: (process.env.SSH_JOB_TTL_MS && parseInt(process.env.SSH_JOB_TTL_MS)) || 30 * 60 * 1000,
  };
  return await sshQueue.add("ssh-connect", payload, Object.assign(defaultOpts, opts));
}

module.exports = { sshQueue, enqueueSSHJob, connection };
