CREATE TABLE `testimonials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`name` varchar(255) NOT NULL,
	`certification_passed` varchar(100),
	`quote` text NOT NULL,
	`rating` int NOT NULL DEFAULT 5,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`reviewed_at` timestamp,
	CONSTRAINT `testimonials_id` PRIMARY KEY(`id`)
);
