import { Request, Response } from "express";
import { pauseMediaTranscodingQueue, resumeMediaTranscodingQueue } from "../../../queues/mediaTranscoding/utils.js";

export async function updateMediaTranscodingQueueController(req: Request, res: Response) {

	const { action } = req.body;

	if (!["pause", "resume"].includes(action)) {
		return res.status(400).json({
			error: "Bad Request",
			message: "Found invalid action in body. Use 'pause' or 'resume'."
		});
	};

	try {

		if (action === "resume") {
			await resumeMediaTranscodingQueue();
			return { state: "active" };
		}

		await pauseMediaTranscodingQueue();
		return { state: "paused" };

	} catch (err) {

		return res.status(500).json({
			error: "Internal Server Error",
			message: err instanceof Error ? err.message : `Could not ${action} media transcoding queue. Unknown error.`
		});

	};

};