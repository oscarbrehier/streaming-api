import Queue from "bull";
import path from "path";
import { Resolution, transcodeHLSVariant } from "../../services/media/transcode.js";

const mediaTranscoding = new Queue("media-transcoding", {
	redis: {
		host: '127.0.0.1',
		port: 6379,
	}
});

mediaTranscoding.process(async (job) => {

	const { data: { inputPath, outputPath, originalFilename, resolution } } = job;
	if (!inputPath || !outputPath) {
		console.error(`[transcoding][${job.id}] Missing \`inputPath\` or \`outputPath\` from job data`);
		throw new Error("Missing required paths");
	};

	const filename = originalFilename || path.basename(inputPath);
	const startTime = Date.now();

	try {

		if (resolution) {

			await transcodeHLSVariant(inputPath, outputPath, resolution);
			const duration = ((Date.now() - startTime) / 1000).toFixed(1);
			console.log(`[transcoding][${job.id}] Completed ${resolution}: ${filename} (${duration}s)`);


		} else {

			const resolutions: Resolution[] = ["1080", "720", "480"];

			for (const res of resolutions) {

				await mediaTranscoding.add({
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
		console.error(`[transcoding][${job.id}] Failed: ${filename}`, err);
		throw err;
	};

});

export default mediaTranscoding;
export * from "./utils.js";