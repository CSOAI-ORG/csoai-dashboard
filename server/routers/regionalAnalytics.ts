import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { getDb } from '../db';
import {
  moduleAssessments,
  assessmentQuestions,
  userAssessmentAttempts,
  certificateTemplates,
  regionalCourseEnrollments,
  certificateIssuances,
  regionalAnalytics,
  moduleCompletionMetrics,
} from '../../drizzle/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

export const regionalAnalyticsRouter = router({
  // ============================================
  // MODULE ASSESSMENTS
  // ============================================
  
  getModuleAssessments: protectedProcedure
    .input(z.object({
      courseId: z.number().optional(),
      moduleId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const conditions = [];
      if (input.courseId) conditions.push(eq(moduleAssessments.courseId, input.courseId));
      if (input.moduleId) conditions.push(eq(moduleAssessments.moduleId, input.moduleId));
      
      return await db.select()
        .from(moduleAssessments)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(moduleAssessments.orderIndex);
    }),

  getAssessmentQuestions: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      return await db.select()
        .from(assessmentQuestions)
        .where(eq(assessmentQuestions.assessmentId, input.assessmentId))
        .orderBy(assessmentQuestions.orderIndex);
    }),

  submitAssessment: protectedProcedure
    .input(z.object({
      assessmentId: z.number(),
      courseId: z.number(),
      moduleId: z.number(),
      answers: z.record(z.string(), z.number()), // questionId -> selectedAnswer
      timeSpentSeconds: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      // Get questions and calculate score
      const questions = await db.select()
        .from(assessmentQuestions)
        .where(eq(assessmentQuestions.assessmentId, input.assessmentId));
      
      let correctAnswers = 0;
      questions.forEach(q => {
        if (input.answers[q.id] === q.correctAnswer) {
          correctAnswers++;
        }
      });
      
      const score = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
      
      // Get assessment to check passing score
      const [assessment] = await db.select()
        .from(moduleAssessments)
        .where(eq(moduleAssessments.id, input.assessmentId));
      
      const passed = score >= assessment.passingScore;
      
      // Get attempt number
      const previousAttempts = await db.select()
        .from(userAssessmentAttempts)
        .where(and(
          eq(userAssessmentAttempts.userId, ctx.user.id),
          eq(userAssessmentAttempts.assessmentId, input.assessmentId)
        ));
      
      const attemptNumber = previousAttempts.length + 1;
      
      // Insert attempt
      const result = await db.insert(userAssessmentAttempts).values({
        userId: ctx.user.id,
        assessmentId: input.assessmentId,
        courseId: input.courseId,
        moduleId: input.moduleId,
        score: score.toString(),
        totalQuestions: questions.length,
        correctAnswers,
        passed: passed ? 1 : 0,
        timeSpentSeconds: input.timeSpentSeconds,
        answers: input.answers as any,
        attemptNumber,
        startedAt: new Date(Date.now() - input.timeSpentSeconds * 1000).toISOString(),
      });
      
      return {
        attemptId: Number((result as any).insertId ?? (result as any)[0]?.insertId),
        score,
        passed,
        correctAnswers,
        totalQuestions: questions.length,
      };
    }),

  getUserAssessmentAttempts: protectedProcedure
    .input(z.object({
      assessmentId: z.number().optional(),
      courseId: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      
      const conditions = [eq(userAssessmentAttempts.userId, ctx.user.id)];
      if (input.assessmentId) conditions.push(eq(userAssessmentAttempts.assessmentId, input.assessmentId));
      if (input.courseId) conditions.push(eq(userAssessmentAttempts.courseId, input.courseId));
      
      return await db.select()
        .from(userAssessmentAttempts)
        .where(and(...conditions))
        .orderBy(desc(userAssessmentAttempts.completedAt));
    }),

  // ============================================
  // CERTIFICATE TEMPLATES
  // ============================================
  
  getCertificateTemplates: protectedProcedure
    .input(z.object({
      regionId: z.number().optional(),
      frameworkCode: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const conditions = [eq(certificateTemplates.isActive, 1)];
      if (input.regionId) conditions.push(eq(certificateTemplates.regionId, input.regionId));
      if (input.frameworkCode) conditions.push(eq(certificateTemplates.frameworkCode, input.frameworkCode));
      
      return await db.select()
        .from(certificateTemplates)
        .where(and(...conditions));
    }),

  // ============================================
  // ENROLLMENT ANALYTICS
  // ============================================
  
  getCourseEnrollments: protectedProcedure
    .input(z.object({
      courseId: z.number().optional(),
      regionId: z.number().optional(),
      status: z.enum(['active', 'completed', 'cancelled', 'expired']).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const conditions = [];
      if (input.courseId) conditions.push(eq(regionalCourseEnrollments.courseId, input.courseId));
      if (input.regionId) conditions.push(eq(regionalCourseEnrollments.regionId, input.regionId));
      if (input.status) conditions.push(eq(regionalCourseEnrollments.status, input.status));
      
      return await db.select()
        .from(regionalCourseEnrollments)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(regionalCourseEnrollments.enrolledAt));
    }),

  getEnrollmentStats: protectedProcedure
    .input(z.object({
      regionId: z.number().optional(),
      courseId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { totalEnrollments: 0, activeEnrollments: 0, completedEnrollments: 0, averageProgress: 0 };
      
      const conditions = [];
      if (input.regionId) conditions.push(eq(regionalCourseEnrollments.regionId, input.regionId));
      if (input.courseId) conditions.push(eq(regionalCourseEnrollments.courseId, input.courseId));
      
      const result = await db.select({
        totalEnrollments: sql<number>`COUNT(*)`,
        activeEnrollments: sql<number>`SUM(CASE WHEN ${regionalCourseEnrollments.status} = 'active' THEN 1 ELSE 0 END)`,
        completedEnrollments: sql<number>`SUM(CASE WHEN ${regionalCourseEnrollments.status} = 'completed' THEN 1 ELSE 0 END)`,
        averageProgress: sql<number>`AVG(${regionalCourseEnrollments.progressPercent})`,
      })
      .from(regionalCourseEnrollments)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
      
      return result[0];
    }),

  // ============================================
  // CERTIFICATE ISSUANCE ANALYTICS
  // ============================================
  
  getCertificateIssuances: protectedProcedure
    .input(z.object({
      regionId: z.number().optional(),
      courseId: z.number().optional(),
      frameworkCode: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const conditions = [eq(certificateIssuances.isRevoked, 0)];
      if (input.regionId) conditions.push(eq(certificateIssuances.regionId, input.regionId));
      if (input.courseId) conditions.push(eq(certificateIssuances.courseId, input.courseId));
      if (input.frameworkCode) conditions.push(eq(certificateIssuances.frameworkCode, input.frameworkCode));
      
      return await db.select()
        .from(certificateIssuances)
        .where(and(...conditions))
        .orderBy(desc(certificateIssuances.issuedAt));
    }),

  getCertificateStats: protectedProcedure
    .input(z.object({
      regionId: z.number().optional(),
      frameworkCode: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { totalIssued: 0, averageScore: 0, totalDownloads: 0, totalVerifications: 0 };
      
      const conditions = [eq(certificateIssuances.isRevoked, 0)];
      if (input.regionId) conditions.push(eq(certificateIssuances.regionId, input.regionId));
      if (input.frameworkCode) conditions.push(eq(certificateIssuances.frameworkCode, input.frameworkCode));
      
      const result = await db.select({
        totalIssued: sql<number>`COUNT(*)`,
        averageScore: sql<number>`AVG(${certificateIssuances.score})`,
        totalDownloads: sql<number>`SUM(${certificateIssuances.downloadCount})`,
        totalVerifications: sql<number>`SUM(${certificateIssuances.verificationCount})`,
      })
      .from(certificateIssuances)
      .where(and(...conditions));
      
      return result[0];
    }),

  // ============================================
  // REGIONAL ANALYTICS DASHBOARD
  // ============================================
  
  getRegionalAnalytics: protectedProcedure
    .input(z.object({
      regionId: z.number(),
      courseId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const conditions = [eq(regionalAnalytics.regionId, input.regionId)];
      if (input.courseId) conditions.push(eq(regionalAnalytics.courseId, input.courseId));
      if (input.startDate) conditions.push(gte(regionalAnalytics.date, input.startDate));
      if (input.endDate) conditions.push(lte(regionalAnalytics.date, input.endDate));
      
      return await db.select()
        .from(regionalAnalytics)
        .where(and(...conditions))
        .orderBy(desc(regionalAnalytics.date));
    }),

  getModuleCompletionMetrics: protectedProcedure
    .input(z.object({
      courseId: z.number(),
      regionId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const conditions = [eq(moduleCompletionMetrics.courseId, input.courseId)];
      if (input.regionId) conditions.push(eq(moduleCompletionMetrics.regionId, input.regionId));
      if (input.startDate) conditions.push(gte(moduleCompletionMetrics.date, input.startDate));
      if (input.endDate) conditions.push(lte(moduleCompletionMetrics.date, input.endDate));
      
      return await db.select()
        .from(moduleCompletionMetrics)
        .where(and(...conditions))
        .orderBy(desc(moduleCompletionMetrics.date));
    }),

  getRegionalComparison: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];
      
      // Get latest analytics for each region
      const result = await db.select({
        regionId: regionalAnalytics.regionId,
        totalEnrollments: sql<number>`SUM(${regionalAnalytics.enrollmentCount})`,
        totalCompletions: sql<number>`SUM(${regionalAnalytics.completionCount})`,
        totalCertificates: sql<number>`SUM(${regionalAnalytics.certificateIssuedCount})`,
        totalRevenue: sql<number>`SUM(${regionalAnalytics.revenue})`,
        averageScore: sql<number>`AVG(${regionalAnalytics.averageScore})`,
        completionRate: sql<number>`(SUM(${regionalAnalytics.completionCount}) / SUM(${regionalAnalytics.enrollmentCount})) * 100`,
      })
      .from(regionalAnalytics)
      .groupBy(regionalAnalytics.regionId);
      
      return result;
    }),
});
