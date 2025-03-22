import { createSubjects } from "@openauthjs/openauth/subject";
import { number, object, string } from "valibot";

export const subjects = createSubjects({
	adminUser: object({
		id: number(),
		email: string(),
	}),
});
