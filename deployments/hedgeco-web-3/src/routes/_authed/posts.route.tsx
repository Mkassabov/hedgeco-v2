import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { fetchPosts } from "~/utils/posts.js";

const deferredQueryOptions = () =>
	queryOptions({
		queryKey: ["deferred"],
		queryFn: fetchPosts,
	});

export const Route = createFileRoute("/_authed/posts")({
	loader: ({ context }) => {
		// Kick off loading as early as possible!
		context.queryClient.prefetchQuery(deferredQueryOptions());
	},
	component: Deferred,
});

function Deferred() {
	return (
		<div className="p-2">
			<Suspense fallback="Loading Middleman...">
				<PostsComponent />
			</Suspense>
		</div>
	);
}

function PostsComponent() {
	const postsQuery = useSuspenseQuery(deferredQueryOptions());

	return (
		<div className="p-2 flex gap-2">
			<ul className="list-disc pl-4">
				<Suspense fallback={<div>Loading...</div>}>
					{[
						...postsQuery.data,
						{ id: "i-do-not-exist", title: "Non-existent Post" },
					].map((post) => {
						return (
							<li key={post.id} className="whitespace-nowrap">
								<Link
									to="/posts/$postId"
									params={{
										postId: post.id,
									}}
									className="block py-1 text-blue-800 hover:text-blue-600"
									activeProps={{ className: "text-black font-bold" }}
								>
									<div>{post.title.substring(0, 20)}</div>
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
