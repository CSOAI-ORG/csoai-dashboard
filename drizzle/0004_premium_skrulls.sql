CREATE TABLE `analyst_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analystId` int NOT NULL,
	`specialistId` int NOT NULL,
	`regionId` int NOT NULL,
	`industry` varchar(100),
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('active','suspended','terminated') NOT NULL DEFAULT 'active',
	`qualityScore` int DEFAULT 0,
	`reportsCompleted` int NOT NULL DEFAULT 0,
	`averageTurnaroundHours` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analyst_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_bundles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`regionId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`courseIds` json NOT NULL,
	`regularPrice` int NOT NULL,
	`bundlePrice` int NOT NULL,
	`savings` int NOT NULL,
	`stripePriceId` varchar(255),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_bundles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `course_enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`status` enum('enrolled','in_progress','completed','failed') NOT NULL DEFAULT 'enrolled',
	`progress` int NOT NULL DEFAULT 0,
	`enrolledAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`score` int,
	`certificateIssued` boolean NOT NULL DEFAULT false,
	`paidAmount` int NOT NULL DEFAULT 0,
	`stripePaymentIntentId` varchar(255),
	`referredBySpecialistId` int,
	`commissionPaid` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_enrollments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`regionId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`framework` varchar(100),
	`level` enum('fundamentals','advanced','specialist') NOT NULL,
	`durationHours` int NOT NULL,
	`price` int NOT NULL,
	`stripePriceId` varchar(255),
	`modules` json,
	`prerequisites` json,
	`certificationRequired` boolean NOT NULL DEFAULT false,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`primaryFramework` varchar(100),
	`regulatoryBody` varchar(255),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `regions_id` PRIMARY KEY(`id`),
	CONSTRAINT `regions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `report_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`analystId` int NOT NULL,
	`specialistId` int NOT NULL,
	`assignedAt` timestamp NOT NULL DEFAULT (now()),
	`dueAt` timestamp NOT NULL,
	`completedAt` timestamp,
	`status` enum('assigned','in_progress','completed','escalated') NOT NULL DEFAULT 'assigned',
	`reviewedAt` timestamp,
	`qualityScore` int,
	`specialistFeedback` text,
	`escalated` boolean NOT NULL DEFAULT false,
	`escalationReason` text,
	`escalatedTo` enum('regional_specialist','council'),
	`paymentAmount` int,
	`paymentStatus` enum('pending','paid') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specialist_earnings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`specialistId` int NOT NULL,
	`period` varchar(20) NOT NULL,
	`baseSalary` int NOT NULL,
	`analystCommissions` int NOT NULL DEFAULT 0,
	`courseCommissions` int NOT NULL DEFAULT 0,
	`performanceBonus` int NOT NULL DEFAULT 0,
	`totalEarnings` int NOT NULL,
	`paidAt` timestamp,
	`paymentStatus` enum('pending','processing','paid') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `specialist_earnings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specialists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`regionId` int NOT NULL,
	`specialistType` enum('regional','industry') NOT NULL,
	`industry` varchar(100),
	`supervisorId` int,
	`certifications` json,
	`yearsExperience` int,
	`bio` text,
	`baseSalary` int NOT NULL DEFAULT 5000,
	`commissionRate` int NOT NULL DEFAULT 10,
	`courseCommissionRate` int NOT NULL DEFAULT 20,
	`status` enum('active','probation','suspended','inactive') NOT NULL DEFAULT 'probation',
	`probationStartDate` timestamp,
	`probationEndDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `specialists_id` PRIMARY KEY(`id`)
);
