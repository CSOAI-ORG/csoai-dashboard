ALTER TABLE `job_applications` ADD `employerResponse` text;--> statement-breakpoint
ALTER TABLE `job_applications` ADD `statusUpdatedAt` timestamp;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD `digestEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD `digestFrequency` enum('daily','weekly') DEFAULT 'daily' NOT NULL;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD `lastDigestSentAt` timestamp;