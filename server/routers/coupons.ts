import { Router } from 'express';
import { getDb } from '../db';
import { coupons, couponUsage } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Validate coupon code
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }
    
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    // Find coupon by code
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(and(
        eq(coupons.code, code.toUpperCase()),
        eq(coupons.active, 1)
      ));
    
    if (!coupon) {
      return res.status(404).json({ 
        valid: false, 
        error: 'Invalid coupon code' 
      });
    }
    
    // Check if coupon has expired
    if (coupon.expiresAt) {
      const expiryDate = new Date(coupon.expiresAt);
      if (expiryDate < new Date()) {
        return res.status(400).json({ 
          valid: false, 
          error: 'Coupon has expired' 
        });
      }
    }
    
    // Check if coupon has reached max uses
    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Coupon usage limit reached' 
      });
    }
    
    // Return valid coupon details
    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: parseFloat(coupon.discountValue),
        remainingUses: coupon.maxUses - coupon.usedCount,
      }
    });
    
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// Apply coupon (called during checkout)
router.post('/coupons/apply', async (req, res) => {
  try {
    const { couponId, userId, orderId } = req.body;
    
    if (!couponId || !userId) {
      return res.status(400).json({ error: 'Coupon ID and User ID are required' });
    }
    
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    // Get coupon
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, couponId));
    
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    
    // Check if user already used this coupon
    const [existingUsage] = await db
      .select()
      .from(couponUsage)
      .where(and(
        eq(couponUsage.couponId, couponId),
        eq(couponUsage.userId, userId)
      ));
    
    if (existingUsage) {
      return res.status(400).json({ error: 'You have already used this coupon' });
    }
    
    // Check if coupon still has uses left
    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }
    
    // Record coupon usage
    await db.insert(couponUsage).values({
      couponId,
      userId,
      orderId: orderId || null,
    });
    
    // Increment used count
    await db
      .update(coupons)
      .set({ usedCount: coupon.usedCount + 1 })
      .where(eq(coupons.id, couponId));
    
    res.json({
      success: true,
      message: 'Coupon applied successfully',
      remainingUses: coupon.maxUses - coupon.usedCount - 1,
    });
    
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ error: 'Failed to apply coupon' });
  }
});

// Get coupon usage stats (admin)
router.get('/coupons/:code/stats', async (req, res) => {
  try {
    const { code } = req.params;
    
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code.toUpperCase()));
    
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    
    res.json({
      code: coupon.code,
      description: coupon.description,
      maxUses: coupon.maxUses,
      usedCount: coupon.usedCount,
      remainingUses: coupon.maxUses - coupon.usedCount,
      percentageUsed: ((coupon.usedCount / coupon.maxUses) * 100).toFixed(2),
      active: coupon.active === 1,
    });
    
  } catch (error) {
    console.error('Error fetching coupon stats:', error);
    res.status(500).json({ error: 'Failed to fetch coupon stats' });
  }
});

export default router;
