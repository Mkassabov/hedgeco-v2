import * as schema from "@hedgeco/hedgeco-database";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { adminAuthMiddleware } from "~/utils/auth";
import { db } from "~/utils/db";

export const fetchPost = createServerFn({ method: "GET" })
	.middleware([adminAuthMiddleware])
	.validator((postId: number) => postId)
	.handler(async ({ data }) => {
		const newsArticle = await db.query.newsArticles.findFirst({
			where: eq(schema.newsArticles.id, data),
		});

		if (!newsArticle) {
			throw notFound();
		}

		return newsArticle;
	});

export const fetchPosts = createServerFn({ method: "GET" })
	.middleware([adminAuthMiddleware])
	.validator((options: { page: number }) => options)
	.handler(async ({ data }) => {
		const newsArticles = await db.query.newsArticles.findMany({
			limit: 10,
			orderBy: [desc(schema.newsArticles.id)],
			offset: data?.page * 10,
		});

		return newsArticles;
	});
