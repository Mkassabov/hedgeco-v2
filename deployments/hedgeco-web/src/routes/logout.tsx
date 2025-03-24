import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { deleteCookie } from "@tanstack/react-start/server";
import { useAppSession } from "~/utils/session";

const logoutFn = createServerFn().handler(async () => {
	const session = await useAppSession();
	await session.clear();
	deleteCookie("access_token");
	deleteCookie("refresh_token");

	throw redirect({
		href: "/",
	});
});

export const Route = createFileRoute("/logout")({
	preload: false,
	loader: () => logoutFn(),
});
