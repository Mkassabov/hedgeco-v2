import { subjects } from "@hedgeco/admin-auth";
import { createClient } from "@openauthjs/openauth/client";
import type { AstroCookies } from "astro";
import { Resource } from "sst";

const adminAuthUrl = Resource["admin-auth"].url;

export const client = createClient({
	// biome-ignore lint/style/useNamingConvention: defined by external package
	clientID: "hedgeco-web",
	issuer: adminAuthUrl,
});

export function setTokens(
	access: string,
	refresh: string,
	cookies: AstroCookies,
) {
	cookies.set("access_token", access, {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		maxAge: 34560000,
	});
	cookies.set("refresh_token", refresh, {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		maxAge: 34560000,
	});
}

export async function adminAuth(cookies: AstroCookies) {
	const accessToken = cookies.get("access_token");
	const refreshToken = cookies.get("refresh_token");

	if (!accessToken) {
		return false;
	}

	const verified = await client.verify(subjects, accessToken.value, {
		refresh: refreshToken?.value,
	});

	if (verified.err) {
		return false;
	}
	if (verified.tokens) {
		await setTokens(verified.tokens.access, verified.tokens.refresh, cookies);
	}

	return verified.subject;
}
