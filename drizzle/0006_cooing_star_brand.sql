CREATE TABLE `course_certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`certificateId` varchar(100) NOT NULL,
	`issuedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_certificates_certificateId_unique` UNIQUE(`certificateId`)
);
