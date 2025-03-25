CREATE TABLE `registration_requests` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`email` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`type` enum('newsOnly','serviceProvider','hedgeFundManager','investor') NOT NULL,
	CONSTRAINT `registration_requests_id` PRIMARY KEY(`id`)
);
