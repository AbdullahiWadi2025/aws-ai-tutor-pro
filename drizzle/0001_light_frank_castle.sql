CREATE TABLE `aws_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`certification` enum('SAA-C03','CLF-C02') NOT NULL,
	`topic` varchar(255) NOT NULL,
	`question_text` text NOT NULL,
	`options` json NOT NULL,
	`correct_answers` json NOT NULL,
	`explanation` text NOT NULL,
	`question_type` enum('single','multiple') NOT NULL DEFAULT 'single',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aws_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`certification` enum('SAA-C03','CLF-C02') NOT NULL,
	`mode` enum('exam','practice') NOT NULL DEFAULT 'exam',
	`score` decimal(5,2),
	`total_questions` int NOT NULL DEFAULT 65,
	`correct_answers` int,
	`time_taken` int,
	`is_passed` boolean,
	`questions_attempted` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exam_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topic_performance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`certification` enum('SAA-C03','CLF-C02') NOT NULL,
	`topic` varchar(255) NOT NULL,
	`correct_count` int NOT NULL DEFAULT 0,
	`total_count` int NOT NULL DEFAULT 0,
	`accuracy` decimal(5,2) DEFAULT '0',
	`last_updated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `topic_performance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exam_session_id` int NOT NULL,
	`question_id` int NOT NULL,
	`user_answer` json NOT NULL,
	`is_correct` boolean NOT NULL,
	`time_spent` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`certification` enum('SAA-C03','CLF-C02') NOT NULL,
	`total_exams` int NOT NULL DEFAULT 0,
	`average_score` decimal(5,2) DEFAULT '0',
	`pass_count` int NOT NULL DEFAULT 0,
	`fail_count` int NOT NULL DEFAULT 0,
	`last_exam_date` timestamp,
	`study_streak` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_progress_id` PRIMARY KEY(`id`)
);
