import { actions } from "astro:actions";
import type { newsArticles } from "@hedgeco/hedgeco-database";
import { useState } from "react";

// Icon Components
const AddIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5 mr-2 text-blue-500"
		viewBox="0 0 20 20"
		fill="currentColor"
		aria-hidden="true"
	>
		<title>Add icon</title>
		<path
			fillRule="evenodd"
			d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
			clipRule="evenodd"
		/>
	</svg>
);

const CalendarIcon = ({ className = "h-4 w-4 mr-1" }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		aria-hidden="true"
	>
		<title>Calendar icon</title>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
		/>
	</svg>
);

const SadFaceIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-12 w-12 mx-auto text-gray-400 mb-4"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		aria-hidden="true"
	>
		<title>Sad face icon</title>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
		/>
	</svg>
);

const DocumentIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-16 w-16 mx-auto text-gray-300 mb-4"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		aria-hidden="true"
	>
		<title>Document icon</title>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
		/>
	</svg>
);

const PrevIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		viewBox="0 0 20 20"
		fill="currentColor"
	>
		<title>Previous page</title>
		<path
			fillRule="evenodd"
			d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
			clipRule="evenodd"
		/>
	</svg>
);

const NextIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		viewBox="0 0 20 20"
		fill="currentColor"
	>
		<title>Next page</title>
		<path
			fillRule="evenodd"
			d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
			clipRule="evenodd"
		/>
	</svg>
);

// Edit Icon
const EditIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		aria-hidden="true"
	>
		<title>Edit icon</title>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
		/>
	</svg>
);

// Save Icon
const SaveIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		aria-hidden="true"
	>
		<title>Save icon</title>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
		/>
	</svg>
);

// Cancel Icon
const CancelIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		aria-hidden="true"
	>
		<title>Cancel icon</title>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M6 18L18 6M6 6l12 12"
		/>
	</svg>
);

const ArticleContent = ({
	article,
	isNewArticle,
	onCancelNewArticle,
}: {
	article: typeof newsArticles.$inferSelect | null;
	isNewArticle?: boolean;
	onCancelNewArticle?: () => void;
}) => {
	const [isEditMode, setIsEditMode] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// Create new article form
	if (isNewArticle) {
		return (
			<form method="POST" action={actions.upsertArticle} className="space-y-4">
				<div className="flex justify-between items-center mb-4 border-b pb-4">
					<h3 className="text-2xl font-bold text-gray-800">New Article</h3>
					<div className="flex space-x-2">
						<button
							type="button"
							onClick={onCancelNewArticle}
							className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
						>
							<CancelIcon /> <span className="ml-1">Cancel</span>
						</button>
						<button
							type="submit"
							className="px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
							onClick={() => setIsSaving(true)}
						>
							<SaveIcon />
							<span className="ml-1">{isSaving ? "Saving..." : "Save"}</span>
						</button>
					</div>
				</div>

				<div>
					<label
						htmlFor="articleTitle"
						className="block text-sm font-medium text-gray-700"
					>
						Title
					</label>
					<input
						type="text"
						name="articleTitle"
						id="articleTitle"
						className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						required={true}
					/>
				</div>

				<div>
					<label
						htmlFor="articleContent"
						className="block text-sm font-medium text-gray-700"
					>
						Content
					</label>
					<textarea
						name="articleContent"
						id="articleContent"
						rows={12}
						className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						required={true}
					/>
				</div>
			</form>
		);
	}

	if (!article) {
		return (
			<div className="text-center py-16">
				<DocumentIcon />
				<p className="text-gray-500 text-lg">
					Select an article to view its content
				</p>
				<p className="text-gray-400 text-sm mt-2">
					Articles appear in the left panel
				</p>
			</div>
		);
	}

	const articleNotFound = (
		<div className="text-center py-12">
			<SadFaceIcon />
			<p className="text-gray-500">Article not found</p>
		</div>
	);

	// This should never happen if article is passed, but keeping it for type safety
	if (!article.id) {
		return articleNotFound;
	}

	// Edit Mode View
	if (isEditMode) {
		return (
			<form method="POST" action={actions.upsertArticle} className="space-y-4">
				<input type="hidden" name="articleId" value={article.id} />
				<div className="flex justify-between items-center mb-4 border-b pb-4">
					<h3 className="text-2xl font-bold text-gray-800">Edit Article</h3>
					<div className="flex space-x-2">
						<button
							type="button"
							onClick={() => setIsEditMode(false)}
							className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
						>
							<CancelIcon /> <span className="ml-1">Cancel</span>
						</button>
						<button
							type="submit"
							className="px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
							onClick={() => setIsSaving(true)}
						>
							<SaveIcon />
							<span className="ml-1">{isSaving ? "Saving..." : "Save"}</span>
						</button>
					</div>
				</div>

				<div>
					<label
						htmlFor="articleTitle"
						className="block text-sm font-medium text-gray-700"
					>
						Title
					</label>
					<input
						type="text"
						name="articleTitle"
						id="articleTitle"
						defaultValue={article.articleTitle}
						className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						required={true}
					/>
				</div>

				<div>
					<label
						htmlFor="articleContent"
						className="block text-sm font-medium text-gray-700"
					>
						Content
					</label>
					<textarea
						name="articleContent"
						id="articleContent"
						rows={12}
						defaultValue={article.articleContent}
						className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						required={true}
					/>
				</div>

				<div className="mt-2 text-sm text-gray-500">
					<div className="flex items-center">
						<CalendarIcon className="h-5 w-5 mr-1" />
						<span>
							Created: {new Date(article.createdAt).toLocaleDateString()}
							{article.updatedAt > article.createdAt && (
								<span className="ml-3 italic">
									(Last updated:{" "}
									{new Date(article.updatedAt).toLocaleDateString()})
								</span>
							)}
						</span>
					</div>
				</div>
			</form>
		);
	}

	// View Mode (Default)
	return (
		<div>
			<div className="flex justify-between items-center mb-4 border-b pb-4">
				<h3 className="text-2xl font-bold text-gray-800">
					{article.articleTitle}
				</h3>
				<button
					type="button"
					onClick={() => setIsEditMode(true)}
					className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					aria-label="Edit article"
				>
					<EditIcon />
				</button>
			</div>

			<div className="flex items-center mb-6 text-sm text-gray-500">
				<CalendarIcon className="h-5 w-5 mr-1" />
				Published on {new Date(article.createdAt).toLocaleDateString()}
				{article.updatedAt > article.createdAt && (
					<span className="ml-3 text-gray-400 italic text-xs">
						(Updated: {new Date(article.updatedAt).toLocaleDateString()})
					</span>
				)}
			</div>
			<div className="prose max-w-none prose-blue prose-img:rounded-lg prose-headings:text-gray-800">
				{article.articleContent}
			</div>
		</div>
	);
};

