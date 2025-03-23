import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	HeadContent,
	Link,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn, useServerFn } from "@tanstack/react-start";
import type * as React from "react";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary.js";
import { NotFound } from "~/components/NotFound.js";
import { loginFn } from "~/routes/_authed";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo.js";
import { useAppSession } from "~/utils/session.js";

const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
	// We need to auth on the server so we have access to secure cookies
	const session = await useAppSession();

	if (!session.data.subject) {
		return null;
	}

	return session.data.subject;
});

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
}>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			...seo({
				title: "Hedgeco.net",
				description:
					"HedgeCo.Net is the leading free hedge fund database with information on more than 7,500 hedge funds. Our hedge fund portal includes hedge fund daily breaking news, alternative investment news, conference details, a service provider directory, hedge fund software, frequently asked questions and many more hedge fund specific features and educational resources.",
			}),
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon-32x32.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon-16x16.png",
			},
			{ rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
			{ rel: "icon", href: "/favicon.ico" },
		],
	}),
	beforeLoad: async () => {
		const user = await fetchUser();

		return {
			user,
		};
	},
	errorComponent: (props) => {
		return (
			<RootDocument>
				<DefaultCatchBoundary {...props} />
			</RootDocument>
		);
	},
	notFoundComponent: () => <NotFound />,
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const { user } = Route.useRouteContext();

	const login = useServerFn(loginFn);

	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<div className="p-2 flex gap-2 text-lg">
					<Link
						to="/"
						activeProps={{
							className: "font-bold",
						}}
						activeOptions={{ exact: true }}
					>
						Home
					</Link>{" "}
					<Link
						to="/posts"
						activeProps={{
							className: "font-bold",
						}}
					>
						Posts
					</Link>
					<div className="ml-auto">
						{user ? (
							<>
								<span className="mr-2">{user.properties.email}</span>
								<Link to="/logout">Logout</Link>
							</>
						) : (
							//todo this is a workaround since sst linking isn't working :/
							// <a href={import.meta.env.VITE_ADMIN_AUTH_URL}>Login</a>
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
				</div>
				<hr />
				{children}
				<TanStackRouterDevtools position="bottom-right" />
				<ReactQueryDevtools buttonPosition="bottom-left" />
				<Scripts />
			</body>
		</html>
	);
}
