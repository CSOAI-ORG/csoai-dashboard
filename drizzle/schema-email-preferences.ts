import { mysqlTable, int, tinyint, timestamp } from "drizzle-orm/mysql-core";

export const emailPreferences = mysqlTable("email_preferences", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int().notNull(),
  
  // Notification types
  certificatesEnabled: tinyint().default(1).notNull(), // Email when earning certificates
  progressReportsEnabled: tinyint().default(1).notNull(), // Weekly/monthly progress summaries
  atRiskAlertsEnabled: tinyint().default(1).notNull(), // Alerts when flagged as at-risk
  courseUpdatesEnabled: tinyint().default(1).notNull(), // New content, course changes
  achievementsEnabled: tinyint().default(1).notNull(), // Milestones, badges
  instructorMessagesEnabled: tinyint().default(1).notNull(), // Direct messages from instructors
  
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});
