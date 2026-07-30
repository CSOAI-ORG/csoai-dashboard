/**
 * Tests for Bundle Enrollment Router
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDb } from '../db';
import { courseEnrollments, courseBundles, courses, coupons, users } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

describe('Bundle Enrollment Router', () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testUserId: number;
  let testBundleId: number;
  let testCourseId: number;
  let testCouponId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error('Database not available');

    // Create test user
    const userResult = await db.insert(users).values({
      openId: `test-bundle-enrollment-${Date.now()}`,
      name: 'Bundle Test User',
      email: `bundletest${Date.now()}@example.com`,
    });
    testUserId = (userResult as any).insertId || (userResult as any)[0]?.insertId;

    // Create test course
    const courseResult = await db.insert(courses).values({
      regionId: 1,
      title: 'Test Course for Bundle',
      description: 'A test course for bundle enrollment testing',
      framework: 'EU AI Act',
      level: 'fundamentals',
      price: 9900, // $99
      durationHours: 10,
      active: 1,
    });
    testCourseId = (courseResult as any).insertId || (courseResult as any)[0]?.insertId;

    // Create test bundle
    const bundleResult = await db.insert(courseBundles).values({
      regionId: 1,
      name: 'Test Bundle',
      description: 'A test bundle for enrollment testing',
      courseIds: JSON.stringify([testCourseId]),
      regularPrice: 19900, // $199
      bundlePrice: 14900, // $149
      savings: 5000, // $50
      bundlePrice3Month: 4900, // $49/month
      bundlePrice6Month: 3900, // $39/month
      bundlePrice12Month: 2900, // $29/month
      active: 1,
    });
    testBundleId = (bundleResult as any).insertId || (bundleResult as any)[0]?.insertId;

    // Create test coupon
    const couponResult = await db.insert(coupons).values({
      code: `TESTBUNDLE${Date.now()}`,
      discountType: 'percentage',
      discountValue: 100, // 100% off
      active: 1,
      maxUses: 10,
      usedCount: 0,
    });
    testCouponId = (couponResult as any).insertId || (couponResult as any)[0]?.insertId;
  });

  afterAll(async () => {
    if (!db) return;

    // Clean up test data
    await db.delete(courseEnrollments).where(eq(courseEnrollments.userId, testUserId));
    await db.delete(courseBundles).where(eq(courseBundles.id, testBundleId));
    await db.delete(courses).where(eq(courses.id, testCourseId));
    await db.delete(coupons).where(eq(coupons.id, testCouponId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe('Bundle Details', () => {
    it('should retrieve bundle details with pricing', async () => {
      if (!db) throw new Error('Database not available');

      const [bundle] = await db
        .select()
        .from(courseBundles)
        .where(eq(courseBundles.id, testBundleId));

      expect(bundle).toBeDefined();
      expect(bundle.name).toBe('Test Bundle');
      expect(bundle.bundlePrice).toBe(14900);
      expect(bundle.bundlePrice3Month).toBe(4900);
      expect(bundle.bundlePrice6Month).toBe(3900);
      expect(bundle.bundlePrice12Month).toBe(2900);
    });

    it('should have valid course IDs in bundle', async () => {
      if (!db) throw new Error('Database not available');

      const [bundle] = await db
        .select()
        .from(courseBundles)
        .where(eq(courseBundles.id, testBundleId));

      const courseIds = JSON.parse(bundle.courseIds as string);
      expect(courseIds).toContain(testCourseId);
    });
  });

  describe('Enrollment Check', () => {
    it('should return not enrolled for new user', async () => {
      if (!db) throw new Error('Database not available');

      const [enrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, testUserId),
          eq(courseEnrollments.bundleId, testBundleId),
          eq(courseEnrollments.enrollmentType, 'bundle')
        ))
        .limit(1);

      expect(enrollment).toBeUndefined();
    });
  });

  describe('Free Enrollment (with 100% coupon)', () => {
    it('should create bundle enrollment with free coupon', async () => {
      if (!db) throw new Error('Database not available');

      // Get the coupon
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.id, testCouponId));

      expect(parseFloat(coupon.discountValue as any)).toBe(100);
      expect(coupon.discountType).toBe('percentage');

      // Create enrollment directly (simulating what the router does for free enrollment)
      await db.insert(courseEnrollments).values({
        userId: testUserId,
        bundleId: testBundleId,
        enrollmentType: 'bundle',
        paymentStatus: 'free',
        amountPaid: 0,
        couponId: testCouponId,
        paymentType: 'one_time',
        status: 'enrolled',
        progress: 0,
      });

      // Verify enrollment was created
      const [enrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, testUserId),
          eq(courseEnrollments.bundleId, testBundleId),
          eq(courseEnrollments.enrollmentType, 'bundle')
        ))
        .limit(1);

      expect(enrollment).toBeDefined();
      expect(enrollment.paymentStatus).toBe('free');
      expect(enrollment.amountPaid).toBe(0);
      expect(enrollment.couponId).toBe(testCouponId);
    });

    it('should create individual course enrollments for bundle', async () => {
      if (!db) throw new Error('Database not available');

      // Get bundle to get course IDs
      const [bundle] = await db
        .select()
        .from(courseBundles)
        .where(eq(courseBundles.id, testBundleId));

      const courseIds = JSON.parse(bundle.courseIds as string);

      // Create individual course enrollments (simulating what the router does)
      for (const courseId of courseIds) {
        await db.insert(courseEnrollments).values({
          userId: testUserId,
          courseId: parseInt(String(courseId)),
          bundleId: testBundleId,
          enrollmentType: 'course',
          paymentStatus: 'free',
          amountPaid: 0,
          status: 'enrolled',
          progress: 0,
        });
      }

      // Verify course enrollments were created
      const courseEnrollmentsList = await db
        .select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, testUserId),
          eq(courseEnrollments.bundleId, testBundleId),
          eq(courseEnrollments.enrollmentType, 'course')
        ));

      expect(courseEnrollmentsList.length).toBe(courseIds.length);
      expect(courseEnrollmentsList[0].courseId).toBe(testCourseId);
    });
  });

  describe('Coupon Validation', () => {
    it('should validate active coupon', async () => {
      if (!db) throw new Error('Database not available');

      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.id, testCouponId));

      expect(coupon.active).toBe(1);
      expect(coupon.usedCount).toBeLessThan(coupon.maxUses || Infinity);
    });

    it('should calculate correct discount for percentage coupon', async () => {
      if (!db) throw new Error('Database not available');

      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.id, testCouponId));

      const [bundle] = await db
        .select()
        .from(courseBundles)
        .where(eq(courseBundles.id, testBundleId));

      const originalPrice = bundle.bundlePrice;
      const discountAmount = Math.round((originalPrice * coupon.discountValue) / 100);
      const finalPrice = Math.max(0, originalPrice - discountAmount);

      expect(discountAmount).toBe(14900); // 100% of $149
      expect(finalPrice).toBe(0);
    });
  });

  describe('Duration-based Pricing', () => {
    it('should have different prices for different durations', async () => {
      if (!db) throw new Error('Database not available');

      const [bundle] = await db
        .select()
        .from(courseBundles)
        .where(eq(courseBundles.id, testBundleId));

      expect(bundle.bundlePrice).toBeGreaterThan(bundle.bundlePrice3Month || 0);
      expect(bundle.bundlePrice3Month).toBeGreaterThan(bundle.bundlePrice6Month || 0);
      expect(bundle.bundlePrice6Month).toBeGreaterThan(bundle.bundlePrice12Month || 0);
    });
  });

  describe('Enrollment Progress Tracking', () => {
    it('should track progress for bundle courses', async () => {
      if (!db) throw new Error('Database not available');

      // Update progress on one of the course enrollments
      await db
        .update(courseEnrollments)
        .set({ progress: 50, status: 'in_progress' })
        .where(and(
          eq(courseEnrollments.userId, testUserId),
          eq(courseEnrollments.courseId, testCourseId),
          eq(courseEnrollments.bundleId, testBundleId)
        ));

      // Verify progress was updated
      const [enrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, testUserId),
          eq(courseEnrollments.courseId, testCourseId),
          eq(courseEnrollments.bundleId, testBundleId)
        ))
        .limit(1);

      expect(enrollment.progress).toBe(50);
      expect(enrollment.status).toBe('in_progress');
    });
  });
});
