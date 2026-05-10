// import Redis from "ioredis";

// function createRedisConnection() {
//   return new Redis({
//     host: "localhost",
//     port: 6379,
//   });
// }

// export const publisher = createRedisConnection();
// export const subscriber = createRedisConnection();

import Redis from "ioredis";

function createRedisConnection() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  return new Redis(redisUrl);
}

export const publisher = createRedisConnection();
export const subscriber = createRedisConnection();
