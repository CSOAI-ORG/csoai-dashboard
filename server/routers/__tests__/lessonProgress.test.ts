import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../../routers';
import { getDb } from '../../db';
import { users, courses, courseEnrollments, courseLessons, userLessonProgress } from '../../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

describe('Lesson Progress Router', () => {
  let testUserId: number;
  let testCourseId: number;
  let testLessonId: number;
  let testEnrollmentId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Create test user
    const userResult = await db.insert(users).values({
      openId: `test-openid-${Date.now()}`,
      name: 'Test User Lesson',
      email: `test-lesson-${Date.now()}@example.com`,
      password: 'hashed_password',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    testUserId = Number((userResult as any).insertId);

    // Create test course
    const courseResult = await db.insert(courses).values({
      regionId: 1,
      title: 'Test Course for Lessons',
      description: 'Test course description',
      framework: 'EU AI Act',
      level: 'fundamentals',
      durationHours: 10,
      price: 0,
      modules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    testCourseId = Number((courseResult as any).insertId);

    // Create enrollment
    const enrollmentResult = await db.insert(courseEnrollments).values({
      userId: testUserId,
      courseId: testCourseId,
      status: 'enrolled',
      progress: 0,
      enrolledAt: new Date().toISOString(),
      paidAmount: 0,
      commissionPaid: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    testEnrollmentId = Number((enrollmentResult as any).insertId);

    // Create test lesson
    const lessonResult = await db.insert(courseLessons).values({
      courseId: testCourseId,
      moduleId: 1,
      lessonKey: 'lesson1',
      title: 'Test Lesson 1',
      type: 'video',
      duration: '15 min',
      orderIndex: 0,
      videoUrl: 'https://example.com/video.mp4',
      content: 'Test lesson content',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    testLessonId = Number((lessonResult as any).insertId);
  });

  it('should get lesson progress for a course', async () => {
    const caller = appRouter.createCaller({
      user: { 
        id: testUserId, 
        email: 'test@example.com', 
        name: 'Test User', 
        role: 'user' as const,
        openId: 'test_user_lesson',
        brand: 'councilof.ai',
        password: null,
        loginMethod: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSignedIn: new Date().toISOString(),
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionTier: 'free' as const,
        subscriptionStatus: 'none' as const,
        foundingMember: 0,
        referralCode: null,
        payoutFrequency: 'monthly' as const,
        lastPayoutDate: null,
        stripeConnectAccountId: null,
      },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.lessonProgress.getLessonProgress({ courseId: testCourseId });
    
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('title');
  });

  it('should update lesson progress', async () => {
    const caller = appRouter.createCaller({
      user: { 
        id: testUserId, 
        email: 'test@example.com', 
        name: 'Test User', 
        role: 'user' as const,
        openId: 'test_user_lesson',
        brand: 'councilof.ai',
        password: null,
        loginMethod: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSignedIn: new Date().toISOString(),
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionTier: 'free' as const,
        subscriptionStatus: 'none' as const,
        foundingMember: 0,
        referralCode: null,
        payoutFrequency: 'monthly' as const,
        lastPayoutDate: null,
        stripeConnectAccountId: null,
      },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.lessonProgress.updateLessonProgress({
      courseId: testCourseId,
      lessonId: testLessonId,
      status: 'in_progress',
      progressPercent: 50,
      timeSpentSeconds: 300,
    });

    expect(result).toEqual({ success: true });

    // Verify progress was saved
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const progress = await db
      .select()
      .from(userLessonProgress)
      .where(
        and(
          eq(userLessonProgress.userId, testUserId),
          eq(userLessonProgress.lessonId, testLessonId)
        )
      )
      .limit(1);

    expect(progress.length).toBe(1);
    expect(progress[0].status).toBe('in_progress');
    expect(progress[0].progressPercent).toBe(50);
  });

  it('should mark lesson as completed', async () => {
    const caller = appRouter.createCaller({
      user: { 
        id: testUserId, 
        email: 'test@example.com', 
        name: 'Test User', 
        role: 'user' as const,
        openId: 'test_user_lesson',
        brand: 'councilof.ai',
        password: null,
        loginMethod: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSignedIn: new Date().toISOString(),
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionTier: 'free' as const,
        subscriptionStatus: 'none' as const,
        foundingMember: 0,
        referralCode: null,
        payoutFrequency: 'monthly' as const,
        lastPayoutDate: null,
        stripeConnectAccountId: null,
      },
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.lessonProgress.updateLessonProgress({
      courseId: testCourseId,
      lessonId: testLessonId,
      status: 'completed',
      progressPercent: 100,
    });

    expect(result).toEqual({ success: true });

    // Verify completion
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const progress = await db
      .select()
      .from(userLessonProgress)
      .where(
        and(
          eq(userLessonProgress.userId, testUserId),
          eq(userLessonProgress.lessonId, testLessonId)
        )
      )
      .limit(1);

    expect(progress.length).toBe(1);
    expect(progress[0].status).toBe('completed');
    expect(progress[0].completedAt).toBeTruthy();
  });
});
