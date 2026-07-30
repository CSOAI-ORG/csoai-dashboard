CREATE TABLE IF NOT EXISTS `email_workflows` (
  `id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `userId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `triggerType` enum('cohort_join','date_based','manual','enrollment','completion') NOT NULL,
  `triggerConfig` json,
  `workflowData` json NOT NULL,
  `isActive` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `workflow_executions` (
  `id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `workflowId` int NOT NULL,
  `userId` int NOT NULL,
  `status` enum('pending','running','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  `startedAt` timestamp,
  `completedAt` timestamp,
  `executionLog` json,
  `errorMessage` text,
  `createdAt` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE IF NOT EXISTS `workflow_step_executions` (
  `id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `executionId` int NOT NULL,
  `stepId` varchar(100) NOT NULL,
  `stepType` enum('trigger','send_email','wait','condition','action') NOT NULL,
  `status` enum('pending','running','completed','failed','skipped') NOT NULL DEFAULT 'pending',
  `startedAt` timestamp,
  `completedAt` timestamp,
  `result` json,
  `errorMessage` text,
  `createdAt` timestamp NOT NULL DEFAULT (now())
);
