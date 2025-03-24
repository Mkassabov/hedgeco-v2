import { subjects } from "@hedgeco/admin-auth";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, getHeaders } from "@tanstack/react-start/server";
import { client, setTokens } from "~/utils/auth";

export const loginFn = createServerFn().handler(async () => {
	const accessToken = getCookie("access_token");
	const refreshToken = getCookie("refresh_token");

	if (accessToken) {
		const verified = await client.verify(
			subjects,
			accessToken,
			refreshToken
				? {
						refresh: refreshToken,
					}
				: undefined,
		);
		if (!verified.err && verified.tokens) {
			setTokens(verified.tokens.access, verified.tokens.refresh);
			throw redirect({ to: "/articles" });
		}
	}

	const headers = await getHeaders();
	const host = headers?.host ?? headers.Host ?? "";
	const protocol = host?.includes("localhost") ? "http" : "https";
	const { url } = await client.authorize(
		`${protocol}://${host}/api/admin-auth-callback`,
		"code",
	);
	throw redirect({ href: url });
});

export const Route = createFileRoute("/_authed")({
	beforeLoad: ({ context }) => {
		if (context.user == null) {
			throw new Error("Not authenticated");
		}
	},
	errorComponent: ({ error }) => {
		if (error.message === "Not authenticated") {
			return <span>Not authenticated</span>;
		}

		throw error;
	},
});
