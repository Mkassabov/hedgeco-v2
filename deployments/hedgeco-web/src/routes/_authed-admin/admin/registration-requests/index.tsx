import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
	"/_authed-admin/admin/registration-requests/",
)({
	component: RegistrationRequestsIndexComponent,
});

function RegistrationRequestsIndexComponent() {
	return <div className="p-2">Select a registration-request.</div>;
}
