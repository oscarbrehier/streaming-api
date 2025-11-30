import { OTPEmail } from "../../utils/email-templates/otp.js";
import { resend } from "../../utils/resend.js";

export async function sendChallengeEmail(email: string, code: string) {

	if (!email) return ;

	const { data, error } = await resend.emails.send({
		from: "Streaming <noreply@updates.eggspank.cloud>",
		to: [email],
		subject: "Your One-Time Password",
		html: OTPEmail(code),
	});

	if (error) {
		console.error(error);
		return ;
	}

	console.log(data)

};