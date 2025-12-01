import { JobStatus } from "bull";
import videoConversion from "../../queues/videoQueue.js"

export async function getQueueStatus() {

	const states = ['waiting', 'active', 'completed', 'failed', 'delayed'];

	const jobsByState = await Promise.all(

		states.map(async (state) => {

			const jobs = await videoConversion.getJobs([state as JobStatus]);
			return jobs.map(job => ({ ...job.toJSON(), status: state }));

		})
	);

	return jobsByState.flat();

};