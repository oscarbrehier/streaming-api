import { Request, Response } from "express";
import { getQueueStatus } from "../../../services/media/getQueueStatus.js";

export async function getQueue(req: Request, res: Response) {

	try {

		const result = await getQueueStatus();
		return res.status(200).json({ result });

	} catch (err) {

		return res.status(500).json({ error: "Failed to retrieve conversion queue status."})

	};

};