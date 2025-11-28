import { supabaseAdmin } from "../../utils/supabaseAdmin.js";

export async function getStatus(userId: string) {

	const { data, error } = await supabaseAdmin
		.from("twofa_sessions")
		.select(`
			id
		`)
		.eq("user_id", userId)
		.gte("expires_at", new Date().toISOString());
	
	if (error) throw new Error("Failed to find an active session for user.");

	return { required: !data || data.length === 0 };

};