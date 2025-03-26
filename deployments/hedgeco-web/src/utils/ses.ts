import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { Resource } from "sst";

export const sesClient = new SESv2Client();
export function sendEmail(to: string, subject: string, body: string) {
	return sesClient.send(
		new SendEmailCommand({
			//@ts-expect-error
			// biome-ignore lint/style/useNamingConvention: <explanation>
			FromEmailAddress: Resource["no-reply-email-service"].sender,
			// biome-ignore lint/style/useNamingConvention: <explanation>
			Destination: {
				// biome-ignore lint/style/useNamingConvention: <explanation>
				ToAddresses: [to],
			},
			// biome-ignore lint/style/useNamingConvention: <explanation>
			Content: {
				// biome-ignore lint/style/useNamingConvention: <explanation>
				Simple: {
					// biome-ignore lint/style/useNamingConvention: <explanation>
					Subject: { Data: subject },
					// biome-ignore lint/style/useNamingConvention: <explanation>
					Body: {
						// biome-ignore lint/style/useNamingConvention: <explanation>
						Text: { Data: body },
					},
				},
			},
		}),
	);
}
