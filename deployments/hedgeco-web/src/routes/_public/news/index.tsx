import * as schema from "@hedgeco/hedgeco-database";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { desc } from "drizzle-orm";
import { Suspense } from "react";
import { z } from "zod";
import { db } from "~/utils/db";

const PUBLIC_ARTICLE_PAGE_SIZE = 50;

const fetchPublicArticlesQueryOptions = (page: number) => {
	const usablePage = page - 1;
	return queryOptions({
		queryKey: ["articles", usablePage],
		queryFn: () => fetchPublicArticles({ data: { page: usablePage } }),
	});
};

const fetchPublicArticles = createServerFn({ method: "GET" })
	.validator((options: { page: number }) => options)
	.handler(async ({ data }) => {
		const newsArticles = await db.query.newsArticles.findMany({
			offset: data.page * PUBLIC_ARTICLE_PAGE_SIZE,
			limit: PUBLIC_ARTICLE_PAGE_SIZE,
			orderBy: [desc(schema.newsArticles.id)],
		});

		return newsArticles;
	});

const searchSchema = z.object({
	page: fallback(z.number().min(1), 1).default(1),
});

export const Route = createFileRoute("/_public/news/")({
	loaderDeps: ({ search: { page } }) => ({ page }),
	loader: ({ context, deps: { page } }) => {
		context.queryClient.prefetchQuery(fetchPublicArticlesQueryOptions(page));
	},
	validateSearch: zodValidator(searchSchema),
	component: Deferred,
});

function Deferred() {
	return (
		<Suspense fallback="Loading...">
			<NewsComponent />
		</Suspense>
	);
}

function NewsComponent() {
	const { page } = Route.useSearch();
	const articlesQuery = useSuspenseQuery(fetchPublicArticlesQueryOptions(page));

	return (
		<Suspense fallback="Loading...">
			{articlesQuery.data.map((article) => (
				<div key={article.id} className="flex flex-col gap-1">
					<Link
						to="/news/$articleId"
						params={{ articleId: article.id.toString() }}
					>
						<h2 className="text-xl font-bold underline text-cyan-700">
							{article.articleTitle}
						</h2>
					</Link>
					<span className="text-[11px] text-gray-400">
						{article.createdAt.toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</span>
					<p className="text-gray-700 line-clamp-3">
						{article.articleContent.split("\n").slice(0, 5).join("\n")}
						{article.articleContent.split("\n").length > 5 ? "..." : ""}
					</p>
				</div>
			))}
		</Suspense>
	);
}
