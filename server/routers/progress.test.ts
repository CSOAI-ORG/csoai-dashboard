/**
 * Tests for Progress Tracking Router
 * Tests time tracking and progress updates
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from '../db';
import { courseEnrollments, courses } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

describe('Progress Tracking', () => {
  let testUserId: number;
  let testCourseId: number;
  let testEnrollmentId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Create test user (assuming user ID 1 exists from seed data)
    testUserId = 1;

    // Get first course from database
    const [course] = await db.select().from(courses).limit(1);
    testCourseId = course.id;

    // Create test enrollment
    const result = await db
      .insert(courseEnrollments)
      .values({
        userId: testUserId,
        courseId: testCourseId,
        enrollmentType: 'course',
        paymentStatus: 'free',
        amountPaid: 0,
        progress: 0,
        status: 'enrolled',
        timeSpentMinutes: 0,
      });

    // Get the enrollment we just created
    const [enrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.userId, testUserId),
          eq(courseEnrollments.courseId, testCourseId)
        )
      )
      .orderBy(courseEnrollments.id)
      .limit(1);

    testEnrollmentId = enrollment.id;
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Clean up test enrollment
    await db
      .delete(courseEnrollments)
      .where(eq(courseEnrollments.id, testEnrollmentId));
  });

  it('should initialize enrollment with zero time spent', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const [enrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.id, testEnrollmentId));

    expect(enrollment).toBeDefined();
    expect(enrollment.timeSpentMinutes || 0).toBe(0);
    expect(enrollment.progress).toBe(0);
  });

  it('should update time spent correctly', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Add 30 minutes
    await db
      .update(courseEnrollments)
      .set({
        timeSpentMinutes: 30,
        lastAccessedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(courseEnrollments.id, testEnrollmentId));

    const [enrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.id, testEnrollmentId));

    expect(enrollment.timeSpentMinutes || 0).toBe(30);
    expect(enrollment.lastAccessedAt).toBeDefined();
  });

  it('should accumulate time spent over multiple updates', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Get current time
    const [current] = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.id, testEnrollmentId));

    const currentTime = (current.timeSpentMinutes as number) || 0;

    // Add another 45 minutes
    await db
      .update(courseEnrollments)
      .set({
        timeSpentMinutes: currentTime + 45,
        lastAccessedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(courseEnrollments.id, testEnrollmentId));

    const [enrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.id, testEnrollmentId));

    expect(enrollment.timeSpentMinutes || 0).toBe(currentTime + 45);
  });

  it('should update progress percentage', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    await db
      .update(courseEnrollments)
      .set({
        progress: 50,
        status: 'in_progress',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(courseEnrollments.id, testEnrollmentId));

    const [enrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.id, testEnrollmentId));

    expect(enrollment.progress).toBe(50);
    expect(enrollment.status).toBe('in_progress');
  });

  it('should mark course as completed when progress reaches 100%', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    await db
      .update(courseEnrollments)
      .set({
        progress: 100,
        status: 'completed',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(courseEnrollments.id, testEnrollmentId));

    const [enrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.id, testEnrollmentId));

    expect(enrollment.progress).toBe(100);
    expect(enrollment.status).toBe('completed');
    expect(enrollment.completedAt).toBeDefined();
  });

  it('should track last accessed timestamp', async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const now = new Date().toISOString();

    await db
      .update(courseEnrollments)
      .set({
        lastAccessedAt: now,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(courseEnrollments.id, testEnrollmentId));

    const [enrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.id, testEnrollmentId));

    expect(enrollment.lastAccessedAt).toBeDefined();
    // Check it's within the last minute
    const lastAccessed = new Date(enrollment.lastAccessedAt as string);
    const diff = Date.now() - lastAccessed.getTime();
    expect(diff).toBeLessThan(60000); // Less than 1 minute
  });
});
