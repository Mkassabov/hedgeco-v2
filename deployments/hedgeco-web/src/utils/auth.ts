import { subjects } from "@hedgeco/admin-auth";
import { createClient } from "@openauthjs/openauth/client";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { Resource } from "sst";

export const client = createClient({
	// biome-ignore lint/style/useNamingConvention: defined by external package
	clientID: "hedgeco-web",
	issuer: Resource["admin-auth"].url,
});

export function setTokens(access: string, refresh: string) {
	setCookie("admin_access_token", access, {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		maxAge: 34560000,
	});
	setCookie("admin_refresh_token", refresh, {
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
	const accessToken = overrideTokens?.access ?? getCookie("admin_access_token");
	const refreshToken =
		overrideTokens?.refresh ?? getCookie("admin_refresh_token");

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
