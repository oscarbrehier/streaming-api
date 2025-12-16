import { Request, Response } from "express";
import { requestContent } from "../../services/content/request.js";

export async function requestContentController(req: Request, res: Response) {

	const {
		mediaId,
		type,
		season,
		episode
	} = req.body;

	if (!mediaId || !type || (type === "tv" && (!season || !episode))) {

		return res.status(400).json({
			error: "Bad Request",
			message: "Missing or invalid parameters",
		});
		
	};

	try {

		const result = await requestContent(mediaId, type, season, episode);
		return res.status(200).json({ success: true, result });

	} catch (err) {

		return res.status(500).json({
			error: "Internal Server Error",
			message: err instanceof Error ? err.message : "An unknown error occurred."
		});

	};

};