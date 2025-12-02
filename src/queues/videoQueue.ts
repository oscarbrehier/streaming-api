import Queue from "bull";
import path from "path";
import { Resolution, transcodeHLSVariant } from "../services/media/transcode.js";

const videoConversion = new Queue("video-conversion", {
	redis: {
		host: '127.0.0.1',
		port: 6379,
	}
});

videoConversion.process(async (job) => {

	const { data: { inputPath, outputPath, originalFilename, resolution } } = job;
	if (!inputPath || !outputPath) {
		console.error("[conversion] Missing `inputPath` or `outputPath` from job data");
		throw new Error("Missing required paths");
	};

	const filename = originalFilename || path.basename(inputPath);
	const startTime = Date.now();

	try {

		if (resolution) {

			await transcodeHLSVariant(inputPath, outputPath, resolution);
			const duration = ((Date.now() - startTime) / 1000).toFixed(1);
			console.log(`[conversion] Completed ${resolution}: ${filename} (${duration}s)`);


		} else {

			const resolutions: Resolution[] = ["1080", "720", "480"];

			for (const res of resolutions) {

				await videoConversion.add({
					inputPath,
					outputPath,
					originalFilename,
					resolution: res
				}, {
					jobId: `${job.id}_${res}`,
					priority: res == "720" ? 1 : 2
				});

			};

		};

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