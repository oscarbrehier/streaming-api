import { Request, Response } from "express";
import { removeMediaTranscodingJob } from "../../../queues/mediaTranscoding/utils.js";

export async function removeTranscodingJobController(req: Request, res: Response) {

	const jobId = req.params.id;

	if (!jobId) {
		return res.status(400).json({
			error: "Bad Request",
			message: "Invalid or missing job ID."
		});
	};

	try {
		
		await removeMediaTranscodingJob(jobId);
		return { success: true };

	} catch (err) {

		return res.status(500).json({
			error: "Internal Server Error",
			message: err instanceof Error ? err.message : "Could not pause media transcoding queue. Error unknown."
		});

	};

};