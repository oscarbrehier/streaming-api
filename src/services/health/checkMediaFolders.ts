import path from "path";
import { existsSync, readdirSync } from "fs";
import { spawn } from "child_process";

export async function checkMediaFolders(root: string, dir: string) {

	const check = new Promise((resolve) => {

		const mediaPath = path.join(root, dir);
		const playlist = path.join(mediaPath, "master.m3u8");

		if (!existsSync(playlist)) return resolve(null);

		const ffmpeg = spawn("ffmpeg", [
			"-v", "error",
			"-i", playlist,
			"-f", "null", "-"
		]);

		let errors: string[] = []

		ffmpeg.stderr.on("data", (data) => {

			const str = data.toString();
			console.log(str);

			errors.push(str);

		});

		ffmpeg.on("close", (code) => {
			resolve({ playlist, errors, code });
		})

		ffmpeg.on("error", (err) => {
			console.log("FFMPEG Spawn error.", err);
			resolve({ playlist, errors: [String(err)], code: -1 });
		});

	});

	const results = await check;
	return results;

}