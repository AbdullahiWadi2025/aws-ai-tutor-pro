CREATE TABLE `study_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`certification` varchar(32) NOT NULL,
	`exam_date` varchar(16) NOT NULL,
	`hours_per_day` decimal(3,1) NOT NULL,
	`knowledge_level` enum('beginner','intermediate','advanced') NOT NULL,
	`readiness_score` int,
	`plan_json` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `study_plans_id` PRIMARY KEY(`id`)
);
