/**
 * Bundle Enrollment Router
 * Dedicated endpoint for enrolling users in course bundles with payment integration
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { courseEnrollments, courseBundles, courses, coupons, couponUsage, users } from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { createCourseCheckoutSession } from "../stripe/stripeService";
import { sendEnrollmentConfirmationEmail } from "../services/courseEmailService";
import { TRPCError } from "@trpc/server";
import { enrollmentLimiter, couponValidationLimiter } from "../utils/rateLimiter";
import { logCouponValidation, checkForAbusePatterns } from "../services/couponValidationLogger";

// Duration type for bundle pricing
const durationSchema = z.enum(["one_time", "3_month", "6_month", "12_month"]);
type Duration = z.infer<typeof durationSchema>;

export const bundleEnrollmentRouter = router({
  /**
   * Get bundle details with pricing options
   */
  getBundleDetails: publicProcedure
    .input(z.object({
      bundleId: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [bundle] = await db
        .select()
        .from(courseBundles)
        .where(eq(courseBundles.id, input.bundleId));

      if (!bundle) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bundle not found" });
      }

      // Parse courseIds
      const courseIds = Array.isArray(bundle.courseIds) 
        ? bundle.courseIds 
        : JSON.parse(bundle.courseIds as string);

      // Get course details
      const bundleCourses = courseIds.length > 0 
        ? await db.select().from(courses).where(inArray(courses.id, courseIds.map((id: string | number) => parseInt(String(id)))))
        : [];

      return {
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        regionId: bundle.regionId,
        courseCount: courseIds.length,
        courses: bundleCourses.map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          durationHours: c.durationHours,
          framework: c.framework,
        })),
        pricing: {
          regular: bundle.regularPrice,
          oneTime: bundle.bundlePrice,
          threeMonth: bundle.bundlePrice3Month,
          sixMonth: bundle.bundlePrice6Month,
          twelveMonth: bundle.bundlePrice12Month,
          savings: bundle.savings,
        },
        stripePriceIds: {
          oneTime: bundle.stripePriceId,
          threeMonth: bundle.stripePriceId3Month,
          sixMonth: bundle.stripePriceId6Month,
          twelveMonth: bundle.stripePriceId12Month,
        },
        active: bundle.active === 1,
      };
    }),

  /**
   * Check if user is already enrolled in a bundle
   */
  checkEnrollment: protectedProcedure
    .input(z.object({
      bundleId: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [enrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, ctx.user.id),
          eq(courseEnrollments.bundleId, input.bundleId),
          eq(courseEnrollments.enrollmentType, "bundle")
        ))
        .limit(1);

      return {
        isEnrolled: !!enrollment && enrollment.paymentStatus === "completed",
        enrollment: enrollment || null,
      };
    }),

  /**
   * Enroll user in a bundle
   * Handles both free and paid enrollments with Stripe integration
   */
  enrollInBundle: protectedProcedure
    .input(z.object({
      bundleId: z.number(),
      duration: durationSchema.default("one_time"),
      couponCode: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Rate limit enrollment attempts
      const rateLimitKey = `enrollment:${ctx.user.id}`;
      const rateLimitResult = enrollmentLimiter.check(rateLimitKey);
      if (!rateLimitResult.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many enrollment attempts. Please try again in ${Math.ceil(rateLimitResult.resetIn / 1000)} seconds.`,
        });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const userId = ctx.user.id;

      // Check if already enrolled
      const [existingEnrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.bundleId, input.bundleId),
          eq(courseEnrollments.enrollmentType, "bundle"),
          eq(courseEnrollments.paymentStatus, "completed")
        ))
        .limit(1);

      if (existingEnrollment) {
        throw new TRPCError({ 
          code: "CONFLICT", 
          message: "You are already enrolled in this bundle" 
        });
      }

      // Get bundle details
      const [bundle] = await db
        .select()
        .from(courseBundles)
        .where(eq(courseBundles.id, input.bundleId));

      if (!bundle) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Bundle not found" });
      }

      if (bundle.active !== 1) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This bundle is no longer available" });
      }

      // Determine price and Stripe price ID based on duration
      let price: number;
      let stripePriceId: string | null;
      
      switch (input.duration) {
        case "3_month":
          price = bundle.bundlePrice3Month || bundle.bundlePrice;
          stripePriceId = bundle.stripePriceId3Month || bundle.stripePriceId;
          break;
        case "6_month":
          price = bundle.bundlePrice6Month || bundle.bundlePrice;
          stripePriceId = bundle.stripePriceId6Month || bundle.stripePriceId;
          break;
        case "12_month":
          price = bundle.bundlePrice12Month || bundle.bundlePrice;
          stripePriceId = bundle.stripePriceId12Month || bundle.stripePriceId;
          break;
        default:
          price = bundle.bundlePrice;
          stripePriceId = bundle.stripePriceId;
      }

      // Apply coupon if provided
      let appliedCoupon: any = null;
      let finalAmount = price;

      if (input.couponCode) {
        const [coupon] = await db
          .select()
          .from(coupons)
          .where(eq(coupons.code, input.couponCode.toUpperCase()))
          .limit(1);

        if (coupon && coupon.active === 1) {
          // Check if coupon is valid for this bundle
          const validForBundle = !coupon.validForBundleIds || 
            (Array.isArray(coupon.validForBundleIds) && coupon.validForBundleIds.includes(input.bundleId));

          // Check usage limits
          const withinUsageLimit = !coupon.maxUses || coupon.usedCount < coupon.maxUses;

          // Check expiry
          const notExpired = !coupon.expiresAt || new Date(coupon.expiresAt) > new Date();

          if (validForBundle && withinUsageLimit && notExpired) {
            appliedCoupon = coupon;
            
            if (coupon.discountType === "percentage") {
              const discount = (finalAmount * Number(coupon.discountValue)) / 100;
              finalAmount = Math.max(0, finalAmount - discount);
            } else {
              // Fixed amount discount (convert from dollars to cents if needed)
              finalAmount = Math.max(0, finalAmount - (Number(coupon.discountValue) * 100));
            }
          }
        }
      }

      // Get user details
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const userEmail = user?.email || `user${userId}@example.com`;
      const userName = user?.name || `User ${userId}`;

      // If final amount is 0, enroll directly without payment
      if (finalAmount === 0) {
        // Create bundle enrollment
        const bundleEnrollmentResult = await db.insert(courseEnrollments).values({
          userId,
          bundleId: input.bundleId,
          enrollmentType: "bundle",
          paymentStatus: "free",
          amountPaid: 0,
          couponId: appliedCoupon?.id || null,
          paymentType: input.duration,
          status: "enrolled",
          progress: 0,
        });
        const bundleEnrollmentId = Number((bundleEnrollmentResult as any).insertId);

        // Create individual course enrollments
        const courseIds = Array.isArray(bundle.courseIds) 
          ? bundle.courseIds 
          : JSON.parse(bundle.courseIds as string);

        for (const courseId of courseIds) {
          await db.insert(courseEnrollments).values({
            userId,
            courseId: parseInt(String(courseId)),
            bundleId: input.bundleId,
            enrollmentType: "course",
            paymentStatus: "free",
            amountPaid: 0,
            couponId: appliedCoupon?.id || null,
            status: "enrolled",
            progress: 0,
          });
        }

        // Record coupon usage
        if (appliedCoupon) {
          await db.insert(couponUsage).values({
            couponId: appliedCoupon.id,
            userId,
            orderId: bundleEnrollmentId,
          });

          await db
            .update(coupons)
            .set({ usedCount: appliedCoupon.usedCount + 1 })
            .where(eq(coupons.id, appliedCoupon.id));
        }

        // Send confirmation email
        try {
          await sendEnrollmentConfirmationEmail({
            userEmail,
            userName,
            courseName: bundle.name,
            courseDescription: bundle.description || "",
            enrollmentDate: new Date().toISOString(),
            isFree: true,
            amountPaid: 0,
            couponCode: appliedCoupon?.code,
          });
        } catch (emailError) {
          console.error("[BundleEnrollment] Failed to send confirmation email:", emailError);
        }

        return {
          success: true,
          enrollmentId: bundleEnrollmentId,
          paymentRequired: false,
          message: "Successfully enrolled in bundle",
        };
      }

      // Payment required - create Stripe checkout session
      if (!stripePriceId) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Payment configuration not available for this bundle" 
        });
      }

      const frontendUrl = process.env.VITE_FRONTEND_URL || "http://localhost:3000";
      
      const { url, sessionId } = await createCourseCheckoutSession({
        userId,
        email: userEmail,
        name: userName,
        bundleId: input.bundleId,
        stripePriceId,
        amount: finalAmount,
        successUrl: `${frontendUrl}/my-courses?session_id={CHECKOUT_SESSION_ID}&bundle=${input.bundleId}`,
        cancelUrl: `${frontendUrl}/checkout?type=bundle&id=${input.bundleId}`,
        paymentType: input.duration,
      });

      // Create pending enrollment
      const pendingEnrollmentResult = await db.insert(courseEnrollments).values({
        userId,
        bundleId: input.bundleId,
        enrollmentType: "bundle",
        paymentStatus: "pending",
        stripePaymentIntentId: sessionId,
        stripePriceId,
        amountPaid: 0,
        couponId: appliedCoupon?.id || null,
        paymentType: input.duration,
        status: "enrolled",
        progress: 0,
      });
      const pendingEnrollmentId = Number((pendingEnrollmentResult as any).insertId);

      return {
        success: true,
        enrollmentId: pendingEnrollmentId,
        paymentRequired: true,
        checkoutUrl: url,
        sessionId,
        amount: finalAmount,
        message: "Redirecting to payment",
      };
    }),

  /**
   * Get user's bundle enrollments with course details
   */
  getMyBundleEnrollments: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const userId = ctx.user.id;

      // Get bundle enrollments
      const enrollments = await db
        .select()
        .from(courseEnrollments)
        .where(and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.enrollmentType, "bundle"),
          eq(courseEnrollments.paymentStatus, "completed")
        ));

      // Enrich with bundle and course details
      const enrichedEnrollments = await Promise.all(
        enrollments.map(async (enrollment) => {
          if (!enrollment.bundleId) return null;

          const [bundle] = await db
            .select()
            .from(courseBundles)
            .where(eq(courseBundles.id, enrollment.bundleId));

          if (!bundle) return null;

          // Get course details
          const courseIds = Array.isArray(bundle.courseIds) 
            ? bundle.courseIds 
            : JSON.parse(bundle.courseIds as string);

          const bundleCourses = courseIds.length > 0
            ? await db.select().from(courses).where(inArray(courses.id, courseIds.map((id: string | number) => parseInt(String(id)))))
            : [];

          // Get individual course enrollments for progress tracking
          const courseEnrollmentsList = await db
            .select()
            .from(courseEnrollments)
            .where(and(
              eq(courseEnrollments.userId, userId),
              eq(courseEnrollments.bundleId, enrollment.bundleId),
              eq(courseEnrollments.enrollmentType, "course")
            ));

          // Calculate overall bundle progress
          const totalProgress = courseEnrollmentsList.reduce((sum, ce) => sum + (ce.progress || 0), 0);
          const overallProgress = courseEnrollmentsList.length > 0 
            ? Math.round(totalProgress / courseEnrollmentsList.length) 
            : 0;

          return {
            id: enrollment.id,
            bundleId: bundle.id,
            bundleName: bundle.name,
            bundleDescription: bundle.description,
            enrolledAt: enrollment.enrolledAt,
            paymentType: enrollment.paymentType,
            amountPaid: enrollment.amountPaid,
            overallProgress,
            courses: bundleCourses.map(course => {
              const courseEnrollment = courseEnrollmentsList.find(ce => ce.courseId === course.id);
              return {
                id: course.id,
                title: course.title,
                description: course.description,
                durationHours: course.durationHours,
                framework: course.framework,
                progress: courseEnrollment?.progress || 0,
                status: courseEnrollment?.status || "enrolled",
                completedAt: courseEnrollment?.completedAt,
              };
            }),
          };
        })
      );

      return enrichedEnrollments.filter(Boolean);
    }),

  /**
   * Validate a coupon code for a bundle
   */
  validateCoupon: publicProcedure
    .input(z.object({
      bundleId: z.number(),
      couponCode: z.string(),
      duration: durationSchema.default("one_time"),
    }))
    .query(async ({ input, ctx }) => {
      // Rate limit coupon validation attempts
      const rateLimitKey = `coupon:${input.couponCode.toUpperCase()}`;
      const rateLimitResult = couponValidationLimiter.check(rateLimitKey);
      if (!rateLimitResult.allowed) {
        // Log the rate-limited attempt
        await logCouponValidation({
          couponCode: input.couponCode,
          bundleId: input.bundleId,
          success: false,
          failureReason: 'rate_limited',
          timestamp: new Date().toISOString(),
        });
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many validation attempts. Please try again in ${Math.ceil(rateLimitResult.resetIn / 1000)} seconds.`,
        });
      }

      // Check for abuse patterns
      const abuseCheck = checkForAbusePatterns(rateLimitKey);
      if (abuseCheck.isAbusive) {
        await logCouponValidation({
          couponCode: input.couponCode,
          bundleId: input.bundleId,
          success: false,
          failureReason: 'abuse_detected',
          timestamp: new Date().toISOString(),
        });
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Suspicious activity detected. Please try again later.",
        });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, input.couponCode.toUpperCase()))
        .limit(1);

      if (!coupon) {
        await logCouponValidation({
          couponCode: input.couponCode,
          bundleId: input.bundleId,
          success: false,
          failureReason: 'invalid_code',
          timestamp: new Date().toISOString(),
        });
        return { valid: false, message: "Invalid coupon code" };
      }

      if (coupon.active !== 1) {
        await logCouponValidation({
          couponCode: input.couponCode,
          bundleId: input.bundleId,
          success: false,
          failureReason: 'inactive_coupon',
          timestamp: new Date().toISOString(),
        });
        return { valid: false, message: "This coupon is no longer active" };
      }

      // Check expiry
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        await logCouponValidation({
          couponCode: input.couponCode,
          bundleId: input.bundleId,
          success: false,
          failureReason: 'expired',
          timestamp: new Date().toISOString(),
        });
        return { valid: false, message: "This coupon has expired" };
      }

      // Check usage limits
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        await logCouponValidation({
          couponCode: input.couponCode,
          bundleId: input.bundleId,
          success: false,
          failureReason: 'usage_limit_reached',
          timestamp: new Date().toISOString(),
        });
        return { valid: false, message: "This coupon has reached its usage limit" };
      }

      // Check if valid for this bundle
      if (coupon.validForBundleIds) {
        const validBundleIds = Array.isArray(coupon.validForBundleIds) 
          ? coupon.validForBundleIds 
          : JSON.parse(coupon.validForBundleIds as string);
        
        if (!validBundleIds.includes(input.bundleId)) {
          return { valid: false, message: "This coupon is not valid for this bundle" };
        }
      }

      // Get bundle price for the selected duration
      const [bundle] = await db
        .select()
        .from(courseBundles)
        .where(eq(courseBundles.id, input.bundleId));

      if (!bundle) {
        return { valid: false, message: "Bundle not found" };
      }

      let originalPrice: number;
      switch (input.duration) {
        case "3_month":
          originalPrice = bundle.bundlePrice3Month || bundle.bundlePrice;
          break;
        case "6_month":
          originalPrice = bundle.bundlePrice6Month || bundle.bundlePrice;
          break;
        case "12_month":
          originalPrice = bundle.bundlePrice12Month || bundle.bundlePrice;
          break;
        default:
          originalPrice = bundle.bundlePrice;
      }

      // Calculate discount
      let discountAmount: number;
      let finalPrice: number;

      if (coupon.discountType === "percentage") {
        discountAmount = Math.round((originalPrice * Number(coupon.discountValue)) / 100);
        finalPrice = Math.max(0, originalPrice - discountAmount);
      } else {
        discountAmount = Number(coupon.discountValue) * 100; // Convert to cents
        finalPrice = Math.max(0, originalPrice - discountAmount);
      }

      // Log successful validation
      await logCouponValidation({
        couponCode: input.couponCode,
        bundleId: input.bundleId,
        success: true,
        discountAmount,
        timestamp: new Date().toISOString(),
      });

      return {
        valid: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
        originalPrice,
        discountAmount,
        finalPrice,
        message: coupon.discountType === "percentage" 
          ? `${coupon.discountValue}% discount applied` 
          : `$${coupon.discountValue} discount applied`,
      };
    }),
});
