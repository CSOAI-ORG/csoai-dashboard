CREATE TABLE `agent_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`agentId` varchar(50) NOT NULL,
	`agentType` enum('guardian','arbiter','scribe') NOT NULL,
	`agentProvider` enum('openai','anthropic','google') NOT NULL,
	`vote` enum('approve','reject','escalate') NOT NULL,
	`confidence` decimal(5,2),
	`reasoning` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_votes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_systems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`systemType` enum('chatbot','recommendation','classification','generation','analysis','other') NOT NULL,
	`riskLevel` enum('minimal','limited','high','unacceptable') NOT NULL DEFAULT 'minimal',
	`status` enum('draft','active','under_review','compliant','non_compliant','archived') NOT NULL DEFAULT 'draft',
	`deploymentDate` timestamp,
	`lastAssessmentDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_systems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analyst_decisions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assignmentId` int NOT NULL,
	`analystId` int NOT NULL,
	`decision` enum('approve','reject','escalate','needs_more_info') NOT NULL,
	`confidence` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`reasoning` text NOT NULL,
	`evidenceReviewed` json,
	`timeSpentMinutes` int,
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyst_decisions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analyst_performance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analystId` int NOT NULL,
	`totalCasesAssigned` int NOT NULL DEFAULT 0,
	`totalCasesCompleted` int NOT NULL DEFAULT 0,
	`totalCasesExpired` int NOT NULL DEFAULT 0,
	`accuracyRate` decimal(5,2),
	`avgResponseTimeMinutes` decimal(10,2),
	`qualityScore` decimal(5,2),
	`rank` int,
	`totalEarnings` decimal(10,2) NOT NULL DEFAULT '0.00',
	`lastActiveAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analyst_performance_id` PRIMARY KEY(`id`),
	CONSTRAINT `analyst_performance_analystId_unique` UNIQUE(`analystId`)
);
--> statement-breakpoint
CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`keyPrefix` varchar(10) NOT NULL,
	`keyHash` varchar(64) NOT NULL,
	`tier` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`permissions` json,
	`rateLimit` int NOT NULL DEFAULT 100,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessment_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`requirementId` int NOT NULL,
	`status` enum('not_started','in_progress','compliant','non_compliant','not_applicable') NOT NULL DEFAULT 'not_started',
	`evidence` text,
	`notes` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessment_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`aiSystemId` int NOT NULL,
	`frameworkId` int NOT NULL,
	`assessorId` int NOT NULL,
	`status` enum('pending','in_progress','completed','approved','rejected') NOT NULL DEFAULT 'pending',
	`overallScore` decimal(5,2),
	`findings` text,
	`recommendations` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int,
	`details` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `case_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analystId` int NOT NULL,
	`reportId` int NOT NULL,
	`councilSessionId` int,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('assigned','in_progress','completed','expired','reassigned') NOT NULL DEFAULT 'assigned',
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`dueAt` timestamp,
	`completedAt` timestamp,
	CONSTRAINT `case_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `certification_tests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`passingScore` int NOT NULL DEFAULT 70,
	`timeLimitMinutes` int NOT NULL DEFAULT 60,
	`totalQuestions` int NOT NULL DEFAULT 50,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `certification_tests_id` PRIMARY KEY(`id`),
	CONSTRAINT `certification_tests_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `council_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subjectType` enum('watchdog_report','assessment','policy_proposal','system_review') NOT NULL,
	`subjectId` int NOT NULL,
	`subjectTitle` varchar(255) NOT NULL,
	`subjectDescription` text,
	`status` enum('voting','consensus_reached','escalated_to_human','completed') NOT NULL DEFAULT 'voting',
	`consensusThreshold` decimal(5,2) NOT NULL DEFAULT '0.67',
	`totalVotes` int NOT NULL DEFAULT 0,
	`approveVotes` int NOT NULL DEFAULT 0,
	`rejectVotes` int NOT NULL DEFAULT 0,
	`escalateVotes` int NOT NULL DEFAULT 0,
	`finalDecision` enum('approved','rejected','escalated'),
	`humanReviewerId` int,
	`humanDecision` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `council_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `frameworks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`version` varchar(50),
	`jurisdiction` varchar(100),
	`description` text,
	`effectiveDate` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `frameworks_id` PRIMARY KEY(`id`),
	CONSTRAINT `frameworks_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`industry` varchar(100),
	`size` enum('startup','small','medium','large','enterprise'),
	`country` varchar(100),
	`subscriptionTier` enum('free','professional','enterprise') NOT NULL DEFAULT 'free',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `organizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pdca_cycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`aiSystemId` int,
	`organizationId` int,
	`cycleNumber` int NOT NULL DEFAULT 1,
	`phase` enum('plan','do','check','act') NOT NULL DEFAULT 'plan',
	`planSummary` text,
	`doSummary` text,
	`checkSummary` text,
	`actSummary` text,
	`status` enum('active','completed','paused') NOT NULL DEFAULT 'active',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `pdca_cycles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `requirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`frameworkId` int NOT NULL,
	`articleNumber` varchar(50),
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`riskLevelApplicable` enum('all','minimal','limited','high','unacceptable') DEFAULT 'all',
	`isMandatory` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `requirements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `test_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testId` int NOT NULL,
	`moduleId` int,
	`questionText` text NOT NULL,
	`questionType` enum('multiple_choice','true_false','scenario') NOT NULL DEFAULT 'multiple_choice',
	`options` json NOT NULL,
	`correctAnswer` varchar(255) NOT NULL,
	`explanation` text,
	`points` int NOT NULL DEFAULT 1,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `test_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `training_modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`durationMinutes` int NOT NULL DEFAULT 30,
	`isRequired` boolean NOT NULL DEFAULT true,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `training_modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `training_modules_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `user_certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`testId` int NOT NULL,
	`attemptId` int NOT NULL,
	`certificateNumber` varchar(100) NOT NULL,
	`certificateType` enum('basic','advanced','expert') NOT NULL DEFAULT 'basic',
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`isRevoked` boolean NOT NULL DEFAULT false,
	`revokedReason` text,
	CONSTRAINT `user_certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_certificates_certificateNumber_unique` UNIQUE(`certificateNumber`)
);
--> statement-breakpoint
CREATE TABLE `user_test_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`testId` int NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`totalPoints` int NOT NULL DEFAULT 0,
	`percentScore` decimal(5,2),
	`passed` boolean NOT NULL DEFAULT false,
	`answers` json,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_test_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_training_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`moduleId` int NOT NULL,
	`status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`progressPercent` int NOT NULL DEFAULT 0,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_training_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin','watchdog_analyst') NOT NULL DEFAULT 'user',
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`subscriptionTier` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`subscriptionStatus` enum('active','canceled','past_due','trialing','none') NOT NULL DEFAULT 'none',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `watchdog_applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255) NOT NULL,
	`country` varchar(100),
	`timezone` varchar(100),
	`experience` text,
	`motivation` text,
	`availableHoursPerWeek` int,
	`status` enum('pending','approved','rejected','waitlisted') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `watchdog_applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watchdog_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`userId` int,
	`authorName` varchar(255),
	`content` text NOT NULL,
	`isOfficial` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `watchdog_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `watchdog_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int,
	`reporterEmail` varchar(320),
	`reporterName` varchar(255),
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`aiSystemName` varchar(255),
	`companyName` varchar(255),
	`incidentType` enum('bias','privacy','safety','misinformation','manipulation','other') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('submitted','under_review','investigating','resolved','dismissed') NOT NULL DEFAULT 'submitted',
	`upvotes` int NOT NULL DEFAULT 0,
	`downvotes` int NOT NULL DEFAULT 0,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `watchdog_reports_id` PRIMARY KEY(`id`)
);
