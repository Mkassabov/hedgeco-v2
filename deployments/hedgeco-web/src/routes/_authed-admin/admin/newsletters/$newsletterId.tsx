import * as schema from "@hedgeco/hedgeco-database";
import mailchimp from "@mailchimp/mailchimp_marketing";
import {
	type MutationOptions,
	queryOptions,
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { isNotFound, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { NotFound } from "~/components/NotFound";
import { fetchArticlesQueryOptions } from "~/routes/_authed-admin/admin/articles/route";
import { db } from "~/utils/db";
import { adminAuthMiddleware } from "~/utils/middleware";

async function updateNewsletterContent(newsletterId: number) {
	"use server";
	mailchimp.setConfig({
		apiKey: process.env.MAILCHIMP_API_KEY,
		server: process.env.MAILCHIMP_SERVER,
	});

	const newsletter = await db.query.newsLetters.findFirst({
		where: eq(schema.newsLetters.id, newsletterId),
		with: {
			newsLettersToArticles: {
				with: {
					newsArticle: true,
				},
			},
		},
	});
	if (!newsletter) {
		throw notFound();
	}

	await mailchimp.campaigns.setContent(newsletter.mailchimpCampaignId, {
		template: {
			id: Number(process.env.MAILCHIMP_TEMPLATE_ID),
			sections: {
				body: newsletter.newsLettersToArticles
					.map(
						(a) =>
							`<h2>${a.newsArticle.articleTitle}</h2><p>${a.newsArticle.articleContent}</p>`,
					)
					.join("\n<hr />"),
			},
		},
	});
}

export const fetchNewsletterQueryOptions = (newsletterId: number) => {
	return queryOptions({
		queryKey: ["admin-newsletter", newsletterId],
		queryFn: () => fetchNewsletter({ data: newsletterId }),
		retry: (failureCount, error) => {
			if (isNotFound(error)) {
				return false;
			}
			return failureCount < 3;
		},
	});
};

const fetchNewsletter = createServerFn({ method: "GET" })
	.middleware([adminAuthMiddleware])
	.validator((newsletterId: number) => newsletterId)
	.handler(async ({ data }) => {
		const newsletter = await db.query.newsLetters.findFirst({
			where: eq(schema.newsLetters.id, data),
			with: {
				newsLettersToArticles: {
					with: {
						newsArticle: true,
					},
				},
			},
		});

		if (!newsletter) {
			throw notFound();
		}

		return newsletter;
	});

function useAddArticleToNewsletter(
	options?: Omit<
		MutationOptions<void, Error, { newsletterId: number; articleId: number }>,
		"mutationFn"
	>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { newsletterId: number; articleId: number }) =>
			addArticleToNewsletter({ data }),
		...options,
		onSuccess: (_data, variables, _context) => {
			queryClient.invalidateQueries({
				queryKey: ["admin-newsletter", variables.newsletterId],
			});
		},
	});
}

const addArticleToNewsletter = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator((data: { newsletterId: number; articleId: number }) => data)
	.handler(async ({ data }) => {
		//todo check if article is already in newsletter
		await db.insert(schema.newsLettersToArticles).values({
			newsLetterId: data.newsletterId,
			newsArticleId: data.articleId,
		});
		await updateNewsletterContent(data.newsletterId);
	});

function useRemoveArticleToNewsletter(
	options?: Omit<
		MutationOptions<void, Error, { newsletterId: number; articleId: number }>,
		"mutationFn"
	>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { newsletterId: number; articleId: number }) =>
			removeArticleToNewsletter({ data }),
		...options,
		onSuccess: (_data, variables, _context) => {
			queryClient.invalidateQueries({
				queryKey: ["admin-newsletter", variables.newsletterId],
			});
		},
	});
}

const removeArticleToNewsletter = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator((data: { newsletterId: number; articleId: number }) => data)
	.handler(async ({ data }) => {
		//todo check if article is already in newsletter
		await db
			.delete(schema.newsLettersToArticles)
			.where(
				and(
					eq(schema.newsLettersToArticles.newsLetterId, data.newsletterId),
					eq(schema.newsLettersToArticles.newsArticleId, data.articleId),
				),
			);
		await updateNewsletterContent(data.newsletterId);
	});

export const Route = createFileRoute(
	"/_authed-admin/admin/newsletters/$newsletterId",
)({
	loader: ({ context, params: { newsletterId } }) => {
		context.queryClient.prefetchQuery(
			fetchNewsletterQueryOptions(Number(newsletterId)),
		);
	},
	component: Deferred,
	notFoundComponent: () => {
		return <NotFound>Newsletter not found</NotFound>;
	},
});

