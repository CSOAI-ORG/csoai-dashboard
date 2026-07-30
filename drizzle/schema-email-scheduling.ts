import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, index, boolean, json } from "drizzle-orm/mysql-core";

// ============================================
// EMAIL SCHEDULING SYSTEM
// ============================================

export const emailSchedules = mysqlTable("email_schedules", {
  id: int().autoincrement().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  templateKey: varchar({ length: 100 }).notNull(), // Reference to email_templates
  triggerType: mysqlEnum(['user_activity', 'time_based', 'manual']).notNull(),
  triggerCondition: json().$type<{
    // For user_activity triggers
    activityType?: 'enrollment' | 'course_completion' | 'inactivity' | 'certification_expiry' | 'compliance_alert';
    daysAfter?: number; // Send X days after trigger event
    daysBefore?: number; // Send X days before event (e.g., expiry warnings)
    
    // For time_based triggers
    cronExpression?: string; // e.g., "0 9 * * 1" for every Monday at 9am
    
    // Common filters
    cohortId?: number;
    courseId?: number;
    userStatus?: string;
  }>().notNull(),
  targetAudience: mysqlEnum(['all_users', 'cohort', 'course_enrollees', 'inactive_users', 'custom_filter']).notNull(),
  audienceFilter: json().$type<{
    cohortIds?: number[];
    courseIds?: number[];
    userStatuses?: string[];
    inactiveDays?: number;
  }>(),
  isActive: boolean().default(true).notNull(),
  priority: mysqlEnum(['low', 'normal', 'high', 'urgent']).default('normal').notNull(),
  sendCount: int().default(0).notNull(), // Total emails sent by this schedule
  lastRunAt: timestamp({ mode: 'string' }),
  nextRunAt: timestamp({ mode: 'string' }),
  createdBy: int().notNull(), // Admin user who created the schedule
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_triggerType").on(table.triggerType),
  index("idx_isActive").on(table.isActive),
  index("idx_nextRunAt").on(table.nextRunAt),
]);

export const emailScheduleRuns = mysqlTable("email_schedule_runs", {
  id: int().autoincrement().notNull(),
  scheduleId: int().notNull(),
  runType: mysqlEnum(['scheduled', 'manual', 'test']).notNull(),
  status: mysqlEnum(['pending', 'running', 'completed', 'failed', 'cancelled']).default('pending').notNull(),
  targetUserCount: int().default(0).notNull(),
  emailsSent: int().default(0).notNull(),
  emailsFailed: int().default(0).notNull(),
  startedAt: timestamp({ mode: 'string' }),
  completedAt: timestamp({ mode: 'string' }),
  errorMessage: text(),
  executionDetails: json().$type<{
    triggeredBy?: string;
    filters?: any;
    errors?: string[];
  }>(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
  index("idx_scheduleId").on(table.scheduleId),
  index("idx_status").on(table.status),
  index("idx_startedAt").on(table.startedAt),
]);

export const userActivityTriggers = mysqlTable("user_activity_triggers", {
  id: int().autoincrement().notNull(),
  scheduleId: int().notNull(),
  userId: int().notNull(),
  activityType: varchar({ length: 100 }).notNull(),
  activityDate: timestamp({ mode: 'string' }).notNull(),
  scheduledSendDate: timestamp({ mode: 'string' }).notNull(),
  status: mysqlEnum(['pending', 'sent', 'cancelled', 'failed']).default('pending').notNull(),
  queueId: int(), // Reference to email_queue when email is created
  processedAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
  index("idx_scheduleId").on(table.scheduleId),
  index("idx_userId").on(table.userId),
  index("idx_status").on(table.status),
  index("idx_scheduledSendDate").on(table.scheduledSendDate),
]);

// ============================================
// TYPE EXPORTS
// ============================================

export type EmailSchedule = typeof emailSchedules.$inferSelect;
export type InsertEmailSchedule = typeof emailSchedules.$inferInsert;

export type EmailScheduleRun = typeof emailScheduleRuns.$inferSelect;
export type InsertEmailScheduleRun = typeof emailScheduleRuns.$inferInsert;

export type UserActivityTrigger = typeof userActivityTriggers.$inferSelect;
export type InsertUserActivityTrigger = typeof userActivityTriggers.$inferInsert;
