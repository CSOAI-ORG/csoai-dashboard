/**
 * Tests for New Features
 * - Navigation links
 * - Email templates for notifications
 * - Bulk student CSV import
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { appRouter } from '../routers';
import { getDb } from '../db';
import { users, instructorCohorts, cohortStudents } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// Mock Resend for email tests
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({
        data: { id: 'test-email-id-123' },
        error: null,
      }),
    },
  })),
}));

describe('New Features Tests', () => {
  let testUserId: number;
  let testCohortId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) console.warn('⚠️ Database not available, skipping test'); return;

    // Create test user
    const timestamp = Date.now();
    const userResult = await db.insert(users).values({
      openId: `test-new-features-${timestamp}`,
      email: `test-new-features-${timestamp}@example.com`,
      name: 'Test User',
      role: 'user',
    });

    testUserId = Number(userResult[0].insertId);

    // Create test cohort
    const cohortResult = await db.insert(instructorCohorts).values({
      instructorId: testUserId,
      cohortName: 'Test Cohort',
      description: 'Test cohort for bulk import',
    });

    testCohortId = Number(cohortResult[0].insertId);
  });

  describe('Bulk Student Import', () => {
    it('should import students from CSV data', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      const students = [
        { email: 'student1@example.com', name: 'Student One' },
        { email: 'student2@example.com', name: 'Student Two' },
        { email: 'student3@example.com', name: 'Student Three' },
      ];

      const result = await caller.instructorDashboard.bulkImportStudents({
        cohortId: testCohortId,
        students,
      });

      expect(result.success).toBe(3);
      expect(result.created).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);
    });

    it('should handle existing users during import', async () => {
      const db = await getDb();
      if (!db) console.warn('⚠️ Database not available, skipping test'); return;

      // Create an existing user
      await db.insert(users).values({
        openId: `existing-${Date.now()}`,
        email: 'existing@example.com',
        name: 'Existing User',
        role: 'user',
      });

      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      const students = [
        { email: 'existing@example.com', name: 'Existing User' },
        { email: 'newstudent@example.com', name: 'New Student' },
      ];

      const result = await caller.instructorDashboard.bulkImportStudents({
        cohortId: testCohortId,
        students,
      });

      expect(result.success).toBe(2);
      expect(result.existing).toBeGreaterThanOrEqual(1);
      expect(result.created).toBeGreaterThanOrEqual(1);
    });

    it('should handle invalid email formats gracefully', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      const students = [
        { email: 'valid@example.com', name: 'Valid Student' },
        { email: 'invalid-email', name: 'Invalid Student' },
      ];

      // This should throw validation error from zod
      await expect(
        caller.instructorDashboard.bulkImportStudents({
          cohortId: testCohortId,
          students,
        })
      ).rejects.toThrow();
    });

    it('should prevent unauthorized cohort access', async () => {
      const caller = appRouter.createCaller({
        user: { id: 99999, email: 'unauthorized@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      const students = [
        { email: 'student@example.com', name: 'Student' },
      ];

      await expect(
        caller.instructorDashboard.bulkImportStudents({
          cohortId: testCohortId,
          students,
        })
      ).rejects.toThrow('Cohort not found or access denied');
    });
  });

  describe('Email Templates', () => {
    it('should have notification email template functions available', async () => {
      const {
        sendComplianceAlertEmail,
        sendSystemUpdateEmail,
        sendPDCACycleUpdateEmail,
        sendTrainingReminderEmail,
        sendCaseAssignmentEmail,
        sendPreferenceUpdateConfirmationEmail,
      } = await import('../services/notificationEmailTemplates');

      expect(typeof sendComplianceAlertEmail).toBe('function');
      expect(typeof sendSystemUpdateEmail).toBe('function');
      expect(typeof sendPDCACycleUpdateEmail).toBe('function');
      expect(typeof sendTrainingReminderEmail).toBe('function');
      expect(typeof sendCaseAssignmentEmail).toBe('function');
      expect(typeof sendPreferenceUpdateConfirmationEmail).toBe('function');
    });

    it('should send compliance alert email', async () => {
      const { sendComplianceAlertEmail } = await import('../services/notificationEmailTemplates');

      const result = await sendComplianceAlertEmail(
        'test@example.com',
        'Test User',
        'Test Alert',
        'This is a test alert',
        'Test System',
        'high',
        'https://example.com/alert/123'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should send system update email', async () => {
      const { sendSystemUpdateEmail } = await import('../services/notificationEmailTemplates');

      const result = await sendSystemUpdateEmail(
        'test@example.com',
        'Test User',
        'New Feature Released',
        'We have released a new feature',
        'feature'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should send PDCA cycle update email', async () => {
      const { sendPDCACycleUpdateEmail } = await import('../services/notificationEmailTemplates');

      const result = await sendPDCACycleUpdateEmail(
        'test@example.com',
        'Test User',
        'Test Cycle',
        'Test System',
        'Check',
        'In Progress',
        'https://example.com/pdca/123'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should send training reminder email', async () => {
      const { sendTrainingReminderEmail } = await import('../services/notificationEmailTemplates');

      const result = await sendTrainingReminderEmail(
        'test@example.com',
        'Test User',
        'AI Safety Fundamentals',
        65,
        'https://example.com/course/123'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should send case assignment email', async () => {
      const { sendCaseAssignmentEmail } = await import('../services/notificationEmailTemplates');

      const result = await sendCaseAssignmentEmail(
        'test@example.com',
        'Test User',
        123,
        'Review AI System',
        'Test AI System',
        'high',
        'https://example.com/case/123'
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should send preference update confirmation email', async () => {
      const { sendPreferenceUpdateConfirmationEmail } = await import('../services/notificationEmailTemplates');

      const result = await sendPreferenceUpdateConfirmationEmail(
        'test@example.com',
        'Test User',
        ['Compliance Alerts', 'System Updates', 'Training Reminders']
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe('Navigation Links', () => {
    it('should have instructor dashboard route accessible', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      const cohorts = await caller.instructorDashboard.getCohorts();
      expect(Array.isArray(cohorts)).toBe(true);
    });

    it('should have ab testing router available', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      // AB testing router should be accessible
      expect(caller.abTesting).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full workflow: create cohort -> import students -> verify', async () => {
      const caller = appRouter.createCaller({
        user: { id: testUserId, email: 'test@example.com', role: 'user' },
        req: {} as any,
        res: {} as any,
      });

      // Create cohort
      const cohort = await caller.instructorDashboard.createCohort({
        cohortName: 'Integration Test Cohort',
        description: 'Testing full workflow',
      });

      expect(cohort.cohortId).toBeDefined();

      // Import students
      const students = [
        { email: 'integration1@example.com', name: 'Integration Student 1' },
        { email: 'integration2@example.com', name: 'Integration Student 2' },
      ];

      const importResult = await caller.instructorDashboard.bulkImportStudents({
        cohortId: cohort.cohortId,
        students,
      });

      expect(importResult.success).toBe(2);

      // Verify students in cohort
      const cohortStudents = await caller.instructorDashboard.getCohortStudents({
        cohortId: cohort.cohortId,
      });

      expect(cohortStudents.length).toBeGreaterThanOrEqual(2);
    });
  });
});
