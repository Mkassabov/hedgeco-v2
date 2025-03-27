import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed-admin/admin/users/")({
	component: UsersIndexComponent,
});

function UsersIndexComponent() {
	return <div className="p-2">Select a user.</div>;
}
