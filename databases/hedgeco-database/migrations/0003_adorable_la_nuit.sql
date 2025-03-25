CREATE TABLE `legal_documents` (
	`name` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `legal_documents_name` PRIMARY KEY(`name`)
);
