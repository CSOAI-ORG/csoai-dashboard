CREATE TABLE `api_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`api_key_id` int NOT NULL,
	`endpoint` varchar(255) NOT NULL,
	`method` varchar(10) NOT NULL,
	`status_code` int NOT NULL,
	`response_time_ms` int NOT NULL,
	`request_size` int,
	`response_size` int,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`system_id` int NOT NULL,
	`company_id` int NOT NULL,
	`reason` text NOT NULL,
	`priority` enum('high','medium','low') NOT NULL DEFAULT 'medium',
	`framework` varchar(50),
	`status` enum('scheduled','in_progress','completed','failed') NOT NULL DEFAULT 'scheduled',
	`estimated_completion` timestamp,
	`assigned_analyst` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completed_at` timestamp,
	CONSTRAINT `audit_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_requirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`framework` enum('EU AI Act','NIST RMF','ISO 42001','TC260') NOT NULL,
	`requirement` text NOT NULL,
	`description` text NOT NULL,
	`priority` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
	`effective_date` timestamp NOT NULL,
	`created_by` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`version` int NOT NULL DEFAULT 1,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `compliance_requirements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compliance_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`system_id` int NOT NULL,
	`company_id` int NOT NULL,
	`compliance_score` int NOT NULL,
	`status` enum('compliant','non_compliant','under_review','flagged') NOT NULL DEFAULT 'under_review',
	`last_audit` timestamp,
	`next_audit_due` timestamp,
	`eu_ai_act_score` int,
	`nist_rmf_score` int,
	`iso42001_score` int,
	`tc260_score` int,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enforcement_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`system_id` int NOT NULL,
	`company_id` int NOT NULL,
	`reason` text NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
	`action` enum('warning','audit_required','monitoring','suspension','shutdown') NOT NULL,
	`issued_by` varchar(255) NOT NULL,
	`issued_at` timestamp NOT NULL DEFAULT (now()),
	`due_date` timestamp,
	`status` enum('open','in_progress','resolved','escalated') NOT NULL DEFAULT 'open',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enforcement_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enterprise_api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`key_hash` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`permissions` json NOT NULL,
	`rate_limit` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`last_used_at` timestamp,
	`expires_at` timestamp,
	`is_active` boolean NOT NULL DEFAULT true,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `enterprise_api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `enterprise_api_keys_key_hash_unique` UNIQUE(`key_hash`)
);
--> statement-breakpoint
CREATE TABLE `government_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`jurisdiction` varchar(255) NOT NULL,
	`role` enum('admin','analyst','viewer') NOT NULL DEFAULT 'viewer',
	`organization_name` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `government_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `government_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `webhook_deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`subscription_id` int NOT NULL,
	`status` enum('pending','delivered','failed','retrying') NOT NULL DEFAULT 'pending',
	`http_status` int,
	`response_body` text,
	`error` text,
	`attempt_count` int NOT NULL DEFAULT 0,
	`next_retry_at` timestamp,
	`delivered_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhook_deliveries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`event_type` varchar(100) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`data` json NOT NULL,
	`company_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhook_events_id` PRIMARY KEY(`id`),
	CONSTRAINT `webhook_events_event_id_unique` UNIQUE(`event_id`)
);
--> statement-breakpoint
CREATE TABLE `webhook_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`company_id` int NOT NULL,
	`url` varchar(500) NOT NULL,
	`events` json NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`last_triggered_at` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`secret` varchar(255) NOT NULL,
	CONSTRAINT `webhook_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `api_usage_api_key_id_idx` ON `api_usage` (`api_key_id`);--> statement-breakpoint
CREATE INDEX `api_usage_endpoint_idx` ON `api_usage` (`endpoint`);--> statement-breakpoint
CREATE INDEX `api_usage_timestamp_idx` ON `api_usage` (`timestamp`);--> statement-breakpoint
CREATE INDEX `audit_requests_system_id_idx` ON `audit_requests` (`system_id`);--> statement-breakpoint
CREATE INDEX `audit_requests_company_id_idx` ON `audit_requests` (`company_id`);--> statement-breakpoint
CREATE INDEX `audit_requests_status_idx` ON `audit_requests` (`status`);--> statement-breakpoint
CREATE INDEX `compliance_requirements_framework_idx` ON `compliance_requirements` (`framework`);--> statement-breakpoint
CREATE INDEX `compliance_requirements_effective_date_idx` ON `compliance_requirements` (`effective_date`);--> statement-breakpoint
CREATE INDEX `compliance_status_system_id_idx` ON `compliance_status` (`system_id`);--> statement-breakpoint
CREATE INDEX `compliance_status_company_id_idx` ON `compliance_status` (`company_id`);--> statement-breakpoint
CREATE INDEX `compliance_status_status_idx` ON `compliance_status` (`status`);--> statement-breakpoint
CREATE INDEX `enforcement_actions_system_id_idx` ON `enforcement_actions` (`system_id`);--> statement-breakpoint
CREATE INDEX `enforcement_actions_company_id_idx` ON `enforcement_actions` (`company_id`);--> statement-breakpoint
CREATE INDEX `enforcement_actions_severity_idx` ON `enforcement_actions` (`severity`);--> statement-breakpoint
CREATE INDEX `enterprise_api_keys_company_id_idx` ON `enterprise_api_keys` (`company_id`);--> statement-breakpoint
CREATE INDEX `enterprise_api_keys_hash_idx` ON `enterprise_api_keys` (`key_hash`);--> statement-breakpoint
CREATE INDEX `government_users_jurisdiction_idx` ON `government_users` (`jurisdiction`);--> statement-breakpoint
CREATE INDEX `government_users_email_idx` ON `government_users` (`email`);--> statement-breakpoint
CREATE INDEX `webhook_deliveries_event_id_idx` ON `webhook_deliveries` (`event_id`);--> statement-breakpoint
CREATE INDEX `webhook_deliveries_subscription_id_idx` ON `webhook_deliveries` (`subscription_id`);--> statement-breakpoint
CREATE INDEX `webhook_deliveries_status_idx` ON `webhook_deliveries` (`status`);--> statement-breakpoint
CREATE INDEX `webhook_events_event_id_idx` ON `webhook_events` (`event_id`);--> statement-breakpoint
CREATE INDEX `webhook_events_company_id_idx` ON `webhook_events` (`company_id`);--> statement-breakpoint
CREATE INDEX `webhook_events_event_type_idx` ON `webhook_events` (`event_type`);--> statement-breakpoint
CREATE INDEX `webhook_subscriptions_company_id_idx` ON `webhook_subscriptions` (`company_id`);--> statement-breakpoint
CREATE INDEX `webhook_subscriptions_url_idx` ON `webhook_subscriptions` (`url`);