import { relations } from "drizzle-orm";
import {
	bigint,
	mysqlEnum,
	mysqlTable,
	primaryKey,
	serial,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/mysql-core";

export const USER_TYPES = [
	"newsOnly",
	"serviceProvider",
	"hedgeFundManager",
	"investor",
] as const;

export const adminUsers = mysqlTable("admin_users", {
	id: serial("id").primaryKey(),
	email: text("email").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = mysqlTable("users", {
	id: serial("id").primaryKey(),
	email: text("email").notNull(),
	type: mysqlEnum("type", USER_TYPES).notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const newsLetters = mysqlTable("news_letters", {
	id: serial("id").primaryKey(),
	releaseDate: timestamp("release_date").notNull(),
	mailchimpCampaignId: text("mailchimp_campaign_id").notNull(),
});

export const newsLetterRelations = relations(newsLetters, ({ many }) => ({
	newsLettersToArticles: many(newsLettersToArticles),
}));

export const newsArticles = mysqlTable("news_articles", {
	id: serial("id").primaryKey(),
	articleTitle: text("article_title").notNull(),
	articleContent: text("article_content").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const newsArticleRelations = relations(newsArticles, ({ many }) => ({
	newsLettersToArticles: many(newsLettersToArticles),
}));

export const newsLettersToArticles = mysqlTable(
	"news_letters_to_articles",
	{
		newsLetterId: bigint("news_letter_id", { mode: "number" }).notNull(),
		newsArticleId: bigint("news_article_id", { mode: "number" }).notNull(),
	},
	(t) => [primaryKey({ columns: [t.newsLetterId, t.newsArticleId] })],
);

export const newsLettersToArticlesRelations = relations(
	newsLettersToArticles,
	({ one }) => ({
		newsLetter: one(newsLetters, {
			fields: [newsLettersToArticles.newsLetterId],
			references: [newsLetters.id],
		}),
		newsArticle: one(newsArticles, {
			fields: [newsLettersToArticles.newsArticleId],
			references: [newsArticles.id],
		}),
	}),
);

export const registrationRequests = mysqlTable("registration_requests", {
	id: serial("id").primaryKey(),
	email: text("email").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	type: mysqlEnum("type", USER_TYPES).notNull(),
});

export const legalDocuments = mysqlTable("legal_documents", {
	name: varchar("name", { length: 255 }).primaryKey(),
	content: text("content").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
