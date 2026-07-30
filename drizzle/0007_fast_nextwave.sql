CREATE TABLE `learning_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`moduleIndex` int NOT NULL,
	`sessionStart` timestamp NOT NULL,
	`sessionEnd` timestamp,
	`durationMinutes` int NOT NULL DEFAULT 0,
	`completed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`moduleIndex` int NOT NULL,
	`attemptNumber` int NOT NULL DEFAULT 1,
	`score` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`timeSpentSeconds` int NOT NULL,
	`passed` boolean NOT NULL,
	`questionResults` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recommendedCourseId` int NOT NULL,
	`reason` enum('weak_area','next_in_path','advanced','framework_preference','popular','incomplete') NOT NULL,
	`reasonText` text,
	`priority` int NOT NULL DEFAULT 5,
	`dismissed` boolean NOT NULL DEFAULT false,
	`enrolled` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_recommendations_id` PRIMARY KEY(`id`)
);
