import { Router } from "express";
import multer from "multer";
import path from "path";
import { uploadChunkController } from "../controllers/media/uploadChunk.controllers.js";
import { getQueueStatusController } from "../controllers/media/conversion/queueStatus.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { existsSync, mkdirSync } from "fs";
import { retryTranscodeJobController } from "../controllers/media/conversion/retryJob.js";
import { getEncodingProgressController } from "../controllers/media/conversion/encodingProgress.controllers.js";

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
router.post("/queue/:id/retry", authMiddleware, retryTranscodeJobController);

router.get("/:id/progress", authMiddleware, getEncodingProgressController);

export default router;