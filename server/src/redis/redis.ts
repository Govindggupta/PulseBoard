import { Redis } from "ioredis";
import { env } from "../env.js";

export const redis = new Redis(env.REDIS_URL);

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (error: Error) => {
  console.error("Redis error:", error);
});
