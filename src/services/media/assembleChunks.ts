import fs from "fs";
import path from "path";

export async function assembleChunks(originalFilename: string, uploadSessionId: string, totalChunks: number) {

	try {

		const uploadPath = path.join(process.cwd(), "tmp", "uploads", originalFilename);
		const writer = fs.createWriteStream(uploadPath);

		for (let i = 0; i <= totalChunks; i++) {

			const chunkPath = path.join(process.cwd(), "tmp", "chunks", `${uploadSessionId}.${i}`);

			const reader = fs.createReadStream(chunkPath);
			await new Promise<void>((resolve, reject) => {
				reader.pipe(writer, { end: false });
				reader.on('end', resolve);
				reader.on('error', reject);
			});

			await fs.promises.unlink(chunkPath).catch(err => {
				console.error("Error deleting chunk file:", err);
			});


		};

		writer.end();

	} catch (err) {

		console.error("Error assembling chunks:", err);
		throw err;

	};

};