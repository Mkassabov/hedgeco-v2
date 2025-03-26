import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import * as schema from "@hedgeco/hedgeco-database";
import { issuer } from "@openauthjs/openauth";
import {
	CodeProvider,
	type CodeProviderError,
} from "@openauthjs/openauth/provider/code";
import { CodeUI } from "@openauthjs/openauth/ui/code";
import type { Theme } from "@openauthjs/openauth/ui/theme";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { handle } from "hono/aws-lambda";
import { createConnection } from "mysql2/promise";
import { Resource } from "sst";
import { subjects } from "./subjects";
const connection = await createConnection({
	database: Resource.HedgecoDatabase.database,
	host: Resource.HedgecoDatabase.host,
	port: Resource.HedgecoDatabase.port,
	user: Resource.HedgecoDatabase.username,
	password: Resource.HedgecoDatabase.password,
});

const db = drizzle(connection, { schema, mode: "default" });

const client = new SESv2Client();

async function getUser(email: string) {
	// Get user from database and return user ID
	const user = await db.query.users.findFirst({
		where: eq(schema.users.email, email),
	});
	return user;
}

function assertClaimFormat(
	claims: Record<string, string>,
): claims is { email: string } {
	return typeof claims.email === "string";
}

const theme: Theme = {
	title: "HedgeCo",
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
	// biome-ignore lint/suspicious/useAwait: <explanation>
	allow: async (input, _req) => {
		const validClients = JSON.parse(process.env.validClients);
		const client = validClients[input.clientID];
		if (client == null) {
			return false;
		}
		const redirectUrl = new URL(input.redirectURI);
		const redirectHost = redirectUrl.hostname;

		if (client.includes(redirectHost)) {
			if (
				(redirectHost === "localhost" && redirectUrl.protocol !== "http:") ||
				(redirectHost !== "localhost" && redirectUrl.protocol !== "https:")
			) {
				return false;
			}
			return true;
		}
		return false;
	},
	theme: theme,
	providers: {
		code: CodeProvider(
			CodeUI({
				//@ts-expect-error //todo this type is just wrong? docs say it should be
				// (claims: Record<string, string>, code: string) => Promise<void | CodeProviderError>
				sendCode: async (claims, code) => {
					if (!assertClaimFormat(claims)) {
						throw new Error("Invalid claim format");
					}
					const user = await getUser(claims.email);
					if (!user) {
						return {
							type: "invalid_claim" as const,
							key: "email",
							value: claims.email,
						} satisfies CodeProviderError;
					}
					await client.send(
						new SendEmailCommand({
							// biome-ignore lint/style/useNamingConvention: <explanation>
							FromEmailAddress: Resource.NoReplyEmailService.sender,
							// biome-ignore lint/style/useNamingConvention: <explanation>
							Destination: {
								// biome-ignore lint/style/useNamingConvention: <explanation>
								ToAddresses: [claims.email],
							},
							// biome-ignore lint/style/useNamingConvention: <explanation>
							Content: {
								// biome-ignore lint/style/useNamingConvention: <explanation>
								Simple: {
									// biome-ignore lint/style/useNamingConvention: <explanation>
									Subject: { Data: "HedgeCo Auth Code" },
									// biome-ignore lint/style/useNamingConvention: <explanation>
									Body: {
										// biome-ignore lint/style/useNamingConvention: <explanation>
										Text: { Data: `Login code from HedgeCo: ${code}` },
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
		if (!assertClaimFormat(value.claims)) {
			throw new Error("Invalid claim format");
		}
		const user = await getUser(value.claims.email);
		if (!user) {
			//* we check the user id above, so this should only happen if
			//* the user is deleted between signing in and the success callback
			throw new Error("User not found");
		}
		if (value.provider === "code") {
			return ctx.subject(user.type, {
				id: user.id,
			});
		}
		throw new Error("Invalid provider");
	},
});

export const handler = handle(app);
