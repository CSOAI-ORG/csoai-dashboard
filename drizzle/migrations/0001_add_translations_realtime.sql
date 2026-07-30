-- Add course translations table
CREATE TABLE IF NOT EXISTS `course_translations` (
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
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_courseId_language` (`courseId`, `language`),
  KEY `idx_language` (`language`)
);

-- Add module translations table
CREATE TABLE IF NOT EXISTS `module_translations` (
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
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_moduleId_language` (`moduleId`, `language`),
  KEY `idx_module_language` (`language`)
);

-- Add lesson translations table
CREATE TABLE IF NOT EXISTS `lesson_translations` (
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
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lessonId_language` (`lessonId`, `language`),
  KEY `idx_lesson_language` (`language`)
);

-- Add realtime events table
CREATE TABLE IF NOT EXISTS `realtime_events` (
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
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId_realtime` (`userId`),
  KEY `idx_organizationId_realtime` (`organizationId`),
  KEY `idx_aiSystemId_realtime` (`aiSystemId`),
  KEY `idx_eventType` (`eventType`),
  KEY `idx_createdAt_realtime` (`createdAt`)
);

-- Update user_preferences table if it doesn't have all columns
ALTER TABLE `user_preferences` ADD COLUMN IF NOT EXISTS `language` varchar(10) DEFAULT 'en-US' NOT NULL;
ALTER TABLE `user_preferences` ADD COLUMN IF NOT EXISTS `currency` varchar(3) DEFAULT 'USD' NOT NULL;
ALTER TABLE `user_preferences` ADD COLUMN IF NOT EXISTS `timezone` varchar(50) DEFAULT 'UTC' NOT NULL;
ALTER TABLE `user_preferences` ADD COLUMN IF NOT EXISTS `theme` enum('light','dark','auto') DEFAULT 'light' NOT NULL;
