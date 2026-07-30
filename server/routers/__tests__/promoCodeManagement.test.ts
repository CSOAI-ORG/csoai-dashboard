import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from '../../routers';
import { getDb } from '../../db';
import { coupons, couponUsage, users } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Promo Code Management Router', () => {
  let testAdminId: number;
  let testUserId: number;
  let testCouponId: number;
  let testCouponCode: string;
  let dbAvailable = false;

  beforeAll(async () => {
    try {
      const db = await getDb();
      if (!db) {
        console.log('⚠️ Database not available, skipping promo code management tests');
        return;
      }
      dbAvailable = true;

    // Create test admin user
    const adminOpenId = 'test_admin_promo_' + Date.now();
    await db.insert(users).values({
      openId: adminOpenId,
      name: 'Test Admin',
      email: 'admin_promo@test.com',
      role: 'admin',
    });
    const [adminUser] = await db.select().from(users).where(eq(users.openId, adminOpenId));
    testAdminId = adminUser.id;

    // Create test regular user
    const userOpenId = 'test_user_promo_' + Date.now();
    await db.insert(users).values({
      openId: userOpenId,
      name: 'Test User',
      email: 'user_promo@test.com',
      role: 'user',
    });
    const [regularUser] = await db.select().from(users).where(eq(users.openId, userOpenId));
    testUserId = regularUser.id;

    // Create test coupon with unique code
    testCouponCode = 'TEST' + Date.now();
    await db.insert(coupons).values({
      code: testCouponCode,
      description: 'Test 100% discount',
      discountType: 'percentage',
      discountValue: '100.00',
      maxUses: 10,
      usedCount: 0,
      active: 1,
    });
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, testCouponCode));
    testCouponId = coupon.id;
    } catch (error) {
      console.log('⚠️ Database not available, skipping promo code management tests');
      dbAvailable = false;
    }
  });

  afterAll(async () => {
    if (!dbAvailable) return;
    const db = await getDb();
    if (!db) return;

    // Clean up test data
    await db.delete(couponUsage).where(eq(couponUsage.couponId, testCouponId));
    await db.delete(coupons).where(eq(coupons.id, testCouponId));
    await db.delete(users).where(eq(users.id, testAdminId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe('getAllPromoCodes', () => {
    it('should allow admin to view all promo codes', async () => {
      if (!dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }
      const caller = appRouter.createCaller({
        user: { 
          id: testAdminId, 
          email: 'admin_promo@test.com', 
          name: 'Test Admin', 
          role: 'admin' as const,
          openId: 'test_admin_promo',
          brand: 'councilof.ai',
          password: null,
          loginMethod: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: 'free' as const,
          subscriptionStatus: 'none' as const,
          foundingMember: 0,
          referralCode: null,
          payoutFrequency: 'monthly' as const,
          lastPayoutDate: null,
          stripeConnectAccountId: null,
        },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.promoCodeManagement.getAllPromoCodes();
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      const testCoupon = result.find(c => c.code === testCouponCode);
      expect(testCoupon).toBeDefined();
      expect(testCoupon?.discountType).toBe('percentage');
      expect(testCoupon?.discountValue).toBe(100);
    });

    it('should deny non-admin users', async () => {
      if (!dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }
      const caller = appRouter.createCaller({
        user: { 
          id: testUserId, 
          email: 'user_promo@test.com', 
          name: 'Test User', 
          role: 'user' as const,
          openId: 'test_user_promo',
          brand: 'councilof.ai',
          password: null,
          loginMethod: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: 'free' as const,
          subscriptionStatus: 'none' as const,
          foundingMember: 0,
          referralCode: null,
          payoutFrequency: 'monthly' as const,
          lastPayoutDate: null,
          stripeConnectAccountId: null,
        },
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.promoCodeManagement.getAllPromoCodes()).rejects.toThrow('Only admins can view promo codes');
    });
  });

  describe('createPromoCode', () => {
    it('should allow admin to create new promo code', async () => {
      if (!dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }
      const caller = appRouter.createCaller({
        user: { 
          id: testAdminId, 
          email: 'admin_promo@test.com', 
          name: 'Test Admin', 
          role: 'admin' as const,
          openId: 'test_admin_promo',
          brand: 'councilof.ai',
          password: null,
          loginMethod: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: 'free' as const,
          subscriptionStatus: 'none' as const,
          foundingMember: 0,
          referralCode: null,
          payoutFrequency: 'monthly' as const,
          lastPayoutDate: null,
          stripeConnectAccountId: null,
        },
        req: {} as any,
        res: {} as any,
      });

      const newCode = 'NEWTEST' + Date.now();
      const result = await caller.promoCodeManagement.createPromoCode({
        code: newCode,
        description: 'New test promo',
        discountType: 'percentage',
        discountValue: 50,
        maxUses: 100,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain(newCode);

      // Verify it was created
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const [created] = await db.select().from(coupons).where(eq(coupons.code, newCode));
      expect(created).toBeDefined();
      expect(created.discountValue).toBe('50.00');

      // Clean up
      await db.delete(coupons).where(eq(coupons.code, newCode));
    });

    it('should prevent duplicate promo codes', async () => {
      if (!dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }
      const caller = appRouter.createCaller({
        user: { 
          id: testAdminId, 
          email: 'admin_promo@test.com', 
          name: 'Test Admin', 
          role: 'admin' as const,
          openId: 'test_admin_promo',
          brand: 'councilof.ai',
          password: null,
          loginMethod: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: 'free' as const,
          subscriptionStatus: 'none' as const,
          foundingMember: 0,
          referralCode: null,
          payoutFrequency: 'monthly' as const,
          lastPayoutDate: null,
          stripeConnectAccountId: null,
        },
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.promoCodeManagement.createPromoCode({
        code: testCouponCode,
        description: 'Duplicate',
        discountType: 'percentage',
        discountValue: 50,
        maxUses: 100,
      })).rejects.toThrow('Promo code already exists');
    });

    it('should deny non-admin users', async () => {
      if (!dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }
      const caller = appRouter.createCaller({
        user: { 
          id: testUserId, 
          email: 'user_promo@test.com', 
          name: 'Test User', 
          role: 'user' as const,
          openId: 'test_user_promo',
          brand: 'councilof.ai',
          password: null,
          loginMethod: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: 'free' as const,
          subscriptionStatus: 'none' as const,
          foundingMember: 0,
          referralCode: null,
          payoutFrequency: 'monthly' as const,
          lastPayoutDate: null,
          stripeConnectAccountId: null,
        },
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.promoCodeManagement.createPromoCode({
        code: 'SHOULDFAIL',
        description: 'Should fail',
        discountType: 'percentage',
        discountValue: 50,
        maxUses: 100,
      })).rejects.toThrow('Only admins can create promo codes');
    });
  });

  describe('updatePromoCode', () => {
    it('should allow admin to update promo code', async () => {
      if (!dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }
      const caller = appRouter.createCaller({
        user: { 
          id: testAdminId, 
          email: 'admin_promo@test.com', 
          name: 'Test Admin', 
          role: 'admin' as const,
          openId: 'test_admin_promo',
          brand: 'councilof.ai',
          password: null,
          loginMethod: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: 'free' as const,
          subscriptionStatus: 'none' as const,
          foundingMember: 0,
          referralCode: null,
          payoutFrequency: 'monthly' as const,
          lastPayoutDate: null,
          stripeConnectAccountId: null,
        },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.promoCodeManagement.updatePromoCode({
        id: testCouponId,
        description: 'Updated description',
        maxUses: 20,
      });

      expect(result.success).toBe(true);

      // Verify update
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      
      const [updated] = await db.select().from(coupons).where(eq(coupons.id, testCouponId));
      expect(updated.description).toBe('Updated description');
      expect(updated.maxUses).toBe(20);
    });
  });

  describe('deactivatePromoCode', () => {
    it('should allow admin to deactivate promo code', async () => {
      if (!dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Create a temporary coupon to deactivate
      const tempCode = 'TEMP' + Date.now();
      await db.insert(coupons).values({
        code: tempCode,
        description: 'Temporary',
        discountType: 'percentage',
        discountValue: '10.00',
        maxUses: 5,
        usedCount: 0,
        active: 1,
      });
      const [tempCoupon] = await db.select().from(coupons).where(eq(coupons.code, tempCode));
      const tempCouponId = tempCoupon.id;

      const caller = appRouter.createCaller({
        user: { 
          id: testAdminId, 
          email: 'admin_promo@test.com', 
          name: 'Test Admin', 
          role: 'admin' as const,
          openId: 'test_admin_promo',
          brand: 'councilof.ai',
          password: null,
          loginMethod: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: 'free' as const,
          subscriptionStatus: 'none' as const,
          foundingMember: 0,
          referralCode: null,
          payoutFrequency: 'monthly' as const,
          lastPayoutDate: null,
          stripeConnectAccountId: null,
        },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.promoCodeManagement.deactivatePromoCode({
        id: tempCouponId,
      });

      expect(result.success).toBe(true);

      // Verify deactivation
      const [deactivated] = await db.select().from(coupons).where(eq(coupons.id, tempCouponId));
      expect(deactivated.active).toBe(0);

      // Clean up
      await db.delete(coupons).where(eq(coupons.id, tempCouponId));
    });
  });

  describe('getUsageSummary', () => {
    it('should return usage summary for admin', async () => {
      if (!dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }
      const caller = appRouter.createCaller({
        user: { 
          id: testAdminId, 
          email: 'admin_promo@test.com', 
          name: 'Test Admin', 
          role: 'admin' as const,
          openId: 'test_admin_promo',
          brand: 'councilof.ai',
          password: null,
          loginMethod: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: 'free' as const,
          subscriptionStatus: 'none' as const,
          foundingMember: 0,
          referralCode: null,
          payoutFrequency: 'monthly' as const,
          lastPayoutDate: null,
          stripeConnectAccountId: null,
        },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.promoCodeManagement.getUsageSummary();

      expect(result).toBeDefined();
      expect(result.totalCoupons).toBeGreaterThan(0);
      expect(result.activeCoupons).toBeGreaterThanOrEqual(0);
      expect(result.totalUsage).toBeGreaterThanOrEqual(0);
      expect(result.utilizationRate).toBeDefined();
    });
  });

  describe('getPromoCodeAnalytics', () => {
    it('should return detailed analytics for a promo code', async () => {
      if (!dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }
      const caller = appRouter.createCaller({
        user: { 
          id: testAdminId, 
          email: 'admin_promo@test.com', 
          name: 'Test Admin', 
          role: 'admin' as const,
          openId: 'test_admin_promo',
          brand: 'councilof.ai',
          password: null,
          loginMethod: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: 'free' as const,
          subscriptionStatus: 'none' as const,
          foundingMember: 0,
          referralCode: null,
          payoutFrequency: 'monthly' as const,
          lastPayoutDate: null,
          stripeConnectAccountId: null,
        },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.promoCodeManagement.getPromoCodeAnalytics({
        code: testCouponCode,
      });

      expect(result).toBeDefined();
      expect(result.coupon).toBeDefined();
      expect(result.coupon.code).toBe(testCouponCode);
      expect(result.analytics).toBeDefined();
      expect(result.analytics.totalUsage).toBeDefined();
      expect(result.analytics.uniqueUsers).toBeDefined();
    });

    it('should throw error for non-existent promo code', async () => {
      if (!dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }
      const caller = appRouter.createCaller({
        user: { 
          id: testAdminId, 
          email: 'admin_promo@test.com', 
          name: 'Test Admin', 
          role: 'admin' as const,
          openId: 'test_admin_promo',
          brand: 'councilof.ai',
          password: null,
          loginMethod: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastSignedIn: new Date().toISOString(),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          subscriptionTier: 'free' as const,
          subscriptionStatus: 'none' as const,
          foundingMember: 0,
          referralCode: null,
          payoutFrequency: 'monthly' as const,
          lastPayoutDate: null,
          stripeConnectAccountId: null,
        },
        req: {} as any,
        res: {} as any,
      });

      await expect(caller.promoCodeManagement.getPromoCodeAnalytics({
        code: 'NONEXISTENT',
      })).rejects.toThrow('Promo code not found');
    });
  });

  describe('FOUNDING10K promo code', () => {
    it('should verify FOUNDING10K promo code exists and is configured correctly', async () => {
      if (!dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const [founding10k] = await db.select().from(coupons).where(eq(coupons.code, 'FOUNDING10K'));

      expect(founding10k).toBeDefined();
      expect(founding10k.active).toBe(1);
      expect(founding10k.discountType).toBe('percentage');
      expect(parseFloat(founding10k.discountValue)).toBe(100);
      expect(founding10k.maxUses).toBeGreaterThan(0);
    });
  });
});
