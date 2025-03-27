import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed-admin/admin/newsletters/")({
	component: NewslettersIndexComponent,
});

function NewslettersIndexComponent() {
	return <div className="p-2">Select a newsletter.</div>;
}
