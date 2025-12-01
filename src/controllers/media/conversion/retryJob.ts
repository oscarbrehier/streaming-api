import { Request, Response } from "express";
import { retryTranscodeJob } from "../../../queues/videoQueue.js";

export async function retryTranscodeJobController(req: Request, res: Response) {

	const jobId = req.params.id;

	if (!jobId) {
		return res.status(400).json({
			error: "Bad Request",
			message: "Invalid or missing job ID."
		});
	};

	try {

		await retryTranscodeJob(jobId);

	} catch (err) {

		return res.status(500).json({
			error: "Internal Server Error",
			message: err instanceof Error ? err.message : "Job retry failed for an unknown reason."
		});

	};

};