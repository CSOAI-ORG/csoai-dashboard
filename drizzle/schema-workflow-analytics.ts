/**
 * Workflow Analytics Schema
 * Tracks workflow performance metrics and email engagement
 */

import { mysqlTable, int, varchar, timestamp, decimal, json, mysqlEnum, index } from "drizzle-orm/mysql-core";

// Workflow performance metrics (aggregated daily)
export const workflowMetrics = mysqlTable("workflow_metrics", {
  id: int().autoincrement().primaryKey().notNull(),
  workflowId: int().notNull(),
  date: varchar({ length: 10 }).notNull(), // YYYY-MM-DD format
  totalExecutions: int().default(0).notNull(),
  successfulExecutions: int().default(0).notNull(),
  failedExecutions: int().default(0).notNull(),
  avgExecutionTimeSeconds: decimal({ precision: 10, scale: 2 }),
  totalEmailsSent: int().default(0).notNull(),
  totalEmailsDelivered: int().default(0).notNull(),
  totalEmailsOpened: int().default(0).notNull(),
  totalEmailsClicked: int().default(0).notNull(),
  totalEmailsBounced: int().default(0).notNull(),
  deliveryRate: decimal({ precision: 5, scale: 2 }), // Percentage
  openRate: decimal({ precision: 5, scale: 2 }), // Percentage
  clickRate: decimal({ precision: 5, scale: 2 }), // Percentage
  bounceRate: decimal({ precision: 5, scale: 2 }), // Percentage
  conversionCount: int().default(0).notNull(), // Number of conversions (e.g., enrollments, completions)
  conversionRate: decimal({ precision: 5, scale: 2 }), // Percentage
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_workflowId").on(table.workflowId),
  index("idx_date").on(table.date),
  index("idx_workflowId_date").on(table.workflowId, table.date),
]);

// Email engagement tracking (per email template/type)
export const emailEngagement = mysqlTable("email_engagement", {
  id: int().autoincrement().primaryKey().notNull(),
  workflowId: int().notNull(),
  emailTemplate: varchar({ length: 100 }).notNull(),
  date: varchar({ length: 10 }).notNull(), // YYYY-MM-DD format
  totalSent: int().default(0).notNull(),
  totalDelivered: int().default(0).notNull(),
  totalOpened: int().default(0).notNull(),
  totalClicked: int().default(0).notNull(),
  totalBounced: int().default(0).notNull(),
  uniqueOpens: int().default(0).notNull(),
  uniqueClicks: int().default(0).notNull(),
  avgTimeToOpen: int(), // Average time to first open (in seconds)
  avgTimeToClick: int(), // Average time to first click (in seconds)
  topClickedLinks: json().$type<Array<{ url: string; clicks: number }>>(), // Top 5 clicked links
  deviceBreakdown: json().$type<{ desktop: number; mobile: number; tablet: number; other: number }>(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_workflowId").on(table.workflowId),
  index("idx_emailTemplate").on(table.emailTemplate),
  index("idx_date").on(table.date),
]);

// A/B testing results
export const abTestResults = mysqlTable("ab_test_results", {
  id: int().autoincrement().primaryKey().notNull(),
  workflowId: int().notNull(),
  testName: varchar({ length: 255 }).notNull(),
  variantA: varchar({ length: 100 }).notNull(), // Template or config A
  variantB: varchar({ length: 100 }).notNull(), // Template or config B
  startDate: timestamp({ mode: 'string' }).notNull(),
  endDate: timestamp({ mode: 'string' }),
  status: mysqlEnum(['running', 'completed', 'paused']).default('running').notNull(),
  
  // Variant A metrics
  variantASent: int().default(0).notNull(),
  variantAOpened: int().default(0).notNull(),
  variantAClicked: int().default(0).notNull(),
  variantAConverted: int().default(0).notNull(),
  variantAOpenRate: decimal({ precision: 5, scale: 2 }),
  variantAClickRate: decimal({ precision: 5, scale: 2 }),
  variantAConversionRate: decimal({ precision: 5, scale: 2 }),
  
  // Variant B metrics
  variantBSent: int().default(0).notNull(),
  variantBOpened: int().default(0).notNull(),
  variantBClicked: int().default(0).notNull(),
  variantBConverted: int().default(0).notNull(),
  variantBOpenRate: decimal({ precision: 5, scale: 2 }),
  variantBClickRate: decimal({ precision: 5, scale: 2 }),
  variantBConversionRate: decimal({ precision: 5, scale: 2 }),
  
  // Statistical significance
  confidenceLevel: decimal({ precision: 5, scale: 2 }), // e.g., 95.00
  pValue: decimal({ precision: 10, scale: 8 }),
  winner: mysqlEnum(['variant_a', 'variant_b', 'no_winner']),
  
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_workflowId").on(table.workflowId),
  index("idx_status").on(table.status),
]);

// Conversion tracking
export const workflowConversions = mysqlTable("workflow_conversions", {
  id: int().autoincrement().primaryKey().notNull(),
  workflowId: int().notNull(),
  executionId: int().notNull(),
  userId: int().notNull(),
  conversionType: mysqlEnum(['enrollment', 'completion', 'purchase', 'signup', 'custom']).notNull(),
  conversionValue: decimal({ precision: 10, scale: 2 }), // Monetary value if applicable
  metadata: json(), // Additional conversion data
  convertedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => [
  index("idx_workflowId").on(table.workflowId),
  index("idx_executionId").on(table.executionId),
  index("idx_userId").on(table.userId),
  index("idx_conversionType").on(table.conversionType),
]);

export type WorkflowMetric = typeof workflowMetrics.$inferSelect;
export type InsertWorkflowMetric = typeof workflowMetrics.$inferInsert;
export type EmailEngagement = typeof emailEngagement.$inferSelect;
export type InsertEmailEngagement = typeof emailEngagement.$inferInsert;
export type ABTestResult = typeof abTestResults.$inferSelect;
export type InsertABTestResult = typeof abTestResults.$inferInsert;
export type WorkflowConversion = typeof workflowConversions.$inferSelect;
export type InsertWorkflowConversion = typeof workflowConversions.$inferInsert;
