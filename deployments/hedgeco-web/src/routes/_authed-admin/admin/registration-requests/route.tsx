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

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				const dir = event.key === "ArrowDown" ? 1 : -1;
				const isFirst = currentRegistrationRequestIndex === 0;
				const isLast =
					currentRegistrationRequestIndex ===
					registrationRequestsQuery.data.length - 1;
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
					registrationRequestsQuery.data.length %
						REGISTRATION_REQUEST_PAGE_SIZE ===
						0
				) {
					return navigate({
						search: (prev) => ({ page: prev.page + 1 }),
					});
				}
				if (currentRegistrationRequestIndex == null) {
					const nextRegistrationRequest =
						dir === 1
							? registrationRequestsQuery.data[0]
							: registrationRequestsQuery.data[
									registrationRequestsQuery.data.length - 1
								];
					if (nextRegistrationRequest == null) {
						return navigate({
							search: (prev) => ({ page: prev.page - 1 }),
						});
					}
					return navigate({
						to: "/admin/registration-requests/$registrationRequestId",
						params: {
							registrationRequestId: nextRegistrationRequest.id.toString(),
						},
						search: (prev) => ({ page: prev.page }),
					});
				}

				const nextRegistrationRequest =
					registrationRequestsQuery.data[
						currentRegistrationRequestIndex + dir
					]?.id.toString();
				if (nextRegistrationRequest != null) {
					return navigate({
						to: "/admin/registration-requests/$registrationRequestId",
						params: { registrationRequestId: nextRegistrationRequest },
						search: (prev) => ({ page: prev.page }),
					});
				}
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [
		currentRegistrationRequestIndex,
		navigate,
		registrationRequestsQuery.data,
		page,
	]);

	return (
		<div className="flex h-full">
			<ul className="list-disc min-w-48 h-full flex flex-col">
				<Suspense fallback={<div>Loading...</div>}>
					{registrationRequestsQuery.data.length === 0 && (
						<div className="flex flex-grow justify-center">
							<p className="text-gray-500">No registration requests</p>
						</div>
					)}
					{registrationRequestsQuery.data.map((registrationRequest) => {
						return (
							<li
								key={registrationRequest.id}
								className="border-b border-gray-700 flex"
							>
								<Link
									preload={false}
									to="/admin/registration-requests/$registrationRequestId"
									params={{
										registrationRequestId: registrationRequest.id.toString(),
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
											{`${registrationRequest.email.substring(0, 16)}${
												registrationRequest.email.length > 16 ? "..." : ""
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
						to="/admin/registration-requests"
						search={{ page: page - 1 }}
						params={{
							registrationRequestId: params?.registrationRequestId,
						}}
						className="py-1 text-center flex-grow aria-disabled:cursor-not-allowed aria-disabled:text-gray-500"
					>
						Previous
					</Link>
					<div className="w-[1px] bg-gray-700 h-full" />
					<Link
						disabled={
							registrationRequestsQuery.data.length %
								REGISTRATION_REQUEST_PAGE_SIZE !==
							0
						}
						to={
							params?.registrationRequestId
								? "/admin/registration-requests/$registrationRequestId"
								: "/admin/registration-requests"
						}
						search={{ page: page + 1 }}
						params={{
							registrationRequestId: params?.registrationRequestId,
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
