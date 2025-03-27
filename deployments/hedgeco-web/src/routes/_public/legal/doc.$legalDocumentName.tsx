import { legalDocuments } from "@hedgeco/hedgeco-database";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "~/utils/db";

const getLegalDocument = createServerFn({ method: "GET" })
	.validator((legalDocumentName: string) => legalDocumentName)
	.handler(async ({ data }) => {
		const legalDocument = await db.query.legalDocuments.findFirst({
			where: eq(legalDocuments.name, data),
		});
		if (legalDocument == null) {
			throw notFound();
		}
		return legalDocument;
	});

export const Route = createFileRoute("/_public/legal/doc/$legalDocumentName")({
	loader: ({ params: { legalDocumentName } }) =>
		getLegalDocument({ data: legalDocumentName }),
	component: RouteComponent,
	notFoundComponent: () => {
		return <span>This document does not exist.</span>;
	},
});

function RouteComponent() {
	const legalDocument = Route.useLoaderData();
	return (
		<div>
			<div className="text-left">
				<br />
				{/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
				<div dangerouslySetInnerHTML={{ __html: legalDocument.content }} />
				<br />
			</div>
		</div>
	);
}
