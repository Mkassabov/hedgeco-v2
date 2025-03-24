import { useSuspenseQuery } from "@tanstack/react-query";
import {
	Link,
	Outlet,
	createFileRoute,
	useNavigate,
} from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { Suspense, useEffect } from "react";
import { z } from "zod";
import { ARTICLE_PAGE_SIZE, fetchArticlesQueryOptions } from "~/data/articles";

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

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				const dir = event.key === "ArrowDown" ? 1 : -1;
				const isFirst = currentArticleIndex === 0;
				const isLast = currentArticleIndex === articlesQuery.data.length - 1;
				if (isFirst && dir === -1) {
					if (page === 1) {
						return;
					}
					return navigate({
						search: (prev) => ({ page: prev.page - 1 }),
					});
				}
				if (
					isLast &&
					dir === 1 &&
					articlesQuery.data.length % ARTICLE_PAGE_SIZE === 0
				) {
					return navigate({
						search: (prev) => ({ page: prev.page + 1 }),
					});
				}
				if (currentArticleIndex == null) {
					const nextArticle =
						dir === 1
							? articlesQuery.data[0]
							: articlesQuery.data[articlesQuery.data.length - 1];
					if (nextArticle == null) {
						return navigate({
							search: (prev) => ({ page: prev.page - 1 }),
						});
					}
					return navigate({
						to: "/admin/articles/$articleId",
						params: { articleId: nextArticle.id.toString() },
						search: (prev) => ({ page: prev.page }),
					});
				}

				const nextArticleId =
					articlesQuery.data[currentArticleIndex + dir]?.id.toString();
				if (nextArticleId != null) {
					return navigate({
						to: "/admin/articles/$articleId",
						params: { articleId: nextArticleId },
						search: (prev) => ({ page: prev.page }),
					});
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [currentArticleIndex, navigate, articlesQuery.data, page]);

	return (
		<div className="flex h-full">
			<ul className="list-disc w-48 h-full flex flex-col">
				<Link
					to="/admin/articles/new"
					className="border-b border-gray-700 h-14 flex items-center justify-center group"
				>
					<div className="text-lg group-hover:text-blue-800">New Article</div>
				</Link>
				<Suspense fallback={<div>Loading...</div>}>
					{articlesQuery.data.map((article) => {
						return (
							<li key={article.id} className="border-b border-gray-700 flex">
								<Link
									preload={false}
									to="/admin/articles/$articleId"
									params={{
										articleId: article.id.toString(),
									}}
									search={{ page }}
									className="group block py-1 px-2 w-full border-l-4"
									inactiveProps={{
										className: "border-l-transparent",
									}}
									activeProps={{
										className: "text-black border-l-blue-800",
									}}
								>
									<div>
										<p className="text-lg text-blue-800 group-hover:text-blue-600">
											{article.articleTitle.substring(0, 20)}
										</p>
										<p className="text-sm text-gray-500">
											{article.createdAt.toLocaleDateString()}
											{article.updatedAt.getTime() !==
												article.createdAt.getTime() &&
												` - ${article.updatedAt.toLocaleDateString()}`}
										</p>
									</div>
								</Link>
							</li>
						);
					})}
				</Suspense>
				<div className="flex flex-grow" />
				<div className="flex justify-center items-center border-t border-gray-700">
					<Link
						disabled={page === 1}
						to="/admin/articles"
						search={{ page: page - 1 }}
						params={{
							articleId: params?.articleId,
						}}
						className="py-1 text-center flex-grow aria-disabled:cursor-not-allowed aria-disabled:text-gray-500"
					>
						Previous
					</Link>
					<div className="w-[1px] bg-gray-700 h-full" />
					<Link
						disabled={articlesQuery.data.length % ARTICLE_PAGE_SIZE !== 0}
						to={
							params?.articleId
								? "/admin/articles/$articleId"
								: "/admin/articles"
						}
						search={{ page: page + 1 }}
						params={{
							articleId: params?.articleId,
						}}
						className="py-1 text-center flex-grow aria-disabled:cursor-not-allowed aria-disabled:text-gray-500"
					>
						Next
					</Link>
				</div>
			</ul>
			<div className="w-[1px] bg-gray-700 h-full" />
			<Outlet />
		</div>
	);
}
