import { Request, Response } from "express";
import { getSystemInfo } from "../../services/health/getSystemInfo.js";

export async function sysInfoController(req: Request, res: Response) {

	try {

		const info = await getSystemInfo();
		return res.json({ results: info });

	} catch (err) {

		console.error("Error fetching system info:", err);
		return res.status(500).json({ error: "Failed to fetch system info" });

	};

};