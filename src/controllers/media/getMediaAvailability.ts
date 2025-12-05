import { Request, Response } from "express";
import { checkMediaAvailability } from "../../services/media/checkMediaAvailability.js";

export async function getMediaAvailabilityController(req: Request, res: Response) {

	const { id } = req.params;

	if (!id) {
		return res.status(400).json({
			error: "Bad Request",
			message: "Required media ID param is missing."
		});
	};

	try {

		const available = await checkMediaAvailability(id);
		return res.status(200).json({ available });

	} catch (err) {

		return res.status(500).json({
			available: false,
			error: "Internal Server Error",
			message: "Failed to check media availability."
		});

	};

};