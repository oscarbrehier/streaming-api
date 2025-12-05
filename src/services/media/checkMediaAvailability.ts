import path from "path"
import { mediaSrcPath } from "../../utils/paths.js"
import { access, readdir } from "fs/promises";

export async function checkMediaAvailability(mediaId: string): Promise<boolean> {

	try {

		const mediaPath = path.join(mediaSrcPath, mediaId);
		const masterPlaylist = path.join(mediaPath, "master.m3u8");

		await access(mediaPath);
		await access(masterPlaylist);

		const items = await readdir(mediaPath, { withFileTypes: true });

		if (items.some(item => item.isFile() && item.name.startsWith(".m3u8") && item.name !== "master.m3u8")) {
			return true;
		};

		const subFolderChecks = items
			.filter(item => item.isDirectory())
			.map(async dir => {
				const subFiles = await readdir(path.join(mediaPath, dir.name));
				return subFiles.some(f => f.endsWith(".m3u8"));
			});

		const results = await Promise.all(subFolderChecks);

		return results.some(Boolean);

	} catch (err) {

		return false;

	};

};