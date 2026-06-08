CREATE TABLE `project_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`project_id` varchar(64) NOT NULL,
	`completed_steps` json NOT NULL DEFAULT ('[]'),
	`completed_at` timestamp,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_progress_id` PRIMARY KEY(`id`)
);
