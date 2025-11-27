import path from "path";
import videoConversion from "../../queues/videoQueue.js";

export function enqueueVideoConversion(originalFilename: string) {

	const sourceVideoPath = path.join(process.cwd(), "tmp", "uploads", originalFilename);
	const hlsOutputDirectory = path.join(process.cwd(), "media", originalFilename);

	videoConversion.add({ inputPath: sourceVideoPath, outputPath: hlsOutputDirectory, originalFilename });

};