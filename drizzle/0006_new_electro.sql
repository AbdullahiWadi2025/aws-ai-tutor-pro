CREATE TABLE `game_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`total_xp` int NOT NULL DEFAULT 0,
	`lessons_completed` int NOT NULL DEFAULT 0,
	`best_streak` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_scores_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_scores_user_id_unique` UNIQUE(`user_id`)
);
