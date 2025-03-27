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
import { sendEmail } from "~/utils/ses";

export const fetchRegistrationRequestQueryOptions = (
	registrationRequestId: number,
) => {
	return queryOptions({
		queryKey: ["admin-registration-request", registrationRequestId],
		queryFn: () => fetchRegistrationRequest({ data: registrationRequestId }),
		retry: (failureCount, error) => {
			if (isNotFound(error)) {
				return false;
			}
			return failureCount < 3;
		},
	});
};

function useRejectRegistrationRequest(
	options?: Omit<MutationOptions<void, Error, number>, "mutationFn">,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (registrationRequestId: number) =>
			rejectRegistrationRequest({ data: registrationRequestId }),
		...options,
		onSuccess: async (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: ["admin-registration-requests"],
			});
			queryClient.invalidateQueries({
				queryKey: ["admin-registration-request", variables],
			});
			if (options?.onSuccess) {
				await options.onSuccess(data, variables, context);
			}
		},
	});
}

const rejectRegistrationRequest = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator((registrationRequestId: number) => registrationRequestId)
	.handler(async ({ data }) => {
		const registrationRequest = await db.query.registrationRequests.findFirst({
			where: eq(schema.registrationRequests.id, data),
		});
		if (!registrationRequest) {
			throw notFound();
		}
		await db
			.delete(schema.registrationRequests)
			.where(eq(schema.registrationRequests.id, registrationRequest.id));
		await sendEmail(
			registrationRequest.email,
			"Hedgeco - Registration Request Rejected",
			"Your hedgeco registration request has been rejected.",
		);
	});

function useApproveRegistrationRequest(
	options?: Omit<
		MutationOptions<
			number,
			Error,
			{ registrationRequestId: number; newsOnly: boolean }
		>,
		"mutationFn"
	>,
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: { registrationRequestId: number; newsOnly: boolean }) =>
			approveRegistrationRequest({
				data,
			}),
		...options,
		onSuccess: async (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: ["admin-registration-requests"],
			});
			queryClient.invalidateQueries({
				queryKey: ["admin-registration-request", variables],
			});
			if (options?.onSuccess) {
				await options.onSuccess(data, variables, context);
			}
		},
	});
}

const approveRegistrationRequest = createServerFn({ method: "POST" })
	.middleware([adminAuthMiddleware])
	.validator(
		(data: { registrationRequestId: number; newsOnly: boolean }) => data,
	)
	.handler(async ({ data }) => {
		const registrationRequest = await db.query.registrationRequests.findFirst({
			where: eq(schema.registrationRequests.id, data.registrationRequestId),
		});
		if (!registrationRequest) {
			throw notFound();
		}
		const res = await db.insert(schema.users).values({
			email: registrationRequest.email,
			type: data.newsOnly ? "newsOnly" : registrationRequest.type,
		});
		const newUserId = res[0].insertId;
		await db
			.delete(schema.registrationRequests)
			.where(eq(schema.registrationRequests.id, registrationRequest.id));
		await sendEmail(
			registrationRequest.email,
			"Hedgeco - Registration Request Approved",
			"Your hedgeco registration request has been approved.",
		);
		return newUserId;
	});

const fetchRegistrationRequest = createServerFn({ method: "GET" })
	.middleware([adminAuthMiddleware])
	.validator((registrationRequestId: number) => registrationRequestId)
	.handler(async ({ data }) => {
		const registrationRequest = await db.query.registrationRequests.findFirst({
			where: eq(schema.registrationRequests.id, data),
		});

		if (!registrationRequest) {
			throw notFound();
		}

		return registrationRequest;
	});

export const Route = createFileRoute(
	"/_authed-admin/admin/registration-requests/$registrationRequestId",
)({
	loader: ({ context, params: { registrationRequestId } }) => {
		context.queryClient.prefetchQuery(
			fetchRegistrationRequestQueryOptions(Number(registrationRequestId)),
		);
	},
	component: Deferred,
	notFoundComponent: () => {
		return <NotFound>Registration request not found</NotFound>;
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
				<RegistrationRequestComponent />
			</ErrorBoundary>
		</Suspense>
	);
}

function RegistrationRequestComponent() {
	const { registrationRequestId } = Route.useParams();
	const registrationRequestQuery = useSuspenseQuery(
		fetchRegistrationRequestQueryOptions(Number(registrationRequestId)),
	);
	const navigate = useNavigate({
		from: "/admin/registration-requests/$registrationRequestId",
	});

	const rejectRegistrationRequest = useRejectRegistrationRequest({
		onSuccess: () => {
			navigate({
				to: "/admin/registration-requests",
				search: (prev) => ({ page: prev.page }),
			});
		},
	});
	const approveRegistrationRequest = useApproveRegistrationRequest({
		onSuccess: (data) => {
			navigate({
				to: "/admin/users/$userId",
				params: {
					userId: data.toString(),
				},
			});
		},
	});

	return (
		<div className="space-y-2 p-2 flex-grow">
			<Suspense fallback="Loading...">
				<div className="flex flex-col gap-2">
					<div className="flex justify-between items-center">
						<h1 className="text-xl font-bold py-1 pr-2 ">
							{registrationRequestQuery.data.email}
						</h1>
						<div className="flex gap-2">
							<button
								type="button"
								className="bg-green-700 py-1 px-4 rounded flex items-center gap-2"
								onClick={() =>
									approveRegistrationRequest.mutate({
										registrationRequestId: Number(registrationRequestId),
										newsOnly: false,
									})
								}
							>
								Approve
								{approveRegistrationRequest.isPending && <LoadingSpinner />}
							</button>
							<button
								type="button"
								className="bg-yellow-600 py-1 px-4 rounded flex items-center gap-2"
								onClick={() =>
									approveRegistrationRequest.mutate({
										registrationRequestId: Number(registrationRequestId),
										newsOnly: true,
									})
								}
							>
								Approve News
								{approveRegistrationRequest.isPending && <LoadingSpinner />}
							</button>
							<button
								type="button"
								className="bg-red-500 py-1 px-4 rounded flex items-center gap-2"
								onClick={() =>
									rejectRegistrationRequest.mutate(
										Number(registrationRequestId),
									)
								}
							>
								Reject
								{rejectRegistrationRequest.isPending && <LoadingSpinner />}
							</button>
						</div>
					</div>
					<hr />
					<pre>{JSON.stringify(registrationRequestQuery.data, null, 2)}</pre>
				</div>
			</Suspense>
		</div>
	);
}
