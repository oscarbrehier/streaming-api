import { existsSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";

export async function getMediaEncodingProgress(mediaId: string): Promise<Record<string, any>> {

	if (!/^\d+$/.test(mediaId)) return {};

	const progressPath = path.join(process.cwd(), "media", mediaId, "progress.json");
	if (!existsSync(progressPath)) return {};

	try {

		const rawContent = await readFile(progressPath, "utf-8");
		const data = JSON.parse(rawContent);

		return data;

	} catch (err) {

		return {};

	};

};