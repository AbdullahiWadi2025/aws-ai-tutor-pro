CREATE TABLE `beta_code_redemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`beta_code_id` int NOT NULL,
	`user_id` int NOT NULL,
	`redeemed_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `beta_code_redemptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `beta_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`description` text,
	`max_uses` int NOT NULL DEFAULT 1,
	`used_count` int NOT NULL DEFAULT 0,
	`trial_days` int NOT NULL DEFAULT 14,
	`expires_at` timestamp,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `beta_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `beta_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `user_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`category` enum('bug','feature_request','general','praise') NOT NULL DEFAULT 'general',
	`rating` int,
	`message` text NOT NULL,
	`page_url` varchar(500),
	`user_agent` text,
	`status` enum('new','reviewed','resolved','archived') NOT NULL DEFAULT 'new',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_trials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`trial_started_at` timestamp NOT NULL DEFAULT (now()),
	`trial_ends_at` timestamp NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`source` varchar(50) NOT NULL DEFAULT 'signup',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_trials_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_trials_user_id_unique` UNIQUE(`user_id`)
);
