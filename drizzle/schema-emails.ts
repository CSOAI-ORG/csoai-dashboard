import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, index, boolean, json } from "drizzle-orm/mysql-core";

// ============================================
// EMAIL NOTIFICATIONS SYSTEM
// ============================================

export const emailTemplates = mysqlTable("email_templates", {
  id: int().autoincrement().notNull(),
  templateKey: varchar({ length: 100 }).notNull(), // e.g., "enrollment_confirmation", "course_completion"
  name: varchar({ length: 255 }).notNull(),
  subject: varchar({ length: 255 }).notNull(),
  htmlContent: text().notNull(),
  textContent: text().notNull(),
  variables: json().$type<string[]>().notNull(), // List of template variables like {{userName}}, {{courseName}}
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_templateKey").on(table.templateKey),
]);

export const emailQueue = mysqlTable("email_queue", {
  id: int().autoincrement().notNull(),
  userId: int().notNull(),
  toEmail: varchar({ length: 255 }).notNull(),
  fromEmail: varchar({ length: 255 }).default('noreply@coai.org').notNull(),
  subject: varchar({ length: 255 }).notNull(),
  htmlContent: text().notNull(),
  textContent: text().notNull(),
  templateKey: varchar({ length: 100 }),
  templateData: json(), // Variables used to render the template
  status: mysqlEnum(['pending', 'sending', 'sent', 'failed', 'cancelled']).default('pending').notNull(),
  priority: mysqlEnum(['low', 'normal', 'high', 'urgent']).default('normal').notNull(),
  attempts: int().default(0).notNull(),
  maxAttempts: int().default(3).notNull(),
  lastAttemptAt: timestamp({ mode: 'string' }),
  sentAt: timestamp({ mode: 'string' }),
  failedAt: timestamp({ mode: 'string' }),
  errorMessage: text(),
  externalId: varchar({ length: 255 }), // Resend message ID
  scheduledFor: timestamp({ mode: 'string' }), // For delayed sending
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_userId").on(table.userId),
  index("idx_status").on(table.status),
  index("idx_scheduledFor").on(table.scheduledFor),
  index("idx_toEmail").on(table.toEmail),
]);

export const emailLogs = mysqlTable("email_logs", {
  id: int().autoincrement().notNull(),
  queueId: int().notNull(),
  userId: int().notNull(),
  toEmail: varchar({ length: 255 }).notNull(),
  subject: varchar({ length: 255 }).notNull(),
  templateKey: varchar({ length: 100 }),
  status: mysqlEnum(['sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained']).notNull(),
  externalId: varchar({ length: 255 }),
  eventData: json(), // Raw webhook data from Resend
  occurredAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
  index("idx_queueId").on(table.queueId),
  index("idx_userId").on(table.userId),
  index("idx_status").on(table.status),
  index("idx_occurredAt").on(table.occurredAt),
]);

export const userEmailPreferences = mysqlTable("user_email_preferences", {
  id: int().autoincrement().notNull(),
  userId: int().notNull(),
  enrollmentConfirmation: boolean().default(true).notNull(),
  courseCompletion: boolean().default(true).notNull(),
  certificateIssuance: boolean().default(true).notNull(),
  weeklyProgress: boolean().default(true).notNull(),
  forumNotifications: boolean().default(true).notNull(),
  marketingEmails: boolean().default(false).notNull(),
  systemAnnouncements: boolean().default(true).notNull(),
  unsubscribedAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_userId").on(table.userId),
]);

// ============================================
// TYPE EXPORTS
// ============================================

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

export type EmailQueue = typeof emailQueue.$inferSelect;
export type InsertEmailQueue = typeof emailQueue.$inferInsert;

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;

export type UserEmailPreferences = typeof userEmailPreferences.$inferSelect;
export type InsertUserEmailPreferences = typeof userEmailPreferences.$inferInsert;
