const Redis = require("ioredis");

const redis = new Redis({
  host: "127.0.0.1",  // or use your cloud Redis endpoint
  port: 6379,         // default Redis port
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

module.exports = redis;
