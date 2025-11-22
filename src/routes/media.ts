import { Router } from "express";
import multer from "multer";
import path from "path";
import { uploadChunkController } from "../controllers/media/uploadChunk.controllers.js";
import { getQueueStatusController } from "../controllers/media/conversion/queueStatus.controllers.js";

const router = Router();

const chunkStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(process.cwd(), "tmp"))
	},
	filename: (req, file, cb) => {
		cb(null, `temp-${Date.now()}-${Math.random()}`)
	}
});

const uploadChunk = multer({ storage: chunkStorage });

router.post("/upload/chunk", uploadChunk.single("file"), uploadChunkController);
router.get("/queue/status", getQueueStatusController);

export default router;