import * as schema from "@hedgeco/hedgeco-database";
import {
	type MutationOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { type FormEvent, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { fetchAdminQueryOptions } from "~/routes/_authed-admin/admin/admins/$adminId";
import { db } from "~/utils/db";
import { adminAuthMiddleware } from "~/utils/middleware";

export const Route = createFileRoute("/_authed-admin/admin/admins/new")({
	component: Deferred,
});

function useCreateAdmin(
	options?: Omit<
		MutationOptions<number, Error, { email: string }>,
		"mutationFn"
	>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (admin: {
			email: string;
		}) => createAdmin({ data: admin }),
		...options,
		onSuccess: async (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ["admin-admins"] });
			queryClient.prefetchQuery(fetchAdminQueryOptions(data));
			if (options?.onSuccess) {
				await options.onSuccess(data, variables, context);
			}
		},
	});
}

const createAdmin = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator((admin: { email: string }) => admin)
	.handler(async ({ data }) => {
		const response = await db.insert(schema.adminUsers).values({
			email: data.email,
		});
		return response[0].insertId;
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
				<NewAdminComponent />
			</ErrorBoundary>
		</Suspense>
	);
}

function NewAdminComponent() {
	const navigate = useNavigate({ from: "/admin/admins/new" });
	const createAdmin = useCreateAdmin({
		onSuccess: (data) => {
			navigate({
				to: "/admin/admins/$adminId",
				params: { adminId: data.toString() },
				search: (prev) => ({ page: prev.page }),
			});
		},
	});

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const formData = new FormData(event.nativeEvent.target as HTMLFormElement);

		createAdmin.mutate({
			email: formData.get("email") as string,
		});
	}
	return (
		<div className="space-y-2 p-2 flex-grow">
			<Suspense fallback="Loading...">
				<form className="flex flex-col gap-2 h-full" onSubmit={handleSubmit}>
					<input
						type="text"
						className="py-1 px-2 rounded w-72"
						name="email"
						placeholder="Email"
					/>
					<div className="flex gap-2">
						<button
							type="submit"
							className="bg-blue-600 py-1 px-4 rounded flex items-center gap-2"
						>
							Create Admin
							{createAdmin.isPending && <LoadingSpinner />}
						</button>
					</div>
				</form>
			</Suspense>
		</div>
	);
}
