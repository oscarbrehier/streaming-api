import fs from "fs/promises";
import { spawn } from "child_process";
import path from "path";

const variants = {
	"1080": { w: 1920, h: 1080, bandwidth: 4500000 },
	"720": { w: 1280, h: 720, bandwidth: 2500000 },
	"480": { w: 854, h: 480, bandwidth: 1200000 },
};

export type Resolution = keyof typeof variants;

export async function transcodeHLSVariant(
	inputPath: string,
	outputDir: string,
	resolution: Resolution
): Promise<void> {

	await fs.mkdir(outputDir, { recursive: true });

	const { w, h, bandwidth } = variants[resolution];
	const streamDir = path.join(outputDir, `stream_${resolution}`);
	await fs.mkdir(streamDir, { recursive: true });

	const progressFile = path.join(outputDir, "progress.json");

	return new Promise((resolve, reject) => {

		const args = [
			"-i", inputPath,

			"-vf", `scale=w=${w}:h=${h}:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2`,

			"-c:v", "libx264",
			"-preset", "fast",
			"-crf", "22",
			"-profile:v", "high",
			"-pix_fmt", "yuv420p",

			"-c:a", "aac",
			"-b:a", "128k",

			"-f", "hls",
			"-hls_time", "6",
			"-hls_playlist_type", "vod",
			"-hls_flags", "independent_segments",
			"-hls_segment_filename", path.join(streamDir, "data%03d.ts"),

			path.join(streamDir, "playlist.m3u8")
		];

		const ffmpeg = spawn("ffmpeg", args);

		let stderrOutput = "";
		let durationSeconds = 0;

		ffmpeg.stderr.on("data", async (data) => {

			const str = data.toString();
			stderrOutput += str;

			if (!durationSeconds) {

				const durMatch = str.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);

				if (durMatch) {

					const h = parseInt(durMatch[1]);
					const m = parseInt(durMatch[2]);
					const s = parseFloat(durMatch[3]);
					durationSeconds = h * 3600 + m * 60 + s;

				};

			};

			const timeMatch = str.match(/time=(\d+):(\d+):(\d+\.\d+)/);

			if (timeMatch && durationSeconds) {

				const h = parseInt(timeMatch[1]);
				const m = parseInt(timeMatch[2]);
				const s = parseFloat(timeMatch[3]);
				const elapsedSeconds = h * 3600 + m * 60 + s;
				const percent = Math.min(100, (elapsedSeconds / durationSeconds) * 100);

				const progress = {
					resolution,
					percent: Math.round(percent * 100) / 100,
					elapsedSeconds,
					durationSeconds,
					status: "working"
				};

				try {
					await fs.writeFile(progressFile, JSON.stringify(progress, null, 2));
				} catch (err) {
					console.error("Failed to write progress:", err);
				};

			};

		});

		ffmpeg.on("error", (err) => reject(err));

		ffmpeg.on("close", async (code) => {

			if (code === 0) {

				const finalProgress = {
					resolution,
					percent: 100,
					elapsedSeconds: durationSeconds,
					durationSeconds,
					status: "done"
				};

				await updateMasterPlaylist(outputDir, resolution, bandwidth);

				await fs.writeFile(progressFile, JSON.stringify(finalProgress, null, 2));
				resolve();

			} else {
				reject(new Error(`FFmpeg failed (${resolution}): ${stderrOutput}`));
			};

		});

	});

};

async function updateMasterPlaylist(
	outputDir: string,
	resolution: "1080" | "720" | "480",
	bandwidth: number
) {

	const masterPath = path.join(outputDir, "master.m3u8");
	let content = "";

	const variantTag = `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${variants[resolution].w}x${variants[resolution].h}`;
	const variantLine = `stream_${resolution}/playlist.m3u8`;

	try {
		content = await fs.readFile(masterPath, "utf8");
	} catch {
		content = "#EXTM3U\n";
	};

	let lines = content.split("\n").filter(Boolean);

	lines = lines.filter(
		(l) =>
			!l.includes(`stream_${resolution}/playlist.m3u8`) &&
			!l.includes(`RESOLUTION=${variants[resolution].w}x${variants[resolution].h}`)
	);

	lines.push(variantTag);
	lines.push(variantLine);

	const order: Resolution[] = ["1080", "720", "480"];

	lines = ["#EXTM3U", ...order.flatMap((res) => {

		const tag = `#EXT-X-STREAM-INF:BANDWIDTH=${variants[res].bandwidth},RESOLUTION=${variants[res].w}x${variants[res].h}`;
		const ref = `stream_${res}/playlist.m3u8`;

		return lines.includes(ref) ? [tag, ref] : [];

	})];

	await fs.writeFile(masterPath, lines.join("\n") + "\n", "utf8");

};