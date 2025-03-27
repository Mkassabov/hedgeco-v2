import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed-admin/admin/admins/")({
	component: AdminsIndexComponent,
});

function AdminsIndexComponent() {
	return <div className="p-2">Select an admin.</div>;
}
