"use server";

import * as schema from "@hedgeco/hedgeco-database";
import { drizzle } from "drizzle-orm/mysql2";
import { createConnection } from "mysql2/promise";
import { Resource } from "sst";

const connection = await createConnection({
	//@ts-expect-error
	database: Resource["hedgeco-database"].database,
	//@ts-expect-error
	host: Resource["hedgeco-database"].host,
	//@ts-expect-error
	port: Resource["hedgeco-database"].port,
	//@ts-expect-error
	user: Resource["hedgeco-database"].username,
	//@ts-expect-error
	password: Resource["hedgeco-database"].password,
});

export const db = drizzle(connection, { schema, mode: "default" });
