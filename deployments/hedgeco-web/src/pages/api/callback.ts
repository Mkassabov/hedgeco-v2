import type { APIRoute } from "astro";
import { client, setTokens } from "../../auth";

export const GET: APIRoute = async ({ request, cookies }) => {
	const url = new URL(request.url);
	const code = url.searchParams.get("code");

	const exchanged = await client.exchange(code!, `${url.origin}/api/callback`);

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

	await setTokens(exchanged.tokens.access, exchanged.tokens.refresh, cookies);

	return Response.redirect(`${url.origin}/admin`);
};
