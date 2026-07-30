/**
 * Workflow Scheduling Schema
 * Advanced scheduling system for automated workflow execution
 */

import { mysqlTable, int, varchar, text, timestamp, json, boolean, mysqlEnum, index } from "drizzle-orm/mysql-core";

// Workflow schedules
export const workflowSchedules = mysqlTable("workflow_schedules", {
  id: int().autoincrement().primaryKey().notNull(),
  workflowId: int().notNull(),
  userId: int().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  
  // Schedule type
  scheduleType: mysqlEnum(['cron', 'interval', 'conditional']).notNull(),
  
  // Cron expression (for cron type)
  cronExpression: varchar({ length: 100 }), // e.g., "0 9 * * 1" (Every Monday at 9 AM)
  timezone: varchar({ length: 50 }).default('UTC').notNull(),
  
  // Interval settings (for interval type)
  intervalValue: int(), // Number of units
  intervalUnit: mysqlEnum(['minutes', 'hours', 'days', 'weeks', 'months']),
  
  // Conditional triggers (for conditional type)
  conditions: json().$type<{
    type: 'user_inactive' | 'enrollment_date' | 'completion_status' | 'custom';
    field?: string;
    operator?: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value?: any;
    daysInactive?: number;
    checkFrequency?: 'hourly' | 'daily' | 'weekly';
  }[]>(),
  
  // Target audience filters
  targetFilters: json().$type<{
    cohortIds?: number[];
    courseIds?: number[];
    enrollmentStatus?: string[];
    userTags?: string[];
    customQuery?: string;
  }>(),
  
  // Execution settings
  isActive: boolean().default(true).notNull(),
  startDate: timestamp({ mode: 'string' }), // When to start executing
  endDate: timestamp({ mode: 'string' }), // When to stop executing
  maxExecutions: int(), // Maximum number of times to execute (null = unlimited)
  executionCount: int().default(0).notNull(), // Current execution count
  
  // Last execution tracking
  lastExecutedAt: timestamp({ mode: 'string' }),
  nextExecutionAt: timestamp({ mode: 'string' }), // Calculated next execution time
  lastExecutionStatus: mysqlEnum(['success', 'failed', 'partial']),
  lastExecutionError: text(),
  
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_workflowId").on(table.workflowId),
  index("idx_userId").on(table.userId),
  index("idx_isActive").on(table.isActive),
  index("idx_nextExecutionAt").on(table.nextExecutionAt),
  index("idx_scheduleType").on(table.scheduleType),
]);

// Schedule execution history
export const scheduleExecutionHistory = mysqlTable("schedule_execution_history", {
  id: int().autoincrement().primaryKey().notNull(),
  scheduleId: int().notNull(),
  workflowId: int().notNull(),
  executionId: int(), // Reference to workflow_executions
  
  scheduledFor: timestamp({ mode: 'string' }).notNull(), // When it was supposed to run
  actualExecutionTime: timestamp({ mode: 'string' }).notNull(), // When it actually ran
  
  status: mysqlEnum(['success', 'failed', 'skipped', 'partial']).notNull(),
  targetUserCount: int().default(0).notNull(), // Number of users targeted
  successfulCount: int().default(0).notNull(), // Number of successful executions
  failedCount: int().default(0).notNull(), // Number of failed executions
  
  duration: int(), // Execution duration in seconds
  errorMessage: text(),
  metadata: json(), // Additional execution details
  
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
  index("idx_scheduleId").on(table.scheduleId),
  index("idx_workflowId").on(table.workflowId),
  index("idx_scheduledFor").on(table.scheduledFor),
  index("idx_status").on(table.status),
]);

// Schedule pause/resume log
export const scheduleStatusLog = mysqlTable("schedule_status_log", {
  id: int().autoincrement().primaryKey().notNull(),
  scheduleId: int().notNull(),
  action: mysqlEnum(['created', 'activated', 'paused', 'resumed', 'deleted', 'completed']).notNull(),
  reason: text(), // Why the action was taken
  performedBy: int(), // User ID who performed the action
  timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
  index("idx_scheduleId").on(table.scheduleId),
  index("idx_action").on(table.action),
]);

export type WorkflowSchedule = typeof workflowSchedules.$inferSelect;
export type InsertWorkflowSchedule = typeof workflowSchedules.$inferInsert;
export type ScheduleExecutionHistory = typeof scheduleExecutionHistory.$inferSelect;
export type InsertScheduleExecutionHistory = typeof scheduleExecutionHistory.$inferInsert;
export type ScheduleStatusLog = typeof scheduleStatusLog.$inferSelect;
export type InsertScheduleStatusLog = typeof scheduleStatusLog.$inferInsert;
