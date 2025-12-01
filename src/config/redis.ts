import { createClient } from "redis";

const redis = createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: Number(process.env.REDIS_PORT), 
	}
});

redis.on("error", (err) => console.error("Redis Client Error,", err));

await redis.connect();

export default redis;