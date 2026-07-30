-- Email Notifications System Tables

CREATE TABLE IF NOT EXISTS `email_templates` (
  `id` int AUTO_INCREMENT NOT NULL,
  `templateKey` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `htmlContent` text NOT NULL,
  `textContent` text NOT NULL,
  `variables` json NOT NULL,
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_templateKey` (`templateKey`)
);

CREATE TABLE IF NOT EXISTS `email_queue` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `toEmail` varchar(255) NOT NULL,
  `fromEmail` varchar(255) NOT NULL DEFAULT 'noreply@coai.org',
  `subject` varchar(255) NOT NULL,
  `htmlContent` text NOT NULL,
  `textContent` text NOT NULL,
  `templateKey` varchar(100),
  `templateData` json,
  `status` enum('pending', 'sending', 'sent', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  `priority` enum('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
  `attempts` int NOT NULL DEFAULT 0,
  `maxAttempts` int NOT NULL DEFAULT 3,
  `lastAttemptAt` timestamp,
  `sentAt` timestamp,
  `failedAt` timestamp,
  `errorMessage` text,
  `externalId` varchar(255),
  `scheduledFor` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_status` (`status`),
  KEY `idx_scheduledFor` (`scheduledFor`),
  KEY `idx_toEmail` (`toEmail`)
);

CREATE TABLE IF NOT EXISTS `email_logs` (
  `id` int AUTO_INCREMENT NOT NULL,
  `queueId` int NOT NULL,
  `userId` int NOT NULL,
  `toEmail` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `templateKey` varchar(100),
  `status` enum('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained') NOT NULL,
  `externalId` varchar(255),
  `eventData` json,
  `occurredAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_queueId` (`queueId`),
  KEY `idx_userId` (`userId`),
  KEY `idx_status` (`status`),
  KEY `idx_occurredAt` (`occurredAt`)
);

CREATE TABLE IF NOT EXISTS `user_email_preferences` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `enrollmentConfirmation` boolean NOT NULL DEFAULT true,
  `courseCompletion` boolean NOT NULL DEFAULT true,
  `certificateIssuance` boolean NOT NULL DEFAULT true,
  `weeklyProgress` boolean NOT NULL DEFAULT true,
  `forumNotifications` boolean NOT NULL DEFAULT true,
  `marketingEmails` boolean NOT NULL DEFAULT false,
  `systemAnnouncements` boolean NOT NULL DEFAULT true,
  `unsubscribedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`)
);
