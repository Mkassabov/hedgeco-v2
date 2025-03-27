import * as schema from "@hedgeco/hedgeco-database";
import mailchimp from "@mailchimp/mailchimp_marketing";
import {
	type MutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type FormEvent, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { fetchNewsletterQueryOptions } from "~/routes/_authed-admin/admin/newsletters/$newsletterId";
import { db } from "~/utils/db";
import { adminAuthMiddleware } from "~/utils/middleware";

export const Route = createFileRoute("/_authed-admin/admin/newsletters/new")({
	component: Deferred,
});

function useCreateNewsletter(
	options?: Omit<
		MutationOptions<number, Error, { releaseDate: Date }>,
		"mutationFn"
	>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (newsletter: {
			releaseDate: Date;
		}) => createNewsletter({ data: newsletter }),
		...options,
		onSuccess: async (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
			queryClient.prefetchQuery(fetchNewsletterQueryOptions(data));
			if (options?.onSuccess) {
				await options.onSuccess(data, variables, context);
			}
		},
	});
}

const createNewsletter = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator((newsletter: { releaseDate: Date }) => newsletter)
	.handler(async ({ data }) => {
		mailchimp.setConfig({
			apiKey: process.env.MAILCHIMP_API_KEY,
			server: process.env.MAILCHIMP_SERVER,
		});
		const result: mailchimp.campaigns.Campaigns =
			await mailchimp.campaigns.create({
				type: "regular",
				recipients: {
					segment_opts: {
						saved_segment_id: Number(process.env.MAILCHIMP_TESTING_SEGMENT_ID),
					},
					list_id: process.env.MAILCHIMP_LIST_ID,
				},
				settings: {
					subject_line: "HedgeCo Newsletter",
					preview_text: "HedgeCo Newsletter",
					title: `HedgeCo Newsletter - ${new Date().toLocaleDateString()}`,
					from_name: "HedgeCo Newsletter",
					reply_to: "newsletter@hedgeco.net",
					template_id: Number(process.env.MAILCHIMP_TEMPLATE_ID),
				},
			});
		const response = await db.insert(schema.newsLetters).values({
			releaseDate: data.releaseDate,
			mailchimpCampaignId: result.id,
		});
		return response[0].insertId;
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
				<NewArticleComponent />
			</ErrorBoundary>
		</Suspense>
	);
}

function NewArticleComponent() {
	const navigate = useNavigate({ from: "/admin/newsletters/new" });
	const createArticle = useCreateNewsletter({
		onSuccess: (data) => {
			navigate({
				to: "/admin/newsletters/$newsletterId",
				params: { newsletterId: data.toString() },
				search: (prev) => ({ page: prev.page }),
			});
		},
	});

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.nativeEvent.target as HTMLFormElement);

		createArticle.mutate({
			releaseDate: new Date(formData.get("releaseDate") as string),
		});
	}
	return (
		<div className="space-y-2 p-2 flex-grow">
			<Suspense fallback="Loading...">
				<form className="flex flex-col gap-2 h-full" onSubmit={handleSubmit}>
					<input
						type="datetime-local"
						className="py-1 px-2 rounded w-72"
						name="releaseDate"
						placeholder="Release Date"
					/>
					<div className="flex gap-2">
						<button
							type="submit"
							className="bg-blue-600 py-1 px-4 rounded flex items-center gap-2"
						>
							Create Newsletter
							{createArticle.isPending && <LoadingSpinner />}
						</button>
					</div>
				</form>
			</Suspense>
		</div>
	);
}
