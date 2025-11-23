import { Request, Response } from "express";
import path from "path";

export async function getMediaController(req: Request, res: Response) {

	const mediaId = req.params.id;
	if (!mediaId) return res.status(400).json({ error: "Missing mediaId in request." });

	const mediaPath = path.join(process.cwd(), "media", mediaId, "master.m3u8");

	res.type("application/vnd.apple.mpegurl");
	res.sendFile(mediaPath);

};