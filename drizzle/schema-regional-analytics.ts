import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, index, boolean, decimal, json } from "drizzle-orm/mysql-core";

// ============================================
// MODULE ASSESSMENTS (Comprehensive Quizzes)
// ============================================

export const moduleAssessments = mysqlTable("module_assessments", {
  id: int().autoincrement().notNull(),
  moduleId: int().notNull(),
  courseId: int().notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  passingScore: int().default(70).notNull(), // Percentage required to pass
  timeLimit: int().default(60).notNull(), // Minutes
  maxAttempts: int().default(3).notNull(),
  orderIndex: int().default(0).notNull(),
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_moduleId").on(table.moduleId),
  index("idx_courseId").on(table.courseId),
]);

export const assessmentQuestions = mysqlTable("assessment_questions", {
  id: int().autoincrement().notNull(),
  assessmentId: int().notNull(),
  question: text().notNull(),
  options: json().$type<string[]>().notNull(), // Array of answer options
  correctAnswer: int().notNull(), // Index of correct option
  explanation: text(),
  difficulty: mysqlEnum(['easy', 'medium', 'hard']).default('medium').notNull(),
  points: int().default(1).notNull(),
  orderIndex: int().default(0).notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_assessmentId").on(table.assessmentId),
]);

export const userAssessmentAttempts = mysqlTable("user_assessment_attempts", {
  id: int().autoincrement().notNull(),
  userId: int().notNull(),
  assessmentId: int().notNull(),
  courseId: int().notNull(),
  moduleId: int().notNull(),
  score: decimal({ precision: 5, scale: 2 }).notNull(),
  totalQuestions: int().notNull(),
  correctAnswers: int().notNull(),
  passed: boolean().notNull(),
  timeSpentSeconds: int().notNull(),
  answers: json().$type<Record<number, number>>().notNull(), // questionId -> selectedAnswer
  attemptNumber: int().default(1).notNull(),
  startedAt: timestamp({ mode: 'string' }).notNull(),
  completedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
  index("idx_userId_assessmentId").on(table.userId, table.assessmentId),
  index("idx_userId_courseId").on(table.userId, table.courseId),
]);

// ============================================
// CERTIFICATE TEMPLATES & CUSTOMIZATION
// ============================================

export const certificateTemplates = mysqlTable("certificate_templates", {
  id: int().autoincrement().notNull(),
  regionId: int().notNull(),
  courseId: int(),
  frameworkCode: varchar({ length: 50 }).notNull(), // EU_AI_ACT, NIST_RMF, TC260, etc.
  templateName: varchar({ length: 255 }).notNull(),
  logoUrl: varchar({ length: 500 }),
  brandColor: varchar({ length: 7 }).default('#3b82f6').notNull(), // Hex color
  headerText: text(),
  footerText: text(),
  complianceStatement: text(), // Framework-specific compliance text
  regulatoryBody: varchar({ length: 255 }), // e.g., "European Commission", "NIST"
  watermarkText: varchar({ length: 100 }),
  signatureTitle: varchar({ length: 100 }),
  signatureName: varchar({ length: 100 }),
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_regionId").on(table.regionId),
  index("idx_frameworkCode").on(table.frameworkCode),
  index("idx_courseId").on(table.courseId),
]);

// ============================================
// REGIONAL ANALYTICS
// ============================================

export const regionalCourseEnrollments = mysqlTable("regional_course_enrollments", {
  id: int().autoincrement().notNull(),
  userId: int().notNull(),
  courseId: int().notNull(),
  regionId: int().notNull(),
  enrollmentType: mysqlEnum(['free', 'paid', 'trial', 'scholarship']).default('paid').notNull(),
  paymentAmount: decimal({ precision: 10, scale: 2 }),
  paymentType: mysqlEnum(['one_time', '3_month', '6_month', '12_month']).default('one_time').notNull(),
  stripePaymentId: varchar({ length: 255 }),
  status: mysqlEnum(['active', 'completed', 'cancelled', 'expired']).default('active').notNull(),
  enrolledAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  completedAt: timestamp({ mode: 'string' }),
  expiresAt: timestamp({ mode: 'string' }),
  lastAccessedAt: timestamp({ mode: 'string' }),
  progressPercent: int().default(0).notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_userId").on(table.userId),
  index("idx_courseId").on(table.courseId),
  index("idx_regionId").on(table.regionId),
  index("idx_enrolledAt").on(table.enrolledAt),
  index("idx_status").on(table.status),
]);

