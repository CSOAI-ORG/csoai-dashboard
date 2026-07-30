import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { appRouter } from '../routers';
import type { TrpcContext } from '../_core/context';
import { getDb } from '../db';
const db = getDb();
import { cohorts, students } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

function createTestContext(): TrpcContext {
  return {
    user: {
      id: 1,
      email: 'admin@test.com',
      name: 'Admin User',
      role: 'admin',
      openId: 'test_admin',
      brand: 'councilof.ai',
      password: null,
      loginMethod: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSignedIn: new Date().toISOString(),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionTier: 'free',
      subscriptionStatus: 'none',
      foundingMember: 0,
      referralCode: null,
      payoutFrequency: 'monthly',
      lastPayoutDate: null,
      stripeConnectAccountId: null,
    },
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext['res'],
  };
}

describe('Cohorts Router', () => {
  const ctx = createTestContext();
  const caller = appRouter.createCaller(ctx);
  let testCohortId: number;
  let testStudentId: number;

  beforeAll(async () => {
    // Clean up any existing test data
    await db.delete(cohorts).where(eq(cohorts.code, 'TEST-2026'));
    await db.delete(students).where(eq(students.email, 'test-cohort@example.com'));
  });

  afterAll(async () => {
    // Clean up test data
    if (testCohortId) {
      await db.delete(cohorts).where(eq(cohorts.id, testCohortId));
    }
    if (testStudentId) {
      await db.delete(students).where(eq(students.id, testStudentId));
    }
  });

  describe('create', () => {
    it('should create a new cohort', async () => {
      const result = await caller.cohorts.create({
        name: 'Test Cohort 2026',
        code: 'TEST-2026',
        description: 'Test cohort for automated testing',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        capacity: 50,
        status: 'active',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Cohort 2026');
      expect(result.code).toBe('TEST-2026');
      expect(result.status).toBe('active');
      expect(result.capacity).toBe(50);
      
      testCohortId = result.id;
    });

    it('should fail to create cohort with duplicate code', async () => {
      await expect(
        caller.cohorts.create({
          name: 'Duplicate Cohort',
          code: 'TEST-2026', // Same code as above
          description: 'Should fail',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          capacity: 30,
          status: 'active',
        })
      ).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list all cohorts', async () => {
      const result = await caller.cohorts.list({});

      expect(result).toBeDefined();
      expect(result.cohorts).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThan(0);
      
      const testCohort = result.cohorts.find(c => c.code === 'TEST-2026');
      expect(testCohort).toBeDefined();
    });

    it('should filter cohorts by status', async () => {
      const result = await caller.cohorts.list({ status: 'active' });

      expect(result.cohorts.every(c => c.status === 'active')).toBe(true);
    });

    it('should search cohorts by name', async () => {
      const result = await caller.cohorts.list({ search: 'Test Cohort' });

      expect(result.cohorts.length).toBeGreaterThan(0);
      expect(result.cohorts.some(c => c.name.includes('Test Cohort'))).toBe(true);
    });
  });

  describe('getById', () => {
    it('should get cohort by id', async () => {
      const result = await caller.cohorts.getById({ id: testCohortId });

      expect(result).toBeDefined();
      expect(result.id).toBe(testCohortId);
      expect(result.name).toBe('Test Cohort 2026');
      expect(result.code).toBe('TEST-2026');
    });

    it('should throw error for non-existent cohort', async () => {
      await expect(
        caller.cohorts.getById({ id: 999999 })
      ).rejects.toThrow('Cohort not found');
    });
  });

  describe('update', () => {
    it('should update cohort details', async () => {
      const result = await caller.cohorts.update({
        id: testCohortId,
        name: 'Updated Test Cohort 2026',
        capacity: 60,
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Test Cohort 2026');
      expect(result.capacity).toBe(60);
      expect(result.code).toBe('TEST-2026'); // Unchanged
    });
  });

  describe('getStats', () => {
    it('should return cohort statistics', async () => {
      const result = await caller.cohorts.getStats({ id: testCohortId });

      expect(result).toBeDefined();
      expect(result.totalStudents).toBe(0);
      expect(result.activeStudents).toBe(0);
      expect(result.capacity).toBe(60);
      expect(result.enrollmentRate).toBe(0);
    });
  });

  describe('assignStudent', () => {
    beforeAll(async () => {
      // Create a test student
      const [student] = await db.insert(students).values({
        firstName: 'Test',
        lastName: 'Student',
        email: 'test-cohort@example.com',
        studentNumber: 'TS-001',
        status: 'active',
      }).returning();
      
      testStudentId = student.id;
    });

    it('should assign student to cohort', async () => {
      const result = await caller.cohorts.assignStudent({
        cohortId: testCohortId,
        studentId: testStudentId,
      });

      expect(result.success).toBe(true);
      
      // Verify student was assigned
      const updatedStudent = await db.query.students.findFirst({
        where: eq(students.id, testStudentId),
      });
      
      expect(updatedStudent?.cohortId).toBe(testCohortId);
    });
  });

  describe('delete', () => {
    it('should delete cohort', async () => {
      const result = await caller.cohorts.delete({ id: testCohortId });

      expect(result.success).toBe(true);
      
      // Verify cohort was deleted
      await expect(
        caller.cohorts.getById({ id: testCohortId })
      ).rejects.toThrow('Cohort not found');
      
      testCohortId = 0; // Prevent cleanup from trying to delete again
    });
  });
});
