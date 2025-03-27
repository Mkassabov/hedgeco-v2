import * as schema from "@hedgeco/hedgeco-database";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { desc } from "drizzle-orm";
import { Suspense } from "react";
import { z } from "zod";
import { AdminSidebar } from "~/components/AdminSidebar";
import { db } from "~/utils/db";
import { adminAuthMiddleware } from "~/utils/middleware";

const ARTICLE_PAGE_SIZE = 10;

export const fetchArticlesQueryOptions = (page: number) => {
	const usablePage = page - 1;
	return queryOptions({
		queryKey: ["admin-articles", usablePage],
		queryFn: () => fetchArticles({ data: { page: usablePage } }),
	});
};

const fetchArticles = createServerFn({ method: "GET" })
	.middleware([adminAuthMiddleware])
	.validator((options: { page: number }) => options)
	.handler(async ({ data }) => {
		const newsArticles = await db.query.newsArticles.findMany({
			offset: data.page * ARTICLE_PAGE_SIZE,
			limit: ARTICLE_PAGE_SIZE,
			orderBy: [desc(schema.newsArticles.id)],
		});

		return newsArticles;
	});

const searchSchema = z.object({
	page: fallback(z.number().min(1), 1).default(1),
});

export const Route = createFileRoute("/_authed-admin/admin/articles")({
	loaderDeps: ({ search: { page } }) => ({ page }),
	loader: ({ context, deps: { page } }) => {
		context.queryClient.prefetchQuery(fetchArticlesQueryOptions(page));
	},
	validateSearch: zodValidator(searchSchema),
	component: Deferred,
});

function Deferred() {
	return (
		<Suspense fallback="Loading...">
			<ArticlesComponent />
		</Suspense>
	);
}

function ArticlesComponent() {
	const { page } = Route.useSearch();
	const navigate = useNavigate({ from: "/admin/articles" });
	const articlesQuery = useSuspenseQuery(fetchArticlesQueryOptions(page));
	const params = Route.useParams() as { articleId?: string };
	const currentArticleIndex =
		params?.articleId == null
			? null
			: articlesQuery.data.findIndex(
					(article) => article.id === Number(params.articleId),
				);

	return (
		<AdminSidebar
			data={articlesQuery.data}
			page={page}
			navigate={navigate}
			currentIndex={currentArticleIndex}
			idPath="/admin/articles/$articleId"
			idPathParamName="articleId"
			renderTarget={(article) => (
				<div>
					<p className="text-lg text-blue-800 group-hover:text-blue-600">
						{article.articleTitle.substring(0, 20)}
					</p>
					<p className="text-sm text-gray-500">
						{article.createdAt.toLocaleDateString()}
						{article.updatedAt.getTime() !== article.createdAt.getTime() &&
							` - ${article.updatedAt.toLocaleDateString()}`}
					</p>
				</div>
			)}
			newPath="/admin/articles/new"
			newLabel="New Article"
			pageSize={ARTICLE_PAGE_SIZE}
		>
			<Outlet />
		</AdminSidebar>
	);
}
