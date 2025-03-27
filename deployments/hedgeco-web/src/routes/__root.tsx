import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
	HeadContent,
	Outlet,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import type * as React from "react";
import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";
import { useAppSession } from "~/utils/session";

const fetchAdminUser = createServerFn({ method: "GET" }).handler(async () => {
	// We need to auth on the server so we have access to secure cookies
	const session = await useAppSession();
	if (!session.data.adminSubject) {
		return null;
	}
	return session.data.adminSubject;
});

const fetchUser = createServerFn({ method: "GET" }).handler(async () => {
	// We need to auth on the server so we have access to secure cookies
	const session = await useAppSession();
	if (!session.data.userSubject) {
		return null;
	}
	return session.data.userSubject;
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
			{ rel: "icon", href: "/favicon.png" },
		],
	}),
	beforeLoad: async () => {
		const adminUser = await fetchAdminUser();
		const user = await fetchUser();

		return {
			adminUser,
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
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="flex flex-col">
				{children}
				{process.env.NODE_ENV === "development" && (
					<div className="h-30 border-t border-gray-700">
						<div className="m-2">
							<button type="button">
								<TanStackRouterDevtools position="bottom-right" />
							</button>
							<button type="button">
								<ReactQueryDevtools buttonPosition="relative" />
							</button>
						</div>
					</div>
				)}
				<Scripts />
			</body>
		</html>
	);
}
