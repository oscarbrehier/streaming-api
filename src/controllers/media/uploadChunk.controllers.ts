import { Request, Response } from "express";
import { createUploadMetadata } from "../../services/media/createUploadMetadata.js";
import { assembleChunks } from "../../services/media/assembleChunks.js";
import { getChunkPaths } from "../../services/media/paths.js";
import { moveChunk } from "../../services/media/moveChunk.js";
import videoConversion from "../../queues/videoQueue.js";
import path from "path";
import { enqueueVideoConversion } from "../../services/media/enqueueVideoConversion.js";
import fs from "fs/promises";

export async function uploadChunkController(req: Request, res: Response) {

	const { file, body: { uploadSessionId, totalChunks, currentChunk, originalFilename } } = req;

	if (!file) return res.status(400).json({ error: "File chunk missing." });
	if (currentChunk === 0 && !originalFilename) return res.status(400).json({ error: "Missing field `originalFilename` from first chunk" });
	if (!uploadSessionId) return res.status(400).json({ error: "File chunk missing `uploadSessionId` field" });

	const chunkIndex = Number(currentChunk);

	const { chunkPath, metadataPath } = getChunkPaths(uploadSessionId, chunkIndex);

	if (chunkIndex === 0) {

		try {

			await createUploadMetadata(metadataPath, {
				originalFilename,
				totalChunks
			});

		} catch (err) {
			console.error("Failed to write to metadata file:", err);
			return res.status(500).json({ error: "Failed to write upload metadata file." });
		};

	};

	try {

		await moveChunk(file.path, chunkPath);

	} catch (err) {
		console.error("Error moving chunk file:", err);
		res.status(500).json({ error: "Error uploading chunk." });
	};

	if (chunkIndex === Number(totalChunks)) {

		try {

			const metadataFile = await fs.readFile(metadataPath, "utf-8");
			const { originalFilename: filename } = JSON.parse(metadataFile);

			if (!filename) return res.status(500).json({ error: "Error reading metadata file." });

			await enqueueVideoConversion(filename, uploadSessionId);
			await assembleChunks(filename, uploadSessionId, Number(totalChunks));

			await fs.unlink(metadataPath).catch(err => {
				console.error("Error deleting metadata file:", err);
			});

			return res.json({ success: true });

		} catch (err) {

			console.error("Error assembling chunks:", err);
			return res.status(500).json({ error: "Error assembling chunks" });

		};

	};

	return res.json({ success: true, chunk: currentChunk });

};