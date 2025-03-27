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

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				const dir = event.key === "ArrowDown" ? 1 : -1;
				const isFirst = currentAdminIndex === 0;
				const isLast = currentAdminIndex === adminsQuery.data.length - 1;
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
					adminsQuery.data.length % ADMIN_PAGE_SIZE === 0
				) {
					return navigate({
						search: (prev) => ({ page: prev.page + 1 }),
					});
				}
				if (currentAdminIndex == null) {
					const nextAdmin =
						dir === 1
							? adminsQuery.data[0]
							: adminsQuery.data[adminsQuery.data.length - 1];
					if (nextAdmin == null) {
						return navigate({
							search: (prev) => ({ page: prev.page - 1 }),
						});
					}
					return navigate({
						to: "/admin/admins/$adminId",
						params: { adminId: nextAdmin.id.toString() },
						search: (prev) => ({ page: prev.page }),
					});
				}

				const nextAdminId =
					adminsQuery.data[currentAdminIndex + dir]?.id.toString();
				if (nextAdminId != null) {
					return navigate({
						to: "/admin/admins/$adminId",
						params: { adminId: nextAdminId },
						search: (prev) => ({ page: prev.page }),
					});
				}
			}
			if (event.key === "c") {
				return navigate({
					to: "/admin/admins/new",
					search: (prev) => ({ page: prev.page }),
				});
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [currentAdminIndex, navigate, adminsQuery.data, page]);

	return (
		<div className="flex h-full">
			<ul className="list-disc min-w-48 h-full flex flex-col">
				<Link
					to="/admin/admins/new"
					className="border-b border-gray-700 h-14 flex items-center justify-center group"
				>
					<div className="text-lg group-hover:text-blue-800">New Admin</div>
				</Link>
				<Suspense fallback={<div>Loading...</div>}>
					{adminsQuery.data.map((admins) => {
						return (
							<li key={admins.id} className="border-b border-gray-700 flex">
								<Link
									preload={false}
									to="/admin/admins/$adminId"
									params={{
										adminId: admins.id.toString(),
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
											{`${admins.email.substring(0, 16)}${
												admins.email.length > 16 ? "..." : ""
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
						to="/admin/admins"
						search={{ page: page - 1 }}
						params={{
							adminId: params?.adminId,
						}}
						className="py-1 text-center flex-grow aria-disabled:cursor-not-allowed aria-disabled:text-gray-500"
					>
						Previous
					</Link>
					<div className="w-[1px] bg-gray-700 h-full" />
					<Link
						disabled={adminsQuery.data.length % ADMIN_PAGE_SIZE !== 0}
						to={params?.adminId ? "/admin/admins/$adminId" : "/admin/admins"}
						search={{ page: page + 1 }}
						params={{
							adminId: params?.adminId,
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
