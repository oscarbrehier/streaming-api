import { mkdir } from "fs/promises";
import path from "path";

const requiredDirs = [
	path.join(process.cwd(), "tmp", "uploads"),
	path.join(process.cwd(), "tmp", "chunks"),
	path.join(process.cwd(), "media"),
];

export async function initializeDirectories() {

	for (const dir of requiredDirs) {

		try {
			await mkdir(dir, { recursive: true });
		} catch (err) {

			console.error(`Failed to create directory ${dir}:`, err);
			throw err;

		};

	};

};