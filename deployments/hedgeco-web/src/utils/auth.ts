import { subjects as adminSubjects } from "@hedgeco/admin-auth";
import { subjects as userSubjects } from "@hedgeco/user-auth";
import { createClient } from "@openauthjs/openauth/client";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { Resource } from "sst";

export const adminClient = createClient({
	// biome-ignore lint/style/useNamingConvention: defined by external package
	clientID: "hedgeco-web",
	issuer: Resource.AdminAuth.url,
});

export const userClient = createClient({
	// biome-ignore lint/style/useNamingConvention: defined by external package
	clientID: "hedgeco-web",
	issuer: Resource.UserAuth.url,
});

export function setAdminTokens(access: string, refresh: string) {
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

export function setUserTokens(access: string, refresh: string) {
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
	const accessToken = overrideTokens?.access ?? getCookie("admin_access_token");
	const refreshToken =
		overrideTokens?.refresh ?? getCookie("admin_refresh_token");

	if (!accessToken) {
		return false;
	}

	const verified = await adminClient.verify(
		adminSubjects,
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
		await setAdminTokens(verified.tokens.access, verified.tokens.refresh);
	}

	return verified.subject;
}

export async function userAuth(overrideTokens?: {
	access: string;
	refresh: string;
}) {
	const accessToken = overrideTokens?.access ?? getCookie("access_token");
	const refreshToken = overrideTokens?.refresh ?? getCookie("refresh_token");

	if (!accessToken) {
		return false;
	}

	const verified = await userClient.verify(
		userSubjects,
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
		await setUserTokens(verified.tokens.access, verified.tokens.refresh);
	}

	return verified.subject;
}
