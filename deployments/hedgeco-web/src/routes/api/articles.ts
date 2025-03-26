import * as schema from "@hedgeco/hedgeco-database";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { desc } from "drizzle-orm";
import { db } from "~/utils/db";

const PUBLIC_ARTICLE_PAGE_SIZE = 50;

export const APIRoute = createAPIFileRoute("/api/articles")({
	GET: async ({ request }) => {
		const url = new URL(request.url);
		const page = Number(url.searchParams.get("page"));

		const newsArticles = await db.query.newsArticles.findMany({
			offset: page * PUBLIC_ARTICLE_PAGE_SIZE,
			limit: PUBLIC_ARTICLE_PAGE_SIZE,
			orderBy: [desc(schema.newsArticles.id)],
		});

		return new Response(
			JSON.stringify({
				articles: newsArticles,
			}),
			{
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	},
});
