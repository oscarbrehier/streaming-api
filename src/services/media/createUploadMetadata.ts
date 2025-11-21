import fs from "fs";

export async function createUploadMetadata(metadataPath: string, data: Record<string, any>) {

	const jsonData = JSON.stringify(data, null, 2);
	await fs.promises.writeFile(metadataPath, jsonData, "utf-8");

};