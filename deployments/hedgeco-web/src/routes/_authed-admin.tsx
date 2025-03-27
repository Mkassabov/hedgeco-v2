import { subjects } from "@hedgeco/admin-auth";
import {
	Link,
	Outlet,
	createFileRoute,
	redirect,
} from "@tanstack/react-router";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import { getCookie, getHeaders } from "@tanstack/react-start/server";
import { adminClient, setAdminTokens } from "~/utils/auth";

export const loginFn = createServerFn().handler(async () => {
	const accessToken = getCookie("admin_access_token");
	const refreshToken = getCookie("admin_refresh_token");

	if (accessToken) {
		const verified = await adminClient.verify(
			subjects,
			accessToken,
			refreshToken
				? {
						refresh: refreshToken,
					}
				: undefined,
		);
		if (!verified.err && verified.tokens) {
			setAdminTokens(verified.tokens.access, verified.tokens.refresh);
			throw redirect({ to: "/admin" });
		}
	}

	const headers = await getHeaders();
	const host = headers?.host ?? headers.Host ?? "";
	const protocol = host?.includes("localhost") ? "http" : "https";
	const { url } = await adminClient.authorize(
		`${protocol}://${host}/api/admin/auth-callback`,
		"code",
	);
	throw redirect({ href: url });
});

export const Route = createFileRoute("/_authed-admin")({
	beforeLoad: ({ context }) => {
		if (context.adminUser == null) {
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
		const { adminUser } = Route.useRouteContext();

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
							className: "border-solid border-b-white",
						}}
						className="m-2 hover:border-b-white border-b-[1px] hover:border-dotted border-transparent"
						activeOptions={{ exact: true }}
					>
						Home
					</Link>
					<div className="relative group hover:block">
						<Link
							to="/admin/articles"
							activeProps={{
								className: "border-solid border-b-white",
							}}
							className="m-2 hover:border-b-white border-b-[1px] hover:border-dotted border-transparent block"
						>
							Articles
						</Link>
						<div className="absolute left-0 w-48 border border-gray-300 rounded shadow-md hidden group-hover:block bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-200">
							<Link
								activeProps={{
									className: "border-solid border-b-white",
								}}
								to="/admin/newsletters"
								className="block mx-4 my-2 hover:border-b-white border-b-[1px] hover:border-dotted border-transparent"
							>
								Newsletters
							</Link>
						</div>
					</div>
					<div className="relative group hover:block">
						<Link
							to="/admin/users"
							activeProps={{
								className: "border-solid border-b-white",
							}}
							className="m-2 hover:border-b-white border-b-[1px] hover:border-dotted border-transparent block"
						>
							Users
						</Link>
						<div className="absolute left-0 w-48 border border-gray-300 rounded shadow-md hidden group-hover:block bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-200">
							<Link
								activeProps={{
									className: "border-solid border-b-white",
								}}
								to="/admin/registration-requests"
								className="block mx-4 my-2 hover:border-b-white border-b-[1px] hover:border-dotted border-transparent"
							>
								Registration Requests
							</Link>
							<Link
								activeProps={{
									className: "border-solid border-b-white",
								}}
								to="/admin/admins"
								className="block mx-4 my-2 hover:border-b-white border-b-[1px] hover:border-dotted border-transparent"
							>
								Admins
							</Link>
						</div>
					</div>
					<div className="ml-auto mr-2">
						{adminUser ? (
							<>
								<span className="mr-2">{adminUser.properties.email}</span>
								<Link to="/admin-logout">Logout</Link>
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
