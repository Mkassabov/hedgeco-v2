import { createAPIFileRoute } from "@tanstack/react-start/api";
import { adminAuth, client, setTokens } from "~/utils/auth";
import { useAppSession } from "~/utils/session";

export const APIRoute = createAPIFileRoute("/api/admin-auth-callback")({
	GET: async ({ request, params }) => {
		const url = new URL(request.url);
		const code = url.searchParams.get("code");

		if (!code) {
			return new Response(
				JSON.stringify({
					message: "No code provided",
				}),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}

		const exchanged = await client.exchange(
			code,
			`${url.origin}/api/admin-auth-callback`,
		);

		if (exchanged.err) {
			return new Response(
				JSON.stringify({
					message: "Failed to exchange code",
				}),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}

		await setTokens(exchanged.tokens.access, exchanged.tokens.refresh);
		const subject = await adminAuth({
			access: exchanged.tokens.access,
			refresh: exchanged.tokens.refresh,
		});
		if (!subject) {
			return new Response(
				JSON.stringify({
					message: "Failed to get subject",
				}),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}
		const session = await useAppSession();
		await session.update({ subject });

		return Response.redirect(url.origin);
	},
});
