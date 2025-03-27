import * as schema from "@hedgeco/hedgeco-database";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
	Link,
	Outlet,
	createFileRoute,
	useNavigate,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { desc } from "drizzle-orm";
import { Suspense, useEffect } from "react";
import { z } from "zod";
import { db } from "~/utils/db";
import { adminAuthMiddleware } from "~/utils/middleware";

const USER_PAGE_SIZE = 10;

const fetchUsersQueryOptions = (page: number) => {
	const usablePage = page - 1;
	return queryOptions({
		queryKey: ["admin-users", usablePage],
		queryFn: () => fetchUsers({ data: { page: usablePage } }),
	});
};

const fetchUsers = createServerFn({ method: "GET" })
	.middleware([adminAuthMiddleware])
	.validator((options: { page: number }) => options)
	.handler(async ({ data }) => {
		const users = await db.query.users.findMany({
			offset: data.page * USER_PAGE_SIZE,
			limit: USER_PAGE_SIZE,
			orderBy: [desc(schema.users.id)],
		});

		return users;
	});

const searchSchema = z.object({
	page: fallback(z.number().min(1), 1).default(1),
});

export const Route = createFileRoute("/_authed-admin/admin/users")({
	loaderDeps: ({ search: { page } }) => ({ page }),
	loader: ({ context, deps: { page } }) => {
		context.queryClient.prefetchQuery(fetchUsersQueryOptions(page));
	},
	validateSearch: zodValidator(searchSchema),
	component: Deferred,
});

function Deferred() {
	return (
		<Suspense fallback="Loading...">
			<UsersComponent />
		</Suspense>
	);
}

function UsersComponent() {
	const { page } = Route.useSearch();
	const navigate = useNavigate({ from: "/admin/users" });
	const usersQuery = useSuspenseQuery(fetchUsersQueryOptions(page));
	const params = Route.useParams() as { userId?: string };
	const currentUserIndex =
		params?.userId == null
			? null
			: usersQuery.data.findIndex((user) => user.id === Number(params.userId));

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				const dir = event.key === "ArrowDown" ? 1 : -1;
				const isFirst = currentUserIndex === 0;
				const isLast = currentUserIndex === usersQuery.data.length - 1;
				if (isFirst && dir === -1) {
					if (page === 1) {
						return;
					}
					return navigate({
						search: (prev) => ({ page: prev.page - 1 }),
					});
				}
				if (
					isLast &&
					dir === 1 &&
					usersQuery.data.length % USER_PAGE_SIZE === 0
				) {
					return navigate({
						search: (prev) => ({ page: prev.page + 1 }),
					});
				}
				if (currentUserIndex == null) {
					const nextUser =
						dir === 1
							? usersQuery.data[0]
							: usersQuery.data[usersQuery.data.length - 1];
					if (nextUser == null) {
						return navigate({
							search: (prev) => ({ page: prev.page - 1 }),
						});
					}
					return navigate({
						to: "/admin/users/$userId",
						params: { userId: nextUser.id.toString() },
						search: (prev) => ({ page: prev.page }),
					});
				}

				const nextUserId =
					usersQuery.data[currentUserIndex + dir]?.id.toString();
				if (nextUserId != null) {
					return navigate({
						to: "/admin/users/$userId",
						params: { userId: nextUserId },
						search: (prev) => ({ page: prev.page }),
					});
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [currentUserIndex, navigate, usersQuery.data, page]);

	return (
		<div className="flex h-full">
			<ul className="list-disc min-w-48 h-full flex flex-col">
				<Suspense fallback={<div>Loading...</div>}>
					{usersQuery.data.length === 0 && (
						<div className="flex flex-grow justify-center">
							<p className="text-gray-500">No users</p>
						</div>
					)}
					{usersQuery.data.map((user) => {
						return (
							<li key={user.id} className="border-b border-gray-700 flex">
								<Link
									preload={false}
									to="/admin/users/$userId"
									params={{
										userId: user.id.toString(),
									}}
									search={{ page }}
									className="group block py-1 px-2 w-full border-l-4"
									inactiveProps={{
										className: "border-l-transparent",
									}}
									activeProps={{
										className: "text-black border-l-blue-800",
									}}
								>
									<div>
										<p className="text-lg text-blue-800 group-hover:text-blue-600">
											{`${user.email.substring(0, 16)}${
												user.email.length > 16 ? "..." : ""
											}`}
										</p>
									</div>
								</Link>
							</li>
						);
					})}
				</Suspense>
				<div className="flex flex-grow" />
				<div className="flex justify-center items-center border-t border-gray-700">
					<Link
						disabled={page === 1}
						to="/admin/users"
						search={{ page: page - 1 }}
						params={{
							userId: params?.userId,
						}}
						className="py-1 text-center flex-grow aria-disabled:cursor-not-allowed aria-disabled:text-gray-500"
					>
						Previous
					</Link>
					<div className="w-[1px] bg-gray-700 h-full" />
					<Link
						disabled={usersQuery.data.length % USER_PAGE_SIZE !== 0}
						to={params?.userId ? "/admin/users/$userId" : "/admin/users"}
						search={{ page: page + 1 }}
						params={{
							userId: params?.userId,
						}}
						className="py-1 text-center flex-grow aria-disabled:cursor-not-allowed aria-disabled:text-gray-500"
					>
						Next
					</Link>
				</div>
			</ul>
			<div className="w-[1px] bg-gray-700 h-full" />
			<Outlet />
		</div>
	);
}