export const certificateIssuances = mysqlTable("certificate_issuances", {
  id: int().autoincrement().notNull(),
  userId: int().notNull(),
  courseId: int().notNull(),
  regionId: int().notNull(),
  certificateId: int().notNull(), // Reference to user_certificates
  certificateNumber: varchar({ length: 100 }).notNull(),
  certificateType: varchar({ length: 100 }).notNull(),
  frameworkCode: varchar({ length: 50 }).notNull(),
  score: decimal({ precision: 5, scale: 2 }),
  issuedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  expiresAt: timestamp({ mode: 'string' }),
  isRevoked: boolean().default(false).notNull(),
  revokedAt: timestamp({ mode: 'string' }),
  revokedReason: text(),
  downloadCount: int().default(0).notNull(),
  lastDownloadedAt: timestamp({ mode: 'string' }),
  verificationCount: int().default(0).notNull(),
  lastVerifiedAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
  index("idx_userId").on(table.userId),
  index("idx_courseId").on(table.courseId),
  index("idx_regionId").on(table.regionId),
  index("idx_certificateNumber").on(table.certificateNumber),
  index("idx_frameworkCode").on(table.frameworkCode),
  index("idx_issuedAt").on(table.issuedAt),
]);

export const regionalAnalytics = mysqlTable("regional_analytics", {
  id: int().autoincrement().notNull(),
  regionId: int().notNull(),
  courseId: int(),
  date: timestamp({ mode: 'string' }).notNull(),
  enrollmentCount: int().default(0).notNull(),
  activeEnrollmentCount: int().default(0).notNull(),
  completionCount: int().default(0).notNull(),
  certificateIssuedCount: int().default(0).notNull(),
  averageCompletionTime: int(), // Days
  averageScore: decimal({ precision: 5, scale: 2 }),
  revenue: decimal({ precision: 10, scale: 2 }).default('0.00').notNull(),
  refundCount: int().default(0).notNull(),
  dropoutCount: int().default(0).notNull(),
  averageProgressPercent: decimal({ precision: 5, scale: 2 }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_regionId_date").on(table.regionId, table.date),
  index("idx_courseId_date").on(table.courseId, table.date),
]);

export const moduleCompletionMetrics = mysqlTable("module_completion_metrics", {
  id: int().autoincrement().notNull(),
  courseId: int().notNull(),
  moduleId: int().notNull(),
  regionId: int().notNull(),
  date: timestamp({ mode: 'string' }).notNull(),
  startedCount: int().default(0).notNull(),
  completedCount: int().default(0).notNull(),
  averageTimeSpent: int(), // Minutes
  averageScore: decimal({ precision: 5, scale: 2 }),
  passRate: decimal({ precision: 5, scale: 2 }),
  dropoutRate: decimal({ precision: 5, scale: 2 }),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_courseId_moduleId").on(table.courseId, table.moduleId),
  index("idx_regionId_date").on(table.regionId, table.date),
]);

// ============================================
// TYPE EXPORTS
// ============================================

export type ModuleAssessment = typeof moduleAssessments.$inferSelect;
export type InsertModuleAssessment = typeof moduleAssessments.$inferInsert;

export type AssessmentQuestion = typeof assessmentQuestions.$inferSelect;
export type InsertAssessmentQuestion = typeof assessmentQuestions.$inferInsert;

export type UserAssessmentAttempt = typeof userAssessmentAttempts.$inferSelect;
export type InsertUserAssessmentAttempt = typeof userAssessmentAttempts.$inferInsert;

export type CertificateTemplate = typeof certificateTemplates.$inferSelect;
export type InsertCertificateTemplate = typeof certificateTemplates.$inferInsert;

export type RegionalCourseEnrollment = typeof regionalCourseEnrollments.$inferSelect;
export type InsertRegionalCourseEnrollment = typeof regionalCourseEnrollments.$inferInsert;

export type CertificateIssuance = typeof certificateIssuances.$inferSelect;
export type InsertCertificateIssuance = typeof certificateIssuances.$inferInsert;

export type RegionalAnalytics = typeof regionalAnalytics.$inferSelect;
export type InsertRegionalAnalytics = typeof regionalAnalytics.$inferInsert;

export type ModuleCompletionMetrics = typeof moduleCompletionMetrics.$inferSelect;
export type InsertModuleCompletionMetrics = typeof moduleCompletionMetrics.$inferInsert;
