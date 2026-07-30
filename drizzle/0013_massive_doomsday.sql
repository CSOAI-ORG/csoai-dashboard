CREATE TABLE `course_translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`language` varchar(10) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text,
	`learningObjectives` json,
	`duration` int,
	`difficulty` enum('beginner','intermediate','advanced'),
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_translations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lesson_translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lessonId` int NOT NULL,
	`language` varchar(10) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text,
	`videoUrl` varchar(500),
	`videoCaptions` text,
	`resources` json,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lesson_translations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `module_translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleId` int NOT NULL,
	`language` varchar(10) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text,
	`learningObjectives` json,
	`keyTakeaways` json,
	`duration` int,
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `module_translations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `realtime_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`organizationId` int,
	`aiSystemId` int,
	`eventType` enum('compliance_update','enforcement_action','audit_result','risk_alert','certification_issued','framework_update','council_decision','watchdog_report') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`data` json,
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `realtime_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`language` varchar(10) NOT NULL DEFAULT 'en-US',
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`timezone` varchar(50) NOT NULL DEFAULT 'UTC',
	`theme` enum('light','dark','auto') NOT NULL DEFAULT 'light',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `websocket_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`connectionId` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastHeartbeat` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `websocket_connections_id` PRIMARY KEY(`id`),
	CONSTRAINT `websocket_connections_connectionId_unique` UNIQUE(`connectionId`)
);
--> statement-breakpoint
CREATE INDEX `idx_courseId_language` ON `course_translations` (`courseId`,`language`);--> statement-breakpoint
CREATE INDEX `idx_language` ON `course_translations` (`language`);--> statement-breakpoint
CREATE INDEX `idx_lessonId_language` ON `lesson_translations` (`lessonId`,`language`);--> statement-breakpoint
CREATE INDEX `idx_lesson_language` ON `lesson_translations` (`language`);--> statement-breakpoint
CREATE INDEX `idx_moduleId_language` ON `module_translations` (`moduleId`,`language`);--> statement-breakpoint
CREATE INDEX `idx_module_language` ON `module_translations` (`language`);--> statement-breakpoint
CREATE INDEX `idx_userId_realtime` ON `realtime_events` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_organizationId_realtime` ON `realtime_events` (`organizationId`);--> statement-breakpoint
CREATE INDEX `idx_aiSystemId_realtime` ON `realtime_events` (`aiSystemId`);--> statement-breakpoint
CREATE INDEX `idx_eventType` ON `realtime_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `idx_createdAt_realtime` ON `realtime_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_userId_prefs` ON `user_preferences` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_userId_ws` ON `websocket_connections` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_isActive_ws` ON `websocket_connections` (`isActive`);