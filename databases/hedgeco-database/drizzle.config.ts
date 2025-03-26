import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

export default defineConfig({
	dialect: "mysql",
	schema: "./src/db/schema.ts",
	out: "./migrations",
	dbCredentials: {
		host: Resource.HedgecoDatabase.host,
		port: Resource.HedgecoDatabase.port,
		user: Resource.HedgecoDatabase.username,
		password: Resource.HedgecoDatabase.password,
		database: Resource.HedgecoDatabase.database,
	},
});
