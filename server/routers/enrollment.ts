import { Router } from 'express';
import Stripe from 'stripe';
import rateLimit from 'express-rate-limit';
import { getDb } from '../db';
import { courseEnrollments, courses, courseBundles, coupons, couponUsage, users } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { createCourseCheckoutSession } from '../stripe/stripeService';
import { sendEnrollmentConfirmationEmail } from '../services/courseEmailService';
import { sdk } from '../_core/sdk';

const router = Router();
// Lazy initialization of Stripe to avoid errors when API key is not available (e.g., in tests)
let _stripe: Stripe | null = null;
const getStripe = () => {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });
  }
  return _stripe;
};

// Rate limiter for enrollment endpoint - prevent abuse
// Allows 10 enrollment attempts per IP per 15 minutes
const enrollmentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many enrollment attempts. Please try again in 15 minutes.',
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Use default IP-based key generator for security
  handler: (req, res) => {
    console.warn(`[Rate Limit] Enrollment rate limit exceeded for ${req.ip}`);
    res.status(429).json({
      error: 'Too many enrollment attempts. Please try again in 15 minutes.',
      retryAfter: 15 * 60,
    });
  },
});

// Create payment intent or enroll for free
router.post('/enrollment/create', enrollmentRateLimiter, async (req, res) => {
  try {
    const { type, itemId, couponId } = req.body;
    
    // Authenticate user from session - this ensures the user is actually logged in
    let authenticatedUser;
    try {
      authenticatedUser = await sdk.authenticateRequest(req);
    } catch (authError) {
      console.error('[Enrollment] Authentication failed:', authError);
      return res.status(401).json({ error: 'Please sign in to enroll in courses' });
    }
    
    const userId = authenticatedUser.id;
    
    if (!type || !itemId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    // Get item details
    let item: any;
    let stripePriceId: string | null;
    
    if (type === 'course') {
      [item] = await db.select().from(courses).where(eq(courses.id, itemId));
      stripePriceId = item?.stripePriceId;
    } else {
      [item] = await db.select().from(courseBundles).where(eq(courseBundles.id, itemId));
      stripePriceId = item?.stripePriceId;
    }
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    let finalAmount = type === 'course' ? item.price : item.bundlePrice;
    let appliedCoupon: any = null;
    
    // Apply coupon if provided
    if (couponId) {
      [appliedCoupon] = await db.select().from(coupons).where(eq(coupons.id, couponId));
      
      if (appliedCoupon && appliedCoupon.active === 1) {
        if (appliedCoupon.discountType === 'percentage') {
          const discount = (finalAmount * appliedCoupon.discountValue) / 100;
          finalAmount = Math.max(0, finalAmount - discount);
        } else {
          finalAmount = Math.max(0, finalAmount - (appliedCoupon.discountValue * 100));
        }
      }
    }
    
    // If final amount is 0, enroll directly without payment
    if (finalAmount === 0) {
      const [enrollment] = await db.insert(courseEnrollments).values({
        userId,
        courseId: type === 'course' ? itemId : null,
        bundleId: type === 'bundle' ? itemId : null,
        enrollmentType: type,
        paymentStatus: 'free',
        amountPaid: 0,
        couponId: couponId || null,
      });
      
      // If it's a bundle, create individual enrollments for each course
      if (type === 'bundle' && item.courseIds) {
        const courseIds = Array.isArray(item.courseIds) ? item.courseIds : JSON.parse(item.courseIds);
        
        for (const courseId of courseIds) {
          await db.insert(courseEnrollments).values({
            userId,
            courseId: parseInt(courseId),
            bundleId: itemId,
            enrollmentType: 'course',
            paymentStatus: 'free',
            amountPaid: 0,
            couponId: couponId || null,
          });
        }
      }
      
      // Record coupon usage
      if (couponId && appliedCoupon) {
        await db.insert(couponUsage).values({
          couponId,
          userId,
          orderId: enrollment.insertId,
        });
        
        await db
          .update(coupons)
          .set({ usedCount: appliedCoupon.usedCount + 1 })
          .where(eq(coupons.id, couponId));
      }
      
      // Send enrollment confirmation email
      try {
        // Get actual user email from database
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        const userEmail = user?.email || `user${userId}@example.com`;
        const userName = user?.name || `User ${userId}`;
        
        await sendEnrollmentConfirmationEmail({
          userEmail,
          userName,
          courseName: item.title || item.name,
          courseDescription: item.description,
          enrollmentDate: new Date().toISOString(),
          isFree: true,
          amountPaid: 0,
          couponCode: appliedCoupon?.code,
        });
        
        console.log(`[Enrollment] Sent confirmation email to ${userEmail}`);
      } catch (emailError) {
        console.error('[Enrollment] Failed to send confirmation email:', emailError);
        // Don't fail the enrollment if email fails
      }
      
      return res.json({
        success: true,
        enrollmentId: enrollment.insertId,
        paymentRequired: false,
      });
    }
    
    // Create Stripe checkout session
    if (!stripePriceId) {
      return res.status(400).json({ error: 'Stripe price not configured for this item' });
    }
    
    // Get user email from database
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const userEmail = user?.email || `user${userId}@example.com`;
    
    const frontendUrl = process.env.VITE_FRONTEND_URL || 'http://localhost:3000';
    const { url, sessionId } = await createCourseCheckoutSession({
      userId,
      email: userEmail,
      courseId: type === 'course' ? itemId : undefined,
      bundleId: type === 'bundle' ? itemId : undefined,
      stripePriceId,
      amount: finalAmount,
      successUrl: `${frontendUrl}/my-courses?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendUrl}/checkout?type=${type}&id=${itemId}`,
      paymentType: 'one_time',
    });
    
    // Create pending enrollment
    const [enrollment] = await db.insert(courseEnrollments).values({
      userId,
      courseId: type === 'course' ? itemId : null,
      bundleId: type === 'bundle' ? itemId : null,
      enrollmentType: type,
      paymentStatus: 'pending',
      stripePaymentIntentId: sessionId,
      stripePriceId,
      amountPaid: 0,
      couponId: couponId || null,
    });
    
    res.json({
      success: true,
      enrollmentId: enrollment.insertId,
      paymentRequired: true,
      checkoutUrl: url,
      sessionId,
      amount: finalAmount,
    });
    
  } catch (error) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({ error: 'Failed to create enrollment' });
  }
});

// Get user's enrollments
router.get('/enrollment/my-courses/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const enrollments = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, parseInt(userId)));
    
    // Fetch course/bundle details for each enrollment
    const enrichedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        if (enrollment.enrollmentType === 'course' && enrollment.courseId) {
          const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, enrollment.courseId));
          
          return {
            ...enrollment,
            item: course,
          };
        } else if (enrollment.enrollmentType === 'bundle' && enrollment.bundleId) {
          const [bundle] = await db
            .select()
            .from(courseBundles)
            .where(eq(courseBundles.id, enrollment.bundleId));
          
          return {
            ...enrollment,
            item: bundle,
          };
        }
        
        return enrollment;
      })
    );
    
    res.json(enrichedEnrollments);
    
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

export default router;
