import { Request, Response } from "express";
import { getCache, setToCache } from "../../services/cache.js";

export async function getCacheController(req: Request, res: Response) {

	const { key } = req.params;

	if (!key) return res.status(400).json({ error: "Key missing in URL" });

	try {

		const result = await getCache(key);

		if (!result || result.data === null) {
			return res.status(404).json({ message: "Cache miss" });
		};

		return res.status(200).json(result);

	} catch (err) {

		console.error("Failed to retrieve data from cache:", err);
		return res.status(500).json({ error: "Internal Server Error" });

	};

};

export async function setCacheController(req: Request, res: Response) {

	const { key, data } = req.body || {};

	if (!key || !data) return res.status(400).json({ error: "Key or Data missing in body" });

	try {
		await setToCache(key, data);
		return res.status(201).json({ success: true });
	} catch (err) {
		return res.status(500).json({ error: "Failed to store in cache" });
	};

};