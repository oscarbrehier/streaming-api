import { Request, Response } from "express";
import { createUploadMetadata } from "../../services/media/createUploadMetadata.js";
import { assembleChunks } from "../../services/media/assembleChunks.js";
import { getChunkPaths } from "../../services/media/paths.js";
import { moveChunk } from "../../services/media/moveChunk.js";
import fs from "fs/promises";
import redis from "../../config/redis.js";
import { addTranscodeJobToQueue } from "../../queues/mediaTranscoding/utils.js";

export async function uploadChunkController(req: Request, res: Response) {

	const { file, body: { uploadSessionId, totalChunks, currentChunk, originalFilename } } = req;

	if (!file) return res.status(400).json({ error: "File chunk missing." });
	if (currentChunk === 0 && !originalFilename) return res.status(400).json({ error: "Missing field `originalFilename` from first chunk" });
	if (!uploadSessionId) return res.status(400).json({ error: "File chunk missing `uploadSessionId` field" });

	const chunkIndex = Number(currentChunk);

	const { chunkPath, metadataPath } = getChunkPaths(uploadSessionId, chunkIndex);

	if (chunkIndex === 0) {

		try {

			await redis.hSet(`upload:${uploadSessionId}`, "originalFilename", originalFilename);

			await createUploadMetadata(metadataPath, {
				originalFilename,
				totalChunks
			});

		} catch (err) {
			console.error("Failed to write to metadata file:", err);
			return res.status(500).json({ error: "Failed to write upload metadata file." });
		};

	};

	let uploadedChunks = 0;

	try {

		await moveChunk(file.path, chunkPath);

		uploadedChunks = await redis.hIncrBy(`upload:${uploadSessionId}`, "uploadedChunks", 1);
		await redis.hSet(`upload:${uploadSessionId}`, "totalChunks", totalChunks);


	} catch (err) {
		console.error("Error moving chunk file:", err);
		res.status(500).json({ error: "Error uploading chunk." });
	};

	const percent = Math.min(100, (uploadedChunks / Number(totalChunks)) * 100);

	if (chunkIndex === Number(totalChunks)) {

		try {

			const metadata = await redis.hGetAll(`upload:${uploadSessionId}`);
			const filename = metadata.originalFilename;

			if (!filename) return res.status(500).json({ error: "Error reading metadata file." });

			await assembleChunks(filename, uploadSessionId, Number(totalChunks));
			addTranscodeJobToQueue(filename);

			await fs.unlink(metadataPath).catch(err => {
				console.error("Error deleting metadata file:", err);
			});

			await redis.del(`upload:${uploadSessionId}`);

			return res.json({ success: true });

		} catch (err) {

			console.error("Error assembling chunks:", err);
			return res.status(500).json({ error: "Error assembling chunks" });

		};

	};

	return res.json({ success: true, percent, chunk: currentChunk });

};