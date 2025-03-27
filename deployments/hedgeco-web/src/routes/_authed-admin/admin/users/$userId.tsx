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

export const fetchUserQueryOptions = (userId: number) => {
	return queryOptions({
		queryKey: ["admin-user", userId],
		queryFn: () => fetchUser({ data: userId }),
		retry: (failureCount, error) => {
			if (isNotFound(error)) {
				return false;
			}
			return failureCount < 3;
		},
	});
};

function useDeleteUser(
	options?: Omit<MutationOptions<void, Error, number>, "mutationFn">,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (userId: number) => deleteUser({ data: userId }),
		...options,
		onSuccess: async (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["admin-users"] });
			queryClient.invalidateQueries({ queryKey: ["admin-user", variables] });
			if (options?.onSuccess) {
				await options.onSuccess(data, variables, context);
			}
		},
	});
}

const deleteUser = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator((userId: number) => userId)
	.handler(async ({ data }) => {
		await db.delete(schema.users).where(eq(schema.users.id, data));
	});

const fetchUser = createServerFn({ method: "GET" })
	.middleware([adminAuthMiddleware])
	.validator((userId: number) => userId)
	.handler(async ({ data }) => {
		const user = await db.query.users.findFirst({
			where: eq(schema.users.id, data),
		});

		if (!user) {
			throw notFound();
		}

		return user;
	});

export const Route = createFileRoute("/_authed-admin/admin/users/$userId")({
	loader: ({ context, params: { userId } }) => {
		context.queryClient.prefetchQuery(fetchUserQueryOptions(Number(userId)));
	},
	component: Deferred,
	notFoundComponent: () => {
		return <NotFound>User not found</NotFound>;
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
				<UserComponent />
			</ErrorBoundary>
		</Suspense>
	);
}

function UserComponent() {
	const { userId } = Route.useParams();
	const userQuery = useSuspenseQuery(fetchUserQueryOptions(Number(userId)));
	const navigate = useNavigate({ from: "/admin/users/$userId" });

	const deleteUser = useDeleteUser({
		onSuccess: () => {
			navigate({
				to: "/admin/users",
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
							{userQuery.data.email}
						</h1>
						<div className="flex gap-2">
							<button
								type="button"
								className="bg-red-500 py-1 px-4 rounded flex items-center gap-2"
								onClick={() => deleteUser.mutate(Number(userId))}
							>
								Delete
								{deleteUser.isPending && <LoadingSpinner />}
							</button>
						</div>
					</div>
					<hr />
					<pre>{JSON.stringify(userQuery.data, null, 2)}</pre>
				</div>
			</Suspense>
		</div>
	);
}
