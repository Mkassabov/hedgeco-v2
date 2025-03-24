import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
	Link,
	Outlet,
	createFileRoute,
	useNavigate,
} from "@tanstack/react-router";
import { Suspense, useEffect } from "react";
import { fetchPosts } from "~/utils/articles";

const deferredQueryOptions = (page?: number) => {
	const usablePage = page ?? 0;
	return queryOptions({
		queryKey: ["articles", usablePage],
		queryFn: () => fetchPosts({ data: { page: usablePage } }),
	});
};

export const Route = createFileRoute("/_authed/articles")({
	// loader: ({ context }) => {
	// 	// Kick off loading as early as possible!
	// 	context.queryClient.prefetchQuery(deferredQueryOptions());
	// },\
	beforeLoad: ({ context }) => {
		if (context.user == null) {
			console.log("===========================");
			console.log("context.user", context.user);
			console.log("===========================");
			throw new Error("Not authenticated");
		}
	},
	component: Deferred,
});

function Deferred() {
	return (
		<div className="p-2">
			<Suspense fallback="Loading Middleman...">
				<ArticlesComponent />
			</Suspense>
		</div>
	);
}

function ArticlesComponent() {
	const navigate = useNavigate({ from: "/articles" });
	const postsQuery = useSuspenseQuery(deferredQueryOptions());
	const params = Route.useParams() as { articleId?: string };
	const currentPostIndex =
		params?.articleId == null
			? null
			: postsQuery.data.findIndex(
					(post) => post.id === Number(params.articleId),
				);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (currentPostIndex == null) {
				if (postsQuery.data[0] != null) {
					navigate({
						to: "/articles/$articleId",
						params: {
							articleId: postsQuery.data[0].id.toString(),
						},
					});
				}
			} else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				const diff = event.key === "ArrowDown" ? 1 : -1;
				const nextPostId =
					postsQuery.data[currentPostIndex + diff]?.id.toString();
				if (nextPostId != null) {
					navigate({
						to: "/articles/$articleId",
						params: {
							articleId: nextPostId.toString(),
						},
					});
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [currentPostIndex, navigate, postsQuery.data]);

	return (
		<div className="p-2 flex gap-2">
			<ul className="list-disc pl-4">
				<Suspense fallback={<div>Loading...</div>}>
					{postsQuery.data.map((post) => {
						return (
							<li key={post.id} className="whitespace-nowrap">
								<Link
									to="/articles/$articleId"
									params={{
										articleId: post.id.toString(),
									}}
									className="block py-1 text-blue-800 hover:text-blue-600"
									activeProps={{ className: "text-black font-bold" }}
								>
									<div>{post.articleTitle.substring(0, 20)}</div>
								</Link>
							</li>
						);
					})}
				</Suspense>
			</ul>
			<hr />
			<Outlet />
		</div>
	);
}
