/**
 * Tests for Phase 9 Advanced Analytics & Automation Features
 * - Cohort Analysis
 * - Automated Certificate Generation & Email
 * - ML-Based Predictive Analytics
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from '../routers';
import { getDb } from '../db';
import { users, courseEnrollments, userTestAttempts, userCertificates } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Phase 9 Features - Cohort Analysis, Certificate Automation, Predictive Analytics', () => {
  let testUserId: number;
  let testEnrollmentId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) console.warn('⚠️ Database not available, skipping test'); return;

    // Create test user
    const timestamp = Date.now();
    const userResult = await db.insert(users).values({
      openId: `test-phase9-${timestamp}`,
      email: `test-phase9-${timestamp}@example.com`,
      name: 'Phase 9 Test User',
      role: 'user',
    }).$returningId() as any;
    testUserId = userResult[0]?.id || userResult.id;
    
    if (!testUserId) {
      throw new Error('Failed to create test user');
    }

    // Create test enrollment
    const enrollmentResult = await db.insert(courseEnrollments).values({
      userId: testUserId,
      courseId: 1,
      enrollmentType: 'course',
      paymentStatus: 'completed',
      progress: 75,
      status: 'in_progress',
      enrolledAt: new Date().toISOString(),
    }).$returningId() as any;
    testEnrollmentId = enrollmentResult[0]?.id || enrollmentResult.id;
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Cleanup test data
    await db.delete(courseEnrollments).where(eq(courseEnrollments.userId, testUserId));
    await db.delete(userCertificates).where(eq(userCertificates.userId, testUserId));
    await db.delete(userTestAttempts).where(eq(userTestAttempts.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe('Cohort Analysis Router', () => {
    it('should get cohorts grouped by month', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      const cohorts = await caller.cohortAnalysis.getCohorts({
        groupBy: 'monthly',
      });

      expect(cohorts).toBeDefined();
      expect(Array.isArray(cohorts)).toBe(true);
      
      if (cohorts.length > 0) {
        const cohort = cohorts[0];
        expect(cohort).toHaveProperty('cohortPeriod');
        expect(cohort).toHaveProperty('totalStudents');
        expect(cohort).toHaveProperty('totalEnrollments');
        expect(cohort).toHaveProperty('completionRate');
        expect(cohort).toHaveProperty('avgProgress');
      }
    });

    it('should get cohorts grouped by quarter', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      const cohorts = await caller.cohortAnalysis.getCohorts({
        groupBy: 'quarterly',
      });

      expect(cohorts).toBeDefined();
      expect(Array.isArray(cohorts)).toBe(true);
    });

    it('should get cohorts grouped by year', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      const cohorts = await caller.cohortAnalysis.getCohorts({
        groupBy: 'yearly',
      });

      expect(cohorts).toBeDefined();
      expect(Array.isArray(cohorts)).toBe(true);
    });

    it('should get cohort trends over time', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      const trends = await caller.cohortAnalysis.getCohortTrends({
        groupBy: 'monthly',
      });

      expect(trends).toBeDefined();
      expect(Array.isArray(trends)).toBe(true);
      
      if (trends.length > 0) {
        const trend = trends[0];
        expect(trend).toHaveProperty('cohortPeriod');
        expect(trend).toHaveProperty('newStudents');
        expect(trend).toHaveProperty('newEnrollments');
        expect(trend).toHaveProperty('studentGrowthRate');
        expect(trend).toHaveProperty('revenueGrowthRate');
      }
    });

    it('should compare multiple cohorts', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      // First get available cohorts
      const cohorts = await caller.cohortAnalysis.getCohorts({
        groupBy: 'monthly',
      });

      if (cohorts.length >= 2) {
        const comparison = await caller.cohortAnalysis.getCohortComparison({
          cohortPeriods: [cohorts[0].cohortPeriod, cohorts[1].cohortPeriod],
          groupBy: 'monthly',
        });

        expect(comparison).toBeDefined();
        expect(Array.isArray(comparison)).toBe(true);
        expect(comparison.length).toBe(2);
        
        const cohort = comparison[0];
        expect(cohort).toHaveProperty('totalStudents');
        expect(cohort).toHaveProperty('completionRate');
        expect(cohort).toHaveProperty('testPassRate');
        expect(cohort).toHaveProperty('avgTestScore');
      }
    });
  });

  describe('Certificate Automation Service', () => {
    it('should generate certificate data structure', async () => {
      const { generateAndEmailCertificate } = await import('../services/certificateAutomation');
      
      const result = await generateAndEmailCertificate({
        userId: testUserId,
        testId: 1,
        attemptId: 1,
        certificateNumber: `TEST-CERT-${Date.now()}`,
        score: 85,
        percentScore: 85,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('certificateId');
    });

    it('should handle missing user gracefully', async () => {
      const { generateAndEmailCertificate } = await import('../services/certificateAutomation');
      
      const result = await generateAndEmailCertificate({
        userId: 999999, // Non-existent user
        testId: 1,
        attemptId: 1,
        certificateNumber: `TEST-CERT-${Date.now()}`,
        score: 85,
        percentScore: 85,
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should batch generate certificates', async () => {
      const { batchGenerateAndEmailCertificates } = await import('../services/certificateAutomation');
      
      const certificates = [
        {
          userId: testUserId,
          testId: 1,
          attemptId: 1,
          certificateNumber: `TEST-BATCH-1-${Date.now()}`,
          score: 85,
          percentScore: 85,
        },
      ];

      const result = await batchGenerateAndEmailCertificates(certificates);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('failed');
      expect(result).toHaveProperty('errors');
      expect(typeof result.success).toBe('number');
      expect(typeof result.failed).toBe('number');
    });
  });

  describe('Predictive Analytics Router', () => {
    it('should get prediction for current user', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      const prediction = await caller.predictiveAnalytics.getPrediction({});

      expect(prediction).toBeDefined();
      if (prediction) {
        expect(prediction).toHaveProperty('userId');
        expect(prediction).toHaveProperty('successProbability');
        expect(prediction).toHaveProperty('completionLikelihood');
        expect(prediction).toHaveProperty('riskLevel');
        expect(prediction).toHaveProperty('recommendations');
        expect(prediction).toHaveProperty('features');
        
        expect(prediction.successProbability).toBeGreaterThanOrEqual(0);
        expect(prediction.successProbability).toBeLessThanOrEqual(100);
        expect(prediction.completionLikelihood).toBeGreaterThanOrEqual(0);
        expect(prediction.completionLikelihood).toBeLessThanOrEqual(100);
        expect(['low', 'medium', 'high']).toContain(prediction.riskLevel);
        expect(Array.isArray(prediction.recommendations)).toBe(true);
      }
    });

    it('should get recommendations for user', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      const recommendations = await caller.predictiveAnalytics.getRecommendations({});

      expect(recommendations).toBeDefined();
      expect(recommendations).toHaveProperty('recommendations');
      expect(recommendations).toHaveProperty('riskLevel');
      expect(Array.isArray(recommendations.recommendations)).toBe(true);
      expect(recommendations.recommendations.length).toBeGreaterThan(0);
    });

    it('should get at-risk students', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      const atRiskStudents = await caller.predictiveAnalytics.getAtRiskStudents({
        threshold: 50,
      });

      expect(atRiskStudents).toBeDefined();
      expect(Array.isArray(atRiskStudents)).toBe(true);
      
      atRiskStudents.forEach(student => {
        expect(student).toHaveProperty('userId');
        expect(student).toHaveProperty('successProbability');
        expect(student.successProbability).toBeLessThan(50);
      });
    });

    it('should get aggregate statistics', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      const statistics = await caller.predictiveAnalytics.getStatistics();

      expect(statistics).toBeDefined();
      expect(statistics).toHaveProperty('totalStudents');
      expect(statistics).toHaveProperty('avgSuccessProbability');
      expect(statistics).toHaveProperty('avgCompletionLikelihood');
      expect(statistics).toHaveProperty('riskDistribution');
      
      expect(statistics.riskDistribution).toHaveProperty('low');
      expect(statistics.riskDistribution).toHaveProperty('medium');
      expect(statistics.riskDistribution).toHaveProperty('high');
      
      expect(typeof statistics.totalStudents).toBe('number');
      expect(typeof statistics.avgSuccessProbability).toBe('number');
      expect(typeof statistics.avgCompletionLikelihood).toBe('number');
    });

    it('should calculate prediction features correctly', async () => {
      const { predictStudentSuccess } = await import('../services/predictiveAnalytics');
      
      const prediction = await predictStudentSuccess(testUserId);

      expect(prediction).toBeDefined();
      if (prediction) {
        expect(prediction.features).toBeDefined();
        expect(prediction.features).toHaveProperty('enrollmentAge');
        expect(prediction.features).toHaveProperty('progressRate');
        expect(prediction.features).toHaveProperty('engagementScore');
        expect(prediction.features).toHaveProperty('testPerformance');
        expect(prediction.features).toHaveProperty('activityConsistency');
        
        // Validate feature ranges
        expect(prediction.features.progressRate).toBeGreaterThanOrEqual(0);
        expect(prediction.features.progressRate).toBeLessThanOrEqual(100);
        expect(prediction.features.engagementScore).toBeGreaterThanOrEqual(0);
        expect(prediction.features.engagementScore).toBeLessThanOrEqual(100);
        expect(prediction.features.testPerformance).toBeGreaterThanOrEqual(0);
        expect(prediction.features.testPerformance).toBeLessThanOrEqual(100);
        expect(prediction.features.activityConsistency).toBeGreaterThanOrEqual(0);
        expect(prediction.features.activityConsistency).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should work end-to-end: enrollment -> prediction -> cohort analysis', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      // 1. Get prediction for enrolled user
      const prediction = await caller.predictiveAnalytics.getPrediction({});
      expect(prediction).toBeDefined();

      // 2. Get cohorts (should include our test user's enrollment)
      const cohorts = await caller.cohortAnalysis.getCohorts({
        groupBy: 'monthly',
      });
      expect(cohorts).toBeDefined();
      expect(cohorts.length).toBeGreaterThan(0);

      // 3. Get trends
      const trends = await caller.cohortAnalysis.getCohortTrends({
        groupBy: 'monthly',
      });
      expect(trends).toBeDefined();
    });

    it('should provide consistent data across all analytics endpoints', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      // Get data from all endpoints
      const prediction = await caller.predictiveAnalytics.getPrediction({});
      const statistics = await caller.predictiveAnalytics.getStatistics();
      const cohorts = await caller.cohortAnalysis.getCohorts({ groupBy: 'monthly' });

      // Verify data consistency
      if (prediction && statistics && cohorts.length > 0) {
        expect(prediction.userId).toBe(testUserId);
        expect(statistics.totalStudents).toBeGreaterThan(0);
        expect(cohorts[0].totalStudents).toBeGreaterThan(0);
      }
    });
  });
});
