import { Request, Response } from "express";
import { verifyCode } from "../../services/2fa/verifyCode.js";

export async function verifyChallengeController(req: Request, res: Response) {

	const { code } = req.body;
	const { id: userId } = req.user!;

	if (!code || code.length !== 6) {

		return res.status(400).json({
			error: "Bad Request",
			message: "Invalid code format"
		});

	};

	try {

		const verified = await verifyCode(userId, code);
		return res.status(200).json(verified);

	} catch (err) {

		return res.status(500).json({
			error: "Internal Server Error",
			message: err instanceof Error ? err.message : "An unknown error occurred."
		});

	};

};