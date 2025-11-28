import { Request, Response } from "express";
import { getStatus } from "../../services/2fa/getStatus.js";

export async function checkStatusController(request: Request, res: Response) {

	try {

		const twofa_status = await getStatus(request.user!.id);
		return res.status(200).json(twofa_status);

	} catch (err) {

		return res.status(500).json({
			error: "Internal Server Error",
			message: err instanceof Error ? err.message : "An unknown error occurred."
		});

	};

};