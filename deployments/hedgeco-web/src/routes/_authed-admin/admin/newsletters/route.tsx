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

const NEWSLETTER_PAGE_SIZE = 10;

const fetchNewslettersQueryOptions = (page: number) => {
	const usablePage = page - 1;
	return queryOptions({
		queryKey: ["admin-newsletters", usablePage],
		queryFn: () => fetchNewsletters({ data: { page: usablePage } }),
	});
};

const fetchNewsletters = createServerFn({ method: "GET" })
	.middleware([adminAuthMiddleware])
	.validator((options: { page: number }) => options)
	.handler(async ({ data }) => {
		const newsletters = await db.query.newsLetters.findMany({
			offset: data.page * NEWSLETTER_PAGE_SIZE,
			limit: NEWSLETTER_PAGE_SIZE,
			orderBy: [desc(schema.newsLetters.id)],
		});

		return newsletters;
	});

const searchSchema = z.object({
	page: fallback(z.number().min(1), 1).default(1),
});

export const Route = createFileRoute("/_authed-admin/admin/newsletters")({
	loaderDeps: ({ search: { page } }) => ({ page }),
	loader: ({ context, deps: { page } }) => {
		context.queryClient.prefetchQuery(fetchNewslettersQueryOptions(page));
	},
	validateSearch: zodValidator(searchSchema),
	component: Deferred,
});

function Deferred() {
	return (
		<Suspense fallback="Loading...">
			<NewslettersComponent />
		</Suspense>
	);
}

function NewslettersComponent() {
	const { page } = Route.useSearch();
	const navigate = useNavigate({ from: "/admin/newsletters" });
	const newslettersQuery = useSuspenseQuery(fetchNewslettersQueryOptions(page));
	const params = Route.useParams() as { newsletterId?: string };
	const currentNewsletterIndex =
		params?.newsletterId == null
			? null
			: newslettersQuery.data.findIndex(
					(newsletter) => newsletter.id === Number(params.newsletterId),
				);

	return (
		<AdminSidebar
			data={newslettersQuery.data}
			page={page}
			navigate={navigate}
			currentIndex={currentNewsletterIndex}
			idPath="/admin/newsletters/$newsletterId"
			idPathParamName="newsletterId"
			renderTarget={(newsletter) => (
				<div>
					<p className="text-lg text-blue-800 group-hover:text-blue-600">
						{new Date(newsletter.releaseDate).toLocaleDateString()}
					</p>
				</div>
			)}
			newPath="/admin/newsletters/new"
			newLabel="New Newsletter"
			pageSize={NEWSLETTER_PAGE_SIZE}
		>
			<Outlet />
		</AdminSidebar>
	);
}
