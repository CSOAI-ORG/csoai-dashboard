/**
 * Email Events Schema
 * Tracks email delivery webhooks from Resend
 */

import { mysqlTable, int, varchar, text, timestamp, json, mysqlEnum, index } from "drizzle-orm/mysql-core";

// Email webhook events from Resend
export const emailEvents = mysqlTable("email_events", {
  id: int().autoincrement().primaryKey().notNull(),
  emailLogId: int(), // Reference to email_execution_logs
  resendEmailId: varchar({ length: 255 }), // Resend's email ID
  eventType: mysqlEnum([
    'email.sent',
    'email.delivered',
    'email.delivery_delayed',
    'email.bounced',
    'email.complained',
    'email.opened',
    'email.clicked'
  ]).notNull(),
  recipientEmail: varchar({ length: 320 }).notNull(),
  timestamp: timestamp({ mode: 'string' }).notNull(), // When the event occurred
  metadata: json().$type<{
    clickedLink?: string;
    userAgent?: string;
    ipAddress?: string;
    bounceType?: string;
    bounceReason?: string;
    complaintType?: string;
  }>(), // Additional event-specific data
  rawPayload: json(), // Complete webhook payload for debugging
  processedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
  index("idx_emailLogId").on(table.emailLogId),
  index("idx_resendEmailId").on(table.resendEmailId),
  index("idx_eventType").on(table.eventType),
  index("idx_recipientEmail").on(table.recipientEmail),
]);

export type EmailEvent = typeof emailEvents.$inferSelect;
export type InsertEmailEvent = typeof emailEvents.$inferInsert;
