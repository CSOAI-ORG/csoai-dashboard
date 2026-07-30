import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, index, boolean, json } from "drizzle-orm/mysql-core";

// ============================================
// COHORT MANAGEMENT SYSTEM
// ============================================

export const cohorts = mysqlTable("cohorts", {
  id: int().autoincrement().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  code: varchar({ length: 50 }).notNull(), // Unique cohort code (e.g., "2024-SPRING-AI")
  status: mysqlEnum(['active', 'archived', 'draft']).default('active').notNull(),
  startDate: timestamp({ mode: 'string' }),
  endDate: timestamp({ mode: 'string' }),
  capacity: int(), // Maximum number of students
  currentEnrollment: int().default(0).notNull(), // Current number of students
  instructorId: int(), // Primary instructor
  metadata: json().$type<{
    tags?: string[];
    color?: string; // For UI display
    icon?: string;
    customFields?: Record<string, any>;
  }>(),
  createdBy: int().notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_code").on(table.code),
  index("idx_status").on(table.status),
  index("idx_instructorId").on(table.instructorId),
]);

export const students = mysqlTable("students", {
  id: int().autoincrement().notNull(),
  userId: int().notNull(), // Reference to users table
  cohortId: int(), // Current cohort assignment
  studentNumber: varchar({ length: 50 }), // Unique student identifier
  firstName: varchar({ length: 100 }).notNull(),
  lastName: varchar({ length: 100 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 50 }),
  status: mysqlEnum(['active', 'inactive', 'graduated', 'withdrawn', 'suspended']).default('active').notNull(),
  enrollmentDate: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  graduationDate: timestamp({ mode: 'string' }),
  gpa: varchar({ length: 10 }), // Grade point average
  totalCredits: int().default(0).notNull(),
  metadata: json().$type<{
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    dateOfBirth?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    notes?: string;
    customFields?: Record<string, any>;
  }>(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_userId").on(table.userId),
  index("idx_cohortId").on(table.cohortId),
  index("idx_email").on(table.email),
  index("idx_studentNumber").on(table.studentNumber),
  index("idx_status").on(table.status),
]);

export const cohortCourses = mysqlTable("cohort_courses", {
  id: int().autoincrement().notNull(),
  cohortId: int().notNull(),
  courseId: int().notNull(),
  startDate: timestamp({ mode: 'string' }),
  endDate: timestamp({ mode: 'string' }),
  isRequired: boolean().default(true).notNull(),
  order: int().default(0).notNull(), // Display order
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
  index("idx_cohortId").on(table.cohortId),
  index("idx_courseId").on(table.courseId),
]);

export const studentCohortHistory = mysqlTable("student_cohort_history", {
  id: int().autoincrement().notNull(),
  studentId: int().notNull(),
  cohortId: int().notNull(),
  startDate: timestamp({ mode: 'string' }).notNull(),
  endDate: timestamp({ mode: 'string' }),
  status: mysqlEnum(['active', 'completed', 'transferred', 'withdrawn']).default('active').notNull(),
  notes: text(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
  index("idx_studentId").on(table.studentId),
  index("idx_cohortId").on(table.cohortId),
]);

// ============================================
// TYPE EXPORTS
// ============================================

export type Cohort = typeof cohorts.$inferSelect;
export type InsertCohort = typeof cohorts.$inferInsert;

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

export type CohortCourse = typeof cohortCourses.$inferSelect;
export type InsertCohortCourse = typeof cohortCourses.$inferInsert;

export type StudentCohortHistory = typeof studentCohortHistory.$inferSelect;
export type InsertStudentCohortHistory = typeof studentCohortHistory.$inferInsert;
