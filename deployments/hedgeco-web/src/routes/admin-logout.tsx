import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie } from "@tanstack/react-start/server";
import { useAppSession } from "~/utils/session";

const logoutFn = createServerFn().handler(async () => {
	const session = await useAppSession();
	const user = session.data.userSubject;
	await session.clear();
	await session.update({
		userSubject: user,
	});
	deleteCookie("admin_access_token");
	deleteCookie("admin_refresh_token");

	throw redirect({
		href: "/",
	});
});

export const Route = createFileRoute("/admin-logout")({
	preload: false,
	loader: ({ context }) => {
		context.queryClient.clear();
		return logoutFn();
	},
});
