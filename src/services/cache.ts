import redis from "../config/redis.js";

export async function getCache(key: string): Promise<{ data: any | null, isStale?: boolean }> {

	const res = await redis.get(key);
	if (!res) return { data: null };

	const cached = JSON.parse(res);

	const isStale = Date.now() > Date.parse(cached.expiresAt);

	return { data: cached.data, isStale };

};

// serving stale data during revalidation
export async function setToCache(key: string, data: any, ttlSeconds: number = 3 * 60 * 60) {

	const cachedObject = {
		data: data,
		expiresAt: new Date(Date.now() + ttlSeconds * 1000)
	};

	await redis.set(key, JSON.stringify(cachedObject), {
		EX: 86400
	});

};

export async function deleteFromCache(key: string) {
	await redis.del(key);
};

export async function deleteByPattern(pattern: string) {

	const keys = await redis.keys(pattern);
	if (keys.length > 0) {
		await redis.del(keys);
	};

};