import { ErrorComponent, createFileRoute } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { NotFound } from "~/components/NotFound.js";
import { fetchPost } from "~/utils/articles.js";

export const Route = createFileRoute("/_authed/articles/$articleId")({
	loader: ({ params: { articleId } }) => fetchPost({ data: Number(articleId) }),
	errorComponent: ArticleErrorComponent,
	component: ArticleComponent,
	notFoundComponent: () => {
		return <NotFound>Article not found</NotFound>;
	},
});

export function ArticleErrorComponent({ error }: ErrorComponentProps) {
	return <ErrorComponent error={error} />;
}

function ArticleComponent() {
	const article = Route.useLoaderData();

	return (
		<div className="space-y-2">
			<h4 className="text-xl font-bold underline">{article.articleTitle}</h4>
			<div className="text-sm">{article.articleContent}</div>
		</div>
	);
}
