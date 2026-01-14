import { NextFunction, Request, Response } from "express";

export async function internalAuth(req: Request, res: Response, next: NextFunction) {

	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Unauthorized", message: "Bearer token required" });
	};

	const key = authHeader.split(" ")[1];

	if (key !== process.env.INTERNAL_API_KEY) {
		return res.status(401).json({ error: "Unauthorized", message: "Invalid internal key" });
	}

	next();

};