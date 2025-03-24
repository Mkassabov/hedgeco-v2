import { subjects } from "@hedgeco/admin-auth";
import { createClient } from "@openauthjs/openauth/client";
import { createMiddleware } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";

export const client = createClient({
	// biome-ignore lint/style/useNamingConvention: defined by external package
	clientID: "hedgeco-web",
	issuer: import.meta.env.VITE_ADMIN_AUTH_URL,
});

export function setTokens(access: string, refresh: string) {
	setCookie("access_token", access, {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		maxAge: 34560000,
	});
	setCookie("refresh_token", refresh, {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		maxAge: 34560000,
	});
}

export async function adminAuth(overrideTokens?: {
	access: string;
	refresh: string;
}) {
	const accessToken = overrideTokens?.access ?? getCookie("access_token");
	const refreshToken = overrideTokens?.refresh ?? getCookie("refresh_token");

	if (!accessToken) {
		return false;
	}

	const verified = await client.verify(
		subjects,
		accessToken,
		refreshToken != null
			? {
					refresh: refreshToken,
				}
			: undefined,
	);

	if (verified.err) {
		return false;
	}
	if (verified.tokens) {
		await setTokens(verified.tokens.access, verified.tokens.refresh);
	}

	return verified.subject;
}

export const adminAuthMiddleware = createMiddleware().server(
	async ({ next }) => {
		const adminUser = await adminAuth();
		if (!adminUser) {
			throw new Response("Unauthorized", { status: 401 });
		}
		const result = await next();
		return result;
	},
);
