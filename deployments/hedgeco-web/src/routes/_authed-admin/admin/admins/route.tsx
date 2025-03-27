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

const ADMIN_PAGE_SIZE = 10;

const fetchAdminsQueryOptions = (page: number) => {
	const usablePage = page - 1;
	return queryOptions({
		queryKey: ["admin-admins", usablePage],
		queryFn: () => fetchAdmins({ data: { page: usablePage } }),
	});
};

const fetchAdmins = createServerFn({ method: "GET" })
	.middleware([adminAuthMiddleware])
	.validator((options: { page: number }) => options)
	.handler(async ({ data }) => {
		const admins = await db.query.adminUsers.findMany({
			offset: data.page * ADMIN_PAGE_SIZE,
			limit: ADMIN_PAGE_SIZE,
			orderBy: [desc(schema.adminUsers.id)],
		});

		return admins;
	});

const searchSchema = z.object({
	page: fallback(z.number().min(1), 1).default(1),
});

export const Route = createFileRoute("/_authed-admin/admin/admins")({
	loaderDeps: ({ search: { page } }) => ({ page }),
	loader: ({ context, deps: { page } }) => {
		context.queryClient.prefetchQuery(fetchAdminsQueryOptions(page));
	},
	validateSearch: zodValidator(searchSchema),
	component: Deferred,
});

function Deferred() {
	return (
		<Suspense fallback="Loading...">
			<AdminsComponent />
		</Suspense>
	);
}

function AdminsComponent() {
	const { page } = Route.useSearch();
	const navigate = useNavigate({ from: "/admin/admins" });
	const adminsQuery = useSuspenseQuery(fetchAdminsQueryOptions(page));
	const params = Route.useParams() as { adminId?: string };
	const currentAdminIndex =
		params?.adminId == null
			? null
			: adminsQuery.data.findIndex(
					(admin) => admin.id === Number(params.adminId),
				);

	return (
		<AdminSidebar
			data={adminsQuery.data}
			page={page}
			navigate={navigate}
			currentIndex={currentAdminIndex}
			idPath="/admin/admins/$adminId"
			idPathParamName="adminId"
			renderTarget={(admin) => (
				<div>
					<p className="text-lg text-blue-800 group-hover:text-blue-600">
						{`${admin.email.substring(0, 16)}${
							admin.email.length > 16 ? "..." : ""
						}`}
					</p>
				</div>
			)}
			newPath="/admin/admins/new"
			newLabel="New Admin"
			pageSize={ADMIN_PAGE_SIZE}
		>
			<Outlet />
		</AdminSidebar>
	);
}
