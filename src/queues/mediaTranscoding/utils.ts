import path from "path";
import mediaTranscoding from "./index.js";

export function addTranscodeJobToQueue(originalFilename: string) {

	const sourceVideoPath = path.join(process.cwd(), "tmp", "uploads", originalFilename);
	const hlsOutputDirectory = path.join(process.cwd(), "media", originalFilename);

	mediaTranscoding.add({ inputPath: sourceVideoPath, outputPath: hlsOutputDirectory, originalFilename });

};

export async function retryTranscodeJob(jobId: string) {

	const job = await mediaTranscoding.getJob(jobId);

	if (!job) {
		throw new Error("Job not found");
	};

	if (job.finishedOn && !job.failedReason) {
		throw new Error("Job is already completed, cannot retry");
	};

	try {
		await job.retry();
	} catch (err) {
		throw new Error(`Job retry failed: ${err instanceof Error ? err.message : "Unknown reason"}`);
	};

};

export async function pauseMediaTranscodingQueue() {

	const isPaused = await mediaTranscoding.isPaused();

	if (isPaused) {
		throw new Error("Queue is already paused");
	};

	try {
		await mediaTranscoding.pause();
	} catch (err) {
		throw new Error(`Failed to pause queue: ${err instanceof Error ? err.message : "Unknown reason"}`);
	};

};

export async function resumeMediaTranscodingQueue() {

	const isPaused = await mediaTranscoding.isPaused();

	if (!isPaused) {
		throw new Error("Queue is not paused, cannot resume");
	};

	try {
		await mediaTranscoding.resume();
	} catch (err) {
		throw new Error(`Failed to resume queue: ${err instanceof Error ? err.message : "Unknown reason"}`);
	};

};

export async function removeMediaTranscodingJob(jobId: string) {

	const job = await mediaTranscoding.getJob(jobId);

	if (!job) {
		throw new Error("Job not found.");
	};

	const isActive = await job.isActive();

	if (job.finishedOn || !isActive) {
		throw new Error("Job is already completed or not active, cannot remove");
	};

	try {
		await job.remove();
	} catch (err) {
		throw new Error(`Failed to remove job: ${err instanceof Error ? err.message : "Unknown reason."}`);
	};

};