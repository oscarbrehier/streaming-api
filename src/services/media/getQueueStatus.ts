import { JobStatus } from "bull";
import mediaTranscoding from "../../queues/mediaTranscoding/index.js"

export async function getQueueStatus() {

	const states = ['waiting', 'active', 'completed', 'failed', 'delayed'];

	const isPaused = await mediaTranscoding.isPaused();
	const counts = await mediaTranscoding.getJobCounts();

	const jobsByState = await Promise.all(

		states.map(async (state) => {

			const jobs = await mediaTranscoding.getJobs([state as JobStatus]);
			return jobs.map(job => ({ ...job.toJSON(), status: state }));

		})
	);

	return {
		state: isPaused ? "paused" : "active",
		counts,
		jobs: jobsByState.flat()
	};

};