import { subjects } from "@hedgeco/admin-auth";
import type { MiddlewareHandler } from "astro";
import { adminAuth, client, setTokens } from "./auth";

export const onRequest: MiddlewareHandler = async (context, next) => {
	const url = new URL(context.request.url);
	if (url.pathname.startsWith("/admin")) {
		const subject = await adminAuth(context.cookies);

		if (!subject) {
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
					// return "/";
					return next();
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
			return Response.redirect(url);
		}
	}

	return next();
};
