-- System Status Incidents Table
CREATE TABLE IF NOT EXISTS `system_incidents` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('investigating', 'identified', 'monitoring', 'resolved') NOT NULL DEFAULT 'investigating',
  `severity` enum('minor', 'major', 'critical') NOT NULL,
  `affectedServices` text,
  `startedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `identifiedAt` timestamp NULL,
  `monitoringAt` timestamp NULL,
  `resolvedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reportedBy` int NULL,
  `reporterEmail` varchar(320) NULL,
  `reporterName` varchar(255) NULL,
  `isPublic` boolean NOT NULL DEFAULT true,
  INDEX `idx_status_incident` (`status`),
  INDEX `idx_severity_incident` (`severity`),
  INDEX `idx_started_at` (`startedAt`)
);

-- Incident Updates Table
CREATE TABLE IF NOT EXISTS `incident_updates` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `incidentId` int NOT NULL,
  `status` enum('investigating', 'identified', 'monitoring', 'resolved') NOT NULL,
  `message` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` int NULL,
  INDEX `idx_incident_id_update` (`incidentId`)
);

-- Service Status Table
CREATE TABLE IF NOT EXISTS `service_status` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `serviceName` varchar(100) NOT NULL,
  `displayName` varchar(255) NOT NULL,
  `description` text NULL,
  `status` enum('operational', 'degraded', 'partial_outage', 'major_outage') NOT NULL DEFAULT 'operational',
  `category` enum('core', 'api', 'dashboard', 'training', 'compliance', 'other') NOT NULL DEFAULT 'other',
  `lastCheckedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_service_name` (`serviceName`),
  INDEX `idx_status_service` (`status`)
);

-- Uptime Metrics Table
CREATE TABLE IF NOT EXISTS `uptime_metrics` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `serviceName` varchar(100) NOT NULL,
  `date` varchar(10) NOT NULL,
  `uptimePercent` decimal(5, 2) NOT NULL,
  `totalChecks` int NOT NULL,
  `successfulChecks` int NOT NULL,
  `failedChecks` int NOT NULL,
  `avgResponseTimeMs` decimal(10, 2) NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_service_date` (`serviceName`, `date`)
);

-- API Response Time Metrics Table
CREATE TABLE IF NOT EXISTS `api_metrics` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `endpoint` varchar(255) NOT NULL,
  `method` varchar(10) NOT NULL,
  `responseTimeMs` int NOT NULL,
  `statusCode` int NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `userId` int NULL,
  INDEX `idx_endpoint_metrics` (`endpoint`),
  INDEX `idx_timestamp_metrics` (`timestamp`)
);

-- Status Page Subscriptions Table
CREATE TABLE IF NOT EXISTS `status_subscriptions` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `email` varchar(320) NULL,
  `phone` varchar(20) NULL,
  `services` text NULL,
  `notifyOnIncident` boolean NOT NULL DEFAULT true,
  `notifyOnResolution` boolean NOT NULL DEFAULT true,
  `notifyOnMaintenance` boolean NOT NULL DEFAULT true,
  `isActive` boolean NOT NULL DEFAULT true,
  `verifiedAt` timestamp NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_email_subscription` (`email`),
  INDEX `idx_active_subscription` (`isActive`)
);
