import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { NotFound } from "~/components/NotFound";
import {
	fetchArticleQueryOptions,
	useDeleteArticle,
	useUpdateArticle,
} from "~/data/articles";

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
					created at: {articleQuery.data.createdAt.toLocaleString()}
				</span>
				{articleQuery.data.updatedAt.getTime() !==
					articleQuery.data.createdAt.getTime() && (
					<span className="text-sm text-gray-500">
						updated at: {articleQuery.data.updatedAt.toLocaleString()}
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
					created at: {articleQuery.data.createdAt.toLocaleString()}
				</span>
				{articleQuery.data.updatedAt.getTime() !==
					articleQuery.data.createdAt.getTime() && (
					<span className="text-sm text-gray-500">
						updated at: {articleQuery.data.updatedAt.toLocaleString()}
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
