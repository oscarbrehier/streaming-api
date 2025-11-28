import { User } from "@supabase/supabase-js"

export {}

declare global {
	namespace Express {
		export interface Request {
			user?: User;
		}
	}
}