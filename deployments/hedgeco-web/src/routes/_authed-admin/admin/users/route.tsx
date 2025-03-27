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

	return (
		<AdminSidebar
			data={usersQuery.data}
			page={page}
			navigate={navigate}
			currentIndex={currentUserIndex}
			idPath="/admin/users/$userId"
			idPathParamName="userId"
			renderTarget={(user) => (
				<div>
					<p className="text-lg text-blue-800 group-hover:text-blue-600">
						{`${user.email.substring(0, 16)}${
							user.email.length > 16 ? "..." : ""
						}`}
					</p>
				</div>
			)}
			pageSize={USER_PAGE_SIZE}
		>
			<Outlet />
		</AdminSidebar>
	);
}
