CREATE TABLE `admin_users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_articles` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`article_title` text NOT NULL,
	`article_content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_articles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_letters` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`release_date` timestamp NOT NULL,
	CONSTRAINT `news_letters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_letters_to_articles` (
	`news_letter_id` bigint NOT NULL,
	`news_article_id` bigint NOT NULL,
	CONSTRAINT `news_letters_to_articles_news_letter_id_news_article_id_pk` PRIMARY KEY(`news_letter_id`,`news_article_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
