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
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { NotFound } from "~/components/NotFound";
import { db } from "~/utils/db";
import { adminAuthMiddleware } from "~/utils/middleware";

export const fetchAdminQueryOptions = (adminId: number) => {
	return queryOptions({
		queryKey: ["admin-admins", adminId],
		queryFn: () => fetchAdmin({ data: adminId }),
		retry: (failureCount, error) => {
			if (isNotFound(error)) {
				return false;
			}
			return failureCount < 3;
		},
	});
};

function useDeleteAdmin(
	options?: Omit<MutationOptions<void, Error, number>, "mutationFn">,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (adminId: number) => deleteAdmin({ data: adminId }),
		...options,
		onSuccess: async (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
			queryClient.invalidateQueries({ queryKey: ["admin-admin", variables] });
			if (options?.onSuccess) {
				await options.onSuccess(data, variables, context);
			}
		},
	});
}

const deleteAdmin = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator((adminId: number) => adminId)
	.handler(async ({ data }) => {
		await db.delete(schema.adminUsers).where(eq(schema.adminUsers.id, data));
	});

const fetchAdmin = createServerFn({ method: "GET" })
	.middleware([adminAuthMiddleware])
	.validator((adminId: number) => adminId)
	.handler(async ({ data }) => {
		const admin = await db.query.adminUsers.findFirst({
			where: eq(schema.adminUsers.id, data),
		});

		if (!admin) {
			throw notFound();
		}

		return admin;
	});

export const Route = createFileRoute("/_authed-admin/admin/admins/$adminId")({
	loader: ({ context, params: { adminId } }) => {
		context.queryClient.prefetchQuery(fetchAdminQueryOptions(Number(adminId)));
	},
	component: Deferred,
	notFoundComponent: () => {
		return <NotFound>Admin not found</NotFound>;
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
				<AdminComponent />
			</ErrorBoundary>
		</Suspense>
	);
}

function AdminComponent() {
	const { adminId } = Route.useParams();
	const adminQuery = useSuspenseQuery(fetchAdminQueryOptions(Number(adminId)));
	const navigate = useNavigate({ from: "/admin/admins/$adminId" });

	const deleteAdmin = useDeleteAdmin({
		onSuccess: () => {
			navigate({
				to: "/admin/admins",
				search: (prev) => ({ page: prev.page }),
			});
		},
	});

	return (
		<div className="space-y-2 p-2 flex-grow">
			<Suspense fallback="Loading...">
				<div className="flex flex-col gap-2">
					<div className="flex justify-between items-center">
						<h1 className="text-xl font-bold py-1 pr-2 ">
							{adminQuery.data.email}
						</h1>
						<div className="flex gap-2">
							<button
								type="button"
								className="bg-red-500 py-1 px-4 rounded flex items-center gap-2"
								onClick={() => deleteAdmin.mutate(Number(adminId))}
							>
								Delete
								{deleteAdmin.isPending && <LoadingSpinner />}
							</button>
						</div>
					</div>
					<hr />
					<pre>{JSON.stringify(adminQuery.data, null, 2)}</pre>
				</div>
			</Suspense>
		</div>
	);
}
