import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/articles/")({
	component: ArticlesIndexComponent,
});

function ArticlesIndexComponent() {
	return <div>Select an article.</div>;
}
