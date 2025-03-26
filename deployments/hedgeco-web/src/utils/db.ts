"use server";

import * as schema from "@hedgeco/hedgeco-database";
import { drizzle } from "drizzle-orm/mysql2";
import { createConnection } from "mysql2/promise";
import { Resource } from "sst";

const connection = await createConnection({
	//@ts-expect-error
	database: Resource.HedgecoDatabase.database,
	//@ts-expect-error
	host: Resource.HedgecoDatabase.host,
	//@ts-expect-error
	port: Resource.HedgecoDatabase.port,
	//@ts-expect-error
	user: Resource.HedgecoDatabase.username,
	//@ts-expect-error
	password: Resource.HedgecoDatabase.password,
	Promise: Promise,
});

export const db = drizzle(connection, { schema, mode: "default" });
