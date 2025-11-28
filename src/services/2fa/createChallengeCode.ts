import { randomInt } from "crypto";
import { supabaseAdmin } from "../../utils/supabaseAdmin.js";
import { hashCode } from "./hashCode.js";

export async function createChallengeCode(userId: string) {

	try {

		const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
		const hashedCode = await hashCode(code);

		const expiresAt = new Date(Date.now() + (5 * 60 * 1000)).toISOString();

		await supabaseAdmin
			.from("twofa_challenges")
			.update({ consumed: true })
			.eq("user_id", userId)
			.eq("consumed", false);

		const { error } = await supabaseAdmin
			.from("twofa_challenges")
			.insert({
				user_id: userId,
				code_hash: hashedCode,
				expires_at: expiresAt,
				consumed: false				
			});

		if (error) {
			console.error(error);
			throw new Error("Challenge code generation failed.");
		};

		return code;

	} catch (err) {

		console.error(err);
		throw new Error("Challenge code generation failed.");

	};

};