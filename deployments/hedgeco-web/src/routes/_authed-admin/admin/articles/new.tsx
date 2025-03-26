import * as schema from "@hedgeco/hedgeco-database";
import {
	type MutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type FormEvent, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { adminAuthMiddleware } from "~/data/middleware";
import { fetchArticleQueryOptions } from "~/routes/_authed-admin/admin/articles/$articleId";
import { db } from "~/utils/db";

export const Route = createFileRoute("/_authed-admin/admin/articles/new")({
	component: Deferred,
});

function useCreateArticle(
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

const createArticle = createServerFn({ method: "POST" })
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
	const navigate = useNavigate({ from: "/admin/articles/new" });
	const createArticle = useCreateArticle({
		onSuccess: (data) => {
			navigate({
				to: "/admin/articles/$articleId",
				params: { articleId: data.toString() },
				search: (prev) => ({ page: prev.page }),
			});
		},
	});

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.nativeEvent.target as HTMLFormElement);

		createArticle.mutate({
			articleTitle: formData.get("articleTitle") as string,
			articleContent: formData.get("articleContent") as string,
		});
	}
	return (
		<div className="space-y-2 p-2 flex-grow">
			<Suspense fallback="Loading...">
				<form className="flex flex-col gap-2 h-full" onSubmit={handleSubmit}>
					<div className="flex justify-between items-center">
						<input
							type="text"
							className="text-xl font-bold py-1 px-2 rounded"
							name="articleTitle"
							placeholder="Article Title"
						/>
						<div className="flex gap-2">
							<button
								type="submit"
								className="bg-blue-600 py-1 px-4 rounded flex items-center gap-2"
							>
								Save
								{createArticle.isPending && <LoadingSpinner />}
							</button>
							<Link
								to="/admin/articles"
								className="bg-red-500 py-1 px-4 rounded flex items-center gap-2"
							>
								Discard Changes
							</Link>
						</div>
					</div>
					<textarea
						name="articleContent"
						className="text-sm w-full flex-grow min-h-48 p-2 rounded"
						placeholder="Article Content"
					/>
				</form>
			</Suspense>
		</div>
	);
}
