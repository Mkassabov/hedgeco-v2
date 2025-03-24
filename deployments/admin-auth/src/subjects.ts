import { createSubjects } from "@openauthjs/openauth/subject";
import type { v1 } from "@standard-schema/spec"; //todo import this in pkg json
import { number, object, string } from "valibot";

export const subjects = createSubjects({
	adminUser: object({
		id: number(),
		email: string(),
	}),
});

export type Subject = {
	[Type in keyof typeof subjects]: {
		type: Type;
		properties: v1.InferOutput<(typeof subjects)[Type]>;
	};
}[keyof typeof subjects];
