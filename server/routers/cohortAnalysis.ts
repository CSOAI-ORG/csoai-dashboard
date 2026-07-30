import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { courseEnrollments, userTestAttempts, users } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const cohortAnalysisRouter = router({
  // Get cohort groups based on enrollment date
  getCohorts: publicProcedure
    .input(
      z.object({
        groupBy: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const { groupBy, startDate, endDate } = input;

      // Build date format based on grouping
      let dateFormat: string;
      switch (groupBy) {
        case "yearly":
          dateFormat = "%Y";
          break;
        case "quarterly":
          dateFormat = "%Y-Q%q";
          break;
        case "monthly":
        default:
          dateFormat = "%Y-%m";
          break;
      }

      // Build WHERE clause for date filtering
      const whereConditions = [];
      if (startDate) {
        whereConditions.push(sql`${courseEnrollments.enrolledAt} >= ${startDate}`);
      }
      if (endDate) {
        whereConditions.push(sql`${courseEnrollments.enrolledAt} <= ${endDate}`);
      }

      // Query cohorts with aggregated metrics
      const cohorts = await db
        .select({
          cohortPeriod: sql<string>`DATE_FORMAT(${courseEnrollments.enrolledAt}, ${dateFormat})`.as("cohortPeriod"),
          totalStudents: sql<number>`COUNT(DISTINCT ${courseEnrollments.userId})`.as("totalStudents"),
          totalEnrollments: sql<number>`COUNT(*)`.as("totalEnrollments"),
          completedEnrollments: sql<number>`SUM(CASE WHEN ${courseEnrollments.status} = 'completed' THEN 1 ELSE 0 END)`.as("completedEnrollments"),
          avgProgress: sql<number>`AVG(${courseEnrollments.progress})`.as("avgProgress"),
          totalRevenue: sql<number>`SUM(${courseEnrollments.amountPaid})`.as("totalRevenue"),
        })
        .from(courseEnrollments)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .groupBy(sql`DATE_FORMAT(${courseEnrollments.enrolledAt}, ${dateFormat})`)
        .orderBy(sql`DATE_FORMAT(${courseEnrollments.enrolledAt}, ${dateFormat})`);

      return cohorts.map((cohort) => ({
        ...cohort,
        completionRate: cohort.totalEnrollments > 0 
          ? ((cohort.completedEnrollments / cohort.totalEnrollments) * 100).toFixed(2)
          : "0.00",
        avgRevenuePerStudent: cohort.totalStudents > 0
          ? (cohort.totalRevenue / cohort.totalStudents).toFixed(2)
          : "0.00",
      }));
    }),

  // Get detailed cohort performance comparison
  getCohortComparison: publicProcedure
    .input(
      z.object({
        cohortPeriods: z.array(z.string()),
        groupBy: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const { cohortPeriods, groupBy } = input;

      // Build date format based on grouping
      let dateFormat: string;
      switch (groupBy) {
        case "yearly":
          dateFormat = "%Y";
          break;
        case "quarterly":
          dateFormat = "%Y-Q%q";
          break;
        case "monthly":
        default:
          dateFormat = "%Y-%m";
          break;
      }

      const comparisons = await Promise.all(
        cohortPeriods.map(async (period) => {
          // Get enrollments for this cohort
          const enrollments = await db
            .select({
              userId: courseEnrollments.userId,
              enrolledAt: courseEnrollments.enrolledAt,
              status: courseEnrollments.status,
              progress: courseEnrollments.progress,
              amountPaid: courseEnrollments.amountPaid,
            })
            .from(courseEnrollments)
            .where(sql`DATE_FORMAT(${courseEnrollments.enrolledAt}, ${dateFormat}) = ${period}`);

          const userIds = [...new Set(enrollments.map((e) => e.userId))];

          // Get test performance for cohort users
          const testAttempts = userIds.length > 0
            ? await db
                .select({
                  userId: userTestAttempts.userId,
                  score: userTestAttempts.score,
                  passed: userTestAttempts.passed,
                  completedAt: userTestAttempts.completedAt,
                })
                .from(userTestAttempts)
                .where(sql`${userTestAttempts.userId} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`)
            : [];

          // Calculate metrics
          const totalStudents = userIds.length;
          const completedEnrollments = enrollments.filter((e) => e.status === "completed").length;
          const avgProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length || 0;
          const totalRevenue = enrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0);

          const passedTests = testAttempts.filter((t) => t.passed).length;
          const avgTestScore = testAttempts.length > 0
            ? testAttempts.reduce((sum, t) => sum + (t.score || 0), 0) / testAttempts.length
            : 0;

          return {
            cohortPeriod: period,
            totalStudents,
            totalEnrollments: enrollments.length,
            completedEnrollments,
            completionRate: enrollments.length > 0
              ? ((completedEnrollments / enrollments.length) * 100).toFixed(2)
              : "0.00",
            avgProgress: avgProgress.toFixed(2),
            totalRevenue,
            avgRevenuePerStudent: totalStudents > 0 ? (totalRevenue / totalStudents).toFixed(2) : "0.00",
            totalTestAttempts: testAttempts.length,
            passedTests,
            testPassRate: testAttempts.length > 0
              ? ((passedTests / testAttempts.length) * 100).toFixed(2)
              : "0.00",
            avgTestScore: avgTestScore.toFixed(2),
          };
        })
      );

      return comparisons;
    }),

  // Get cohort trends over time
  getCohortTrends: publicProcedure
    .input(
      z.object({
        groupBy: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const { groupBy, startDate, endDate } = input;

      // Build date format based on grouping
      let dateFormat: string;
      switch (groupBy) {
        case "yearly":
          dateFormat = "%Y";
          break;
        case "quarterly":
          dateFormat = "%Y-Q%q";
          break;
        case "monthly":
        default:
          dateFormat = "%Y-%m";
          break;
      }

      // Build WHERE clause for date filtering
      const whereConditions = [];
      if (startDate) {
        whereConditions.push(sql`${courseEnrollments.enrolledAt} >= ${startDate}`);
      }
      if (endDate) {
        whereConditions.push(sql`${courseEnrollments.enrolledAt} <= ${endDate}`);
      }

      // Get enrollment trends
      const trends = await db
        .select({
          cohortPeriod: sql<string>`DATE_FORMAT(${courseEnrollments.enrolledAt}, ${dateFormat})`.as("cohortPeriod"),
          newStudents: sql<number>`COUNT(DISTINCT ${courseEnrollments.userId})`.as("newStudents"),
          newEnrollments: sql<number>`COUNT(*)`.as("newEnrollments"),
          avgProgress: sql<number>`AVG(${courseEnrollments.progress})`.as("avgProgress"),
          revenue: sql<number>`SUM(${courseEnrollments.amountPaid})`.as("revenue"),
        })
        .from(courseEnrollments)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .groupBy(sql`DATE_FORMAT(${courseEnrollments.enrolledAt}, ${dateFormat})`)
        .orderBy(sql`DATE_FORMAT(${courseEnrollments.enrolledAt}, ${dateFormat})`);

      // Calculate growth rates
      const trendsWithGrowth = trends.map((trend, index) => {
        if (index === 0) {
          return {
            ...trend,
            studentGrowthRate: "0.00",
            revenueGrowthRate: "0.00",
          };
        }

        const prevTrend = trends[index - 1];
        const studentGrowthRate = prevTrend.newStudents > 0
          ? (((trend.newStudents - prevTrend.newStudents) / prevTrend.newStudents) * 100).toFixed(2)
          : "0.00";
        const revenueGrowthRate = prevTrend.revenue > 0
          ? (((trend.revenue - prevTrend.revenue) / prevTrend.revenue) * 100).toFixed(2)
          : "0.00";

        return {
          ...trend,
          studentGrowthRate,
          revenueGrowthRate,
        };
      });

      return trendsWithGrowth;
    }),

  // Get individual cohort details with student list
  getCohortDetails: publicProcedure
    .input(
      z.object({
        cohortPeriod: z.string(),
        groupBy: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const { cohortPeriod, groupBy, limit, offset } = input;

      // Build date format based on grouping
      let dateFormat: string;
      switch (groupBy) {
        case "yearly":
          dateFormat = "%Y";
          break;
        case "quarterly":
          dateFormat = "%Y-Q%q";
          break;
        case "monthly":
        default:
          dateFormat = "%Y-%m";
          break;
      }

      // Get students in this cohort
      const cohortStudents = await db
        .select({
          userId: courseEnrollments.userId,
          userName: users.name,
          userEmail: users.email,
          enrolledAt: courseEnrollments.enrolledAt,
          totalEnrollments: sql<number>`COUNT(*)`.as("totalEnrollments"),
          completedEnrollments: sql<number>`SUM(CASE WHEN ${courseEnrollments.status} = 'completed' THEN 1 ELSE 0 END)`.as("completedEnrollments"),
          avgProgress: sql<number>`AVG(${courseEnrollments.progress})`.as("avgProgress"),
          totalSpent: sql<number>`SUM(${courseEnrollments.amountPaid})`.as("totalSpent"),
        })
        .from(courseEnrollments)
        .leftJoin(users, eq(courseEnrollments.userId, users.id))
        .where(sql`DATE_FORMAT(${courseEnrollments.enrolledAt}, ${dateFormat}) = ${cohortPeriod}`)
        .groupBy(courseEnrollments.userId, users.name, users.email, courseEnrollments.enrolledAt)
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const totalCount = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${courseEnrollments.userId})`.as("count"),
        })
        .from(courseEnrollments)
        .where(sql`DATE_FORMAT(${courseEnrollments.enrolledAt}, ${dateFormat}) = ${cohortPeriod}`);

      return {
        students: cohortStudents.map((student) => ({
          ...student,
          completionRate: student.totalEnrollments > 0
            ? ((student.completedEnrollments / student.totalEnrollments) * 100).toFixed(2)
            : "0.00",
        })),
        total: totalCount[0]?.count || 0,
        limit,
        offset,
      };
    }),
});
