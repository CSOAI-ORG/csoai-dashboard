/**
 * Workflow Templates Schema
 * Pre-built workflow templates for common scenarios
 */

import { mysqlTable, int, varchar, text, timestamp, json, boolean, mysqlEnum } from "drizzle-orm/mysql-core";

// Workflow templates
export const workflowTemplates = mysqlTable("workflow_templates", {
  id: int().autoincrement().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  category: mysqlEnum(['welcome', 'course', 'engagement', 'certification', 'reminder', 'nurture']).notNull(),
  triggerType: mysqlEnum(['cohort_join', 'date_based', 'manual', 'enrollment', 'completion']).notNull(),
  triggerConfig: json(), // Default trigger configuration
  workflowData: json().notNull(), // Complete workflow graph (nodes, edges, positions)
  previewImage: varchar({ length: 500 }), // URL to preview image
  tags: json(), // Array of tags for filtering
  usageCount: int().default(0).notNull(), // Track how many times template is used
  isPublic: boolean().default(true).notNull(), // Whether template is available to all users
  createdBy: int(), // User ID of creator (null for system templates)
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

// Template usage tracking
export const templateUsage = mysqlTable("template_usage", {
  id: int().autoincrement().primaryKey().notNull(),
  templateId: int().notNull(),
  userId: int().notNull(),
  workflowId: int().notNull(), // The workflow created from this template
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export type InsertWorkflowTemplate = typeof workflowTemplates.$inferInsert;
export type SelectWorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type InsertTemplateUsage = typeof templateUsage.$inferInsert;
export type SelectTemplateUsage = typeof templateUsage.$inferSelect;
