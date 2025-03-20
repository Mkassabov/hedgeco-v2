CREATE TABLE `admin_users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`)
);
