import type { MiddlewareHandler } from "astro";
import { auth } from "./auth";

export const onRequest: MiddlewareHandler = async (context, next) => {
	const url = new URL(context.request.url);
	if (url.pathname.startsWith("/admin")) {
		const subject = await auth(context.cookies);
		if (!subject && url.pathname !== "/admin/login") {
			return Response.redirect(new URL("/admin/login", url));
		}
		if (subject && url.pathname === "/admin/login") {
			return Response.redirect(new URL("/admin", url));
		}
	}

	return next();
};
