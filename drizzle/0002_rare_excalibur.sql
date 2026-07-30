CREATE TABLE `recommendation_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`period` varchar(20) NOT NULL,
	`periodType` enum('daily','weekly','monthly') NOT NULL,
	`totalGenerated` int NOT NULL DEFAULT 0,
	`totalViewed` int NOT NULL DEFAULT 0,
	`totalImplemented` int NOT NULL DEFAULT 0,
	`totalDismissed` int NOT NULL DEFAULT 0,
	`totalSnoozed` int NOT NULL DEFAULT 0,
	`helpfulCount` int NOT NULL DEFAULT 0,
	`notHelpfulCount` int NOT NULL DEFAULT 0,
	`byCategory` json,
	`byPriority` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recommendation_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendation_interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recommendationId` varchar(100) NOT NULL,
	`recommendationType` varchar(50) NOT NULL,
	`action` enum('viewed','implemented','dismissed','snoozed') NOT NULL,
	`feedback` enum('helpful','not_helpful','irrelevant'),
	`feedbackNote` text,
	`snoozeUntil` timestamp,
	`aiSystemId` int,
	`frameworkId` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recommendation_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recommendation_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`complianceGapWeight` int NOT NULL DEFAULT 100,
	`incidentPreventionWeight` int NOT NULL DEFAULT 80,
	`governanceWeight` int NOT NULL DEFAULT 70,
	`riskMitigationWeight` int NOT NULL DEFAULT 90,
	`bestPracticeWeight` int NOT NULL DEFAULT 50,
	`regulatoryUpdateWeight` int NOT NULL DEFAULT 85,
	`emailDigestEnabled` boolean NOT NULL DEFAULT false,
	`emailDigestFrequency` enum('daily','weekly','monthly') NOT NULL DEFAULT 'weekly',
	`minPriorityForEmail` enum('critical','high','medium','low') NOT NULL DEFAULT 'high',
	`defaultLimit` int NOT NULL DEFAULT 10,
	`showDismissedAfterDays` int NOT NULL DEFAULT 30,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recommendation_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `recommendation_preferences_userId_unique` UNIQUE(`userId`)
);
