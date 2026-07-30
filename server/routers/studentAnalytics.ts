import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { 
  userTrainingProgress, 
  trainingModules,
  courses,
  userTestAttempts,
  certificationTests,
  userCertificates,
  users
} from "../../drizzle/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

export const studentAnalyticsRouter = router({
  // Get completion rates per course and framework
  getCompletionRates: protectedProcedure
    .input(
      z.object({
        frameworkId: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { completionRates: [], byFramework: [] };

      const { frameworkId, startDate, endDate } = input;

      // Build where conditions
      const conditions = [];
      if (frameworkId) {
        conditions.push(eq(courses.framework, frameworkId));
      }
      if (startDate) {
        conditions.push(gte(userTrainingProgress.completedAt, new Date(startDate).toISOString()));
      }
      if (endDate) {
        conditions.push(lte(userTrainingProgress.completedAt, new Date(endDate).toISOString()));
      }

      // Get all modules with completion stats, joining through courses for framework
      const modules = await db
        .select({
          moduleId: trainingModules.id,
          moduleName: trainingModules.title,
          framework: courses.framework,
          totalEnrolled: sql<number>`COUNT(DISTINCT ${userTrainingProgress.userId})`,
          totalCompleted: sql<number>`SUM(CASE WHEN ${userTrainingProgress.completedAt} IS NOT NULL THEN 1 ELSE 0 END)`,
        })
        .from(trainingModules)
        .leftJoin(courses, eq(trainingModules.courseId, courses.id))
        .leftJoin(
          userTrainingProgress,
          eq(trainingModules.id, userTrainingProgress.moduleId)
        )
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(trainingModules.id, trainingModules.title, courses.framework);

      // Calculate completion rates
      const completionRates = modules.map((module) => ({
        moduleId: module.moduleId,
        moduleName: module.moduleName,
        framework: module.framework || "general",
        totalEnrolled: Number(module.totalEnrolled),
        totalCompleted: Number(module.totalCompleted),
        completionRate:
          Number(module.totalEnrolled) > 0
            ? (Number(module.totalCompleted) / Number(module.totalEnrolled)) * 100
            : 0,
      }));

      // Group by framework
      const byFramework = completionRates.reduce((acc, item) => {
        if (!acc[item.framework]) {
          acc[item.framework] = {
            framework: item.framework,
            modules: [],
            totalEnrolled: 0,
            totalCompleted: 0,
            avgCompletionRate: 0,
          };
        }
        acc[item.framework].modules.push(item);
        acc[item.framework].totalEnrolled += item.totalEnrolled;
        acc[item.framework].totalCompleted += item.totalCompleted;
        return acc;
      }, {} as Record<string, any>);

      // Calculate average completion rates per framework
      Object.values(byFramework).forEach((fw: any) => {
        fw.avgCompletionRate =
          fw.totalEnrolled > 0 ? (fw.totalCompleted / fw.totalEnrolled) * 100 : 0;
      });

      return {
        completionRates,
        byFramework: Object.values(byFramework),
      };
    }),

  // Get average quiz scores per test
  getQuizScores: protectedProcedure
    .input(
      z.object({
        frameworkId: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { quizScores: [], byFramework: [] };

      const { startDate, endDate } = input;

      // Build where conditions
      const conditions = [sql`${userTestAttempts.completedAt} IS NOT NULL`];
      if (startDate) {
        conditions.push(gte(userTestAttempts.completedAt, new Date(startDate).toISOString()));
      }
      if (endDate) {
        conditions.push(lte(userTestAttempts.completedAt, new Date(endDate).toISOString()));
      }

      // Get quiz scores grouped by test
      const scores = await db
        .select({
          testId: certificationTests.id,
          testName: certificationTests.title,
          avgScore: sql<number>`AVG(${userTestAttempts.score})`,
          maxScore: sql<number>`MAX(${userTestAttempts.score})`,
          minScore: sql<number>`MIN(${userTestAttempts.score})`,
          totalAttempts: sql<number>`COUNT(*)`,
          passedAttempts: sql<number>`SUM(CASE WHEN ${userTestAttempts.passed} = 1 THEN 1 ELSE 0 END)`,
        })
        .from(certificationTests)
        .leftJoin(
          userTestAttempts,
          eq(certificationTests.id, userTestAttempts.testId)
        )
        .where(and(...conditions))
        .groupBy(certificationTests.id, certificationTests.title);

      // Calculate pass rates
      const quizScores = scores.map((score) => ({
        testId: score.testId,
        testName: score.testName,
        framework: "general", // Since schema doesn't have framework field
        avgScore: Number(score.avgScore) || 0,
        maxScore: Number(score.maxScore) || 0,
        minScore: Number(score.minScore) || 0,
        totalAttempts: Number(score.totalAttempts),
        passedAttempts: Number(score.passedAttempts),
        passRate:
          Number(score.totalAttempts) > 0
            ? (Number(score.passedAttempts) / Number(score.totalAttempts)) * 100
            : 0,
      }));

      // Group by framework (all general for now)
      const byFramework = [{
        framework: "general",
        tests: quizScores,
        avgScore: quizScores.length > 0 
          ? quizScores.reduce((sum, test) => sum + test.avgScore * test.totalAttempts, 0) / 
            quizScores.reduce((sum, test) => sum + test.totalAttempts, 0)
          : 0,
        totalAttempts: quizScores.reduce((sum, test) => sum + test.totalAttempts, 0),
        passedAttempts: quizScores.reduce((sum, test) => sum + test.passedAttempts, 0),
        passRate: quizScores.length > 0
          ? (quizScores.reduce((sum, test) => sum + test.passedAttempts, 0) / 
             quizScores.reduce((sum, test) => sum + test.totalAttempts, 0)) * 100
          : 0,
      }];

      return {
        quizScores,
        byFramework,
      };
    }),

  // Get time-to-completion metrics
  getTimeToCompletion: protectedProcedure
    .input(
      z.object({
        frameworkId: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { timeMetrics: [], byFramework: [] };

      const { frameworkId, startDate, endDate } = input;

      // Build where conditions
      const conditions = [];
      if (frameworkId) {
        conditions.push(eq(courses.framework, frameworkId));
      }
      if (startDate) {
        conditions.push(gte(userTrainingProgress.completedAt, new Date(startDate).toISOString()));
      }
      if (endDate) {
        conditions.push(lte(userTrainingProgress.completedAt, new Date(endDate).toISOString()));
      }

      // Get time-to-completion data
      const completionTimes = await db
        .select({
          moduleId: trainingModules.id,
          moduleName: trainingModules.title,
          framework: courses.framework,
          userId: userTrainingProgress.userId,
          startedAt: userTrainingProgress.startedAt,
          completedAt: userTrainingProgress.completedAt,
        })
        .from(trainingModules)
        .leftJoin(courses, eq(trainingModules.courseId, courses.id))
        .innerJoin(
          userTrainingProgress,
          eq(trainingModules.id, userTrainingProgress.moduleId)
        )
        .where(
          conditions.length > 0 
            ? and(sql`${userTrainingProgress.completedAt} IS NOT NULL`, ...conditions)
            : sql`${userTrainingProgress.completedAt} IS NOT NULL`
        );

      // Calculate time differences in hours
      const timeMetrics = completionTimes
        .filter(record => record.startedAt && record.completedAt)
        .map((record) => {
          const startTime = new Date(record.startedAt!).getTime();
          const endTime = new Date(record.completedAt!).getTime();
          const hoursToComplete = (endTime - startTime) / (1000 * 60 * 60);

          return {
            moduleId: record.moduleId,
            moduleName: record.moduleName,
            framework: record.framework || "general",
            userId: record.userId,
            hoursToComplete,
          };
        });

      // Group by module and calculate averages
      const byModule = timeMetrics.reduce((acc, item) => {
        if (!acc[item.moduleId]) {
          acc[item.moduleId] = {
            moduleId: item.moduleId,
            moduleName: item.moduleName,
            framework: item.framework,
            times: [],
            avgHours: 0,
            minHours: 0,
            maxHours: 0,
          };
        }
        acc[item.moduleId].times.push(item.hoursToComplete);
        return acc;
      }, {} as Record<string, any>);

      // Calculate statistics
      Object.values(byModule).forEach((module: any) => {
        const times = module.times;
        module.avgHours = times.reduce((sum: number, t: number) => sum + t, 0) / times.length;
        module.minHours = Math.min(...times);
        module.maxHours = Math.max(...times);
        delete module.times; // Remove raw data
      });

      // Group by framework
      const byFramework = Object.values(byModule).reduce((acc: any, item: any) => {
        if (!acc[item.framework]) {
          acc[item.framework] = {
            framework: item.framework,
            modules: [],
            avgHours: 0,
          };
        }
        acc[item.framework].modules.push(item);
        return acc;
      }, {} as Record<string, any>);

      // Calculate framework averages
      Object.values(byFramework).forEach((fw: any) => {
        const totalHours = fw.modules.reduce((sum: number, mod: any) => sum + mod.avgHours, 0);
        fw.avgHours = fw.modules.length > 0 ? totalHours / fw.modules.length : 0;
      });

      return {
        timeMetrics: Object.values(byModule),
        byFramework: Object.values(byFramework),
      };
    }),

  // Get overall analytics summary
  getAnalyticsSummary: protectedProcedure
    .input(
      z.object({
        frameworkId: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return {
        totalEnrolled: 0,
        totalCertificates: 0,
        avgCompletionRate: 0,
        avgQuizScore: 0,
      };

      const { frameworkId, startDate, endDate } = input;

      // Build date conditions
      const dateConditions = [];
      if (frameworkId) {
        dateConditions.push(eq(courses.framework, frameworkId));
      }
      if (startDate) {
        dateConditions.push(gte(userTrainingProgress.completedAt, new Date(startDate).toISOString()));
      }
      if (endDate) {
        dateConditions.push(lte(userTrainingProgress.completedAt, new Date(endDate).toISOString()));
      }

      // Total enrolled students
      const enrolledQuery = db
        .select({ count: sql<number>`COUNT(DISTINCT ${userTrainingProgress.userId})` })
        .from(userTrainingProgress)
        .innerJoin(trainingModules, eq(userTrainingProgress.moduleId, trainingModules.id))
        .leftJoin(courses, eq(trainingModules.courseId, courses.id));

      if (dateConditions.length > 0) {
        enrolledQuery.where(and(...dateConditions));
      }

      const [enrolledResult] = await enrolledQuery;
      const totalEnrolled = Number(enrolledResult?.count || 0);

      // Total certificates issued
      const certConditions = [];
      if (startDate) {
        certConditions.push(gte(userCertificates.issuedAt, new Date(startDate).toISOString()));
      }
      if (endDate) {
        certConditions.push(lte(userCertificates.issuedAt, new Date(endDate).toISOString()));
      }

      const certQuery = db
        .select({ count: sql<number>`COUNT(*)` })
        .from(userCertificates);

      if (certConditions.length > 0) {
        certQuery.where(and(...certConditions));
      }

      const [certResult] = await certQuery;
      const totalCertificates = Number(certResult?.count || 0);

      // Average completion rate
      const completionQuery = db
        .select({
          completed: sql<number>`SUM(CASE WHEN ${userTrainingProgress.completedAt} IS NOT NULL THEN 1 ELSE 0 END)`,
          total: sql<number>`COUNT(*)`,
        })
        .from(userTrainingProgress)
        .innerJoin(trainingModules, eq(userTrainingProgress.moduleId, trainingModules.id))
        .leftJoin(courses, eq(trainingModules.courseId, courses.id));

      if (dateConditions.length > 0) {
        completionQuery.where(and(...dateConditions));
      }

      const [completionResult] = await completionQuery;
      const avgCompletionRate =
        Number(completionResult?.total || 0) > 0
          ? (Number(completionResult?.completed || 0) / Number(completionResult?.total || 0)) * 100
          : 0;

      // Average quiz score
      const scoreConditions = [];
      scoreConditions.push(sql`${userTestAttempts.completedAt} IS NOT NULL`);
      if (startDate) {
        scoreConditions.push(gte(userTestAttempts.completedAt, new Date(startDate).toISOString()));
      }
      if (endDate) {
        scoreConditions.push(lte(userTestAttempts.completedAt, new Date(endDate).toISOString()));
      }

      const scoreQuery = db
        .select({ avgScore: sql<number>`AVG(${userTestAttempts.score})` })
        .from(userTestAttempts)
        .where(scoreConditions.length > 0 ? and(...scoreConditions) : undefined);

      const [scoreResult] = await scoreQuery;
      const avgQuizScore = Number(scoreResult?.avgScore || 0);

      return {
        totalEnrolled,
        totalCertificates,
        avgCompletionRate,
        avgQuizScore,
      };
    }),

  // Get recent activity for timeline
  getRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        frameworkId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const { limit, frameworkId } = input;

      // Build conditions
      const conditions = [];
      if (frameworkId) {
        conditions.push(eq(courses.framework, frameworkId));
      }

      // Get recent completions
      const completions = await db
        .select({
          type: sql<string>`'completion'`,
          userId: userTrainingProgress.userId,
          userName: users.name,
          moduleId: trainingModules.id,
          moduleName: trainingModules.title,
          framework: courses.framework,
          timestamp: userTrainingProgress.completedAt,
        })
        .from(userTrainingProgress)
        .innerJoin(trainingModules, eq(userTrainingProgress.moduleId, trainingModules.id))
        .leftJoin(courses, eq(trainingModules.courseId, courses.id))
        .innerJoin(users, eq(userTrainingProgress.userId, users.id))
        .where(
          conditions.length > 0
            ? and(sql`${userTrainingProgress.completedAt} IS NOT NULL`, ...conditions)
            : sql`${userTrainingProgress.completedAt} IS NOT NULL`
        )
        .orderBy(desc(userTrainingProgress.completedAt))
        .limit(limit);

      // Get recent certificates
      const certificates = await db
        .select({
          type: sql<string>`'certificate'`,
          userId: userCertificates.userId,
          userName: users.name,
          certificateId: userCertificates.id,
          certificateNumber: userCertificates.certificateNumber,
          framework: sql<string>`'general'`,
          timestamp: userCertificates.issuedAt,
        })
        .from(userCertificates)
        .innerJoin(users, eq(userCertificates.userId, users.id))
        .orderBy(desc(userCertificates.issuedAt))
        .limit(limit);

      // Combine and sort by timestamp
      const activities = [...completions, ...certificates].sort((a, b) => {
        const timeA = new Date(a.timestamp!).getTime();
        const timeB = new Date(b.timestamp!).getTime();
        return timeB - timeA;
      });

      return activities.slice(0, limit);
    }),
});
