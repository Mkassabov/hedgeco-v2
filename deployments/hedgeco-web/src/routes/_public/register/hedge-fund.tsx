import * as schema from "@hedgeco/hedgeco-database";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { db } from "~/utils/db";
import { sendEmail } from "~/utils/ses";

export const Route = createFileRoute("/_public/register/hedge-fund")({
	component: RegisterHedgeFundManagerComponent,
});

const registerHedgeFundUser = createServerFn({ method: "POST" })
	.validator((data: { email: string }) => data)
	.handler(async ({ data }) => {
		//todo we don't verify the email and we probably should
		await db.insert(schema.registrationRequests).values({
			email: data.email,
			type: "hedgeFundManager",
		});
		await sendEmail(
			// biome-ignore lint/style/noNonNullAssertion: //todo
			process.env.CONTACT_EMAIL!,
			"Hedge Fund Manager Registration Request",
			`Email: ${data.email}`,
		);
		return {
			success: true,
			message: "Registration request sent! An admin will review your request.",
		};
	});

function RegisterHedgeFundManagerComponent() {
	const registrationMutation = useMutation({
		mutationFn: (data: {
			email: string;
		}) => registerHedgeFundUser({ data }),
	});

	return (
		<>
			<h1 className="text-cyan-900 text-2xl font-bold mt-5">Contact Us</h1>
			<hr />
			{registrationMutation.data?.success && (
				<div className="flex flex-col gap-2 my-2 border-green-400 border-2 rounded-lg p-2 max-w-[40rem] bg-green-900 text-white">
					<span>{registrationMutation.data.message}</span>
				</div>
			)}
			<form
				noValidate={false}
				onSubmit={(e) => {
					e.preventDefault();
					const form = e.target as HTMLFormElement;

					const formData = new FormData(form);
					const email = formData.get("email") as string;
					registrationMutation.mutate({
						email,
					});
				}}
				className="mt-2 rounded-lg border-2 border-cyan-900 p-4 max-w-[40rem] flex flex-col gap-4"
			>
				<h2 className="text-cyan-900 text-lg font-bold">
					Enter your email to register as a Hedge Fund Manager
				</h2>
				<div className="flex flex-wrap gap-2">
					<div className="flex flex-col gap-1 w-[15rem]">
						<label htmlFor="email">
							Email <span className="text-red-500">*</span>
						</label>
						<input
							required={true}
							type="email"
							id="email"
							name="email"
							className="rounded py-1 px-2 text-sm border-2 border-cyan-900"
						/>
					</div>
				</div>
				<button
					type="submit"
					className="bg-cyan-900 text-white py-2 px-4 rounded  flex items-center gap-2"
					disabled={registrationMutation.isPending}
				>
					Register
					{registrationMutation.isPending && <LoadingSpinner />}
				</button>
			</form>
		</>
	);
}
