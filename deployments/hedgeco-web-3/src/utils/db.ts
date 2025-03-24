"use server";

import * as schema from "@hedgeco/hedgeco-database";
import { drizzle } from "drizzle-orm/mysql2";
import { createConnection } from "mysql2/promise";
import { Resource } from "sst";

const connection = await createConnection({
	database: Resource["hedgeco-database"].database,
	host: Resource["hedgeco-database"].host,
	port: Resource["hedgeco-database"].port,
	user: Resource["hedgeco-database"].username,
	password: Resource["hedgeco-database"].password,
});

export const db = drizzle(connection, { schema, mode: "default" });