function useSendTestNewsletter(
	options?: Omit<
		MutationOptions<void, Error, { newsletterId: number; recipient: string }>,
		"mutationFn"
	>,
) {
	return useMutation({
		mutationFn: (data: { newsletterId: number; recipient: string }) =>
			sendTestNewsletter({ data }),
		...options,
	});
}

const sendTestNewsletter = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator((data: { newsletterId: number; recipient: string }) => data)
	.handler(async ({ data }) => {
		mailchimp.setConfig({
			apiKey: process.env.MAILCHIMP_API_KEY,
			server: process.env.MAILCHIMP_SERVER,
		});
		const newsletter = await db.query.newsLetters.findFirst({
			where: eq(schema.newsLetters.id, data.newsletterId),
		});
		if (!newsletter) {
			throw notFound();
		}
		await mailchimp.campaigns.sendTestEmail(newsletter.mailchimpCampaignId, {
			test_emails: [data.recipient],
			send_type: "html",
		});
	});

function useSendNewsletterNow(
	options?: Omit<MutationOptions<void, Error, number>, "mutationFn">,
) {
	return useMutation({
		mutationFn: (data: number) => sendNewsletterNow({ data }),
		...options,
	});
}

const sendNewsletterNow = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator((data: number) => data)
	.handler(async ({ data }) => {
		mailchimp.setConfig({
			apiKey: process.env.MAILCHIMP_API_KEY,
			server: process.env.MAILCHIMP_SERVER,
		});
		const newsletter = await db.query.newsLetters.findFirst({
			where: eq(schema.newsLetters.id, data),
		});
		if (!newsletter) {
			throw notFound();
		}
		await mailchimp.campaigns.send(newsletter.mailchimpCampaignId);
	});

function useScheduleNewsletter(
	options?: Omit<MutationOptions<void, Error, number>, "mutationFn">,
) {
	return useMutation({
		mutationFn: (data: number) => scheduleNewsletter({ data }),
		...options,
	});
}

const scheduleNewsletter = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator((data: number) => data)
	.handler(async ({ data }) => {
		mailchimp.setConfig({
			apiKey: process.env.MAILCHIMP_API_KEY,
			server: process.env.MAILCHIMP_SERVER,
		});
		const newsletter = await db.query.newsLetters.findFirst({
			where: eq(schema.newsLetters.id, data),
		});
		if (!newsletter) {
			throw notFound();
		}
		await mailchimp.campaigns.schedule(newsletter.mailchimpCampaignId, {
			schedule_time: new Date(newsletter.releaseDate).toISOString(),
		});
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
				<NewsletterComponent />
			</ErrorBoundary>
		</Suspense>
	);
}

