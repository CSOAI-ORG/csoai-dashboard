/**
 * Analytics Router
 * Handles real-time metrics for signup conversion rates, payment success rates, and course completion tracking
 */

import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  analyticsEvents,
  conversionFunnels,
  paymentAnalytics,
  courseCompletionTracking,
  recommendationAnalytics,
  watchdogReports,
  assessments,
  users,
  aiSystems,
  frameworks,
} from "../../drizzle/schema";
import { eq, and, gte, lte, desc, sql, count } from "drizzle-orm";

export const analyticsRouter = router({
  // Track an analytics event
  trackEvent: publicProcedure
    .input(
      z.object({
        eventType: z.enum([
          "signup_started",
          "signup_completed",
          "payment_initiated",
          "payment_completed",
          "payment_failed",
          "course_started",
          "course_completed",
          "exam_passed",
          "exam_failed",
        ]),
        userId: z.number().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(analyticsEvents).values({
        eventType: input.eventType,
        userId: input.userId || null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }),

  // Get signup conversion funnel
  getSignupConversionFunnel: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate || new Date();

      // Get funnel data aggregated from conversionFunnels table
      const startDateStr = startDate instanceof Date ? startDate.toISOString() : startDate;
      const endDateStr = endDate instanceof Date ? endDate.toISOString() : endDate;
      const funnelData = await db
        .select()
        .from(conversionFunnels)
        .where(
          and(
            gte(conversionFunnels.timestamp, startDateStr),
            lte(conversionFunnels.timestamp, endDateStr)
          )
        )
        .orderBy(desc(conversionFunnels.timestamp));

      if (!funnelData.length) return null;

      // Aggregate funnel steps
      const signupStarts = funnelData.filter(f => f.step === 'signup' && f.completed === 0).length;
      const signupCompletes = funnelData.filter(f => f.step === 'signup' && f.completed === 1).length;
      const conversionRate = signupStarts > 0 ? (signupCompletes / signupStarts) * 100 : 0;

      return {
        signupStarts,
        signupCompletes,
        conversionRate,
        dropoffRate: 100 - conversionRate,
        recordedAt: funnelData[0].timestamp,
      };
    }),

  // Get payment success metrics
  getPaymentMetrics: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate || new Date();
      const startDateStr2 = startDate instanceof Date ? startDate.toISOString() : startDate;
      const endDateStr2 = endDate instanceof Date ? endDate.toISOString() : endDate;

      const metrics = await db
        .select()
        .from(paymentAnalytics)
        .where(
          and(
            gte(paymentAnalytics.createdAt, startDateStr2),
            lte(paymentAnalytics.createdAt, endDateStr2)
          )
        )
        .orderBy(desc(paymentAnalytics.createdAt));

      if (!metrics.length) return null;

      // Aggregate payment metrics
      const totalTransactions = metrics.length;
      const successfulTransactions = metrics.filter(m => m.status === 'completed').length;
      const failedTransactions = metrics.filter(m => m.status === 'failed').length;
      const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;
      const totalRevenue = metrics
        .filter(m => m.status === 'completed')
        .reduce((sum, m) => sum + parseFloat(m.amount ?? '0'), 0);
      const averageTransactionValue = successfulTransactions > 0 ? totalRevenue / successfulTransactions : 0;

      return {
        totalTransactions,
        successfulTransactions,
        failedTransactions,
        successRate,
        totalRevenue,
        averageTransactionValue,
        recordedAt: metrics[0].createdAt,
      };
    }),

  // Get course completion stats
  getCourseCompletionStats: publicProcedure
    .input(
      z.object({
        courseId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate || new Date();
      const startDateStr3 = startDate instanceof Date ? startDate.toISOString() : startDate;
      const endDateStr3 = endDate instanceof Date ? endDate.toISOString() : endDate;

      let whereConditions = and(
        gte(courseCompletionTracking.createdAt, startDateStr3),
        lte(courseCompletionTracking.createdAt, endDateStr3)
      );

      if (input.courseId) {
        whereConditions = and(
          whereConditions,
          eq(courseCompletionTracking.courseId, input.courseId)
        );
      }

      const stats = await db
        .select()
        .from(courseCompletionTracking)
        .where(whereConditions)
        .orderBy(desc(courseCompletionTracking.createdAt));

      if (!stats.length) return null;

      // Aggregate completion stats
      const enrolledCount = stats.length;
      const completedCount = stats.filter(s => s.completedAt != null).length;
      const completionRate = enrolledCount > 0 ? (completedCount / enrolledCount) * 100 : 0;

      return {
        courseId: input.courseId || null,
        enrolledCount,
        completedCount,
        completionRate,
        averageTimeToCompletion: null, // Not tracked in current schema
        recordedAt: stats[0].createdAt,
      };
    }),

  // Get user behavior analytics
  getUserBehaviorAnalytics: protectedProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate || new Date();
      const startDateStr4 = startDate instanceof Date ? startDate.toISOString() : startDate;
      const endDateStr4 = endDate instanceof Date ? endDate.toISOString() : endDate;

      // Get recommendation analytics for the user
      const analytics = await db
        .select()
        .from(recommendationAnalytics)
        .where(
          and(
            gte(recommendationAnalytics.createdAt, startDateStr4),
            lte(recommendationAnalytics.createdAt, endDateStr4)
          )
        )
        .orderBy(desc(recommendationAnalytics.createdAt));

      return analytics.map((a: any) => ({
        period: a.period,
        periodType: a.periodType,
        totalGenerated: a.totalGenerated,
        totalViewed: a.totalViewed,
        totalImplemented: a.totalImplemented,
        totalDismissed: a.totalDismissed,
        helpfulCount: a.helpfulCount,
        notHelpfulCount: a.notHelpfulCount,
        recordedAt: a.createdAt,
      }));
    }),

  // Get incident trends over time
  getIncidentTrends: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        groupBy: z.enum(["day", "week", "month"]).default("day"),
        aiSystemId: z.number().optional(),
        incidentType: z.enum(['bias','privacy','safety','misinformation','manipulation','other']).optional(),
        severity: z.enum(['low','medium','high','critical']).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate || new Date();
      const startDateStr = startDate instanceof Date ? startDate.toISOString() : startDate;
      const endDateStr = endDate instanceof Date ? endDate.toISOString() : endDate;

      // Build filter conditions
      const conditions = [
        gte(watchdogReports.createdAt, startDateStr),
        lte(watchdogReports.createdAt, endDateStr)
      ];
      
      if (input.aiSystemId) {
        conditions.push(eq(watchdogReports.aiSystemName, input.aiSystemId.toString()));
      }
      if (input.incidentType) {
        conditions.push(eq(watchdogReports.incidentType, input.incidentType));
      }
      if (input.severity) {
        conditions.push(eq(watchdogReports.severity, input.severity));
      }

      // Get all reports in date range with filters
      const reports = await db
        .select({
          createdAt: watchdogReports.createdAt,
          severity: watchdogReports.severity,
          incidentType: watchdogReports.incidentType,
          status: watchdogReports.status,
        })
        .from(watchdogReports)
        .where(and(...conditions))
        .orderBy(watchdogReports.createdAt);

      // Group by date period
      const trendData: Record<string, any> = {};
      reports.forEach((report) => {
        const date = new Date(report.createdAt);
        let key: string;
        
        if (input.groupBy === "day") {
          key = date.toISOString().split("T")[0];
        } else if (input.groupBy === "week") {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        }

        if (!trendData[key]) {
          trendData[key] = {
            date: key,
            total: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            resolved: 0,
            pending: 0,
            byType: {} as Record<string, number>,
          };
        }

        trendData[key].total++;
        trendData[key][report.severity]++;
        
        if (report.status === "resolved") {
          trendData[key].resolved++;
        } else {
          trendData[key].pending++;
        }

        const type = report.incidentType || "other";
        trendData[key].byType[type] = (trendData[key].byType[type] || 0) + 1;
      });

      return Object.values(trendData).sort((a: any, b: any) => 
        a.date.localeCompare(b.date)
      );
    }),

  // Get compliance history over time
  getComplianceHistory: publicProcedure
    .input(
      z.object({
        aiSystemId: z.number().optional(),
        frameworkId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const startDate = input.startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate || new Date();
      const startDateStr = startDate instanceof Date ? startDate.toISOString() : startDate;
      const endDateStr = endDate instanceof Date ? endDate.toISOString() : endDate;

      const conditions = [
        gte(assessments.createdAt, startDateStr),
        lte(assessments.createdAt, endDateStr)
      ];

      if (input.aiSystemId) {
        conditions.push(eq(assessments.aiSystemId, input.aiSystemId));
      }
      
      if (input.frameworkId) {
        conditions.push(eq(assessments.frameworkId, input.frameworkId));
      }
      
      const whereConditions = and(...conditions);

      const assessmentData = await db
        .select({
          id: assessments.id,
          aiSystemId: assessments.aiSystemId,
          frameworkId: assessments.frameworkId,
          overallScore: assessments.overallScore,
          status: assessments.status,
          createdAt: assessments.createdAt,
        })
        .from(assessments)
        .where(whereConditions)
        .orderBy(assessments.createdAt);

      // Group by date and calculate averages
      const historyData: Record<string, any> = {};
      assessmentData.forEach((assessment) => {
        const date = new Date(assessment.createdAt).toISOString().split("T")[0];
        
        if (!historyData[date]) {
          historyData[date] = {
            date,
            scores: [],
            frameworks: {} as Record<string, number>,
          };
        }

        const score = assessment.overallScore ? parseFloat(assessment.overallScore as string) : 0;
        historyData[date].scores.push(score);
        
        const framework = assessment.frameworkId || 0;
        historyData[date].frameworks[framework] = 
          (historyData[date].frameworks[framework] || 0) + 1;
      });

      return Object.values(historyData)
        .map((item: any) => ({
          date: item.date,
          averageScore: item.scores.reduce((a: number, b: number) => a + b, 0) / item.scores.length,
          assessmentCount: item.scores.length,
          frameworks: item.frameworks,
        }))
        .sort((a: any, b: any) => a.date.localeCompare(b.date));
    }),

  // Get user activity metrics
  getUserActivityMetrics: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = input.endDate || new Date();
      const startDateStr = startDate instanceof Date ? startDate.toISOString() : startDate;
      const endDateStr = endDate instanceof Date ? endDate.toISOString() : endDate;

      // Get user registrations over time
      const userRegistrations = await db
        .select({
          createdAt: users.createdAt,
          role: users.role,
        })
        .from(users)
        .where(
          and(
            gte(users.createdAt, startDateStr),
            lte(users.createdAt, endDateStr)
          )
        )
        .orderBy(users.createdAt);

      // Get activity events
      const activityEvents = await db
        .select({
          eventType: analyticsEvents.eventType,
          userId: analyticsEvents.userId,
          createdAt: analyticsEvents.createdAt,
        })
        .from(analyticsEvents)
        .where(
          and(
            gte(analyticsEvents.createdAt, startDateStr),
            lte(analyticsEvents.createdAt, endDateStr)
          )
        )
        .orderBy(analyticsEvents.createdAt);

      // Group by date
      const activityData: Record<string, any> = {};
      
      userRegistrations.forEach((user) => {
        const date = new Date(user.createdAt).toISOString().split("T")[0];
        if (!activityData[date]) {
          activityData[date] = {
            date,
            newUsers: 0,
            activeUsers: new Set(),
            events: {} as Record<string, number>,
          };
        }
        activityData[date].newUsers++;
      });

      activityEvents.forEach((event) => {
        const date = new Date(event.createdAt).toISOString().split("T")[0];
        if (!activityData[date]) {
          activityData[date] = {
            date,
            newUsers: 0,
            activeUsers: new Set(),
            events: {} as Record<string, number>,
          };
        }
        
        if (event.userId) {
          activityData[date].activeUsers.add(event.userId);
        }
        
        const eventType = event.eventType || "unknown";
        activityData[date].events[eventType] = 
          (activityData[date].events[eventType] || 0) + 1;
      });

      return Object.values(activityData)
        .map((item: any) => ({
          date: item.date,
          newUsers: item.newUsers,
          activeUsers: item.activeUsers.size,
          events: item.events,
        }))
        .sort((a: any, b: any) => a.date.localeCompare(b.date));
    }),

  // Get real-time dashboard metrics
  getDashboardMetrics: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get signup events
    const signupEvents = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventType, "signup_completed"),
          gte(analyticsEvents.createdAt, last24Hours.toISOString())
        )
      );

    // Get payment events
    const paymentSuccessEvents = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventType, "payment_completed"),
          gte(analyticsEvents.createdAt, last24Hours.toISOString())
        )
      );

    const paymentFailedEvents = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventType, "payment_failed"),
          gte(analyticsEvents.createdAt, last24Hours.toISOString())
        )
      );

    // Get course completion events
    const courseCompletionEvents = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventType, "course_completed"),
          gte(analyticsEvents.createdAt, last24Hours.toISOString())
        )
      );

    const successCount = paymentSuccessEvents[0]?.count || 0;
    const failedCount = paymentFailedEvents[0]?.count || 0;
    const totalPayments = successCount + failedCount;

    return {
      signupsLast24h: signupEvents[0]?.count || 0,
      paymentsSuccessLast24h: successCount,
      paymentsFailedLast24h: failedCount,
      courseCompletionsLast24h: courseCompletionEvents[0]?.count || 0,
      paymentSuccessRate: totalPayments > 0 ? ((successCount / totalPayments) * 100).toFixed(2) : "0",
      timestamp: new Date().toISOString(),
    };
  }),

  // Get list of AI systems for filtering
  getAISystemsList: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const systems = await db
      .select({
        id: aiSystems.id,
        name: aiSystems.name,
      })
      .from(aiSystems)
      .orderBy(aiSystems.name);

    return systems;
  }),

  // Get list of frameworks for filtering
  getFrameworksList: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const frameworksList = await db
      .select({
        id: frameworks.id,
        name: frameworks.name,
      })
      .from(frameworks)
      .orderBy(frameworks.name);

    return frameworksList;
  }),
});
