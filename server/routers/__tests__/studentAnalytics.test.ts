import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from '../../routers';
import { getDb } from '../../db';
import { 
  users, 
  trainingModules, 
  courses,
  userTrainingProgress,
  certificationTests,
  userTestAttempts,
  userCertificates
} from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Student Analytics Router', () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testUserId: number;
  let testCourseId: number;
  let testModuleId: number;
  let testTestId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error('Database not available');

    // Create test user
    const [user] = await db.insert(users).values({
      openId: `test-analytics-${Date.now()}`,
      email: `test-analytics-${Date.now()}@example.com`,
      name: 'Test Analytics User',
      role: 'admin',
    });
    testUserId = Number(user.insertId);

    // Create test course with framework
    const [course] = await db.insert(courses).values({
      regionId: 1,
      title: 'Test Analytics Course',
      description: 'Test course for analytics',
      framework: 'eu-ai-act',
      level: 'fundamentals',
      durationHours: 10,
      price: 0,
      active: 1,
    });
    testCourseId = Number(course.insertId);

    // Create test module
    const [module] = await db.insert(trainingModules).values({
      code: `TEST-ANALYTICS-${Date.now()}`,
      title: 'Test Analytics Module',
      description: 'Test module for analytics',
      content: 'Test content',
      courseId: testCourseId,
      orderIndex: 1,
      durationMinutes: 60,
      isRequired: 1,
      isActive: true,
    });
    testModuleId = Number(module.insertId);

    // Create test certification test
    const [test] = await db.insert(certificationTests).values({
      code: `TEST-CERT-${Date.now()}`,
      title: 'Test Certification',
      description: 'Test certification for analytics',
      passingScore: 70,
      timeLimitMinutes: 90,
      totalQuestions: 50,
      isActive: true,
    });
    testTestId = Number(test.insertId);

    // Create test training progress
    await db.insert(userTrainingProgress).values({
      userId: testUserId,
      moduleId: testModuleId,
      completed: 0,
      progress: 50,
      startedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    });

    // Create completed progress
    await db.insert(userTrainingProgress).values({
      userId: testUserId,
      moduleId: testModuleId,
      completed: 1,
      progress: 100,
      startedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      completedAt: new Date().toISOString(),
    });

    // Create test attempt
    await db.insert(userTestAttempts).values({
      userId: testUserId,
      testId: testTestId,
      score: 85,
      passed: 1,
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date().toISOString(),
      answers: JSON.stringify([]),
    });

    // Create certificate
    await db.insert(userCertificates).values({
      userId: testUserId,
      testId: testTestId,
      attemptId: 1,
      certificateNumber: `CERT-TEST-${Date.now()}`,
      certificateType: 'basic',
      issuedAt: new Date().toISOString(),
    });
  });

  afterAll(async () => {
    if (!db) return;
    
    // Cleanup in reverse order of dependencies
    await db.delete(userCertificates).where(eq(userCertificates.userId, testUserId));
    await db.delete(userTestAttempts).where(eq(userTestAttempts.userId, testUserId));
    await db.delete(userTrainingProgress).where(eq(userTrainingProgress.userId, testUserId));
    await db.delete(certificationTests).where(eq(certificationTests.id, testTestId));
    await db.delete(trainingModules).where(eq(trainingModules.id, testModuleId));
    await db.delete(courses).where(eq(courses.id, testCourseId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe('getCompletionRates', () => {
    it('should return completion rates for all frameworks', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'admin' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.studentAnalytics.getCompletionRates({});

      expect(result).toBeDefined();
      expect(result.completionRates).toBeInstanceOf(Array);
      expect(result.byFramework).toBeInstanceOf(Array);
    });

    it('should filter by framework', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'admin' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.studentAnalytics.getCompletionRates({
        frameworkId: 'eu-ai-act',
      });

      expect(result).toBeDefined();
      expect(result.byFramework).toBeInstanceOf(Array);
      
      // Should only have eu-ai-act framework
      const frameworks = result.byFramework.map((fw: any) => fw.framework);
      if (frameworks.length > 0) {
        expect(frameworks.every((f: string) => f === 'eu-ai-act' || f === 'general')).toBe(true);
      }
    });

    it('should filter by date range', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'admin' },
        req: {} as any,
        res: {} as any,
      });

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const result = await caller.studentAnalytics.getCompletionRates({
        startDate: yesterday,
        endDate: tomorrow,
      });

      expect(result).toBeDefined();
      expect(result.completionRates).toBeInstanceOf(Array);
    });
  });

  describe('getQuizScores', () => {
    it('should return quiz scores and pass rates', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'admin' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.studentAnalytics.getQuizScores({});

      expect(result).toBeDefined();
      expect(result.quizScores).toBeInstanceOf(Array);
      expect(result.byFramework).toBeInstanceOf(Array);

      // Check that scores are calculated correctly
      if (result.quizScores.length > 0) {
        const score = result.quizScores[0];
        expect(score).toHaveProperty('avgScore');
        expect(score).toHaveProperty('passRate');
        expect(score).toHaveProperty('totalAttempts');
      }
    });

    it('should filter quiz scores by date range', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'admin' },
        req: {} as any,
        res: {} as any,
      });

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const result = await caller.studentAnalytics.getQuizScores({
        startDate: yesterday,
        endDate: tomorrow,
      });

      expect(result).toBeDefined();
      expect(result.quizScores).toBeInstanceOf(Array);
    });
  });

  describe('getTimeToCompletion', () => {
    it('should return time-to-completion metrics', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'admin' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.studentAnalytics.getTimeToCompletion({});

      expect(result).toBeDefined();
      expect(result.timeMetrics).toBeInstanceOf(Array);
      expect(result.byFramework).toBeInstanceOf(Array);

      // Check that time metrics are calculated
      if (result.timeMetrics.length > 0) {
        const metric = result.timeMetrics[0];
        expect(metric).toHaveProperty('avgHours');
        expect(metric).toHaveProperty('minHours');
        expect(metric).toHaveProperty('maxHours');
        expect(typeof metric.avgHours).toBe('number');
      }
    });

    it('should filter time metrics by framework', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'admin' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.studentAnalytics.getTimeToCompletion({
        frameworkId: 'eu-ai-act',
      });

      expect(result).toBeDefined();
      expect(result.byFramework).toBeInstanceOf(Array);
    });
  });

  describe('getAnalyticsSummary', () => {
    it('should return overall analytics summary', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'admin' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.studentAnalytics.getAnalyticsSummary({});

      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalEnrolled');
      expect(result).toHaveProperty('totalCertificates');
      expect(result).toHaveProperty('avgCompletionRate');
      expect(result).toHaveProperty('avgQuizScore');

      expect(typeof result.totalEnrolled).toBe('number');
      expect(typeof result.totalCertificates).toBe('number');
      expect(typeof result.avgCompletionRate).toBe('number');
      expect(typeof result.avgQuizScore).toBe('number');

      // Values should be non-negative
      expect(result.totalEnrolled).toBeGreaterThanOrEqual(0);
      expect(result.totalCertificates).toBeGreaterThanOrEqual(0);
      expect(result.avgCompletionRate).toBeGreaterThanOrEqual(0);
      expect(result.avgQuizScore).toBeGreaterThanOrEqual(0);
    });

    it('should filter summary by date range', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'admin' },
        req: {} as any,
        res: {} as any,
      });

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const result = await caller.studentAnalytics.getAnalyticsSummary({
        startDate: yesterday,
        endDate: tomorrow,
      });

      expect(result).toBeDefined();
      expect(result.totalEnrolled).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getRecentActivity', () => {
    it('should return recent activity', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'admin' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.studentAnalytics.getRecentActivity({
        limit: 10,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Check activity structure
      if (result.length > 0) {
        const activity = result[0];
        expect(activity).toHaveProperty('type');
        expect(activity).toHaveProperty('userId');
        expect(activity).toHaveProperty('userName');
        expect(activity).toHaveProperty('timestamp');
        expect(['completion', 'certificate']).toContain(activity.type);
      }
    });

    it('should limit the number of activities returned', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'admin' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.studentAnalytics.getRecentActivity({
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('should filter activity by framework', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'admin' },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.studentAnalytics.getRecentActivity({
        limit: 10,
        frameworkId: 'eu-ai-act',
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      const caller = appRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
      });

      await expect(
        caller.studentAnalytics.getCompletionRates({})
      ).rejects.toThrow();

      await expect(
        caller.studentAnalytics.getQuizScores({})
      ).rejects.toThrow();

      await expect(
        caller.studentAnalytics.getTimeToCompletion({})
      ).rejects.toThrow();

      await expect(
        caller.studentAnalytics.getAnalyticsSummary({})
      ).rejects.toThrow();

      await expect(
        caller.studentAnalytics.getRecentActivity({ limit: 10 })
      ).rejects.toThrow();
    });
  });
});
