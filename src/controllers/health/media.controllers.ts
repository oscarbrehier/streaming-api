import { Request, Response } from "express";
import { checkMediaFolders } from "../../services/health/checkMediaFolders.js";

export async function mediaCheckController(req: Request, res: Response) {

	try {

		const result = await checkMediaFolders();
		return res.json({ result }).status(200);

	} catch (err) {

		console.error("Error fetch media health:", err)
		return res.json(500).json({ error: "Failed to fetch media health" });

	};

};