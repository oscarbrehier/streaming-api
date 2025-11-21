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

async function createUploadMetadata(metadataPath: string, uploadSessionId: string, data: Record<string, any>) {

	const jsonData = JSON.stringify(data, null, 2);
	await fs.promises.writeFile(metadataPath, jsonData, "utf-8");

};

router.post("/upload/chunk", upload.single("file"), async (req, res) => {

	const { file, body: { uploadSessionId, totalChunks, currentChunk, originalFilename } } = req;

	if (!file) return res.status(400).json({ error: "File chunk missing." });
	if (currentChunk === 0 && !originalFilename) return res.status(400).json({ error: "Missing field `originalFilename` from first chunk" });
	if (!uploadSessionId) return res.status(400).json({ error: "File chunk missing `uploadSessionId` field" });

	const chunkFilename = `${file?.originalname}.${currentChunk}`;
	const chunkPath = path.join(process.cwd(), "tmp", "chunks", chunkFilename);

	const metadataPath = path.join(process.cwd(), "tmp", "chunks", `${uploadSessionId}.meta.json`);

	if (+currentChunk === 0) {

		try {

			await createUploadMetadata(metadataPath, uploadSessionId, {
				originalFilename,
				totalChunks
			})

		} catch {

			console.error("Failed to write to metadata file:", err);
			return res.status(500).json({ error: "Failed to write upload metadata file." });

		};

	};

	fs.rename(file.path, chunkPath, (err) => {

		if (err) {
			console.error("Error moving chunk file:", err);
			res.status(500).json({ error: "Error uploading chunk." });
		} else {

			if (+currentChunk === +totalChunks) {

				assembleChunks(metadataPath, file.originalname, totalChunks)
					.then(() => res.json({ success: true }))
					.catch((err) => {
						console.error("Error assembling chunks:", err);
						res.json({ error: "Error assembling chunks" }).status(500);
					})

			} else {

				res.json({ success: true, chunk: currentChunk }).status(200);

			}

		};

	});

});

async function assembleChunks(metadataPath: string, filename: string, totalChunks: number) {

	const metadataFile = await fs.promises.readFile(metadataPath, "utf-8");
	const { originalFilename } = JSON.parse(metadataFile);

	const uploadPath = path.join(process.cwd(), "tmp", "uploads", originalFilename);
	const writer = fs.createWriteStream(uploadPath);

	for (let i = 0; i <= totalChunks; i++) {
		console.log("processing chunk:", i);

		const chunkPath = path.join(process.cwd(), "tmp", "chunks", `${filename}.${i}`);

		const reader = fs.createReadStream(chunkPath);
		await new Promise((resolve, reject) => {
			reader.pipe(writer, { end: false });
			reader.on('end', resolve);
			reader.on('error', reject);
		});

		await fs.promises.unlink(chunkPath).catch(err => {
			console.error("Error deleting chunk file:", err);
		});

	};

	writer.end();
}

export default router;