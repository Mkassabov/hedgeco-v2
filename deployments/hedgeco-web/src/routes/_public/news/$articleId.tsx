import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { NotFound } from "~/components/NotFound.js";
import { fetchPublicArticleQueryOptions } from "~/data/articles";

export const Route = createFileRoute("/_public/news/$articleId")({
	loader: ({ context, params: { articleId } }) => {
		context.queryClient.prefetchQuery(
			fetchPublicArticleQueryOptions(Number(articleId)),
		);
	},
	component: Deferred,
	notFoundComponent: () => {
		return <NotFound>Article not found</NotFound>;
	},
});

function Deferred() {
	return (
		<Suspense fallback="Loading...">
			<ErrorBoundary
				fallbackRender={({ error, resetErrorBoundary }) => {
					return (
						<div>
							<p>Error: {JSON.stringify(error)}</p>
							{/* //todo find a way to reset this on nav so the user doesn't have to */}
							<button
								type="button"
								className="bg-blue-600 py-1 px-4 rounded"
								onClick={resetErrorBoundary}
							>
								Reset
							</button>
						</div>
					);
				}}
			>
				<NewsArticleComponent />
			</ErrorBoundary>
		</Suspense>
	);
}

function NewsArticleComponent() {
	const { articleId } = Route.useParams();
	const articleQuery = useSuspenseQuery(
		fetchPublicArticleQueryOptions(Number(articleId)),
	);

	return (
		<Suspense fallback="Loading...">
			<div className="flex flex-col gap-2">
				<h1 className="text-xl font-bold py-1 pr-2 ">
					{articleQuery.data.articleTitle}
				</h1>
				<span className="text-[11px] text-gray-400">
					{articleQuery.data.createdAt.toLocaleDateString("en-US", {
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</span>
				<p className="text-gray-700">{articleQuery.data.articleContent}</p>
			</div>
		</Suspense>
	);
}
