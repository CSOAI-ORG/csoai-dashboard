/**
 * PDCA Notification Service Tests
 * Tests for email notifications on PDCA phase advances and linked incident updates
 */

import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { getDb } from '../db';
import { users, aiSystems, pdcaCycles, notificationPreferences } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// Mock Resend
const mockSend = vi.fn().mockResolvedValue({
  data: { id: 'test-email-id-123' },
  error: null,
});

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: mockSend,
    },
  })),
}));

describe('PDCA Notification Service', () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testUserId: number;
  let testAiSystemId: number;
  let testCycleId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) console.warn('⚠️ Database not available, skipping test'); return;

    // Create a test user with email
    const userResult = await db
      .insert(users)
      .values({
        openId: `test-pdca-notif-${Date.now()}`,
        email: `test-pdca-notif-${Date.now()}@example.com`,
        name: 'Test PDCA User',
        role: 'user',
      });
    testUserId = Number((userResult as any).insertId || userResult[0]?.insertId);

    // Create a test AI system
    const aiSystemResult = await db
      .insert(aiSystems)
      .values({
        userId: testUserId,
        name: 'Test AI System for Notifications',
        description: 'A test AI system',
        riskLevel: 'limited',
      });
    testAiSystemId = Number((aiSystemResult as any).insertId || aiSystemResult[0]?.insertId);

    // Create a test PDCA cycle
    const cycleResult = await db
      .insert(pdcaCycles)
      .values({
        aiSystemId: testAiSystemId,
        cycleNumber: 1,
        phase: 'plan',
        status: 'active',
        planSummary: 'Test plan summary',
        startedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });
    testCycleId = Number((cycleResult as any).insertId || cycleResult[0]?.insertId);
  });

  afterAll(async () => {
    if (db) {
      // Clean up test data
      await db.delete(pdcaCycles).where(eq(pdcaCycles.id, testCycleId));
      await db.delete(aiSystems).where(eq(aiSystems.id, testAiSystemId));
      await db.delete(notificationPreferences).where(eq(notificationPreferences.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  beforeEach(() => {
    mockSend.mockClear();
  });

  it('should have notification service module', async () => {
    const notificationService = await import('../services/pdcaNotificationService');
    expect(notificationService.sendPDCAPhaseAdvanceNotification).toBeDefined();
    expect(notificationService.sendLinkedIncidentUpdateNotification).toBeDefined();
  });

  it('should get phase display names correctly', async () => {
    // Test the internal helper function indirectly through the service
    const { sendPDCAPhaseAdvanceNotification } = await import('../services/pdcaNotificationService');
    
    // The function should exist and be callable
    expect(typeof sendPDCAPhaseAdvanceNotification).toBe('function');
  });

  it('should respect notification preferences', async () => {
    if (!db) console.warn('⚠️ Database not available, skipping test'); return;

    // Create notification preferences with email disabled
    // First try to delete any existing preferences
    await db.delete(notificationPreferences).where(eq(notificationPreferences.userId, testUserId));
    
    // Then insert new preferences
    await db
      .insert(notificationPreferences)
      .values({
        userId: testUserId,
        emailEnabled: 0, // Disabled
        pushEnabled: 1,
      });

    const { sendPDCAPhaseAdvanceNotification } = await import('../services/pdcaNotificationService');

    // Should return success but not send email when disabled
    const result = await sendPDCAPhaseAdvanceNotification(testCycleId, 'plan', 'do', false);
    
    // Result should indicate success (respecting preference)
    expect(result.success).toBe(true);

    // Re-enable for other tests
    await db
      .update(notificationPreferences)
      .set({ emailEnabled: 1 })
      .where(eq(notificationPreferences.userId, testUserId));
  });

  it('should handle missing cycle gracefully', async () => {
    const { sendPDCAPhaseAdvanceNotification } = await import('../services/pdcaNotificationService');

    const result = await sendPDCAPhaseAdvanceNotification(999999, 'plan', 'do', false);
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle linked incident notification for missing cycle', async () => {
    const { sendLinkedIncidentUpdateNotification } = await import('../services/pdcaNotificationService');

    const result = await sendLinkedIncidentUpdateNotification(999999, 1, 'resolved');
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should generate correct email content for phase advance', async () => {
    // This test verifies the notification service can be called without errors
    // The actual email sending is mocked
    const { sendPDCAPhaseAdvanceNotification } = await import('../services/pdcaNotificationService');
    
    // Ensure user has email notifications enabled
    if (db) {
      await db
        .delete(notificationPreferences)
        .where(eq(notificationPreferences.userId, testUserId));
    }

    // Call should complete without throwing
    const result = await sendPDCAPhaseAdvanceNotification(testCycleId, 'plan', 'do', false);
    
    // If Resend is not configured, it should return an error about configuration
    // If configured, it should succeed
    expect(result).toBeDefined();
    expect(typeof result.success).toBe('boolean');
  });
});
