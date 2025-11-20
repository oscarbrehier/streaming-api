import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function uploadMedia(formData: FormData) {

	const chunk = formData.get("chunk") as Blob;
	const chunkIndex = parseInt(formData.get('chunkIndex') as string);
	const totalChunks = parseInt(formData.get('totalChunks') as string);
	const filename = formData.get('filename') as string;

	if (!chunk || !filename) return { error: "Missing chunk or filename" };

	const uploadDir = path.join(process.cwd(), "media", "temp");
	await mkdir(uploadDir, { recursive: true });

	const chunkPath = path.join(uploadDir, `${filename}.part${chunkIndex}`);
	const finalPath = path.join(process.cwd(), 'media', filename);

	const bytes = await chunk.arrayBuffer();
	await writeFile(chunkPath, Buffer.from(bytes));

};