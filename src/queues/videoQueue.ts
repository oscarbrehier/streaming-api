import Queue from "bull";
import { transcodeVideoToAdaptiveHLS } from "../services/media/transcodeVideoToAdaptiveHLS.js";
import path from "path";

const videoConversion = new Queue("video-conversion", {
	redis: {
		host: '127.0.0.1',
		port: 6379,
	}
});

videoConversion.process(async (job) => {

	const { data: { inputPath, outputPath, originalFilename } } = job;
	if (!inputPath || !outputPath) {
		console.error("[conversion] Missing `inputPath` or `outputPath` from job data");
		throw new Error("Missing required paths");
	};

	const filename = originalFilename || path.basename(inputPath);
	const startTime = Date.now();

	try {

		await transcodeVideoToAdaptiveHLS(inputPath, outputPath);

		const duration = ((Date.now() - startTime) / 1000).toFixed(1);
		console.log(`[conversion] Completed: ${filename} (${duration}s)`);

	} catch (err) {
		console.error(`[conversion] Failed: ${filename}`, err);
		throw err;
	};

});

export default videoConversion;

export async function retryTranscodeJob(jobId: string) {

	const job = await videoConversion.getJob(jobId);

	if (!job) {
		throw new Error("Job not found.");
	};

	if (job.finishedOn && !job.failedReason) {
		throw new Error("Job is already completed, cannot retry.");
	};

	try {

		await job.retry();

	} catch (err) {

		throw new Error(`Job retry failed: ${err instanceof Error ? err.message : "Unknown reason."}`);

	};

};