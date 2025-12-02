import { Request, Response } from "express";
import { getMediaEncodingProgress } from "../../../services/media/getEncodingProgress.js";
import { randomInt } from "crypto";

export function getEncodingProgressController(req: Request, res: Response) {

	const mediaId = req.params.id;

	if (!mediaId || !/^\d+$/.test(mediaId)) {

		return res.status(400).json({
			error: "Bad Request",
			message: "Invalid media ID format."
		});

	};

	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();

	console.log('Headers sent, connection established');

	res.write(`data: ${JSON.stringify({ connected: true })}\n\n`);

	const interval = setInterval(async () => {

		const encodingProgress = await getMediaEncodingProgress(mediaId);
		res.write(`data: ${JSON.stringify(encodingProgress)}\n\n`);

	}, 1000);

	req.on("close", () => {
		clearInterval(interval);
	});

};