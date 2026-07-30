-- Custom SQL migration file, put your code below! --

-- Create cohorts table
CREATE TABLE IF NOT EXISTS `cohorts` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `code` varchar(50) NOT NULL,
  `status` enum('active','archived','draft') NOT NULL DEFAULT 'active',
  `startDate` timestamp,
  `endDate` timestamp,
  `capacity` int,
  `currentEnrollment` int NOT NULL DEFAULT 0,
  `instructorId` int,
  `metadata` json,
  `createdBy` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_code` (`code`),
  INDEX `idx_status` (`status`),
  INDEX `idx_instructorId` (`instructorId`)
);

-- Create students table
CREATE TABLE IF NOT EXISTS `students` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `cohortId` int,
  `studentNumber` varchar(50),
  `firstName` varchar(100) NOT NULL,
  `lastName` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50),
  `status` enum('active','inactive','graduated','withdrawn','suspended') NOT NULL DEFAULT 'active',
  `enrollmentDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `graduationDate` timestamp,
  `gpa` varchar(10),
  `totalCredits` int NOT NULL DEFAULT 0,
  `metadata` json,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_userId` (`userId`),
  INDEX `idx_cohortId` (`cohortId`),
  INDEX `idx_email` (`email`),
  INDEX `idx_studentNumber` (`studentNumber`),
  INDEX `idx_status` (`status`)
);

-- Create cohort_courses table
CREATE TABLE IF NOT EXISTS `cohort_courses` (
  `id` int AUTO_INCREMENT NOT NULL,
  `cohortId` int NOT NULL,
  `courseId` int NOT NULL,
  `startDate` timestamp,
  `endDate` timestamp,
  `isRequired` boolean NOT NULL DEFAULT true,
  `order` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cohortId` (`cohortId`),
  INDEX `idx_courseId` (`courseId`)
);

-- Create student_cohort_history table
CREATE TABLE IF NOT EXISTS `student_cohort_history` (
  `id` int AUTO_INCREMENT NOT NULL,
  `studentId` int NOT NULL,
  `cohortId` int NOT NULL,
  `startDate` timestamp NOT NULL,
  `endDate` timestamp,
  `status` enum('active','completed','transferred','withdrawn') NOT NULL DEFAULT 'active',
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_studentId` (`studentId`),
  INDEX `idx_cohortId` (`cohortId`)
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS `email_templates` (
  `id` int AUTO_INCREMENT NOT NULL,
  `key` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` enum('onboarding','course','certification','notification','marketing','system') NOT NULL,
  `subject` varchar(500) NOT NULL,
  `htmlBody` text NOT NULL,
  `textBody` text,
  `previewText` varchar(255),
  `availableMergeTags` json NOT NULL,
  `defaultValues` json,
  `isActive` boolean NOT NULL DEFAULT true,
  `version` int NOT NULL DEFAULT 1,
  `parentTemplateId` int,
  `metadata` json,
  `createdBy` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastUsedAt` timestamp,
  `usageCount` int NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_key` (`key`),
  INDEX `idx_category` (`category`),
  INDEX `idx_isActive` (`isActive`)
);

-- Create email_template_versions table
CREATE TABLE IF NOT EXISTS `email_template_versions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `templateId` int NOT NULL,
  `version` int NOT NULL,
  `subject` varchar(500) NOT NULL,
  `htmlBody` text NOT NULL,
  `textBody` text,
  `changeDescription` text,
  `createdBy` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_templateId` (`templateId`),
  INDEX `idx_version` (`version`)
);

-- Create email_template_previews table
CREATE TABLE IF NOT EXISTS `email_template_previews` (
  `id` int AUTO_INCREMENT NOT NULL,
  `templateId` int NOT NULL,
  `previewName` varchar(255) NOT NULL,
  `sampleData` json NOT NULL,
  `renderedHtml` text,
  `createdBy` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_templateId` (`templateId`)
);