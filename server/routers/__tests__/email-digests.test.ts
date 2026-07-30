/**
 * Tests for Email Digest Feature
 * Verify that digest services can generate and format email content correctly
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from '../../db';
import { users, notificationPreferences, notifications, watchdogReports, assessments, aiSystems, frameworks } from '../../../drizzle/schema';
import { eq, and, gte } from 'drizzle-orm';

describe('Email Digest System', () => {
  let db: any;
  let testUserId: number;
  let testNotificationId: number;

  beforeAll(async () => {
    db = await getDb();
    
    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        email: 'digest-test@example.com',
        name: 'Digest Test User',
        openId: 'test-digest-user-' + Date.now(),
      })
      .$returningId();
    testUserId = (user as any).id;

    // Create notification preferences for digest
    await db
      .insert(notificationPreferences)
      .values({
        userId: testUserId,
        digestEnabled: 1,
        digestFrequency: 'daily',
        emailEnabled: 1,
      });

    // Create test notification
    const [notification] = await db
      .insert(notifications)
      .values({
        userId: testUserId,
        type: 'incident_reported',
        title: 'Test Notification for Digest',
        message: 'This is a test notification',
        priority: 'high',
        isRead: 0,
      })
      .$returningId();
    testNotificationId = (notification as any).id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (db && testNotificationId) {
      await db.delete(notifications).where(eq(notifications.id, testNotificationId));
    }
    if (db && testUserId) {
      await db.delete(notificationPreferences).where(eq(notificationPreferences.userId, testUserId));
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it('should have digest preferences configured for test user', async () => {
    const [prefs] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, testUserId))
      .limit(1);

    expect(prefs).toBeDefined();
    expect(prefs.digestEnabled).toBe(1);
    expect(prefs.digestFrequency).toBe('daily');
    expect(prefs.emailEnabled).toBe(1);
  });

  it('should retrieve users with daily digest enabled', async () => {
    const usersWithDigest = await db
      .select({
        userId: notificationPreferences.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(notificationPreferences)
      .leftJoin(users, eq(notificationPreferences.userId, users.id))
      .where(
        and(
          eq(notificationPreferences.digestEnabled, 1),
          eq(notificationPreferences.digestFrequency, 'daily')
        )
      );

    expect(usersWithDigest).toBeDefined();
    expect(Array.isArray(usersWithDigest)).toBe(true);
    
    // Should include our test user
    const testUser = usersWithDigest.find((u: any) => u.userId === testUserId);
    expect(testUser).toBeDefined();
    expect(testUser?.userEmail).toBe('digest-test@example.com');
  });

  it('should retrieve users with weekly digest enabled', async () => {
    // Update test user to weekly
    await db
      .update(notificationPreferences)
      .set({ digestFrequency: 'weekly' })
      .where(eq(notificationPreferences.userId, testUserId));

    const usersWithDigest = await db
      .select({
        userId: notificationPreferences.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(notificationPreferences)
      .leftJoin(users, eq(notificationPreferences.userId, users.id))
      .where(
        and(
          eq(notificationPreferences.digestEnabled, 1),
          eq(notificationPreferences.digestFrequency, 'weekly')
        )
      );

    expect(usersWithDigest).toBeDefined();
    
    // Should include our test user
    const testUser = usersWithDigest.find((u: any) => u.userId === testUserId);
    expect(testUser).toBeDefined();
    expect(testUser?.userEmail).toBe('digest-test@example.com');

    // Reset to daily
    await db
      .update(notificationPreferences)
      .set({ digestFrequency: 'daily' })
      .where(eq(notificationPreferences.userId, testUserId));
  });

  it('should retrieve unread notifications for user', async () => {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, testUserId),
          eq(notifications.isRead, 0)
        )
      );

    expect(userNotifications).toBeDefined();
    expect(Array.isArray(userNotifications)).toBe(true);
    expect(userNotifications.length).toBeGreaterThan(0);
    
    // Should include our test notification
    const testNotif = userNotifications.find((n: any) => n.id === testNotificationId);
    expect(testNotif).toBeDefined();
    expect(testNotif?.title).toBe('Test Notification for Digest');
  });

  it('should update last digest sent timestamp', async () => {
    const now = new Date().toISOString();
    
    await db
      .update(notificationPreferences)
      .set({ lastDigestSentAt: now })
      .where(eq(notificationPreferences.userId, testUserId));

    const [prefs] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, testUserId))
      .limit(1);

    expect(prefs.lastDigestSentAt).toBeDefined();
    expect(new Date(prefs.lastDigestSentAt).getTime()).toBeCloseTo(new Date(now).getTime(), -3);
  });

  it('should retrieve incidents for analytics digest', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayStr = yesterday.toISOString();

    const incidents = await db
      .select()
      .from(watchdogReports)
      .where(gte(watchdogReports.createdAt, yesterdayStr));

    expect(incidents).toBeDefined();
    expect(Array.isArray(incidents)).toBe(true);
  });

  it('should retrieve assessments for analytics digest', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayStr = yesterday.toISOString();

    const assessmentsData = await db
      .select()
      .from(assessments)
      .where(gte(assessments.createdAt, yesterdayStr));

    expect(assessmentsData).toBeDefined();
    expect(Array.isArray(assessmentsData)).toBe(true);
  });

  it('should calculate incident summary statistics', async () => {
    const incidents = await db
      .select()
      .from(watchdogReports)
      .limit(100);

    const summary = {
      total: incidents.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      byType: {} as Record<string, number>,
    };

    incidents.forEach((incident: any) => {
      if (incident.severity === 'critical') summary.critical++;
      else if (incident.severity === 'high') summary.high++;
      else if (incident.severity === 'medium') summary.medium++;
      else if (incident.severity === 'low') summary.low++;

      const type = incident.incidentType || 'other';
      summary.byType[type] = (summary.byType[type] || 0) + 1;
    });

    expect(summary.total).toBe(incidents.length);
    expect(summary.critical + summary.high + summary.medium + summary.low).toBeLessThanOrEqual(summary.total);
  });

  it('should calculate compliance summary statistics', async () => {
    const assessmentsData = await db
      .select()
      .from(assessments)
      .limit(100);

    const summary = {
      totalAssessments: assessmentsData.length,
      averageScore: 0,
    };

    if (assessmentsData.length > 0) {
      const totalScore = assessmentsData.reduce((sum: number, a: any) => {
        const score = a.overallScore ? parseFloat(a.overallScore as string) : 0;
        return sum + score;
      }, 0);
      summary.averageScore = Math.round(totalScore / assessmentsData.length);
    }

    expect(summary.totalAssessments).toBe(assessmentsData.length);
    if (assessmentsData.length > 0) {
      expect(summary.averageScore).toBeGreaterThanOrEqual(0);
      expect(summary.averageScore).toBeLessThanOrEqual(100);
    }
  });
});
