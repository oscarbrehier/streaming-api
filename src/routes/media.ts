import { Router } from "express";
import { uploadMediaController } from "../controllers/media/upload.controllers.js";
import multer from "multer";
import path from "path";
import fs, { createReadStream } from "fs";
import { pipeline } from "stream/promises";
import pump from "pump";

const router = Router();

const CHUNK_DIR = "./chunks";

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(process.cwd(), "tmp", "uploads"))
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
		cb(null, (file.originalname.split(".")[0] ?? file.fieldname).replace(/ /g, "_") + '-' + uniqueSuffix + ".mp4");
	}
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("movie"), uploadMediaController);
router.post("/upload/chunk", upload.single("file"), (req, res) => {

	const { file, body: { totalChunks, currentChunk } } = req;

	if (!file) return res.status(400).json({ error: "File chunk missing." });

	const chunkFilename = `${file?.originalname}.${currentChunk}`;
	const chunkPath = path.join(process.cwd(), "tmp", "chunks");

	fs.rename(file.path, chunkPath, (err) => {

		if (err) {
			console.error("Error moving chunk file:", err);
			res.status(500).json({ error: "Error uploading chunk." });
		} else {

			if (+currentChunk === +totalChunks) {

				assembleChunks(file.originalname, totalChunks)
					.then(() => res.json({ success: true }))
					.catch((err) => {
						console.error("Error assembling chunks:", err);
						res.json({ error: "Error assembling chunks" }).status(500);
					})

			}

		};

	});

});

async function assembleChunks(filename, totalChunks) {

	const uploadPath = path.join(process.cwd(), "tmp", "uploads", filename);
	const writer = fs.createWriteStream(uploadPath);

	for (let i = 0; i <= totalChunks; i++) {

		const chunkPath = path.join(process.cwd(), "tmp", "chunks", `${filename}.${i}`);
		await pipeline(pump(fs.createReadStream(chunkPath)), pump(writer));
		fs.unlink(chunkPath, (err) => {

			if (err) {
				console.error("Error deleting chunk file:", err);
			}

		})

	};

};

export default router;