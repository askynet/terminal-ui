const Queue = require("bull");

const sshQueue = new Queue("sshQueue", {
  redis: { host: "redis", port: 6379 },
});

async function addSSHJob(data) {
  await sshQueue.add(data);
}

module.exports = { sshQueue, addSSHJob };
