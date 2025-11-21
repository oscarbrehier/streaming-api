import fs from "fs";
import path from "path";
import { assembleChunks } from "./assembleChunks.js";

export async function createUploadMetadata(metadataPath: string, data: Record<string, any>) {

	const jsonData = JSON.stringify(data, null, 2);
	await fs.promises.writeFile(metadataPath, jsonData, "utf-8");

};

export async function uploadChunk(
	file: Express.Multer.File,
	uploadSessionId: string,
	currentChunk: string,
	originalFilename: string,
	totalChunks: any,
) {

	const chunkFilename = `${uploadSessionId}.${currentChunk}`;
	const chunkPath = path.join(process.cwd(), "tmp", "chunks", chunkFilename);

	const metadataPath = path.join(process.cwd(), "tmp", "chunks", `${uploadSessionId}.meta.json`);

	if (+currentChunk === 0) {

		try {

			await createUploadMetadata(metadataPath, {
				originalFilename,
				totalChunks
			})

		} catch (err) {

			console.error("Failed to write to metadata file:", err);
			throw new Error("Failed to write upload metadata file.");

		};

	};

	fs.rename(file.path, chunkPath, (err) => {

		if (err) {

			console.error("Error moving chunk file:", err);
			throw new Error("Error uploading chunk.");

		} else {

			if (+currentChunk === +totalChunks) {

				assembleChunks(metadataPath, uploadSessionId, totalChunks)
					.catch((err) => {

						console.error("Error assembling chunks:", err);
						throw new Error("Error assembling chunks");

					})

			};

		};

	});

};