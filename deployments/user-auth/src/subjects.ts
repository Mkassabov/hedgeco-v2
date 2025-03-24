import { createSubjects } from "@openauthjs/openauth/subject";
import type { v1 } from "@standard-schema/spec"; //todo import this in pkg json
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

export type Subject = {
	[Type in keyof typeof subjects]: {
		type: Type;
		properties: v1.InferOutput<(typeof subjects)[Type]>;
	};
}[keyof typeof subjects];
