import { mysqlTable, int, varchar, text, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

export const instructorCohorts = mysqlTable("instructor_cohorts", {
  id: int().autoincrement().primaryKey().notNull(),
  instructorId: int().notNull(),
  cohortName: varchar({ length: 255 }).notNull(),
  description: text(),
  courseId: int(),
  startDate: timestamp({ mode: 'string' }),
  endDate: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const cohortStudents = mysqlTable("cohort_students", {
  id: int().autoincrement().primaryKey().notNull(),
  cohortId: int().notNull(),
  studentId: int().notNull(),
  enrolledAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  status: mysqlEnum(['active', 'completed', 'dropped']).default('active').notNull(),
});
