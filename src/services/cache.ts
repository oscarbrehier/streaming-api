import redis from "../config/redis.js";

export async function getCache(key: string): Promise<{ data: any | null, isStale?: boolean }> {

	const res = await redis.get(key);
	if (!res) return { data: null };

	const cached = JSON.parse(res);

	const isStale = Date.now() > Date.parse(cached.expiresAt);

	return { data: cached.data, isStale };

};

// serving stale data during revalidation
export async function setToCache(key: string, data: any) {

	const cachedObject = {
		data: data,
		expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000)
	};

	await redis.set(key, JSON.stringify(cachedObject), {
		EX: 86400
	});

};