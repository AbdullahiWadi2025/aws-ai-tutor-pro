CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(255),
	`requirement` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`certification` enum('SAA-C03','CLF-C02') NOT NULL,
	`topic` varchar(255) NOT NULL,
	`priority` int NOT NULL,
	`reason` text NOT NULL,
	`accuracy` decimal(5,2),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `study_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`achievement_id` int NOT NULL,
	`unlocked_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_achievements_id` PRIMARY KEY(`id`)
);
