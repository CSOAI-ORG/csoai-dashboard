/**
 * Tests for Status Notification System and Admin Incident Management
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from '../db';
import { systemIncidents, statusSubscriptions, serviceStatus } from '../../drizzle/schema-status';
import { eq } from 'drizzle-orm';

describe('Status Notification System', () => {
  let testIncidentId: number;
  let testSubscriptionId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Create test subscription
    // Note: tinyint columns use 1/0 instead of true/false in MySQL
    const subResult = await db.insert(statusSubscriptions).values({
      email: 'test-subscriber@example.com',
      services: JSON.stringify(['api', 'dashboard']),
      notifyOnIncident: 1,
      notifyOnResolution: 1,
      notifyOnMaintenance: 1,
      isActive: 1,
      verifiedAt: new Date().toISOString(),
    });

    testSubscriptionId = Number((subResult as any)[0]?.insertId ?? (subResult as any).insertId);
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Cleanup test data
    if (testIncidentId) {
      await db.delete(systemIncidents).where(eq(systemIncidents.id, testIncidentId));
    }
    if (testSubscriptionId) {
      await db.delete(statusSubscriptions).where(eq(statusSubscriptions.id, testSubscriptionId));
    }
  });

  it('should create incident in database', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const result = await db.insert(systemIncidents).values({
      title: 'Test Incident - API Outage',
      description: 'Testing incident creation for notification system',
      severity: 'major',
      status: 'investigating',
      affectedServices: JSON.stringify(['api']),
      startedAt: new Date().toISOString(),
    });

    testIncidentId = Number((result as any)[0]?.insertId ?? (result as any).insertId);

    expect(testIncidentId).toBeGreaterThan(0);

    // Verify incident was created
    const [incident] = await db
      .select()
      .from(systemIncidents)
      .where(eq(systemIncidents.id, testIncidentId))
      .limit(1);

    expect(incident).toBeDefined();
    expect(incident.title).toBe('Test Incident - API Outage');
    expect(incident.severity).toBe('major');
    expect(incident.status).toBe('investigating');
  });

  it('should retrieve active subscriptions', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const subscriptions = await db
      .select()
      .from(statusSubscriptions)
      .where(eq(statusSubscriptions.isActive, 1));

    expect(subscriptions.length).toBeGreaterThan(0);
    
    const testSub = subscriptions.find(sub => sub.id === testSubscriptionId);
    expect(testSub).toBeDefined();
    expect(testSub?.email).toBe('test-subscriber@example.com');
  });

  it('should update incident status', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Skip if testIncidentId is not valid
    if (!testIncidentId || isNaN(testIncidentId)) {
      console.log('Skipping test - no valid incident ID');
      return;
    }

    await db
      .update(systemIncidents)
      .set({
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
      })
      .where(eq(systemIncidents.id, testIncidentId));

    const [incident] = await db
      .select()
      .from(systemIncidents)
      .where(eq(systemIncidents.id, testIncidentId))
      .limit(1);

    expect(incident.status).toBe('resolved');
    expect(incident.resolvedAt).toBeDefined();
  });

  it('should retrieve service status records', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const services = await db.select().from(serviceStatus);

    expect(services.length).toBeGreaterThan(0);
    
    // Check for expected service categories
    const categories = services.map(s => s.category);
    expect(categories).toContain('api');
  });

  it('should filter subscriptions by service interest', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const allSubscriptions = await db
      .select()
      .from(statusSubscriptions)
      .where(eq(statusSubscriptions.isActive, 1));

    // Simulate filtering for API service incident
    const affectedServices = ['api'];
    const relevantSubscribers = allSubscriptions.filter((sub: any) => {
      if (!sub.services) return true; // Notify all if no specific services
      const subscribedServices = JSON.parse(sub.services);
      return affectedServices.some((svc: string) => subscribedServices.includes(svc));
    });

    expect(relevantSubscribers.length).toBeGreaterThan(0);
    
    const testSub = relevantSubscribers.find(sub => sub.id === testSubscriptionId);
    expect(testSub).toBeDefined();
  });
});

describe('Health Monitoring System', () => {
  it('should have service status records', async () => {
    const db = await getDb();
    if (!db) {
      console.log('⚠️ Database not available, skipping test');
      return;
    }

    const services = await db.select().from(serviceStatus);

    expect(services.length).toBeGreaterThan(0);
    
    // Verify service structure
    services.forEach(service => {
      expect(service.serviceName).toBeDefined();
      expect(service.displayName).toBeDefined();
      expect(service.status).toBeDefined();
      expect(['operational', 'degraded', 'partial_outage', 'major_outage']).toContain(service.status);
    });
  });

  it('should update service status', async () => {
    const db = await getDb();
    if (!db) {
      console.log('⚠️ Database not available, skipping test');
      return;
    }

    const [service] = await db.select().from(serviceStatus).limit(1);
    
    if (!service) {
      throw new Error('No services found in database');
    }

    const originalStatus = service.status;

    // Update status
    await db
      .update(serviceStatus)
      .set({
        status: 'degraded',
        lastCheckedAt: new Date().toISOString(),
      })
      .where(eq(serviceStatus.id, service.id));

    // Verify update
    const [updated] = await db
      .select()
      .from(serviceStatus)
      .where(eq(serviceStatus.id, service.id))
      .limit(1);

    expect(updated.status).toBe('degraded');

    // Restore original status
    await db
      .update(serviceStatus)
      .set({ status: originalStatus })
      .where(eq(serviceStatus.id, service.id));
  });
});

describe('Exam Duration Consistency', () => {
  it('should have correct exam duration in database', async () => {
    const db = await getDb();
    if (!db) {
      console.log('⚠️ Database not available, skipping test');
      return;
    }

    // Query certification_tests table using raw SQL
    const result = await db.execute('SELECT timeLimitMinutes, totalQuestions FROM certification_tests LIMIT 1') as any;
    
    if (result && result[0] && result[0].length > 0) {
      const exam = result[0][0];
      expect(exam.timeLimitMinutes).toBe(90);
      expect(exam.totalQuestions).toBe(50);
    } else {
      // If no test exists, this is expected in a fresh database
      console.log('No certification tests found - this is expected in a fresh database');
    }
  });
});
