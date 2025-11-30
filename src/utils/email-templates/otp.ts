export function OTPEmail(code: string) {

	return `
		<!DOCTYPE html>
		<html>

		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
		</head>

		<body
			style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
			<table role="presentation" style="width: 100%; border-collapse: collapse;">
				<tr>
					<td align="center" style="padding: 40px 0;">
						<table role="presentation"
							style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); overflow: hidden;">

							<tr>
								<td style="padding: 0;">
									<img src="https://image.tmdb.org/t/p/original/4fI4P0HK66mdaWNUPnDetj25zJb.jpg"
										alt="Streaming"
										style="width: 100%; height: auto; display: block; aspect-ratio: 1.78/1; object-fit: cover;" />
								</td>
							</tr>


							<!-- Body -->
							<tr>
								<td style="padding: 40px;">
									<p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #374151;">
										Here's your one-time password to sign in:
									</p>

									<div
										style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
										<div
											style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: 'Courier New', monospace;">
											${code}
										</div>
									</div>

									<p style="margin: 0 0 16px 0; font-size: 14px; line-height: 20px; color: #6b7280;">
										This code will expire in 5 minutes. If you didn't request this code, you can safely
										ignore this email.
									</p>

									<p style="margin: 0; font-size: 14px; line-height: 20px; color: #6b7280;">
										For security reasons, never share this code with anyone.
									</p>
								</td>
							</tr>

						</table>
					</td>
				</tr>
			</table>
		</body>

		</html>
	`

};