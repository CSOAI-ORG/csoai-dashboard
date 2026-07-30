CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`emailEnabled` boolean NOT NULL DEFAULT true,
	`slackEnabled` boolean NOT NULL DEFAULT false,
	`slackWebhookUrl` varchar(500),
	`complianceAlerts` boolean NOT NULL DEFAULT true,
	`systemUpdates` boolean NOT NULL DEFAULT true,
	`jobApplications` boolean NOT NULL DEFAULT true,
	`certificateIssued` boolean NOT NULL DEFAULT true,
	`councilDecisions` boolean NOT NULL DEFAULT true,
	`reportUpdates` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('compliance_alert','system_update','job_application','certificate_issued','council_decision','report_update') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`link` varchar(500),
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_userId_isRead` ON `notifications` (`userId`,`isRead`);--> statement-breakpoint
CREATE INDEX `idx_createdAt` ON `notifications` (`createdAt`);