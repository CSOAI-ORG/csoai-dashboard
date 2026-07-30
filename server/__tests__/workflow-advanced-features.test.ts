/**
 * Tests for Advanced Workflow Features
 * - Email delivery webhooks
 * - Workflow analytics
 * - Workflow scheduling
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from '../db';
import { 
  emailEvents, 
  emailExecutionLogs,
  workflowMetrics,
  emailEngagement,
  abTestResults,
  workflowConversions,
  workflowSchedules,
  scheduleExecutionHistory,
  scheduleStatusLog,
  emailWorkflows,
  users
} from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe.skip('Advanced Workflow Features', () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testUserId: number;
  let testWorkflowId: number;
  let testEmailLogId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error('Database not available');

    // Create test user
    const [user] = await db.insert(users).values({
      openId: `test-workflow-${Date.now()}`,
      name: 'Test Workflow User',
      email: `workflow-test-${Date.now()}@example.com`,
      role: 'user',
    }).$returningId() as { id: number }[];
    testUserId = user.id;

    // Create test workflow
    const [workflow] = await db.insert(emailWorkflows).values({
      userId: testUserId,
      name: 'Test Workflow for Advanced Features',
      description: 'Testing email webhooks, analytics, and scheduling',
      triggerType: 'manual',
      workflowData: { nodes: [], edges: [] },
      isActive: true,
    }).$returningId() as { id: number }[];
    testWorkflowId = workflow.id;

    // Create test email execution log
    const [emailLog] = await db.insert(emailExecutionLogs).values({
      executionId: 1,
      workflowId: testWorkflowId,
      recipientEmail: 'test@example.com',
      recipientName: 'Test Recipient',
      emailSubject: 'Test Email',
      emailTemplate: 'test_template',
      status: 'sent',
    }).$returningId() as { id: number }[];
    testEmailLogId = emailLog.id;
  });

  afterAll(async () => {
    if (!db) return;

    // Cleanup test data
    await db.delete(scheduleStatusLog).where(eq(scheduleStatusLog.scheduleId, 1));
    await db.delete(scheduleExecutionHistory).where(eq(scheduleExecutionHistory.workflowId, testWorkflowId));
    await db.delete(workflowSchedules).where(eq(workflowSchedules.workflowId, testWorkflowId));
    await db.delete(workflowConversions).where(eq(workflowConversions.workflowId, testWorkflowId));
    await db.delete(abTestResults).where(eq(abTestResults.workflowId, testWorkflowId));
    await db.delete(emailEngagement).where(eq(emailEngagement.workflowId, testWorkflowId));
    await db.delete(workflowMetrics).where(eq(workflowMetrics.workflowId, testWorkflowId));
    await db.delete(emailEvents).where(eq(emailEvents.emailLogId, testEmailLogId));
    await db.delete(emailExecutionLogs).where(eq(emailExecutionLogs.id, testEmailLogId));
    await db.delete(emailWorkflows).where(eq(emailWorkflows.id, testWorkflowId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe('Email Delivery Webhooks', () => {
    it('should create email event record', async () => {
      if (!db) throw new Error('Database not available');

      const result = await db.insert(emailEvents).values({
        emailLogId: testEmailLogId,
        resendEmailId: 're_test123',
        eventType: 'email.delivered',
        recipientEmail: 'test@example.com',
        timestamp: new Date().toISOString(),
        metadata: { testData: true },
        rawPayload: { type: 'email.delivered' },
      });

      expect(result.insertId).toBeDefined();

      // Verify the event was created
      const events = await db
        .select()
        .from(emailEvents)
        .where(eq(emailEvents.emailLogId, testEmailLogId));

      expect(events.length).toBeGreaterThan(0);
      expect(events[0].eventType).toBe('email.delivered');
      expect(events[0].resendEmailId).toBe('re_test123');
    });

    it('should update email log status on webhook event', async () => {
      if (!db) throw new Error('Database not available');

      // Simulate webhook updating email log status
      await db
        .update(emailExecutionLogs)
        .set({
          status: 'delivered',
          deliveredAt: new Date().toISOString(),
        })
        .where(eq(emailExecutionLogs.id, testEmailLogId));

      const log = await db
        .select()
        .from(emailExecutionLogs)
        .where(eq(emailExecutionLogs.id, testEmailLogId))
        .limit(1);

      expect(log[0].status).toBe('delivered');
      expect(log[0].deliveredAt).toBeDefined();
    });

    it('should track email opened event', async () => {
      if (!db) throw new Error('Database not available');

      await db.insert(emailEvents).values({
        emailLogId: testEmailLogId,
        resendEmailId: 're_test123',
        eventType: 'email.opened',
        recipientEmail: 'test@example.com',
        timestamp: new Date().toISOString(),
        metadata: { userAgent: 'Mozilla/5.0', ipAddress: '192.168.1.1' },
      });

      await db
        .update(emailExecutionLogs)
        .set({
          status: 'opened',
          openedAt: new Date().toISOString(),
        })
        .where(eq(emailExecutionLogs.id, testEmailLogId));

      const log = await db
        .select()
        .from(emailExecutionLogs)
        .where(eq(emailExecutionLogs.id, testEmailLogId))
        .limit(1);

      expect(log[0].status).toBe('opened');
      expect(log[0].openedAt).toBeDefined();
    });

    it('should track email clicked event', async () => {
      if (!db) throw new Error('Database not available');

      await db.insert(emailEvents).values({
        emailLogId: testEmailLogId,
        resendEmailId: 're_test123',
        eventType: 'email.clicked',
        recipientEmail: 'test@example.com',
        timestamp: new Date().toISOString(),
        metadata: { clickedLink: 'https://example.com/cta' },
      });

      await db
        .update(emailExecutionLogs)
        .set({
          status: 'clicked',
          clickedAt: new Date().toISOString(),
        })
        .where(eq(emailExecutionLogs.id, testEmailLogId));

      const log = await db
        .select()
        .from(emailExecutionLogs)
        .where(eq(emailExecutionLogs.id, testEmailLogId))
        .limit(1);

      expect(log[0].status).toBe('clicked');
      expect(log[0].clickedAt).toBeDefined();
    });
  });

  describe('Workflow Analytics', () => {
    it('should create workflow metrics record', async () => {
      if (!db) throw new Error('Database not available');

      const today = new Date().toISOString().split('T')[0];
      const result = await db.insert(workflowMetrics).values({
        workflowId: testWorkflowId,
        date: today,
        totalExecutions: 100,
        successfulExecutions: 95,
        failedExecutions: 5,
        avgExecutionTimeSeconds: '45.50',
        totalEmailsSent: 100,
        totalEmailsDelivered: 98,
        totalEmailsOpened: 75,
        totalEmailsClicked: 30,
        totalEmailsBounced: 2,
        deliveryRate: '98.00',
        openRate: '76.53',
        clickRate: '30.61',
        bounceRate: '2.00',
        conversionCount: 15,
        conversionRate: '15.00',
      });

      expect(result.insertId).toBeDefined();

      const metrics = await db
        .select()
        .from(workflowMetrics)
        .where(eq(workflowMetrics.workflowId, testWorkflowId));

      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0].totalExecutions).toBe(100);
      expect(metrics[0].openRate).toBe('76.53');
    });

    it('should create email engagement record', async () => {
      if (!db) throw new Error('Database not available');

      const today = new Date().toISOString().split('T')[0];
      const result = await db.insert(emailEngagement).values({
        workflowId: testWorkflowId,
        emailTemplate: 'welcome_email',
        date: today,
        totalSent: 50,
        totalDelivered: 49,
        totalOpened: 40,
        totalClicked: 20,
        totalBounced: 1,
        uniqueOpens: 38,
        uniqueClicks: 18,
        avgTimeToOpen: 3600,
        avgTimeToClick: 7200,
        topClickedLinks: [
          { url: 'https://example.com/cta', clicks: 15 },
          { url: 'https://example.com/learn-more', clicks: 5 },
        ],
        deviceBreakdown: { desktop: 30, mobile: 15, tablet: 4, other: 1 },
      });

      expect(result.insertId).toBeDefined();

      const engagement = await db
        .select()
        .from(emailEngagement)
        .where(eq(emailEngagement.workflowId, testWorkflowId));

      expect(engagement.length).toBeGreaterThan(0);
      expect(engagement[0].emailTemplate).toBe('welcome_email');
      expect(engagement[0].totalOpened).toBe(40);
    });

    it('should create A/B test result record', async () => {
      if (!db) throw new Error('Database not available');

      const result = await db.insert(abTestResults).values({
        workflowId: testWorkflowId,
        testName: 'Subject Line Test',
        variantA: 'template_v1',
        variantB: 'template_v2',
        startDate: new Date().toISOString(),
        status: 'running',
        variantASent: 50,
        variantAOpened: 35,
        variantAClicked: 15,
        variantAConverted: 8,
        variantAOpenRate: '70.00',
        variantAClickRate: '30.00',
        variantAConversionRate: '16.00',
        variantBSent: 50,
        variantBOpened: 40,
        variantBClicked: 20,
        variantBConverted: 12,
        variantBOpenRate: '80.00',
        variantBClickRate: '40.00',
        variantBConversionRate: '24.00',
        confidenceLevel: '95.00',
        pValue: '0.03000000',
        winner: 'variant_b',
      });

      expect(result.insertId).toBeDefined();

      const tests = await db
        .select()
        .from(abTestResults)
        .where(eq(abTestResults.workflowId, testWorkflowId));

      expect(tests.length).toBeGreaterThan(0);
      expect(tests[0].winner).toBe('variant_b');
      expect(tests[0].variantBOpenRate).toBe('80.00');
    });

    it('should create workflow conversion record', async () => {
      if (!db) throw new Error('Database not available');

      const result = await db.insert(workflowConversions).values({
        workflowId: testWorkflowId,
        executionId: 1,
        userId: testUserId,
        conversionType: 'enrollment',
        conversionValue: '99.99',
        metadata: { courseId: 123, source: 'email_campaign' },
      });

      expect(result.insertId).toBeDefined();

      const conversions = await db
        .select()
        .from(workflowConversions)
        .where(eq(workflowConversions.workflowId, testWorkflowId));

      expect(conversions.length).toBeGreaterThan(0);
      expect(conversions[0].conversionType).toBe('enrollment');
      expect(conversions[0].conversionValue).toBe('99.99');
    });
  });

  describe('Workflow Scheduling', () => {
    it('should create cron schedule', async () => {
      if (!db) throw new Error('Database not available');

      const result = await db.insert(workflowSchedules).values({
        workflowId: testWorkflowId,
        userId: testUserId,
        name: 'Weekly Monday Morning Email',
        description: 'Send every Monday at 9 AM',
        scheduleType: 'cron',
        cronExpression: '0 9 * * 1',
        timezone: 'America/New_York',
        isActive: true,
        nextExecutionAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      expect(result.insertId).toBeDefined();

      const schedules = await db
        .select()
        .from(workflowSchedules)
        .where(eq(workflowSchedules.workflowId, testWorkflowId));

      expect(schedules.length).toBeGreaterThan(0);
      expect(schedules[0].scheduleType).toBe('cron');
      expect(schedules[0].cronExpression).toBe('0 9 * * 1');
    });

    it('should create interval schedule', async () => {
      if (!db) throw new Error('Database not available');

      const result = await db.insert(workflowSchedules).values({
        workflowId: testWorkflowId,
        userId: testUserId,
        name: 'Daily Digest',
        description: 'Send every 24 hours',
        scheduleType: 'interval',
        intervalValue: 24,
        intervalUnit: 'hours',
        timezone: 'UTC',
        isActive: true,
        nextExecutionAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      expect(result.insertId).toBeDefined();

      const schedules = await db
        .select()
        .from(workflowSchedules)
        .where(eq(workflowSchedules.workflowId, testWorkflowId));

      const intervalSchedule = schedules.find(s => s.scheduleType === 'interval');
      expect(intervalSchedule).toBeDefined();
      expect(intervalSchedule?.intervalValue).toBe(24);
      expect(intervalSchedule?.intervalUnit).toBe('hours');
    });

    it('should create conditional schedule', async () => {
      if (!db) throw new Error('Database not available');

      const result = await db.insert(workflowSchedules).values({
        workflowId: testWorkflowId,
        userId: testUserId,
        name: 'Inactive User Re-engagement',
        description: 'Send to users inactive for 7 days',
        scheduleType: 'conditional',
        conditions: [
          {
            type: 'user_inactive',
            daysInactive: 7,
            checkFrequency: 'daily',
          },
        ],
        targetFilters: {
          enrollmentStatus: ['active'],
          userTags: ['student'],
        },
        timezone: 'UTC',
        isActive: true,
        nextExecutionAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

      expect(result.insertId).toBeDefined();

      const schedules = await db
        .select()
        .from(workflowSchedules)
        .where(eq(workflowSchedules.workflowId, testWorkflowId));

      const conditionalSchedule = schedules.find(s => s.scheduleType === 'conditional');
      expect(conditionalSchedule).toBeDefined();
      expect(conditionalSchedule?.conditions).toBeDefined();
    });

    it('should record schedule execution history', async () => {
      if (!db) throw new Error('Database not available');

      // Get a schedule ID
      const schedules = await db
        .select()
        .from(workflowSchedules)
        .where(eq(workflowSchedules.workflowId, testWorkflowId))
        .limit(1);

      if (schedules.length === 0) {
        throw new Error('No schedule found for testing');
      }

      const scheduleId = schedules[0].id;

      const result = await db.insert(scheduleExecutionHistory).values({
        scheduleId,
        workflowId: testWorkflowId,
        executionId: 1,
        scheduledFor: new Date().toISOString(),
        actualExecutionTime: new Date().toISOString(),
        status: 'success',
        targetUserCount: 100,
        successfulCount: 98,
        failedCount: 2,
        duration: 45,
        metadata: { note: 'Test execution' },
      });

      expect(result.insertId).toBeDefined();

      const history = await db
        .select()
        .from(scheduleExecutionHistory)
        .where(eq(scheduleExecutionHistory.scheduleId, scheduleId));

      expect(history.length).toBeGreaterThan(0);
      expect(history[0].status).toBe('success');
      expect(history[0].successfulCount).toBe(98);
    });

    it('should log schedule status changes', async () => {
      if (!db) throw new Error('Database not available');

      const schedules = await db
        .select()
        .from(workflowSchedules)
        .where(eq(workflowSchedules.workflowId, testWorkflowId))
        .limit(1);

      if (schedules.length === 0) {
        throw new Error('No schedule found for testing');
      }

      const scheduleId = schedules[0].id;

      const result = await db.insert(scheduleStatusLog).values({
        scheduleId,
        action: 'paused',
        reason: 'Testing pause functionality',
        performedBy: testUserId,
      });

      expect(result.insertId).toBeDefined();

      const logs = await db
        .select()
        .from(scheduleStatusLog)
        .where(eq(scheduleStatusLog.scheduleId, scheduleId));

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].action).toBe('paused');
      expect(logs[0].reason).toBe('Testing pause functionality');
    });
  });
});
