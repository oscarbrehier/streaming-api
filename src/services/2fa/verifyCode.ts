import { supabaseAdmin } from "../../utils/supabaseAdmin.js";
import bcrypt from "bcrypt";

export async function verifyCode(userId: string, code: string) {

	const { error, data } = await supabaseAdmin
		.from("twofa_challenges")
		.select(`
			id,
			code_hash	
		`)
		.eq("user_id", userId)
		.eq("consumed", false)
		.gte("expires_at", new Date().toISOString());

	if (error) throw new Error("Error fetching 2fa challenges");
	if (!data || data.length === 0) return { verified: false };

	for (const challenge of data) {

		const match = await bcrypt.compare(code, challenge.code_hash);
		
		if (match) {

			await supabaseAdmin
				.from("twofa_challenges")
				.update({ consumed: true })
				.eq("id", challenge.id);

			const sessionExpires = new Date(Date.now() + (24 * 60 * 60 * 1000));

			const { error: sessionError } = await supabaseAdmin
				.from("twofa_sessions")
				.insert({
					user_id: userId,
					session_id: crypto.randomUUID(),
					verified_at: new Date().toISOString(),
					expires_at: sessionExpires.toISOString()
				});

			if (sessionError) throw new Error("Failed to create 2FA session");

			return { verified: true };
 
		};

	};

	return { verified: false }; 

};