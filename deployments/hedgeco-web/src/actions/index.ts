import { defineAction } from "astro:actions";

export const server = {
	logout: defineAction({
		accept: "form",
		handler: (_input, context) => {
			context.cookies.delete("access_token");
			context.cookies.delete("refresh_token");
			return "/";
		},
	}),
};
