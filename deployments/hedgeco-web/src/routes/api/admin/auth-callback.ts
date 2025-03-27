import { createAPIFileRoute } from "@tanstack/react-start/api";
import { adminAuth, client, setTokens } from "~/utils/auth";
import { useAppSession } from "~/utils/session";
import "sst";

export const APIRoute = createAPIFileRoute("/api/admin/auth-callback")({
	GET: async ({ request }) => {
		const url = new URL(request.url);
		const code = url.searchParams.get("code");
		console.log("code", code);

		if (!code) {
			console.log("no code provided");
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
			`${url.origin}/api/admin/auth-callback`,
		);
		console.log("exchanged", exchanged);
		if (exchanged.err) {
			console.log("failed to exchange code", exchanged.err);
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
		console.log("tokens", exchanged.tokens);

		await setTokens(exchanged.tokens.access, exchanged.tokens.refresh);
		console.log("setting tokens");
		const adminSubject = await adminAuth({
			access: exchanged.tokens.access,
			refresh: exchanged.tokens.refresh,
		});
		console.log("adminSubject", adminSubject);
		if (!adminSubject) {
			console.log("failed to get subject");
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
		console.log("session", session);
		await session.update({ adminSubject });
		console.log("redirecting to", `${url.origin}/admin`);

		const res = Response.redirect(`${url.origin}/admin`);
		console.log(res);
		return res;
	},
});
