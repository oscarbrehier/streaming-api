import Queue from "bull";
import { convertToHLS } from "../services/media/convertToHLS.js";

const videoConversion = new Queue("video-conversion", {
	redis: {
		host: '127.0.0.1',
		port: 6379,
	}
});

videoConversion.process(async (job) => {

	console.log(`Processing job with ID: ${job.id} and data:`, job.data);

	const { data } = job;
	if (!data.inputPath || !data.outputPath) {

		console.error("Missing `inputPath` or `outputPath` from data.");
		return ;

	}

	await convertToHLS(data.inputPath, data.outputPath);

	console.log(`Conversion of file: ${data.inputPath} finished. Location: ${data.outputPath}`);

	return `Processed data: ${job.data}`;

});

export default videoConversion;