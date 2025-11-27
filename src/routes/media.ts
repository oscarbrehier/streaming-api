import { Request, Response, Router } from "express";
import multer from "multer";
import path from "path";
import { uploadChunkController } from "../controllers/media/uploadChunk.controllers.js";
import { getQueueStatusController } from "../controllers/media/conversion/queueStatus.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { existsSync, mkdirSync } from "fs";

const router = Router();

const tmpDir = path.join(process.cwd(), "tmp");
if (!existsSync(tmpDir)) {
	mkdirSync(tmpDir, { recursive: true });
};

const chunkStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(tmpDir));
	},
	filename: (req, file, cb) => {
		cb(null, `temp-${Date.now()}-${Math.random()}`)
	}
});

const uploadChunk = multer({ storage: chunkStorage });

router.post("/upload/chunk", authMiddleware, uploadChunk.single("file"), uploadChunkController);
router.get("/queue/status", authMiddleware, getQueueStatusController);

router.use("/:id", (req: Request, res: Response) => {

	const { id: mediaId } = req.params;
	const requestedFile = req.path;

	if (!mediaId || !requestedFile) {

		return res.status(400).json({
			error: "Bad Request",
			message: "Media ID or file path is missing."
		});

	};

	const isM3U8 = requestedFile.endsWith('.m3u8');
	const isTS = requestedFile.endsWith('.ts');

	if (!isM3U8 && !isTS) {

		return res.status(415).json({
			error: "Unsupported Media Type",
		});

	};

	const filePath = path.join(process.cwd(), "media", mediaId, requestedFile);
	res.type(isM3U8 ? 'application/vnd.apple.mpegurl' : 'video/mp2t');

	res.sendFile(filePath, (err) => {

		if (err) {

			console.error(`File not found: ${filePath}`);

			res.status(404).json({
				error: "Not Found",
				message: "Media file not found."
			});

		};

	});

});

export default router;