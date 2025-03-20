import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { issuer } from "@openauthjs/openauth";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { MemoryStorage } from "@openauthjs/openauth/storage/memory";
import { CodeUI } from "@openauthjs/openauth/ui/code";
import type { Theme } from "@openauthjs/openauth/ui/theme";
import { handle } from "hono/aws-lambda";
import { Resource } from "sst";
import { subjects } from "./subjects";

const client = new SESv2Client();

async function getUser(email: string) {
	// Get user from database and return user ID
	return "123";
}

const theme: Theme = {
	title: "HedgeCo Admin Auth",
	primary: "#3280FF",
	background: "#FFFFFF",
	logo: "http://localhost:4321/public/hedgeco.svg",
	css: `
		img[data-component="logo"] {
			height: 8rem;
		}
	`,
};

const app = issuer({
	subjects,
	storage: MemoryStorage(),
	// Remove after setting custom domain
	allow: async () => true,
	theme: theme,
	providers: {
		code: CodeProvider(
			CodeUI({
				sendCode: async (email, code) => {
					console.log(email, code);
					await client.send(
						new SendEmailCommand({
							// biome-ignore lint/style/useNamingConvention: <explanation>
							FromEmailAddress: Resource["no-reply-email-service"].sender,
							// biome-ignore lint/style/useNamingConvention: <explanation>
							Destination: {
								// biome-ignore lint/style/useNamingConvention: <explanation>
								ToAddresses: [email.email],
							},
							// biome-ignore lint/style/useNamingConvention: <explanation>
							Content: {
								// biome-ignore lint/style/useNamingConvention: <explanation>
								Simple: {
									// biome-ignore lint/style/useNamingConvention: <explanation>
									Subject: { Data: "HedgeCo Admin Auth Code" },
									// biome-ignore lint/style/useNamingConvention: <explanation>
									Body: {
										// biome-ignore lint/style/useNamingConvention: <explanation>
										Text: { Data: `Login code from HedgeCo Admin: ${code}` },
									},
								},
							},
						}),
					);
				},
			}),
		),
	},
	success: async (ctx, value) => {
		if (value.provider === "code") {
			return ctx.subject("adminUser", {
				id: await getUser(value.claims.email),
			});
		}
		throw new Error("Invalid provider");
	},
});

export const handler = handle(app);
