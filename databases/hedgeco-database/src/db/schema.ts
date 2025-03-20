import { mysqlTable, serial, text, timestamp } from "drizzle-orm/mysql-core";

export const adminUsers = mysqlTable("admin_users", {
	id: serial("id").primaryKey(),
	email: text("email").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
