import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

export default defineConfig({
	dialect: "mysql",
	schema: "./src/db/schema.ts",
	out: "./migrations",
	dbCredentials: {
		host: Resource["hedgeco-database"].host,
		port: Resource["hedgeco-database"].port,
		user: Resource["hedgeco-database"].username,
		password: Resource["hedgeco-database"].password,
		database: Resource["hedgeco-database"].database,
	},
});
