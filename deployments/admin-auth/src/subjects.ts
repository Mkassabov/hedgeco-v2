import { createSubjects } from "@openauthjs/openauth/subject";
import { number, object } from "valibot";

export const subjects = createSubjects({
	adminUser: object({
		id: number(),
	}),
});
