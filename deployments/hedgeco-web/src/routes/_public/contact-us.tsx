import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { sendEmail } from "~/utils/ses";

export const Route = createFileRoute("/_public/contact-us")({
	component: ContactUsComponent,
});

const sendContactMessage = createServerFn({ method: "POST" })
	.validator(
		(data: { name: string; email: string; phone?: string; message: string }) =>
			data,
	)
	.handler(async ({ data }) => {
		await sendEmail(
			process.env.CONTACT_EMAIL!,
			"HedgeCo Contact Form Message",
			`Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nMessage: ${data.message}`,
		);
		return {
			success: true,
			message: "Message sent successfully. An admin will contact you shortly.",
		};
	});

function ContactUsComponent() {
	const contactMutation = useMutation({
		mutationFn: (data: {
			name: string;
			email: string;
			phone?: string;
			message: string;
		}) => sendContactMessage({ data }),
	});
	//todo show feedback the message has been sent

	return (
		<>
			<h1 className="text-cyan-900 text-2xl font-bold mt-5">Contact Us</h1>
			<hr />
			{contactMutation.data?.success && (
				<div className="flex flex-col gap-2 my-2 border-green-400 border-2 rounded-lg p-2 max-w-[40rem] bg-green-900 text-white">
					<span>{contactMutation.data.message}</span>
				</div>
			)}
			<form
				noValidate={false}
				onSubmit={(e) => {
					e.preventDefault();
					const form = e.target as HTMLFormElement;

					const formData = new FormData(form);
					const name = formData.get("name") as string;
					const email = formData.get("email") as string;
					const phone = formData.get("phone") as string;
					const message = formData.get("message") as string;
					contactMutation.mutate({
						name,
						email,
						phone,
						message,
					});
				}}
				className="mt-2 rounded-lg border-2 border-cyan-900 p-4 max-w-[40rem] flex flex-col gap-4"
			>
				<h2 className="text-cyan-900 text-lg font-bold">
					Please fill out and submit the form below and one of our
					representatives will contact you
				</h2>
				<div className="flex flex-wrap gap-2">
					<div className="flex flex-col gap-1 w-[15rem]">
						<label htmlFor="name">
							Your Full Name <span className="text-red-500">*</span>
						</label>
						<input
							required={true}
							type="text"
							id="name"
							name="name"
							className="rounded py-1 px-2 text-sm border-2 border-cyan-900"
						/>
					</div>
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
					<div className="flex flex-col gap-1 w-[15rem]">
						<label htmlFor="phone">Phone Number</label>
						<input
							type="tel"
							id="phone"
							name="phone"
							className="rounded py-1 px-2 text-sm border-2 border-cyan-900"
						/>
					</div>
				</div>
				<div className="flex flex-col gap-1">
					<label htmlFor="message">
						Message <span className="text-red-500">*</span>
					</label>
					<textarea
						required={true}
						id="message"
						name="message"
						className="rounded min-h-[10rem] py-1 px-2 text-sm border-2 border-cyan-900"
					/>
				</div>
				<button
					type="submit"
					className="bg-cyan-900 text-white py-2 px-4 rounded  flex items-center gap-2"
					disabled={contactMutation.isPending}
				>
					Send Message {contactMutation.isPending && <LoadingSpinner />}
				</button>
			</form>
		</>
	);
}