// Main Component
export function Articles(props: {
	articles: Array<typeof newsArticles.$inferSelect>;
	pageNumber: number;
	articleId: number | null;
	preloadArticle: typeof newsArticles.$inferSelect | null;
}) {
	const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
		props.articleId,
	);
	const [showNewArticleForm, setShowNewArticleForm] = useState(false);

	const selectedArticle = selectedArticleId
		? (props.articles.find((a) => a.id === selectedArticleId) ??
			props.preloadArticle ??
			null)
		: null;

	return (
		<div className="max-w-7xl mx-auto px-4 py-8">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{/* Left column - Article List */}
				<div className="md:col-span-1 bg-white rounded-lg shadow-md overflow-hidden h-fit sticky top-4">
					<div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
						<h2 className="text-xl font-bold text-white">Articles</h2>
					</div>

					<div className="border-b border-gray-200">
						<button
							type="button"
							className="w-full text-left p-4 border-l-4 border-l-transparent hover:bg-gray-50 transition-colors flex items-center"
							onClick={() => {
								setShowNewArticleForm(true);
								setSelectedArticleId(null);
							}}
						>
							<AddIcon />
							<span className="font-semibold text-blue-500">
								Add New Article
							</span>
						</button>
					</div>

					<div className="overflow-y-auto max-h-[calc(100vh-260px)]">
						{props.articles.length === 0 ? (
							<div className="p-6 text-center text-gray-500">
								No articles available
							</div>
						) : (
							props.articles.map((article) => (
								<button
									key={article.id}
									type="button"
									className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset border-l-4 ${
										selectedArticleId === article.id
											? "bg-blue-50 border-l-blue-500"
											: "border-l-transparent"
									}`}
									onClick={() => {
										setSelectedArticleId(article.id);
										window.history.pushState(
											{},
											"",
											`/admin/articles?page=${props.pageNumber}&articleId=${article.id}`,
										);
									}}
									onKeyUp={(e) => {
										if (e.key === "Enter") {
											setSelectedArticleId(article.id);
										}
									}}
									aria-pressed={selectedArticleId === article.id}
								>
									<h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
										{article.articleTitle}
									</h3>
									<p className="text-sm text-gray-500 flex items-center">
										<CalendarIcon />
										{new Date(article.createdAt).toLocaleDateString()}
									</p>
								</button>
							))
						)}
					</div>

					{/* Pagination Controls */}
					<div className="p-3 border-t border-gray-200 flex justify-between items-center bg-gray-50">
						<a
							href={`/admin/articles?page=${props.pageNumber - 1}${
								props.articleId ? `&articleId=${props.articleId}` : ""
							}`}
							className={`px-3 py-1 rounded ${
								props.pageNumber === 1
									? "text-gray-400 cursor-not-allowed pointer-events-none"
									: "text-blue-600 hover:bg-blue-100"
							}`}
							aria-label="Previous page"
						>
							<PrevIcon />
						</a>

						<span className="text-sm text-gray-600">
							Page {props.pageNumber}
						</span>

						<a
							href={`/admin/articles?page=${props.pageNumber + 1}${
								props.articleId ? `&articleId=${props.articleId}` : ""
							}`}
							className={"px-3 py-1 rounded text-blue-600 hover:bg-blue-100"}
							aria-label="Next page"
						>
							<NextIcon />
						</a>
					</div>
				</div>

				{/* Right column - Article Content */}
				<div className="md:col-span-2">
					<div className="bg-white rounded-lg shadow-md p-6">
						{showNewArticleForm ? (
							<ArticleContent
								article={null}
								isNewArticle={true}
								onCancelNewArticle={() => setShowNewArticleForm(false)}
							/>
						) : (
							<ArticleContent article={selectedArticle} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
