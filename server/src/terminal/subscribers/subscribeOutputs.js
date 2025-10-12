const { getRedis } = require("../../utils/redis.service");
const { getSession } = require("../session/sessionManager");

const subscribeOutputs = async () => {
    const sub = getRedis().redisSub;

    const count = await sub.psubscribe("ssh-event.*", "ssh-events.*", "ssh-output.*");
    console.log(`✅ Subscribed to ${count} channel(s)`);

    sub.on("pmessage", async (pattern, channel, message) => {
        try {
            const { type, sessionId, data, error } = JSON.parse(message);
            const session = await getSession(sessionId);
            if (session && session.ws) {
                session.ws.emit(type, { sessionId, data, error });
            }
        } catch (err) {
            console.error("❌ Error parsing message:", err);
        }
    });

    return sub;
}


module.exports = { subscribeOutputs };