import { createClient } from "redis";

const redis = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: Number(process.env.REDIS_PORT),
		family: 4,
		reconnectStrategy: (retries) => {
			if (retries > 10) return new Error("Redis connection failed");
			return Math.min(retries * 100, 3000);
		}
	}
});

redis.on("error", (err) => console.error("Redis Client Error,", err));

export default redis;