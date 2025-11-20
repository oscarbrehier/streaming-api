import path from "path";
import { existsSync, readdirSync } from "fs";
import { spawn } from "child_process";

export async function checkMediaFolders() {

	const mediaRoot = path.join(process.cwd(), "media");
	const files = readdirSync(mediaRoot);

	const checks = files.map((folder) => {

		return new Promise((resolve) => {

			const mediaPath = path.join(mediaRoot, folder);
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

	});

	const results = await Promise.all(checks);
	return results;

}