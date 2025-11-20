import { Request, Response } from "express";

export async function uploadMediaController(req: Request, res: Response) {

	try {

		const file = req.file;
		console.log(file);

		return res.json({ success: "ok" }).status(200);

	} catch (err) {

		return res.json({ error: "Failed to upload media." }).status(500);

	};

};