import { createClient } from "redis";

const redis = createClient({
  url: "rediss://default:gQAAAAAAAbrYAAIgcDI4OTJiMGJmN2RiMWM0YjE5OTAyMjg3YzVkY2M0NThlNw@thorough-eagle-113368.upstash.io:6379",
});

redis.on("error", (err) => console.log("Redis Client Error", err));

await redis.connect();

export default redis;