function NewsletterComponent() {
	const { newsletterId } = Route.useParams();
	const newsletterQuery = useSuspenseQuery(
		fetchNewsletterQueryOptions(Number(newsletterId)),
	);
	const articlesQuery = useSuspenseQuery(fetchArticlesQueryOptions(1));
	const [isTestEmailDialogOpen, setIsTestEmailDialogOpen] = useState(false);
	const sendTestNewsletter = useSendTestNewsletter();
	const sendNewsletterNow = useSendNewsletterNow();
	const scheduleNewsletter = useScheduleNewsletter();

	return (
		<div className="flex-grow">
			<Suspense fallback="Loading...">
				<div className="flex h-full">
					<div className="flex flex-col gap-2 flex-grow">
						<Suspense fallback={<div>Loading...</div>}>
							<div className="flex flex-col p-2">
								<div className="flex justify-between items-center">
									<h1 className="text-xl font-bold pr-2 ">
										{new Date(
											newsletterQuery.data.releaseDate,
										).toLocaleString()}
									</h1>
									<div className="flex gap-2">
										<button
											type="button"
											className="bg-yellow-700 py-1 px-4 rounded flex items-center gap-2"
											onClick={() => setIsTestEmailDialogOpen(true)}
										>
											Send Test Email
										</button>
										<button
											type="button"
											className="bg-red-700 py-1 px-4 rounded flex items-center gap-2"
											onClick={() =>
												sendNewsletterNow.mutate(Number(newsletterId))
											}
										>
											Send Newsletter Now
											{sendNewsletterNow.isPending && <LoadingSpinner />}
										</button>
										<button
											type="button"
											className="bg-green-700 py-1 px-4 rounded flex items-center gap-2"
											onClick={() =>
												scheduleNewsletter.mutate(Number(newsletterId))
											}
										>
											Schedule Newsletter
											{scheduleNewsletter.isPending && <LoadingSpinner />}
										</button>
									</div>
								</div>
								{isTestEmailDialogOpen && (
									<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
										<div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg w-96">
											<h2 className="text-lg font-bold mb-4">
												Send Test Email
											</h2>
											<form
												onSubmit={(e) => {
													e.preventDefault();
													const formData = new FormData(e.currentTarget);
													const email = formData.get("email") as string;
													sendTestNewsletter.mutate(
														{
															newsletterId: Number(newsletterId),
															recipient: email,
														},
														{
															onSuccess: () => {
																setIsTestEmailDialogOpen(false);
															},
														},
													);
												}}
												className="space-y-4"
											>
												<div>
													<label
														htmlFor="email"
														className="block text-sm font-medium mb-1"
													>
														Email Address
													</label>
													<input
														type="email"
														id="email"
														name="email"
														required={true}
														className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
													/>
												</div>
												<div className="flex justify-end gap-2">
													<button
														type="button"
														onClick={() => setIsTestEmailDialogOpen(false)}
														className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
													>
														Cancel
													</button>
													<button
														type="submit"
														disabled={sendTestNewsletter.isPending}
														className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
													>
														Send
														{sendTestNewsletter.isPending && (
															<>
																<LoadingSpinner />
																Sending...
															</>
														)}
													</button>
												</div>
											</form>
										</div>
									</div>
								)}
								<hr className="mb-3 mt-1" />
								{newsletterQuery.data.newsLettersToArticles.map(
									({ newsArticle: article }) => {
										return (
											<div key={article.id}>
												<h2 className="text-lg font-bold">
													{article.articleTitle}
												</h2>
												<p>{article.articleContent}</p>
												<hr className="my-3" />
											</div>
										);
									},
								)}
							</div>
						</Suspense>
					</div>
					<div className="w-[1px] bg-gray-700 h-full" />
					<ul className="list-disc min-w-48 h-full flex flex-col">
						<span className="p-2 text-center border-b border-gray-700">
							Remove Articles
						</span>
						<Suspense fallback={<div>Loading...</div>}>
							{newsletterQuery.data.newsLettersToArticles.map(
								({ newsArticle: article }) => {
									const removeArticleToNewsletter =
										useRemoveArticleToNewsletter();
									return (
										<li
											key={article.id}
											className="border-b border-gray-700 flex"
										>
											<div className="group block p-1 w-full flex items-center justify-between gap-2">
												{article.articleTitle}
												<button
													type="button"
													className="bg-red-500 p-1 aspect-square rounded flex items-center gap-2"
													onClick={() =>
														removeArticleToNewsletter.mutate({
															newsletterId: Number(newsletterId),
															articleId: article.id,
														})
													}
												>
													{removeArticleToNewsletter.isPending ? (
														<LoadingSpinner />
													) : (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															strokeWidth={1.5}
															stroke="currentColor"
															className="w-5 h-5"
														>
															<title>Remove Article</title>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="M8.25 4.5l7.5 7.5-7.5 7.5"
															/>
														</svg>
													)}
												</button>
											</div>
										</li>
									);
								},
							)}
						</Suspense>
					</ul>
					<div className="w-[1px] bg-gray-700 h-full" />
					<ul className="list-disc min-w-48 h-full flex flex-col">
						<span className="p-2 text-center border-b border-gray-700">
							Add Articles
						</span>
						<Suspense fallback={<div>Loading...</div>}>
							{articlesQuery.data
								.filter(
									(article) =>
										!newsletterQuery.data.newsLettersToArticles.some(
											(newsletterArticle) =>
												newsletterArticle.newsArticleId === article.id,
										),
								)
								.map((article) => {
									const addArticleToNewsletter = useAddArticleToNewsletter();

									return (
										<li
											key={article.id}
											className="border-b border-gray-700 flex"
										>
											<div className="group block p-1 w-full flex items-center gap-2">
												<button
													type="button"
													onClick={() =>
														addArticleToNewsletter.mutate({
															newsletterId: Number(newsletterId),
															articleId: article.id,
														})
													}
													className="bg-blue-500 p-1 aspect-square rounded flex items-center gap-2"
												>
													{addArticleToNewsletter.isPending ? (
														<LoadingSpinner />
													) : (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
															strokeWidth={1.5}
															stroke="currentColor"
															className="w-5 h-5"
														>
															<title>Add Article</title>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																d="M15.75 19.5L8.25 12l7.5-7.5"
															/>
														</svg>
													)}
												</button>
												{article.articleTitle}
											</div>
										</li>
									);
								})}
						</Suspense>
					</ul>
				</div>
			</Suspense>
		</div>
	);
}
