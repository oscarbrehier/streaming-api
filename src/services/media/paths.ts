import path from "path";

export function getChunkPaths(uploadSessionId: string, currentChunk: number) {

	const chunkFilename = `${uploadSessionId}.${currentChunk}`;
	const chunkPath = path.join(process.cwd(), "tmp", "chunks", chunkFilename);

	const metadataPath = path.join(process.cwd(), "tmp", "chunks", `${uploadSessionId}.meta.json`);

	return { chunkFilename, chunkPath, metadataPath };

};