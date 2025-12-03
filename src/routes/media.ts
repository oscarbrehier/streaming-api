import { Router } from "express";
import multer from "multer";
import path from "path";
import { uploadChunkController } from "../controllers/media/uploadChunk.controllers.js";
import { getQueueStatusController } from "../controllers/media/transcoding/queueStatus.controllers.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { existsSync, mkdirSync } from "fs";
import { retryTranscodeJobController } from "../controllers/media/transcoding/retryJob.js";
import { getEncodingProgressController } from "../controllers/media/transcoding/encodingProgress.controllers.js";
import { removeTranscodingJobController } from "../controllers/media/transcoding/removeJob.js";
import { updateMediaTranscodingQueueController } from "../controllers/media/transcoding/updateQueue.js";

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

router.get("/transcoding/status", authMiddleware, getQueueStatusController);
router.patch("/transcoding", authMiddleware, updateMediaTranscodingQueueController);

router.get("/transcoding/:id/progress", authMiddleware, getEncodingProgressController);
router.post("/transcoding/:id/retry", authMiddleware, retryTranscodeJobController);
router.delete("/transcoding/:id", authMiddleware, removeTranscodingJobController);

export default router;