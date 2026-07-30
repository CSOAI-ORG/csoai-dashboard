/**
 * Proctoring Schema Extensions
 * Database tables for exam proctoring and integrity verification
 */

import { mysqlTable, varchar, text, int, timestamp, json, enum as mysqlEnum } from 'drizzle-orm/mysql-core';

/**
 * Proctoring Sessions Table
 * Tracks remote exam monitoring sessions
 */
export const proctoringSessions = mysqlTable('proctoring_sessions', {
  id: int('id').primaryKey().autoincrement(),
  sessionId: varchar('session_id', { length: 255 }).unique().notNull(),
  examId: varchar('exam_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  certificationType: mysqlEnum('certificate_type', ['fundamentals', 'professional', 'expert']).notNull(),
  status: mysqlEnum('status', ['active', 'paused', 'completed', 'cancelled']).default('active'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  recordingUrl: varchar('recording_url', { length: 1024 }),
  integrityScore: int('integrity_score').default(100),
  suspiciousEventCount: int('suspicious_event_count').default(0),
  certificateValidity: mysqlEnum('certificate_validity', ['full', 'flagged', 'invalid']).default('full'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

/**
 * Proctoring Events Table
 * Records suspicious events during exam (eye movement, face detection, etc.)
 */
export const proctoringEvents = mysqlTable('proctoring_events', {
  id: int('id').primaryKey().autoincrement(),
  sessionId: varchar('session_id', { length: 255 }).notNull(),
  eventType: mysqlEnum('event_type', [
    'eye_movement',
    'face_detection',
    'screen_change',
    'audio_detection',
    'suspicious_behavior',
  ]).notNull(),
  severity: mysqlEnum('severity', ['low', 'medium', 'high', 'critical']).notNull(),
  description: text('description').notNull(),
  metadata: json('metadata'),
  timestamp: timestamp('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

/**
 * Referral Program Table
 * Tracks user referrals and commission earnings
 */
export const referrals = mysqlTable('referrals', {
  id: int('id').primaryKey().autoincrement(),
  referrerId: varchar('referrer_id', { length: 255 }).notNull(),
  referralCode: varchar('referral_code', { length: 255 }).unique().notNull(),
  referredUserId: varchar('referred_user_id', { length: 255 }),
  referralSource: mysqlEnum('referral_source', ['email', 'social', 'direct', 'affiliate']).default('direct'),
  status: mysqlEnum('status', ['active', 'converted', 'expired']).default('active'),
  conversionDate: timestamp('conversion_date'),
  commissionAmount: int('commission_amount').default(0), // in cents
  payoutStatus: mysqlEnum('payout_status', ['pending', 'processed', 'failed']).default('pending'),
  payoutDate: timestamp('payout_date'),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
});

/**
 * Commission Tracking Table
 * Detailed commission history for referral program
 */
export const commissions = mysqlTable('commissions', {
  id: int('id').primaryKey().autoincrement(),
  referrerId: varchar('referrer_id', { length: 255 }).notNull(),
  referralId: int('referral_id').notNull(),
  courseId: int('course_id'),
  commissionRate: int('commission_rate').default(20), // percentage
  commissionAmount: int('commission_amount').notNull(), // in cents
  status: mysqlEnum('status', ['earned', 'pending', 'processed', 'failed']).default('earned'),
  payoutId: varchar('payout_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  processedAt: timestamp('processed_at'),
});

/**
 * Government Portal Access Table
 * Tracks government agency access and permissions
 */
export const governmentPortalAccess = mysqlTable('government_portal_access', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  agencyName: varchar('agency_name', { length: 255 }).notNull(),
  jurisdiction: mysqlEnum('jurisdiction', ['EU', 'US', 'UK', 'CA', 'AU']).notNull(),
  role: mysqlEnum('role', ['admin', 'analyst', 'viewer']).default('viewer'),
  permissions: json('permissions').default('[]'),
  accessToken: varchar('access_token', { length: 1024 }),
  refreshToken: varchar('refresh_token', { length: 1024 }),
  tokenExpiresAt: timestamp('token_expires_at'),
  lastAccessedAt: timestamp('last_accessed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

/**
 * Government Compliance Reports Table
 * Tracks compliance reports submitted to government agencies
 */
export const governmentComplianceReports = mysqlTable('government_compliance_reports', {
  id: int('id').primaryKey().autoincrement(),
  reportId: varchar('report_id', { length: 255 }).unique().notNull(),
  agencyId: varchar('agency_id', { length: 255 }).notNull(),
  submittedBy: varchar('submitted_by', { length: 255 }).notNull(),
  reportType: mysqlEnum('report_type', [
    'quarterly',
    'incident',
    'audit',
    'certification',
    'enforcement',
  ]).notNull(),
  framework: mysqlEnum('framework', ['eu_ai_act', 'nist_rmf', 'tc260', 'iso_42001']).notNull(),
  dataJson: json('data_json').notNull(),
  status: mysqlEnum('status', ['draft', 'submitted', 'reviewed', 'approved']).default('draft'),
  submittedAt: timestamp('submitted_at'),
  reviewedAt: timestamp('reviewed_at'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
