-- Module Assessments (Comprehensive Quizzes)
CREATE TABLE IF NOT EXISTS `module_assessments` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `module_id` int NOT NULL,
  `course_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `passing_score` int NOT NULL DEFAULT 70,
  `time_limit` int NOT NULL DEFAULT 60,
  `max_attempts` int NOT NULL DEFAULT 3,
  `order_index` int NOT NULL DEFAULT 0,
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_moduleId` (`module_id`),
  INDEX `idx_courseId` (`course_id`)
);

CREATE TABLE IF NOT EXISTS `assessment_questions` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `assessment_id` int NOT NULL,
  `question` text NOT NULL,
  `options` json NOT NULL,
  `correct_answer` int NOT NULL,
  `explanation` text,
  `difficulty` enum('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  `points` int NOT NULL DEFAULT 1,
  `order_index` int NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_assessmentId` (`assessment_id`)
);

CREATE TABLE IF NOT EXISTS `user_assessment_attempts` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `user_id` int NOT NULL,
  `assessment_id` int NOT NULL,
  `course_id` int NOT NULL,
  `module_id` int NOT NULL,
  `score` decimal(5, 2) NOT NULL,
  `total_questions` int NOT NULL,
  `correct_answers` int NOT NULL,
  `passed` boolean NOT NULL,
  `time_spent_seconds` int NOT NULL,
  `answers` json NOT NULL,
  `attempt_number` int NOT NULL DEFAULT 1,
  `started_at` timestamp NOT NULL,
  `completed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_userId_assessmentId` (`user_id`, `assessment_id`),
  INDEX `idx_userId_courseId` (`user_id`, `course_id`)
);

-- Certificate Templates & Customization
CREATE TABLE IF NOT EXISTS `certificate_templates` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `region_id` int NOT NULL,
  `course_id` int,
  `framework_code` varchar(50) NOT NULL,
  `template_name` varchar(255) NOT NULL,
  `logo_url` varchar(500),
  `brand_color` varchar(7) NOT NULL DEFAULT '#3b82f6',
  `header_text` text,
  `footer_text` text,
  `compliance_statement` text,
  `regulatory_body` varchar(255),
  `watermark_text` varchar(100),
  `signature_title` varchar(100),
  `signature_name` varchar(100),
  `is_active` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_regionId` (`region_id`),
  INDEX `idx_frameworkCode` (`framework_code`),
  INDEX `idx_courseId` (`course_id`)
);

-- Regional Analytics
CREATE TABLE IF NOT EXISTS `course_enrollments` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `region_id` int NOT NULL,
  `enrollment_type` enum('free', 'paid', 'trial', 'scholarship') NOT NULL DEFAULT 'paid',
  `payment_amount` decimal(10, 2),
  `payment_type` enum('one_time', '3_month', '6_month', '12_month') NOT NULL DEFAULT 'one_time',
  `stripe_payment_id` varchar(255),
  `status` enum('active', 'completed', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
  `enrolled_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp,
  `expires_at` timestamp,
  `last_accessed_at` timestamp,
  `progress_percent` int NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_userId` (`user_id`),
  INDEX `idx_courseId` (`course_id`),
  INDEX `idx_regionId` (`region_id`),
  INDEX `idx_enrolledAt` (`enrolled_at`),
  INDEX `idx_status` (`status`)
);

CREATE TABLE IF NOT EXISTS `certificate_issuances` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `user_id` int NOT NULL,
  `course_id` int NOT NULL,
  `region_id` int NOT NULL,
  `certificate_id` int NOT NULL,
  `certificate_number` varchar(100) NOT NULL,
  `certificate_type` varchar(100) NOT NULL,
  `framework_code` varchar(50) NOT NULL,
  `score` decimal(5, 2),
  `issued_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp,
  `is_revoked` boolean NOT NULL DEFAULT false,
  `revoked_at` timestamp,
  `revoked_reason` text,
  `download_count` int NOT NULL DEFAULT 0,
  `last_downloaded_at` timestamp,
  `verification_count` int NOT NULL DEFAULT 0,
  `last_verified_at` timestamp,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_userId` (`user_id`),
  INDEX `idx_courseId` (`course_id`),
  INDEX `idx_regionId` (`region_id`),
  INDEX `idx_certificateNumber` (`certificate_number`),
  INDEX `idx_frameworkCode` (`framework_code`),
  INDEX `idx_issuedAt` (`issued_at`)
);

CREATE TABLE IF NOT EXISTS `regional_analytics` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `region_id` int NOT NULL,
  `course_id` int,
  `date` timestamp NOT NULL,
  `enrollment_count` int NOT NULL DEFAULT 0,
  `active_enrollment_count` int NOT NULL DEFAULT 0,
  `completion_count` int NOT NULL DEFAULT 0,
  `certificate_issued_count` int NOT NULL DEFAULT 0,
  `average_completion_time` int,
  `average_score` decimal(5, 2),
  `revenue` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `refund_count` int NOT NULL DEFAULT 0,
  `dropout_count` int NOT NULL DEFAULT 0,
  `average_progress_percent` decimal(5, 2),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_regionId_date` (`region_id`, `date`),
  INDEX `idx_courseId_date` (`course_id`, `date`)
);

CREATE TABLE IF NOT EXISTS `module_completion_metrics` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `course_id` int NOT NULL,
  `module_id` int NOT NULL,
  `region_id` int NOT NULL,
  `date` timestamp NOT NULL,
  `started_count` int NOT NULL DEFAULT 0,
  `completed_count` int NOT NULL DEFAULT 0,
  `average_time_spent` int,
  `average_score` decimal(5, 2),
  `pass_rate` decimal(5, 2),
  `dropout_rate` decimal(5, 2),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_courseId_moduleId` (`course_id`, `module_id`),
  INDEX `idx_regionId_date` (`region_id`, `date`)
);
