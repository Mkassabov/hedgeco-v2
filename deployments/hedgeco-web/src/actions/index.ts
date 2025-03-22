import { defineAction } from "astro:actions";
import { newsArticles } from "@hedgeco/hedgeco-database";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";

export const server = {
	logout: defineAction({
		accept: "form",
		handler: (_input, context) => {
			context.cookies.delete("access_token");
			context.cookies.delete("refresh_token");
			return "/";
		},
	}),
	upsertArticle: defineAction({
		accept: "form",
		input: z.object({
			articleTitle: z.string(),
			articleContent: z.string(),
			articleId: z.number().optional(),
		}),
		handler: async (input, _context) => {
			let articleId = input.articleId;
			if (articleId) {
				await db
					.update(newsArticles)
					.set({
						articleTitle: input.articleTitle,
						articleContent: input.articleContent,
					})
					.where(eq(newsArticles.id, articleId));
			} else {
				const data = await db.insert(newsArticles).values({
					articleTitle: input.articleTitle,
					articleContent: input.articleContent,
				});
				articleId = data[0].id!;
			}
			const article = await db.query.newsArticles.findFirst({
				where: eq(newsArticles.id, articleId as number),
			});
			return article;
		},
	}),
};
