const IORedis = require("ioredis");

let redisStore;
let redisPub;
let redisSub;
function getRedis() {
    const options = {
        host: process.env.REDIS_HOST,
        port: +process.env.REDIS_PORT,
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASS,
        connectTimeout: 10000
    };

    if (!redisStore) {
        redisStore = new IORedis(options);

        redisStore.on("connect", () => {
            console.log("✅ Connected to Store Redis");
        });

        redisStore.on("error", (err) => {
            console.error("❌ Redis error:", err);
        });
    }

    if (!redisPub) {
        redisPub = new IORedis(options);

        redisPub.on("connect", () => {
            console.log("✅ Connected to Pub Redis");
        });

        redisPub.on("error", (err) => {
            console.error("❌ Redis error:", err);
        });
    }

    if (!redisSub) {
        redisSub = new IORedis(options);

        redisSub.on("connect", () => {
            console.log("✅ Connected to Sub Redis");
        });

        redisSub.on("error", (err) => {
            console.error("❌ Redis error:", err);
        });
    }
    return { redisStore, redisPub, redisSub, options };
}


module.exports = { getRedis };