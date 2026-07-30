/**
 * Referral Schema Extension
 * Database tables for referral program tracking and commission management
 */

import { mysqlTable, varchar, text, int, timestamp, decimal, mysqlEnum, index } from "drizzle-orm/mysql-core";

/**
 * Referral Codes Table
 * Stores unique referral codes for each user
 */
export const referralCodes = mysqlTable("referral_codes", {
  id: int().primaryKey().autoincrement(),
  userId: int().notNull(),
  code: varchar({ length: 50 }).unique().notNull(),
  status: mysqlEnum(['active', 'inactive', 'expired']).default('active').notNull(),
  totalClicks: int().default(0).notNull(),
  totalConversions: int().default(0).notNull(),
  totalEarnings: decimal({ precision: 10, scale: 2 }).default('0.00').notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  expiresAt: timestamp({ mode: 'string' }),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("referral_codes_userId_idx").on(table.userId),
  index("referral_codes_code_idx").on(table.code),
]);

/**
 * Referral Conversions Table
 * Tracks when referred users complete certifications and earn commissions
 */
export const referralConversions = mysqlTable("referral_conversions", {
  id: int().primaryKey().autoincrement(),
  referralCodeId: int().notNull(),
  referrerId: int().notNull(),
  referredUserId: int().notNull(),
  referredEmail: varchar({ length: 255 }).notNull(),
  certificationId: int(),
  certificationName: varchar({ length: 255 }),
  certificationPrice: decimal({ precision: 10, scale: 2 }).notNull(),
  commissionRate: int().default(20).notNull(), // percentage
  commissionAmount: decimal({ precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum(['pending', 'earned', 'processed', 'failed']).default('pending').notNull(),
  payoutId: varchar({ length: 255 }),
  payoutDate: timestamp({ mode: 'string' }),
  clickedAt: timestamp({ mode: 'string' }).notNull(),
  convertedAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("referral_conversions_referrerId_idx").on(table.referrerId),
  index("referral_conversions_referredUserId_idx").on(table.referredUserId),
  index("referral_conversions_status_idx").on(table.status),
]);

/**
 * Referral Clicks Table
 * Tracks referral link clicks for analytics
 */
export const referralClicks = mysqlTable("referral_clicks", {
  id: int().primaryKey().autoincrement(),
  referralCodeId: int().notNull(),
  referrerId: int().notNull(),
  ipAddress: varchar({ length: 45 }),
  userAgent: text(),
  referrerSource: mysqlEnum(['email', 'social', 'direct', 'other']).default('direct').notNull(),
  clickedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("referral_clicks_referrerId_idx").on(table.referrerId),
  index("referral_clicks_referralCodeId_idx").on(table.referralCodeId),
]);

/**
 * Referral Payouts Table
 * Tracks commission payouts via Stripe
 */
export const referralPayouts = mysqlTable("referral_payouts", {
  id: int().primaryKey().autoincrement(),
  referrerId: int().notNull(),
  totalAmount: decimal({ precision: 10, scale: 2 }).notNull(),
  conversionCount: int().notNull(),
  status: mysqlEnum(['pending', 'processing', 'completed', 'failed']).default('pending').notNull(),
  stripePayoutId: varchar({ length: 255 }),
  stripeTransferId: varchar({ length: 255 }),
  errorMessage: text(),
  scheduledFor: timestamp({ mode: 'string' }),
  processedAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("referral_payouts_referrerId_idx").on(table.referrerId),
  index("referral_payouts_status_idx").on(table.status),
]);

/**
 * Referral Email Logs Table
 * Tracks email notifications sent for referral events
 */
export const referralEmailLogs = mysqlTable("referral_email_logs", {
  id: int().primaryKey().autoincrement(),
  referrerId: int().notNull(),
  referredUserId: int(),
  eventType: mysqlEnum(['signup', 'conversion', 'commission_earned', 'payout']).notNull(),
  recipientEmail: varchar({ length: 255 }).notNull(),
  subject: varchar({ length: 255 }).notNull(),
  status: mysqlEnum(['sent', 'failed', 'bounced']).default('sent').notNull(),
  resendMessageId: varchar({ length: 255 }),
  errorMessage: text(),
  sentAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("referral_email_logs_referrerId_idx").on(table.referrerId),
  index("referral_email_logs_eventType_idx").on(table.eventType),
]);
