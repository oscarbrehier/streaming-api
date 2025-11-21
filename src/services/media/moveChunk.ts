import fs from "fs";

export function moveChunk(tempPath: string, chunkPath: string): Promise<void> {

	return new Promise((resolve, reject) => {
		
		fs.rename(tempPath, chunkPath, (err) => {
			if (err) return reject(err);
			resolve();
		});

	});

};