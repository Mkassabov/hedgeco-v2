import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed-admin/admin/articles/")({
	component: ArticlesIndexComponent,
});

function ArticlesIndexComponent() {
	return <div className="p-2">Select an article.</div>;
}
