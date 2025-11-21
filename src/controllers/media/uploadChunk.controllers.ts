import { Request, Response } from "express";
import { createUploadMetadata } from "../../services/media/createUploadMetadata.js";
import { assembleChunks } from "../../services/media/assembleChunks.js";
import { getChunkPaths } from "../../services/media/paths.js";
import { moveChunk } from "../../services/media/moveChunk.js";

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

			await assembleChunks(metadataPath, uploadSessionId, Number(totalChunks));
			return res.json({ success: true });

		} catch (err) {

			console.error("Error assembling chunks:", err);
			return res.status(500).json({ error: "Error assembling chunks" });

		};

	};

	return res.json({ success: true, chunk: currentChunk });

};