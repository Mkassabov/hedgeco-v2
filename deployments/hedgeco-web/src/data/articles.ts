import * as schema from "@hedgeco/hedgeco-database";
import {
	type MutationOptions,
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { isNotFound, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { adminAuthMiddleware } from "~/utils/auth";
import { db } from "~/utils/db";

export const fetchArticleQueryOptions = (articleId: number) => {
	return queryOptions({
		queryKey: ["article", articleId],
		queryFn: () => fetchArticle({ data: articleId }),
		retry: (failureCount, error) => {
			if (isNotFound(error)) {
				return false;
			}
			return failureCount < 3;
		},
	});
};

export const fetchArticle = createServerFn({ method: "GET" })
	.middleware([adminAuthMiddleware])
	.validator((articleId: number) => articleId)
	.handler(async ({ data }) => {
		const newsArticle = await db.query.newsArticles.findFirst({
			where: eq(schema.newsArticles.id, data),
		});

		if (!newsArticle) {
			throw notFound();
		}

		return newsArticle;
	});

export const ARTICLE_PAGE_SIZE = 5;

export const fetchArticlesQueryOptions = (page: number) => {
	const usablePage = page - 1;
	return queryOptions({
		queryKey: ["articles", usablePage],
		queryFn: () => fetchArticles({ data: { page: usablePage } }),
	});
};

export const fetchArticles = createServerFn({ method: "GET" })
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

export function useDeleteArticle(
	options?: Omit<MutationOptions<void, Error, number>, "mutationFn">,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (articleId: number) => deleteArticle({ data: articleId }),
		...options,
		onSuccess: async (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["articles"] });
			queryClient.invalidateQueries({ queryKey: ["article", variables] });
			if (options?.onSuccess) {
				await options.onSuccess(data, variables, context);
			}
		},
	});
}

export const deleteArticle = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator((articleId: number) => articleId)
	.handler(async ({ data }) => {
		await db
			.delete(schema.newsArticles)
			.where(eq(schema.newsArticles.id, data));
	});

export function useUpdateArticle(
	options?: Omit<
		MutationOptions<
			void,
			Error,
			{ id: number; articleTitle: string; articleContent: string }
		>,
		"mutationFn"
	>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (article: {
			id: number;
			articleTitle: string;
			articleContent: string;
		}) => updateArticle({ data: article }),
		...options,
		onSuccess: async (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["articles"] });
			queryClient.invalidateQueries({ queryKey: ["article", variables.id] });
			if (options?.onSuccess) {
				await options.onSuccess(data, variables, context);
			}
		},
	});
}

export const updateArticle = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator(
		(article: { id: number; articleTitle: string; articleContent: string }) =>
			article,
	)
	.handler(async ({ data }) => {
		await db
			.update(schema.newsArticles)
			.set({
				articleTitle: data.articleTitle,
				articleContent: data.articleContent,
				updatedAt: new Date(),
			})
			.where(eq(schema.newsArticles.id, data.id));
	});

export function useCreateArticle(
	options?: Omit<
		MutationOptions<
			number,
			Error,
			{ articleTitle: string; articleContent: string }
		>,
		"mutationFn"
	>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (article: {
			articleTitle: string;
			articleContent: string;
		}) => createArticle({ data: article }),
		...options,
		onSuccess: async (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["articles"] });
			queryClient.prefetchQuery(fetchArticleQueryOptions(data));
			if (options?.onSuccess) {
				await options.onSuccess(data, variables, context);
			}
		},
	});
}

export const createArticle = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator(
		(article: { articleTitle: string; articleContent: string }) => article,
	)
	.handler(async ({ data }) => {
		const response = await db.insert(schema.newsArticles).values({
			articleTitle: data.articleTitle,
			articleContent: data.articleContent,
		});
		return response[0].insertId;
	});
