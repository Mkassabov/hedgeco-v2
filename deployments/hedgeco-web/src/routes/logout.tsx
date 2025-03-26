import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie } from "@tanstack/react-start/server";
import { useAppSession } from "~/utils/session";

const logoutFn = createServerFn().handler(async () => {
	const session = await useAppSession();
	const adminUser = session.data.adminSubject;
	await session.clear();
	await session.update({
		adminSubject: adminUser,
	});
	deleteCookie("access_token");
	deleteCookie("refresh_token");

	throw redirect({
		href: "/",
	});
});

export const Route = createFileRoute("/logout")({
	preload: false,
	loader: ({ context }) => {
		context.queryClient.clear();
		return logoutFn();
	},
});
