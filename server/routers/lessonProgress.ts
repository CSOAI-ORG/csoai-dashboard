import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  courseLessons,
  userLessonProgress,
  lessonQuizzes,
  userQuizAttempts,
  userQuizScores,
  courseEnrollments,
  courses,
  users
} from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

import { sendCompletionCertificateEmail } from '../services/courseEmailService.js';

// Helper function to update course enrollment progress
async function updateCourseProgress(db: any, userId: number, courseId: number) {
  // Get all lessons for the course
  const allLessons = await db
    .select()
    .from(courseLessons)
    .where(eq(courseLessons.courseId, courseId));

  // Get completed lessons
  const completedLessons = await db
    .select()
    .from(userLessonProgress)
    .where(
      and(
        eq(userLessonProgress.userId, userId),
        eq(userLessonProgress.courseId, courseId),
        eq(userLessonProgress.status, 'completed')
      )
    );

  const totalLessons = allLessons.length;
  const completedCount = completedLessons.length;
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Check if this is a new completion
  const [currentEnrollment] = await db
    .select()
    .from(courseEnrollments)
    .where(
      and(
        eq(courseEnrollments.userId, userId),
        eq(courseEnrollments.courseId, courseId)
      )
    )
    .limit(1);

  const wasCompleted = currentEnrollment?.status === 'completed';
  const isNowCompleted = progress === 100;
  const justCompleted = isNowCompleted && !wasCompleted;

  // Update enrollment
  const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'enrolled';
  const now = new Date().toISOString();

  await db
    .update(courseEnrollments)
    .set({
      progress,
      status,
      completedAt: progress === 100 ? now : null,
      updatedAt: now,
    })
    .where(
      and(
        eq(courseEnrollments.userId, userId),
        eq(courseEnrollments.courseId, courseId)
      )
    );

  // Send completion email if just completed
  if (justCompleted) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
      
      if (user && course) {
        await sendCompletionCertificateEmail({
          userEmail: user.email,
          userName: user.name || `User ${userId}`,
          courseName: course.title,
          completionDate: now,
          certificateUrl: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/certificates`,
        });
        console.log(`[Completion] Sent completion email to ${user.email}`);
      }
    } catch (emailError) {
      console.error('[Completion] Failed to send completion email:', emailError);
      // Don't fail the progress update if email fails
    }
  }
}

export const lessonProgressRouter = router({
  /**
   * Get lesson progress for a specific course
   */
  getLessonProgress: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Get all lessons for the course
      const lessons = await db
        .select()
        .from(courseLessons)
        .where(eq(courseLessons.courseId, input.courseId))
        .orderBy(courseLessons.moduleId, courseLessons.orderIndex);

      // Get user progress for these lessons
      const lessonIds = lessons.map(l => l.id);
      const progressData = lessonIds.length > 0 ? await db
        .select()
        .from(userLessonProgress)
        .where(
          and(
            eq(userLessonProgress.userId, userId),
            eq(userLessonProgress.courseId, input.courseId)
          )
        ) : [];

      const progressMap = new Map(progressData.map(p => [p.lessonId, p]));

      return lessons.map(lesson => ({
        ...lesson,
        progress: progressMap.get(lesson.id) || null,
      }));
    }),

  /**
   * Update lesson progress
   */
  updateLessonProgress: protectedProcedure
    .input(z.object({
      courseId: z.number(),
      lessonId: z.number(),
      status: z.enum(['not_started', 'in_progress', 'completed']),
      progressPercent: z.number().min(0).max(100),
      timeSpentSeconds: z.number().optional(),
      lastPositionSeconds: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Check if progress record exists
      const existing = await db
        .select()
        .from(userLessonProgress)
        .where(
          and(
            eq(userLessonProgress.userId, userId),
            eq(userLessonProgress.lessonId, input.lessonId)
          )
        )
        .limit(1);

      const now = new Date().toISOString();

      if (existing.length > 0) {
        // Update existing record
        await db
          .update(userLessonProgress)
          .set({
            status: input.status,
            progressPercent: input.progressPercent,
            timeSpentSeconds: input.timeSpentSeconds ?? existing[0].timeSpentSeconds,
            lastPositionSeconds: input.lastPositionSeconds ?? existing[0].lastPositionSeconds,
            completedAt: input.status === 'completed' ? now : existing[0].completedAt,
            updatedAt: now,
          })
          .where(eq(userLessonProgress.id, existing[0].id));
      } else {
        // Create new record
        await db.insert(userLessonProgress).values({
          userId,
          courseId: input.courseId,
          lessonId: input.lessonId,
          status: input.status,
          progressPercent: input.progressPercent,
          timeSpentSeconds: input.timeSpentSeconds || 0,
          lastPositionSeconds: input.lastPositionSeconds || 0,
          startedAt: now,
          completedAt: input.status === 'completed' ? now : null,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Update course enrollment progress
      await updateCourseProgress(db, userId, input.courseId);

      return { success: true };
    }),

  /**
   * Get quiz questions for a lesson
   */
  getQuizQuestions: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const questions = await db
        .select()
        .from(lessonQuizzes)
        .where(eq(lessonQuizzes.lessonId, input.lessonId))
        .orderBy(lessonQuizzes.orderIndex);

      return questions;
    }),

  /**
   * Submit quiz answers
   */
  submitQuizAnswers: protectedProcedure
    .input(z.object({
      lessonId: z.number(),
      answers: z.array(z.object({
        quizId: z.number(),
        selectedAnswer: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Get all questions for validation
      const questions = await db
        .select()
        .from(lessonQuizzes)
        .where(eq(lessonQuizzes.lessonId, input.lessonId));

      const questionMap = new Map(questions.map(q => [q.id, q]));

      // Record each attempt
      let correctCount = 0;
      const now = new Date().toISOString();

      for (const answer of input.answers) {
        const question = questionMap.get(answer.quizId);
        if (!question) continue;

        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        if (isCorrect) correctCount++;

        await db.insert(userQuizAttempts).values({
          userId,
          lessonId: input.lessonId,
          quizId: answer.quizId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect: isCorrect ? 1 : 0,
          attemptedAt: now,
        });
      }

      // Calculate score
      const totalQuestions = questions.length;
      const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
      const passed = score >= 70;

      // Get attempt number
      const previousScores = await db
        .select()
        .from(userQuizScores)
        .where(
          and(
            eq(userQuizScores.userId, userId),
            eq(userQuizScores.lessonId, input.lessonId)
          )
        );

      const attemptNumber = previousScores.length + 1;

      // Record score
      await db.insert(userQuizScores).values({
        userId,
        lessonId: input.lessonId,
        totalQuestions,
        correctAnswers: correctCount,
        score: score.toFixed(2),
        passed: passed ? 1 : 0,
        attemptNumber,
        completedAt: now,
      });

      // If passed, mark lesson as completed
      if (passed) {
        const lessonData = await db
          .select()
          .from(courseLessons)
          .where(eq(courseLessons.id, input.lessonId))
          .limit(1);

        if (lessonData.length > 0) {
          await db
            .update(userLessonProgress)
            .set({
              status: 'completed',
              progressPercent: 100,
              completedAt: now,
              updatedAt: now,
            })
            .where(
              and(
                eq(userLessonProgress.userId, userId),
                eq(userLessonProgress.lessonId, input.lessonId)
              )
            );

          // Update course progress
          if (lessonData[0]) {
            await updateCourseProgress(db, userId, lessonData[0].courseId);
          }
        }
      }

      return {
        success: true,
        score,
        passed: passed ? 1 : 0,
        correctAnswers: correctCount,
        totalQuestions,
        attemptNumber,
      };
    }),

  /**
   * Get quiz results for a lesson
   */
  getQuizResults: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      const scores = await db
        .select()
        .from(userQuizScores)
        .where(
          and(
            eq(userQuizScores.userId, userId),
            eq(userQuizScores.lessonId, input.lessonId)
          )
        )
        .orderBy(desc(userQuizScores.completedAt));

      return scores;
    }),


});
