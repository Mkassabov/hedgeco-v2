import { createSubjects } from "@openauthjs/openauth/subject";
import { number, object } from "valibot";

export const subjects = createSubjects({
	newsOnly: object({
		id: number(),
	}),
	serviceProvider: object({
		id: number(),
	}),
	hedgeFundManager: object({
		id: number(),
	}),
	investor: object({
		id: number(),
	}),
});
