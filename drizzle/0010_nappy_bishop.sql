CREATE TABLE `diagrams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL DEFAULT 'Untitled Diagram',
	`nodes_json` text NOT NULL DEFAULT ('[]'),
	`edges_json` text NOT NULL DEFAULT ('[]'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `diagrams_id` PRIMARY KEY(`id`)
);
