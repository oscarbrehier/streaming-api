import fs from "fs/promises";
import { spawn } from "child_process";
import path from "path";

export async function convertToHLS(inputPath: string, outputDir: string): Promise<void> {

	await fs.mkdir(outputDir, { recursive: true });

	return new Promise((resolve, reject) => {

		const args = [
			'-i', inputPath,
			'-filter_complex', '[0:v]split=3[v1080][v720][v480];[v1080]scale=w=1920:h=1080[v1080out];[v720]scale=w=1280:h=720[v720out];[v480]scale=w=854:h=480[v480out]',
			'-map', '[v1080out]', '-c:v:0', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-g', '48', '-keyint_min', '48', '-sc_threshold', '0', '-b:v:0', '8000k', '-maxrate:v:0', '8560k', '-bufsize:v:0', '12000k',
			'-map', '[v720out]', '-c:v:1', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-g', '48', '-keyint_min', '48', '-sc_threshold', '0', '-b:v:1', '4000k', '-maxrate:v:1', '4280k', '-bufsize:v:1', '6000k',
			'-map', '[v480out]', '-c:v:2', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-g', '48', '-keyint_min', '48', '-sc_threshold', '0', '-b:v:2', '2000k', '-maxrate:v:2', '2140k', '-bufsize:v:2', '3000k',
			'-map', '0:a', '-map', '0:a', '-map', '0:a', '-c:a', 'aac', '-b:a', '192k',
			'-f', 'hls', '-hls_time', '10', '-hls_playlist_type', 'vod', '-hls_flags', 'independent_segments', '-hls_segment_type', 'mpegts',
			'-hls_segment_filename', path.join(outputDir, "stream_%v/data%03d.ts"),
			'-master_pl_name', 'master.m3u8',
			'-var_stream_map', 'v:0,a:0 v:1,a:1 v:2,a:2',
			path.join(outputDir, "stream_%v/playlist.m3u8")
		];

		const ffmpeg = spawn("ffmpeg", args);

		const progressFile = path.join(outputDir, "progress.json");
		let durationSeconds = 0;
		let stderrOutput = "";

		ffmpeg.stderr.on("data", async (data) => {

			const str = data.toString();
			stderrOutput += str;

			if (!durationSeconds) {

				const durMatch = str.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);

				if (durMatch) {
					const hours = parseInt(durMatch[1]);
					const minutes = parseInt(durMatch[2]);
					const seconds = parseFloat(durMatch[3]);
					durationSeconds = hours * 3600 + minutes * 60 + seconds;
				};

			};

			const timeMatch = str.match(/time=(\d+):(\d+):(\d+\.\d+)/);
			if (timeMatch && durationSeconds) {

				const h = parseInt(timeMatch[1]);
				const m = parseInt(timeMatch[2]);
				const s = parseFloat(timeMatch[3]);
				const currentSeconds = h * 3600 + m * 60 + s;
				const percent = Math.min(100, (currentSeconds / durationSeconds) * 100);

				try {

					await fs.writeFile(
						progressFile,
						JSON.stringify({
							percent: Math.round(percent * 100) / 100,
							currentSeconds,
							durationSeconds
						})
					);

				} catch (err) {
					console.error("Failed to write progress:", err);
				};

			};

		});

		ffmpeg.on("error", (err) => {
			console.error("FFmpeg spawn error:", err);
			reject(err);
		});

		ffmpeg.on("close", async (code) => {

			if (code === 0) {

				try {

					await fs.writeFile(progressFile, JSON.stringify({ percent: 100 }));

					const masterPlaylist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
stream_0/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720
stream_1/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=854x480
stream_2/playlist.m3u8`;

					await fs.writeFile(path.join(outputDir, "master.m3u8"), masterPlaylist);
					resolve();

				} catch (err) {
					reject(err);
				};

			} else {
				console.error("FFmpeg stderr output:", stderrOutput);
				reject(new Error(`FFmpeg failed with code ${code}`));
			};

		});

	});

};