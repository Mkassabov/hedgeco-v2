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

const REGISTRATION_REQUEST_PAGE_SIZE = 10;

const fetchRegistrationRequestsQueryOptions = (page: number) => {
	const usablePage = page - 1;
	return queryOptions({
		queryKey: ["admin-registration-requests", usablePage],
		queryFn: () => fetchRegistrationRequests({ data: { page: usablePage } }),
	});
};

const fetchRegistrationRequests = createServerFn({ method: "GET" })
	.middleware([adminAuthMiddleware])
	.validator((options: { page: number }) => options)
	.handler(async ({ data }) => {
		const registrationRequests = await db.query.registrationRequests.findMany({
			offset: data.page * REGISTRATION_REQUEST_PAGE_SIZE,
			limit: REGISTRATION_REQUEST_PAGE_SIZE,
			orderBy: [desc(schema.registrationRequests.id)],
		});

		return registrationRequests;
	});

const searchSchema = z.object({
	page: fallback(z.number().min(1), 1).default(1),
});

export const Route = createFileRoute(
	"/_authed-admin/admin/registration-requests",
)({
	loaderDeps: ({ search: { page } }) => ({ page }),
	loader: ({ context, deps: { page } }) => {
		context.queryClient.prefetchQuery(
			fetchRegistrationRequestsQueryOptions(page),
		);
	},
	validateSearch: zodValidator(searchSchema),
	component: Deferred,
});

function Deferred() {
	return (
		<Suspense fallback="Loading...">
			<RegistrationRequests />
		</Suspense>
	);
}

function RegistrationRequests() {
	const { page } = Route.useSearch();
	const navigate = useNavigate({ from: "/admin/registration-requests" });
	const registrationRequestsQuery = useSuspenseQuery(
		fetchRegistrationRequestsQueryOptions(page),
	);
	const params = Route.useParams() as { registrationRequestId?: string };
	const currentRegistrationRequestIndex =
		params?.registrationRequestId == null
			? null
			: registrationRequestsQuery.data.findIndex(
					(registrationRequest) =>
						registrationRequest.id === Number(params.registrationRequestId),
				);

	return (
		<AdminSidebar
			data={registrationRequestsQuery.data}
			page={page}
			navigate={navigate}
			currentIndex={currentRegistrationRequestIndex}
			idPath="/admin/registration-requests/$registrationRequestId"
			idPathParamName="registrationRequestId"
			renderTarget={(registrationRequest) => (
				<div>
					<p className="text-lg text-blue-800 group-hover:text-blue-600">
						{`${registrationRequest.email.substring(0, 16)}${
							registrationRequest.email.length > 16 ? "..." : ""
						}`}
					</p>
				</div>
			)}
			pageSize={REGISTRATION_REQUEST_PAGE_SIZE}
		>
			<Outlet />
		</AdminSidebar>
	);
}
