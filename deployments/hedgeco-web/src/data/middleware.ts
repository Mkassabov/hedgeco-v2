import { createMiddleware } from "@tanstack/react-start";
import { adminAuth } from "~/utils/auth";

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
