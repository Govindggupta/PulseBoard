import { Redis } from "ioredis";
import { env } from "../env.js";

// Upstash requires TLS — ensure the URL uses rediss:// scheme
const redisUrl = env.REDIS_URL.replace(/^redis:\/\//, "rediss://");

export const redis = new Redis(redisUrl, {
  tls: {},
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    // Cap retries: wait min(exponential backoff, 3s), stop after 10 attempts
    if (times > 10) return null;
    return Math.min(times * 200, 3000);
  },
  lazyConnect: false,
});

// `ready` fires once after the connection is fully established (post-AUTH)
redis.on("ready", () => {
  console.log("Redis connected");
});

redis.on("error", (error: Error) => {
  console.error("Redis error:", error);
});
