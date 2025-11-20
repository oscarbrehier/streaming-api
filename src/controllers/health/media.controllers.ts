import { Request, Response } from "express";
import { checkMediaFolders } from "../../services/health/checkMediaFolders.js";
import path from "path";
import { readdirSync } from "fs";

const mediaHealth = [
	{
		playlist: "/Users/alice/project/media/movie1/master.m3u8",
		errors: [],
		code: 0
	},
	{
		playlist: "/Users/alice/project/media/movie2/master.m3u8",
		errors: [
			"[NULL @ 0x558a3e4f8400] Opening 'movie2/master.m3u8' for reading",
			"playlist.m3u8: Invalid data found when processing input",         // e.g. missing EXT-X tags :contentReference[oaicite:0]{index=0}  
			"[h264 @ 0x558a3e62a800] Invalid NAL unit 5, skipping",             // from decoding issues :contentReference[oaicite:1]{index=1}  
			"[h264 @ 0x558a3e62a800] Error splitting the input into NAL units",// likewise :contentReference[oaicite:2]{index=2}  
			"Error while decoding stream #0:0: Invalid data found when processing input", // repeated pattern :contentReference[oaicite:3]{index=3}  
			"[aac @ 0x558a3e6c6800] Inconsistent channel configuration",       // audio‑side problem :contentReference[oaicite:4]{index=4}  
			"[aac @ 0x558a3e6c6800] Prediction is not allowed in AAC‑LC",      // more AAC error :contentReference[oaicite:5]{index=5}  
			"Error while decoding stream #0:1: Invalid data found when processing input" // audio error repeated :contentReference[oaicite:6]{index=6}  
		],
		code: 1
	},
	{
		playlist: "/Users/alice/project/media/movie3/master.m3u8",
		errors: [
			"[hls @ 0x558a3e4d6400] Error when loading first segment 'https://example.com/seg0.ts'",  // segment load failure :contentReference[oaicite:7]{index=7}  
			"https://example.com/seg0.ts: Invalid data found when processing input"                     // from ffmpeg :contentReference[oaicite:8]{index=8}  
		],
		code: -1094995529
	},
	{
		playlist: "/Users/alice/project/media/movie4/master.m3u8",
		errors: [
			"[aac_adtstoasc @ 0x558a3e6f6000] Input packet too small",                               // from someone’s segment parsing error :contentReference[oaicite:9]{index=9}  
			"[matroska @ 0x558a3e505f80] Error applying bitstream filters to an output packet for stream #1: Invalid data found when processing input", // mux error :contentReference[oaicite:10]{index=10}  
			"[out#0/matroska @ 0x558a3e4f5e00] Error muxing a packet",                                // repeated error in muxing :contentReference[oaicite:11]{index=11}  
			"[out#0/matroska @ 0x558a3e4f5e00] Task finished with error code: -1094995529 (Invalid data found when processing input)" // exit code from ffmpeg :contentReference[oaicite:12]{index=12}  
		],
		code: -1094995529
	},
	null, // e.g. a folder that had no `master.m3u8`
	{
		playlist: "/Users/alice/project/media/movie5/master.m3u8",
		errors: [
			"FFMPEG Spawn error. Error: spawn ffmpeg ENOENT"
		],
		code: -1
	},
	{
		playlist: "/Users/alice/project/media/movie1/master.m3u8",
		errors: [],
		code: 0
	},
	{
		playlist: "/Users/alice/project/media/movie2/master.m3u8",
		errors: [
			"[NULL @ 0x558a3e4f8400] Opening 'movie2/master.m3u8' for reading",
			"playlist.m3u8: Invalid data found when processing input",         // e.g. missing EXT-X tags :contentReference[oaicite:0]{index=0}  
			"[h264 @ 0x558a3e62a800] Invalid NAL unit 5, skipping",             // from decoding issues :contentReference[oaicite:1]{index=1}  
			"[h264 @ 0x558a3e62a800] Error splitting the input into NAL units",// likewise :contentReference[oaicite:2]{index=2}  
			"Error while decoding stream #0:0: Invalid data found when processing input", // repeated pattern :contentReference[oaicite:3]{index=3}  
			"[aac @ 0x558a3e6c6800] Inconsistent channel configuration",       // audio‑side problem :contentReference[oaicite:4]{index=4}  
			"[aac @ 0x558a3e6c6800] Prediction is not allowed in AAC‑LC",      // more AAC error :contentReference[oaicite:5]{index=5}  
			"Error while decoding stream #0:1: Invalid data found when processing input" // audio error repeated :contentReference[oaicite:6]{index=6}  
		],
		code: 1
	},
	{
		playlist: "/Users/alice/project/media/movie3/master.m3u8",
		errors: [
			"[hls @ 0x558a3e4d6400] Error when loading first segment 'https://example.com/seg0.ts'",  // segment load failure :contentReference[oaicite:7]{index=7}  
			"https://example.com/seg0.ts: Invalid data found when processing input"                     // from ffmpeg :contentReference[oaicite:8]{index=8}  
		],
		code: -1094995529
	},
	{
		playlist: "/Users/alice/project/media/movie4/master.m3u8",
		errors: [
			"[aac_adtstoasc @ 0x558a3e6f6000] Input packet too small",                               // from someone’s segment parsing error :contentReference[oaicite:9]{index=9}  
			"[matroska @ 0x558a3e505f80] Error applying bitstream filters to an output packet for stream #1: Invalid data found when processing input", // mux error :contentReference[oaicite:10]{index=10}  
			"[out#0/matroska @ 0x558a3e4f5e00] Error muxing a packet",                                // repeated error in muxing :contentReference[oaicite:11]{index=11}  
			"[out#0/matroska @ 0x558a3e4f5e00] Task finished with error code: -1094995529 (Invalid data found when processing input)" // exit code from ffmpeg :contentReference[oaicite:12]{index=12}  
		],
		code: -1094995529
	},
	null, // e.g. a folder that had no `master.m3u8`
	{
		playlist: "/Users/alice/project/media/movie5/master.m3u8",
		errors: [
			"FFMPEG Spawn error. Error: spawn ffmpeg ENOENT"
		],
		code: -1
	},
	{
		playlist: "/Users/alice/project/media/movie1/master.m3u8",
		errors: [],
		code: 0
	},
	{
		playlist: "/Users/alice/project/media/movie2/master.m3u8",
		errors: [
			"[NULL @ 0x558a3e4f8400] Opening 'movie2/master.m3u8' for reading",
			"playlist.m3u8: Invalid data found when processing input",         // e.g. missing EXT-X tags :contentReference[oaicite:0]{index=0}  
			"[h264 @ 0x558a3e62a800] Invalid NAL unit 5, skipping",             // from decoding issues :contentReference[oaicite:1]{index=1}  
			"[h264 @ 0x558a3e62a800] Error splitting the input into NAL units",// likewise :contentReference[oaicite:2]{index=2}  
			"Error while decoding stream #0:0: Invalid data found when processing input", // repeated pattern :contentReference[oaicite:3]{index=3}  
			"[aac @ 0x558a3e6c6800] Inconsistent channel configuration",       // audio‑side problem :contentReference[oaicite:4]{index=4}  
			"[aac @ 0x558a3e6c6800] Prediction is not allowed in AAC‑LC",      // more AAC error :contentReference[oaicite:5]{index=5}  
			"Error while decoding stream #0:1: Invalid data found when processing input" // audio error repeated :contentReference[oaicite:6]{index=6}  
		],
		code: 1
	},
	{
		playlist: "/Users/alice/project/media/movie3/master.m3u8",
		errors: [
			"[hls @ 0x558a3e4d6400] Error when loading first segment 'https://example.com/seg0.ts'",  // segment load failure :contentReference[oaicite:7]{index=7}  
			"https://example.com/seg0.ts: Invalid data found when processing input"                     // from ffmpeg :contentReference[oaicite:8]{index=8}  
		],
		code: -1094995529
	},
	{
		playlist: "/Users/alice/project/media/movie4/master.m3u8",
		errors: [
			"[aac_adtstoasc @ 0x558a3e6f6000] Input packet too small",                               // from someone’s segment parsing error :contentReference[oaicite:9]{index=9}  
			"[matroska @ 0x558a3e505f80] Error applying bitstream filters to an output packet for stream #1: Invalid data found when processing input", // mux error :contentReference[oaicite:10]{index=10}  
			"[out#0/matroska @ 0x558a3e4f5e00] Error muxing a packet",                                // repeated error in muxing :contentReference[oaicite:11]{index=11}  
			"[out#0/matroska @ 0x558a3e4f5e00] Task finished with error code: -1094995529 (Invalid data found when processing input)" // exit code from ffmpeg :contentReference[oaicite:12]{index=12}  
		],
		code: -1094995529
	},
	null, // e.g. a folder that had no `master.m3u8`
	{
		playlist: "/Users/alice/project/media/movie5/master.m3u8",
		errors: [
			"FFMPEG Spawn error. Error: spawn ffmpeg ENOENT"
		],
		code: -1
	}
];


export async function mediaCheckController(req: Request, res: Response) {

	res.setHeader('Content-Type', 'application/x-ndjson');
	res.setHeader("Transfer-Encoding", "chunked");

	try {
		const mediaRoot = path.join(process.cwd(), "media");
		const files = readdirSync(mediaRoot);

		for (const dir of files) {
			const result = await checkMediaFolders(mediaRoot, dir);

			const chunk = JSON.stringify(result) + "\n";

			if (!res.write(chunk)) {
				await new Promise<void>((resolve) => res.once("drain", resolve));
			};
		}

		res.end();

	} catch (err) {
		console.error("Error fetching media health:", err);
		res.status(500).json({ error: "Failed to fetch media health" });
	}

};