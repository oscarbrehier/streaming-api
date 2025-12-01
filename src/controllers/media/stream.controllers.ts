import { Request, Response } from "express";
import path from "path";
import { createReadStream } from "fs";
import fs from "fs/promises";

const ALLOWED_EXTENSIONS = new Set(['.m3u8', '.ts']);
const MEDIA_ROOT = path.join(process.cwd(), "media");

export async function streamMediaController(req: Request, res: Response) {

	const mediaId = req.params[0];
	const requestedFile = req.params[1];

	if (!mediaId || !/^[a-zA-Z0-9_-]+$/.test(mediaId)) {

		return res.status(400).json({
			error: "Bad Request",
			message: "Invalid media ID format."
		});

	};

	if (!requestedFile) {

		return res.status(400).json({
			error: "Bad Request",
			message: "File path is missing."
		});

	};

	const normalizedPath = path.normalize(requestedFile).replace(/^(\.\.[\/\\])+/, '').replace(/\\/g, '/');;
	if (normalizedPath !== requestedFile || requestedFile.includes('..')) {

		return res.status(403).json({
			error: "Forbidden",
			message: "Invalid file path"
		});

	};

	const fileExtension = path.extname(requestedFile).toLowerCase();
	if (!ALLOWED_EXTENSIONS.has(fileExtension)) {

		return res.status(415).json({
			error: "Unsupported Media Type",
			message: "Only .m3u8 or .ts files are allowed."
		});

	};

	const filePath = path.join(MEDIA_ROOT, mediaId, requestedFile);

	const resolvedPath = path.resolve(filePath);
	const resolvedMediaRoot = path.resolve(MEDIA_ROOT);
	if (!resolvedPath.startsWith(resolvedMediaRoot)) {

		return res.status(403).json({
			error: "Forbidden",
			message: "Access denied."
		});

	};

	try {

		const stats = await fs.stat(filePath);

		if (!stats.isFile()) {

			return res.status(404).json({
				error: "Not Found",
				message: "Media file not found."
			});

		};

		const isM3U8 = fileExtension === ".m3u8";
		res.setHeader('Content-Type', isM3U8 ? 'application/vnd.apple.mpegurl' : 'video/mp2t');
		res.setHeader('Content-Length', stats.size);

		if (isM3U8) {
			res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		} else {
			res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
		};

		const range = req.headers.range;

		if (range && !isM3U8) {

			const parts = range.replace(/bytes=/, "").split("-");

			if (!parts[0] || !parts[1]) {

				return res.status(400).json({
					error: "Bad Request",
					message: "Invalid range header"
				});

			};

			const start = parseInt(parts[0], 10);
			const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
			const chunkSize = (end - start) + 1;

			res.status(206);
			res.setHeader('Content-Range', `bytes ${start}-${end}/${stats.size}`);
			res.setHeader('Content-Length', chunkSize);
			res.setHeader('Accept-Ranges', 'bytes');

			const stream = createReadStream(filePath, { start, end });
			stream.pipe(res);

		} else {

			res.sendFile(filePath);

		};

	} catch (err: any) {

		if (err.code === 'ENOENT') {

			return res.status(404).json({
				error: "Not Found",
				message: "Media file not found."
			});

		}

		console.error(`Error serving file ${filePath}:`, err);

		if (!res.headersSent) {

			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to server media file."
			});

		};

	};

};