import { createClient } from "@supabase/supabase-js";
import { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../utils/supabaseAdmin.js";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {

	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {

		return res.status(401).json({
			error: "Unauthorized",
			message: "Missing or invalid authorization header"
		});

	};

	const token = authHeader.split(" ")[1];

	try {

		const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
		
		if (error || !user) {

			return res.status(401).json({
				error: "Unauthorized",
				message: "Invalid or expired token"
			});

		};

		const supabaseUser = createClient(
			process.env.SUPABASE_URL!,
			process.env.SUPABASE_ANON_KEY!,
			{
				global: {
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			}
		);

		const { data: profile, error: profileError } = await supabaseUser
			.from("profiles")
			.select("role")
			.eq("id", user.id)
			.single();

		if (profileError || profile?.role !== "admin") {

			return res.status(403).json({
				error: "Forbidden",
				message: "Invalid user authorization"
			});

		};

		next();

	} catch (err) {

		console.log("Auth middleware error:", err);
		return res.status(500).json({
			error: "Internal Server Error",
			message: "Authentication failed"
		});

	};

};