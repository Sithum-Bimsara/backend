import IORedis from "ioredis";

export const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const redisConnection = new IORedis(redisConfig);

redisConnection.on("error", (err) => {
  console.warn("[Redis Warning] Connection failed, offline features active:", err.message);
});

export const redis = redisConnection;
