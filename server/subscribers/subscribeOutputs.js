const Redis = require("ioredis");
const { getSession } = require("../utils/sessionManager");


function subscribeOutputs() {
    const sub = new Redis({ host: "localhost", port: 6379 });

    sub.subscribe("ssh-events", (err, count) => {
        if (err) {
            console.error("❌ Failed to subscribe:", err);
        } else {
            console.log(`✅ Subscribed to ${count} channel(s): ssh-events`);
        }
    });

    sub.on("message", (channel, message) => {
        try {
            const { type, sessionId, data, error } = JSON.parse(message);
            const session = getSession(sessionId);

            if (session && session.ws) {
                session.ws.emit(type, { sessionId, data, error });
            }
        } catch (err) {
            console.error("❌ Error parsing message:", err);
        }
    });

    return sub;
}

module.exports = subscribeOutputs;
