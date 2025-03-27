import { createAPIFileRoute } from "@tanstack/react-start/api";
import { setUserTokens, userAuth, userClient } from "~/utils/auth";
import { useAppSession } from "~/utils/session";
import "sst";

export const APIRoute = createAPIFileRoute("/api/auth-callback")({
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

		const exchanged = await userClient.exchange(
			code,
			`${url.origin}/api/auth-callback`,
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

		await setUserTokens(exchanged.tokens.access, exchanged.tokens.refresh);
		console.log("setting tokens");
		const userSubject = await userAuth({
			access: exchanged.tokens.access,
			refresh: exchanged.tokens.refresh,
		});
		console.log("userSubject", userSubject);
		if (!userSubject) {
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
		await session.update({ userSubject });
		console.log("redirecting to", `${url.origin}/`);

		const res = new Response(null, {
			status: 302,
			headers: {
				// biome-ignore lint/style/useNamingConvention: <explanation>
				Location: `${url.origin}/`,
			},
		});
		console.log(res);
		return res;
	},
});
