CREATE TABLE `exam_session_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`exam_session_id` int NOT NULL,
	`question_id` int NOT NULL,
	`question_order` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exam_session_questions_id` PRIMARY KEY(`id`)
);
