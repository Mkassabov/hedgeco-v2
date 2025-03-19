// export async function login(cookies: AstroCookies, headers: Headers) {
// 	const accessToken = cookies.get("access_token");
// 	const refreshToken = cookies.get("refresh_token");

// 	if (accessToken) {
// 		const verified = await client.verify(subjects, accessToken.value, {
// 			refresh: refreshToken?.value,
// 		});
// 		if (!verified.err && verified.tokens) {
// 			setTokens(verified.tokens.access, verified.tokens.refresh, cookies);
// 			return "/";
// 		}
// 	}
// 	const host = headers.get("host");
// 	const protocol = host?.includes("localhost") ? "http" : "https";
// 	const { url } = await client.authorize(
// 		`${protocol}://${host}/api/callback`,
// 		"code",
// 	);
// 	return url;
// }

// export function logout(cookies: AstroCookies) {
// 	cookies.delete("access_token");
// 	cookies.delete("refresh_token");

// 	return "/";
// }

import { defineAction } from "astro:actions";
import { setTokens, subjects } from "../auth";
import { client } from "../auth";

export const server = {
	login: defineAction({
		accept: "form",
		handler: async (_input, context) => {
			const accessToken = context.cookies.get("access_token");
			const refreshToken = context.cookies.get("refresh_token");

			if (accessToken) {
				const verified = await client.verify(subjects, accessToken.value, {
					refresh: refreshToken?.value,
				});

				if (!verified.err && verified.tokens) {
					setTokens(
						verified.tokens.access,
						verified.tokens.refresh,
						context.cookies,
					);
					return "/";
				}
			}
			const host = context.request.headers.get("host");
			const protocol =
				host?.includes("localhost") || host?.includes("127.0.0.1")
					? "http"
					: "https";
			const { url } = await client.authorize(
				`${protocol}://${host}/api/callback`,
				"code",
			);
			return url;
		},
	}),
	logout: defineAction({
		accept: "form",
		handler: (_input, context) => {
			context.cookies.delete("access_token");
			context.cookies.delete("refresh_token");
			return "/";
		},
	}),
};
