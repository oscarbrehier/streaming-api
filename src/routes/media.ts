import { Request, Response, Router } from "express";
import multer from "multer";
import path from "path";
import { uploadChunkController } from "../controllers/media/uploadChunk.controllers.js";
import { getQueueStatusController } from "../controllers/media/conversion/queueStatus.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { existsSync, mkdirSync } from "fs";
import { streamMediaController } from "../controllers/media/stream.controllers.js";
import { getMediaEncodingProgress } from "../services/media/getEncodingProgress.js";

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

router.get("/:id/progress", authMiddleware, getMediaEncodingProgress);

router.use(/^\/([a-zA-Z0-9_-]+)\/(.+)$/, streamMediaController);

router.options(/^\/([a-zA-Z0-9_-]+)\/(.+)$/, (req: Request, res: Response) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Range');
	res.status(204).send();
});

export default router;