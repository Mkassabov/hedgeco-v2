import { subjects } from "@hedgeco/admin-auth";
import {
	Link,
	Outlet,
	createFileRoute,
	redirect,
} from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
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
			throw redirect({ to: "/admin" });
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

export const Route = createFileRoute("/_authed-admin")({
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
	component: () => {
		const { user } = Route.useRouteContext();

		const login = useServerFn(loginFn);

		return (
			<>
				<header className="h-12 flex items-center border-b border-gray-700">
					<Link
						to="/"
						className="w-48 flex items-center justify-center text-lg"
						activeOptions={{ exact: true }}
					>
						Go To Consumer
					</Link>
					<div className="w-[1px] bg-gray-700 h-full" />
					<Link
						to="/admin"
						activeProps={{
							className: "underline",
						}}
						className="p-2"
						activeOptions={{ exact: true }}
					>
						Home
					</Link>
					<Link
						to="/admin/articles"
						activeProps={{
							className: "underline",
						}}
						className="p-2"
					>
						Articles
					</Link>
					<div className="ml-auto">
						{user ? (
							<>
								<span className="mr-2">{user.properties.email}</span>
								<Link to="/logout">Logout</Link>
							</>
						) : (
							<form
								onSubmit={(e) => {
									e.preventDefault();
									login();
								}}
								className="space-y-4"
							>
								<button type="submit">Login</button>
							</form>
						)}
					</div>
				</header>
				<main className="h-[calc(100vh-3rem)]">
					<Outlet />
				</main>
			</>
		);
	},
});
