import { Request, Response } from "express";
import { createChallengeCode } from "../../services/2fa/createChallengeCode.js";

export async function createChanllengeController(request: Request, res: Response) {

	try {

		const code = await createChallengeCode(request.user!.id);

		return res.status(200).json({
			send: true
		});

	} catch (err) {

		return res.status(500).json({
			error: "Internal Server Error",
			message: err instanceof Error ? err.message : "An unknown error occurred"
		});

	};

};