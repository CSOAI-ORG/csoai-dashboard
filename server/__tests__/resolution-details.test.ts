/**
 * Resolution Details Tests
 * Tests for the Watchdog incident resolution functionality
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { getDb } from '../db';
import { watchdogReports, users } from '../../drizzle/schema';
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

describe('Resolution Details', () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testUserId: number;
  let testIncidentId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) console.warn('⚠️ Database not available, skipping test'); return;

    // Create a test user
    const userResult = await db
      .insert(users)
      .values({
        openId: `test-resolution-${Date.now()}`,
        email: `test-resolution-${Date.now()}@example.com`,
        name: 'Test Resolution User',
        role: 'admin',
      });
    testUserId = Number((userResult as any).insertId || userResult[0]?.insertId);

    // Create a test incident
    const incidentResult = await db
      .insert(watchdogReports)
      .values({
        userId: testUserId,
        title: 'Test Incident for Resolution',
        description: 'This is a test incident to verify resolution details',
        incidentType: 'safety',
        severity: 'medium',
        status: 'submitted',
        aiSystemName: 'Test AI System',
        companyName: 'Test Company',
      });
    testIncidentId = Number((incidentResult as any).insertId || incidentResult[0]?.insertId);
  });

  afterAll(async () => {
    if (db) {
      // Clean up test data
      await db.delete(watchdogReports).where(eq(watchdogReports.id, testIncidentId));
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it('should have resolution fields in watchdog_reports schema', async () => {
    if (!db) console.warn('⚠️ Database not available, skipping test'); return;

    const [incident] = await db
      .select()
      .from(watchdogReports)
      .where(eq(watchdogReports.id, testIncidentId))
      .limit(1);

    expect(incident).toBeDefined();
    // Verify the resolution fields exist (they should be null initially)
    // Check that resolution fields exist in schema (using camelCase from Drizzle)
    // Fields are defined with explicit column names in schema
    expect('resolutionNotes' in incident || 'resolution_notes' in incident).toBe(true);
    expect('resolutionDate' in incident || 'resolution_date' in incident).toBe(true);
    expect('resolvedById' in incident || 'resolved_by_id' in incident).toBe(true);
    expect('resolvedByName' in incident || 'resolved_by_name' in incident).toBe(true);
  });

  it('should update incident with resolution details', async () => {
    if (!db) console.warn('⚠️ Database not available, skipping test'); return;

    const resolutionNotes = 'Issue was resolved by implementing additional safety checks';
    const resolutionDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const resolverName = 'Test Admin';

    await db
      .update(watchdogReports)
      .set({
        status: 'resolved',
        resolutionNotes: resolutionNotes,
        resolutionDate: resolutionDate,
        resolvedById: testUserId,
        resolvedByName: resolverName,
      })
      .where(eq(watchdogReports.id, testIncidentId));

    const [updated] = await db
      .select()
      .from(watchdogReports)
      .where(eq(watchdogReports.id, testIncidentId))
      .limit(1);

    expect(updated.status).toBe('resolved');
    expect(updated.resolutionNotes).toBe(resolutionNotes);
    expect(updated.resolutionDate).toBeDefined();
    expect(updated.resolvedById).toBe(testUserId);
    expect(updated.resolvedByName).toBe(resolverName);
  });

  it('should support dismissed status with resolution notes', async () => {
    if (!db) console.warn('⚠️ Database not available, skipping test'); return;

    // Create another incident for dismissal test
    const dismissedResult = await db
      .insert(watchdogReports)
      .values({
        userId: testUserId,
        title: 'Test Incident for Dismissal',
        description: 'This incident will be dismissed',
        incidentType: 'other',
        severity: 'low',
        status: 'submitted',
        aiSystemName: 'Test AI',
        companyName: 'Test Co',
      });
    const dismissedIncidentId = Number((dismissedResult as any).insertId || dismissedResult[0]?.insertId);

    const dismissalReason = 'Duplicate report - already addressed in incident #123';

    await db
      .update(watchdogReports)
      .set({
        status: 'dismissed',
        resolutionNotes: dismissalReason,
        resolutionDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
        resolvedById: testUserId,
        resolvedByName: 'Test Admin',
      })
      .where(eq(watchdogReports.id, dismissedIncidentId));

    const [updated] = await db
      .select()
      .from(watchdogReports)
      .where(eq(watchdogReports.id, dismissedIncidentId))
      .limit(1);

    expect(updated.status).toBe('dismissed');
    expect(updated.resolutionNotes).toBe(dismissalReason);

    // Clean up
    await db.delete(watchdogReports).where(eq(watchdogReports.id, dismissedIncidentId));
  });
});
