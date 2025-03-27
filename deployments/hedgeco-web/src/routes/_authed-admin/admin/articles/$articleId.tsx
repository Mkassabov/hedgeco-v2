import * as schema from "@hedgeco/hedgeco-database";
import {
	type MutationOptions,
	queryOptions,
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { isNotFound, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { type FormEvent, Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { NotFound } from "~/components/NotFound";
import { db } from "~/utils/db";
import { adminAuthMiddleware } from "~/utils/middleware";

export const fetchArticleQueryOptions = (articleId: number) => {
	return queryOptions({
		queryKey: ["admin-rticle", articleId],
		queryFn: () => fetchArticle({ data: articleId }),
		retry: (failureCount, error) => {
			if (isNotFound(error)) {
				return false;
			}
			return failureCount < 3;
		},
	});
};

function useDeleteArticle(
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

const deleteArticle = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator((articleId: number) => articleId)
	.handler(async ({ data }) => {
		await db
			.delete(schema.newsArticles)
			.where(eq(schema.newsArticles.id, data));
	});

function useUpdateArticle(
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

const updateArticle = createServerFn({ method: "POST" })
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

const fetchArticle = createServerFn({ method: "GET" })
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

export const Route = createFileRoute(
	"/_authed-admin/admin/articles/$articleId",
)({
	loader: ({ context, params: { articleId } }) => {
		context.queryClient.prefetchQuery(
			fetchArticleQueryOptions(Number(articleId)),
		);
	},
	component: Deferred,
	notFoundComponent: () => {
		return <NotFound>Article not found</NotFound>;
	},
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
				<ArticleComponent />
			</ErrorBoundary>
		</Suspense>
	);
}

function ArticleComponent() {
	const [isEditView, setIsEditView] = useState(false);

	return (
		<div className="space-y-2 p-2 flex-grow">
			<Suspense fallback="Loading...">
				{isEditView ? (
					<Edit setIsReadView={() => setIsEditView(false)} />
				) : (
					<ReadView setIsEditView={() => setIsEditView(true)} />
				)}
			</Suspense>
		</div>
	);
}

function ReadView({ setIsEditView }: { setIsEditView: () => void }) {
	const { articleId } = Route.useParams();
	const articleQuery = useSuspenseQuery(
		fetchArticleQueryOptions(Number(articleId)),
	);
	const navigate = useNavigate({ from: "/admin/articles/$articleId" });

	const deleteArticle = useDeleteArticle({
		onSuccess: () => {
			navigate({
				to: "/admin/articles",
				search: (prev) => ({ page: prev.page }),
			});
		},
	});

	return (
		<div className="flex flex-col gap-2">
			<div className="flex justify-between items-center">
				<h1 className="text-xl font-bold py-1 pr-2 ">
					{articleQuery.data.articleTitle}
				</h1>
				<div className="flex gap-2">
					<button
						type="button"
						className="bg-blue-600 py-1 px-4 rounded"
						onClick={setIsEditView}
					>
						Edit
					</button>
					<button
						type="button"
						className="bg-red-500 py-1 px-4 rounded flex items-center gap-2"
						onClick={() => deleteArticle.mutate(Number(articleId))}
					>
						Delete
						{deleteArticle.isPending && <LoadingSpinner />}
					</button>
				</div>
			</div>
			<div className="flex flex-col">
				<span className="text-sm text-gray-500">
					created at: {new Date(articleQuery.data.createdAt).toLocaleString()}
				</span>
				{articleQuery.data.updatedAt.getTime() !==
					articleQuery.data.createdAt.getTime() && (
					<span className="text-sm text-gray-500">
						updated at: {new Date(articleQuery.data.updatedAt).toLocaleString()}
					</span>
				)}
			</div>
			<div className="text-sm pt-2">{articleQuery.data.articleContent}</div>
		</div>
	);
}

function Edit({ setIsReadView }: { setIsReadView: () => void }) {
	const { articleId } = Route.useParams();
	const articleQuery = useSuspenseQuery(
		fetchArticleQueryOptions(Number(articleId)),
	);
	const updateArticle = useUpdateArticle({
		onSuccess: () => {
			setIsReadView();
		},
	});

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.nativeEvent.target as HTMLFormElement);

		updateArticle.mutate({
			id: Number(articleId),
			articleTitle: formData.get("articleTitle") as string,
			articleContent: formData.get("articleContent") as string,
		});
	}

	return (
		<form className="flex flex-col gap-2 h-full" onSubmit={handleSubmit}>
			<div className="flex justify-between items-center">
				{/* <h1 className="text-xl font-bold">{articleQuery.data.articleTitle}</h1> */}
				<input
					type="text"
					className="text-xl font-bold py-1 px-2 rounded"
					defaultValue={articleQuery.data.articleTitle}
					name="articleTitle"
				/>
				<div className="flex gap-2">
					<button
						type="submit"
						className="bg-blue-600 py-1 px-4 rounded flex items-center gap-2"
					>
						Save
						{updateArticle.isPending && <LoadingSpinner />}
					</button>
					<button
						type="button"
						className="bg-red-500 py-1 px-4 rounded flex items-center gap-2"
						onClick={setIsReadView}
					>
						Discard Changes
					</button>
				</div>
			</div>
			<div className="flex flex-col">
				<span className="text-sm text-gray-500">
					created at: {new Date(articleQuery.data.createdAt).toLocaleString()}
				</span>
				{articleQuery.data.updatedAt.getTime() !==
					articleQuery.data.createdAt.getTime() && (
					<span className="text-sm text-gray-500">
						updated at: {new Date(articleQuery.data.updatedAt).toLocaleString()}
					</span>
				)}
			</div>
			<textarea
				name="articleContent"
				className="text-sm w-full flex-grow min-h-48 p-2 rounded"
				defaultValue={articleQuery.data.articleContent}
			/>
		</form>
	);
}
