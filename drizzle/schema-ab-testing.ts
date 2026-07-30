import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, tinyint, json } from "drizzle-orm/mysql-core";

export const abExperiments = mysqlTable("ab_experiments", {
  id: int().autoincrement().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  hypothesis: text(),
  targetAudience: varchar({ length: 255 }),
  startDate: timestamp({ mode: 'string' }),
  endDate: timestamp({ mode: 'string' }),
  status: mysqlEnum(['draft', 'active', 'paused', 'completed']).default('draft').notNull(),
  successMetric: varchar({ length: 255 }),
  createdBy: int().notNull(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const abVariants = mysqlTable("ab_variants", {
  id: int().autoincrement().primaryKey().notNull(),
  experimentId: int().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  interventionType: varchar({ length: 255 }),
  interventionContent: text(),
  weight: int().default(50).notNull(),
  isControl: tinyint().default(0).notNull(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const abAssignments = mysqlTable("ab_assignments", {
  id: int().autoincrement().primaryKey().notNull(),
  experimentId: int().notNull(),
  variantId: int().notNull(),
  studentId: int().notNull(),
  assignedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  completedAt: timestamp({ mode: 'string' }),
  outcome: mysqlEnum(['success', 'failure', 'pending']).default('pending').notNull(),
  outcomeMetrics: json(),
});
