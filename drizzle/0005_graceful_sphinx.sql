ALTER TABLE `course_bundles` ADD `bundlePrice3Month` int;--> statement-breakpoint
ALTER TABLE `course_bundles` ADD `bundlePrice6Month` int;--> statement-breakpoint
ALTER TABLE `course_bundles` ADD `bundlePrice12Month` int;--> statement-breakpoint
ALTER TABLE `course_bundles` ADD `stripePriceId3Month` varchar(255);--> statement-breakpoint
ALTER TABLE `course_bundles` ADD `stripePriceId6Month` varchar(255);--> statement-breakpoint
ALTER TABLE `course_bundles` ADD `stripePriceId12Month` varchar(255);--> statement-breakpoint
ALTER TABLE `course_enrollments` ADD `paymentType` enum('one_time','3_month','6_month','12_month') DEFAULT 'one_time' NOT NULL;--> statement-breakpoint
ALTER TABLE `course_enrollments` ADD `stripeSubscriptionId` varchar(255);--> statement-breakpoint
ALTER TABLE `course_enrollments` ADD `subscriptionStatus` enum('active','cancelled','past_due','none') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `courses` ADD `price3Month` int;--> statement-breakpoint
ALTER TABLE `courses` ADD `price6Month` int;--> statement-breakpoint
ALTER TABLE `courses` ADD `price12Month` int;--> statement-breakpoint
ALTER TABLE `courses` ADD `stripePriceId3Month` varchar(255);--> statement-breakpoint
ALTER TABLE `courses` ADD `stripePriceId6Month` varchar(255);--> statement-breakpoint
ALTER TABLE `courses` ADD `stripePriceId12Month` varchar(255);