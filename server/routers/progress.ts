import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  courseEnrollments, 
  courses,
  courseCertificates,
  userTrainingProgress
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export const progressRouter = router({
  /**
   * Get overall progress summary for the current user
   * Returns: total courses, completed, in-progress, completion %, total hours, avg score, certificates
   */
  getOverallProgress: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const userId = ctx.user.id;

    // Get enrollment stats
    const enrollments = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId));

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter((e: any) => e.status === "completed").length;
    const inProgressCourses = enrollments.filter((e: any) => e.status === "in_progress").length;
    const completionPercentage = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

    // Calculate total learning time from enrollments
    const totalMinutes = enrollments.reduce((sum: number, e: any) => sum + (e.totalTimeSpent || 0), 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10; // Round to 1 decimal

    // Calculate average score from enrollments
    const scoresArray = enrollments.filter((e: any) => e.quizScore !== null).map((e: any) => e.quizScore || 0);
    const avgScore = scoresArray.length > 0
      ? Math.round(scoresArray.reduce((a: number, b: number) => a + b, 0) / scoresArray.length)
      : 0;

    // Count certificates
    const certificates = await db
      .select()
      .from(courseCertificates)
      .where(eq(courseCertificates.userId, userId));

    const certificateCount = certificates.length;

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      completionPercentage,
      totalHours,
      avgScore,
      certificateCount,
    };
  }),

  /**
   * Get detailed progress for a specific course
   * Returns: module completion, quiz scores, time spent, current module
   */
  getCourseProgress: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Get enrollment
      const enrollment = await db
        .select()
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.userId, userId),
            eq(courseEnrollments.courseId, input.courseId)
          )
        )
        .limit(1);

      if (enrollment.length === 0) {
        throw new Error("Not enrolled in this course");
      }

      // Get course details
      const courseData = await db
        .select()
        .from(courses)
        .where(eq(courses.id, input.courseId))
        .limit(1);

      if (courseData.length === 0) {
        throw new Error("Course not found");
      }

      const course = courseData[0];
      const modules = (course.modules as any[]) || [];
      const totalModules = modules.length;

      // Calculate per-module stats from enrollment data
      const moduleStats = modules.map((module: any, index: number) => {
        const currentProgress = enrollment[0].progress || 0;
        const moduleProgress = Math.floor(currentProgress / (100 / totalModules));
        return {
          moduleIndex: index,
          title: module.title || `Module ${index + 1}`,
          completed: index < moduleProgress,
          timeSpentMinutes: 0,
          quizScore: null as number | null,
          quizAttempts: 0,
        };
      });

      const completedModules = moduleStats.filter((m: any) => m.completed).length;
      const moduleCompletionPercentage = totalModules > 0 
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

      return {
        enrollment: enrollment[0],
        course: {
          id: course.id,
          title: course.title,
          framework: course.framework,
          level: course.level,
        },
        totalModules,
        completedModules,
        moduleCompletionPercentage,
        moduleStats,
        overallProgress: enrollment[0].progress,
      };
    }),

  /**
   * Get quiz analytics across all courses
   * Returns: score trends, strongest/weakest topics, improvement over time
   */
  getQuizAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const userId = ctx.user.id;

    // Get all enrollments with quiz data
    const enrollments = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId))
      .orderBy(courseEnrollments.enrolledAt);

    if (enrollments.length === 0) {
      return {
        totalAttempts: 0,
        avgScore: 0,
        passRate: 0,
        scoreTrend: [],
        topicPerformance: [],
        recentQuizzes: [],
      };
    }

    // Calculate overall stats from enrollments
    const enrollmentsWithScores = enrollments.filter((e: any) => e.quizScore !== null);
    const totalAttempts = enrollmentsWithScores.length;
    const avgScore = totalAttempts > 0 
      ? Math.round(enrollmentsWithScores.reduce((sum: number, e: any) => sum + (e.quizScore || 0), 0) / totalAttempts)
      : 0;
    const passedCount = enrollmentsWithScores.filter((e: any) => (e.quizScore || 0) >= 70).length;
    const passRate = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

    // Get course names for topic performance
    const courseIds = Array.from(new Set(enrollments.map((e: any) => e.courseId)));
    const coursesData = courseIds.length > 0 ? await db
      .select()
      .from(courses)
      .where(sql`${courses.id} IN (${sql.join(courseIds.map((id: any) => sql`${id}`), sql`, `)})`) : [];

    const courseMap = new Map(coursesData.map((c: any) => [c.id, c.title]));

    // Topic performance by course
    const topicPerformance = courseIds.map((courseId: any) => {
      const courseEnrollment = enrollments.find((e: any) => e.courseId === courseId);
      return {
        topic: courseMap.get(courseId) || `Course ${courseId}`,
        avgScore: courseEnrollment?.score || 0,
        attempts: 1,
      };
    }).sort((a, b) => b.avgScore - a.avgScore);

    // Recent quizzes (last 5 enrollments)
    const recentQuizzes = enrollmentsWithScores.slice(-5).reverse().map((e: any) => ({
      courseId: e.courseId,
      courseName: courseMap.get(e.courseId) || `Course ${e.courseId}`,
      moduleIndex: 0,
      score: e.quizScore || 0,
      passed: (e.quizScore || 0) >= 70,
      date: e.enrolledAt,
    }));

    return {
      totalAttempts,
      avgScore,
      passRate,
      scoreTrend: [],
      topicPerformance,
      recentQuizzes,
    };
  }),

  /**
   * Get all certificates earned by the user
   */
  getCertificates: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const userId = ctx.user.id;

    const certificates = await db
      .select({
        certificate: courseCertificates,
        course: courses,
      })
      .from(courseCertificates)
      .leftJoin(courses, eq(courseCertificates.courseId, courses.id))
      .where(eq(courseCertificates.userId, userId))
      .orderBy(desc(courseCertificates.issuedAt));

    return certificates.map((c: any) => ({
      id: c.certificate.id,
      certificateId: c.certificate.certificateId,
      courseId: c.certificate.courseId,
      courseName: c.course?.title || "Unknown Course",
      framework: c.course?.framework || "Unknown",
      issuedAt: c.certificate.issuedAt,
      verificationUrl: `/verify-certificate/${c.certificate.certificateId}`,
    }));
  }),

  /**
   * Get personalized course recommendations
   * Based on completed courses, quiz performance, and learning patterns
   */
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const userId = ctx.user.id;

    // Get user's enrolled courses
    const enrollments = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId));

    const enrolledCourseIds = new Set(enrollments.map((e: any) => e.courseId));

    // Get all courses
    const allCourses = await db.select().from(courses);

    // Filter out enrolled courses and recommend based on framework diversity
    const completedFrameworks = new Set(
      enrollments
        .filter((e: any) => e.status === "completed")
        .map((e: any) => {
          const course = allCourses.find((c: any) => c.id === e.courseId);
          return course?.framework;
        })
        .filter(Boolean)
    );

    // Recommend courses from frameworks user hasn't completed
    const recommendations = allCourses
      .filter((c: any) => !enrolledCourseIds.has(c.id))
      .map((c: any) => {
        const reasonText = completedFrameworks.has(c.framework)
          ? "Continue your learning in this framework"
          : "Expand your knowledge to a new framework";
        return {
          id: `rec_${c.id}`,
          courseId: c.id,
          courseName: c.title,
          framework: c.framework,
          level: c.level,
          reason: reasonText,
          reasonText: reasonText,
          priority: completedFrameworks.has(c.framework) ? 2 : 1,
        };
      })
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 5);

    return recommendations;
  }),

  /**
   * Dismiss a recommendation
   */
  dismissRecommendation: protectedProcedure
    .input(z.object({ recommendationId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // In a real app, this would store the dismissal in the database
      // For now, just return success
      return { success: true };
    }),

  /**
   * Get learning streak and activity data
   */
  getLearningStreak: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const userId = ctx.user.id;

    // Get training progress to calculate streak
    const progress = await db
      .select()
      .from(userTrainingProgress)
      .where(eq(userTrainingProgress.userId, userId))
      .orderBy(desc(userTrainingProgress.updatedAt));

    if (progress.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDaysActive: 0,
        lastActiveDate: null,
        weeklyActivity: [],
      };
    }

    // Calculate streak from last accessed dates
    const uniqueDates = [...new Set(
      progress
        .map((p: any) => p.lastAccessedAt?.split('T')[0])
        .filter(Boolean)
    )].sort().reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < uniqueDates.length; i++) {
      const date = uniqueDates[i];
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      const expected = expectedDate.toISOString().split('T')[0];

      if (date === expected) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Weekly activity (last 7 days)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const active = uniqueDates.includes(dateStr);
      weeklyActivity.push({ day: dayName, date: dateStr, active });
    }

    return {
      currentStreak,
      longestStreak,
      totalDaysActive: uniqueDates.length,
      lastActiveDate: uniqueDates[0] || null,
      weeklyActivity,
    };
  }),

  /**
   * Update course progress
   */
  updateProgress: protectedProcedure
    .input(z.object({
      courseId: z.number(),
      moduleIndex: z.number(),
      progress: z.number().min(0).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      await db
        .update(courseEnrollments)
        .set({
          progress: input.progress,
          status: input.progress >= 100 ? "completed" : "in_progress",
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(courseEnrollments.userId, userId),
            eq(courseEnrollments.courseId, input.courseId)
          )
        );

      return { success: true };
    }),

  /**
   * Update time spent on course
   */
  updateTimeSpent: protectedProcedure
    .input(z.object({
      courseId: z.number(),
      minutesToAdd: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Get current enrollment
      const [enrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.userId, userId),
            eq(courseEnrollments.courseId, input.courseId)
          )
        );

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      const currentTime = (enrollment.timeSpentMinutes as number) || 0;
      const newTime = currentTime + input.minutesToAdd;

      await db
        .update(courseEnrollments)
        .set({
          timeSpentMinutes: newTime,
          lastAccessedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(
          and(
            eq(courseEnrollments.userId, userId),
            eq(courseEnrollments.courseId, input.courseId)
          )
        );

      return { success: true, timeSpentMinutes: newTime };
    }),
});
