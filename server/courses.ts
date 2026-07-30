/**
 * Courses Router - Training Certification Business Model
 * Handles course catalog, enrollments, payment plans, and Stripe subscriptions
 * FREE: Watchdog courses (framework = "watchdog")
 * PAID: CSOAI courses (all other frameworks)
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { sendCompletionCertificateEmail } from './services/courseEmailService';
import { getDb } from "./db";
import { courses, courseEnrollments, courseBundles, regions, trainingModules, coupons } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import Stripe from "stripe";
import { couponValidationLimiter } from "./utils/rateLimiter";
import { TRPCError } from "@trpc/server";

// Lazy initialization of Stripe to avoid errors when API key is not available (e.g., in tests)
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

// Helper function to determine if course is free
const isCourseFreeFn = (framework: string | null) => framework === "watchdog";

export const coursesRouter = router({
  /**
   * Get course catalog with pricing by region
   * Public endpoint - anyone can browse courses
   */
  getCatalog: publicProcedure
    .input(
      z.object({
        regionId: z.number().optional(),
        level: z.enum(["fundamentals", "advanced", "specialist"]).optional(),
        framework: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      // Build where conditions
      const conditions: any[] = [eq(courses.active, 1)];
      if (input.regionId) {
        conditions.push(eq(courses.regionId, input.regionId));
      }
      if (input.level) {
        conditions.push(eq(courses.level, input.level));
      }
      if (input.framework) {
        conditions.push(eq(courses.framework, input.framework));
      }

      const allCourses = await db
        .select()
        .from(courses)
        .where(and(...conditions));

      return allCourses.map((course: any) => ({
        ...course,
        isFree: isCourseFreeFn(course.framework),
        pricing: {
          oneTime: course.price,
          threeMonth: course.price3Month,
          sixMonth: course.price6Month,
          twelveMonth: course.price12Month,
        },
        stripePriceIds: {
          oneTime: course.stripePriceId,
          threeMonth: course.stripePriceId3Month,
          sixMonth: course.stripePriceId6Month,
          twelveMonth: course.stripePriceId12Month,
        },
      }));
    }),

  /**
   * Get course details with full information
   */
  getCourseDetails: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, input.courseId));

      if (!course) {
        throw new Error("Course not found");
      }

      // Get enrollment count
      const [enrollmentStats] = await db
        .select({ count: sql<number>`count(*)` })
        .from(courseEnrollments)
        .where(eq(courseEnrollments.courseId, input.courseId));

      // Get training modules for this course
      const modules = await db
        .select()
        .from(trainingModules)
        .where(eq(trainingModules.courseId, input.courseId));

      return {
        ...course,
        isFree: isCourseFreeFn(course.framework),
        enrollmentCount: enrollmentStats?.count || 0,
        modules: modules || [],
        pricing: {
          oneTime: course.price,
          threeMonth: course.price3Month,
          sixMonth: course.price6Month,
          twelveMonth: course.price12Month,
        },
        stripePriceIds: {
          oneTime: course.stripePriceId,
          threeMonth: course.stripePriceId3Month,
          sixMonth: course.stripePriceId6Month,
          twelveMonth: course.stripePriceId12Month,
        },
      };
    }),

  /**
   * Get all regions for filtering
   */
  getRegions: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(regions);
  }),

  /**
   * Get course bundles with savings calculations
   */
  getCourseBundles: publicProcedure
    .input(z.object({ regionId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      // Build where conditions
      const conditions: any[] = [eq(courseBundles.active, 1)];
      if (input.regionId) {
        conditions.push(eq(courseBundles.regionId, input.regionId));
      }

      const bundles = await db
        .select()
        .from(courseBundles)
        .where(and(...conditions));

      return bundles.map((bundle: any) => ({
        ...bundle,
        pricing: {
          oneTime: bundle.bundlePrice,
          threeMonth: bundle.bundlePrice3Month,
          sixMonth: bundle.bundlePrice6Month,
          twelveMonth: bundle.bundlePrice12Month,
        },
        stripePriceIds: {
          oneTime: bundle.stripePriceId,
          threeMonth: bundle.stripePriceId3Month,
          sixMonth: bundle.stripePriceId6Month,
          twelveMonth: bundle.stripePriceId12Month,
        },
      }));
    }),

  /**
   * Enroll in a course with payment plan selection
   * FREE courses: Instant enrollment (Watchdog)
   * PAID courses: Creates Stripe checkout session (CSOAI)
   */
  enrollInCourse: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        paymentType: z.enum(["one_time", "3_month", "6_month", "12_month"]).optional(),
        referredBySpecialistId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        console.log('[enrollInCourse] Starting enrollment:', { input, userId: ctx.user.id });
        
        const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userId = ctx.user.id;

      // Check if already enrolled
      const [existing] = await db
        .select()
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.userId, userId),
            eq(courseEnrollments.courseId, input.courseId)
          )
        );

      if (existing) {
        throw new Error("Already enrolled in this course");
      }

      // Get course details
      const [course] = await db
        .select()
        .from(courses)
        .where(eq(courses.id, input.courseId));

      if (!course) {
        throw new Error("Course not found");
      }
      
      console.log('[enrollInCourse] Course found:', { 
        id: course.id, 
        title: course.title,
        stripePriceId: course.stripePriceId,
        stripePriceId3Month: course.stripePriceId3Month,
        stripePriceId6Month: course.stripePriceId6Month,
        stripePriceId12Month: course.stripePriceId12Month
      });

      // FREE COURSES (Watchdog) - Instant enrollment
      if (isCourseFreeFn(course.framework)) {
        const [enrollment] = await db
          .insert(courseEnrollments)
          .values({
            userId,
            courseId: input.courseId,
            status: "enrolled",
            paymentType: "one_time",
            paidAmount: 0,
            subscriptionStatus: "active",
            referredBySpecialistId: input.referredBySpecialistId,
          })
          .$returningId() as { id: number }[];

        return {
          enrollmentId: enrollment.id,
          status: "enrolled",
          isFree: true,
          message: "Successfully enrolled in free course",
        };
      }

      // PAID COURSES (CSOAI) - Stripe payment required
      if (!input.paymentType) {
        throw new Error("Payment type required for paid courses");
      }

      // Map payment type to Stripe price ID
      const paymentTypeMap: Record<string, keyof typeof course> = {
        one_time: "stripePriceId",
        "3_month": "stripePriceId3Month",
        "6_month": "stripePriceId6Month",
        "12_month": "stripePriceId12Month",
      };

      const stripePriceIdKey = paymentTypeMap[input.paymentType];
      const stripePriceId = course[stripePriceIdKey];
      
      console.log('[enrollInCourse] Stripe price lookup:', {
        paymentType: input.paymentType,
        stripePriceIdKey,
        stripePriceId,
        courseId: course.id,
        courseTitle: course.title
      });

      if (!stripePriceId) {
        console.error('[enrollInCourse] Missing Stripe price ID:', { courseId: course.id, paymentType: input.paymentType });
        throw new Error(`Payment plan not available for this course. Please contact support.`);
      }

      // Determine if subscription or one-time
      const isSubscription = input.paymentType !== "one_time";

      try {
        console.log('[enrollInCourse] Creating Stripe checkout session...');
        
        // Create Stripe checkout session
        const session = await (getStripe().checkout.sessions.create as any)({
          payment_method_types: ["card"],
          line_items: [
            {
              price: stripePriceId,
              quantity: 1,
            },
          ],
          mode: isSubscription ? "subscription" : "payment",
          success_url: `${process.env.VITE_FRONTEND_URL}/my-courses?success=true&courseId=${input.courseId}`,
          cancel_url: `${process.env.VITE_FRONTEND_URL}/courses?cancelled=true`,
          client_reference_id: `${userId}`,
          metadata: {
            courseId: input.courseId.toString(),
            userId: userId.toString(),
            paymentType: input.paymentType,
          },
        });
        
        console.log('[enrollInCourse] Stripe session created:', { sessionId: session.id, url: session.url });

        // Create enrollment record (pending payment)
        const insertResult = await db
          .insert(courseEnrollments)
          .values({
            userId,
            courseId: input.courseId,
            status: "enrolled",
            paymentType: input.paymentType,
            paidAmount: 0,
            stripePaymentIntentId: session.id,
            subscriptionStatus: "none" as any,
            referredBySpecialistId: input.referredBySpecialistId,
          });

        const enrollmentId = Number((insertResult as any).insertId);
        console.log('[enrollInCourse] Enrollment created:', { enrollmentId });

        return {
          enrollmentId,
          checkoutUrl: session.url,
          paymentType: input.paymentType,
          isFree: false,
          message: "Redirecting to payment...",
        };
      } catch (error: any) {
        console.error('[enrollInCourse] Stripe error:', error);
        throw new Error(`Stripe error: ${error.message}`);
      }
      } catch (error: any) {
        console.error('[enrollInCourse] FATAL ERROR:', error);
        throw new Error(`Enrollment failed: ${error.message}`);
      }
    }),

  /**
   * Get user's enrollments (courses and bundles)
   */
  getMyEnrollments: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { courses: [], bundles: [] };

    const userId = ctx.user.id;

    // Get course enrollments
    const courseEnrollmentsList = await db
      .select({
        enrollment: courseEnrollments,
        course: courses,
      })
      .from(courseEnrollments)
      .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .where(
        and(
          eq(courseEnrollments.userId, userId),
          sql`${courseEnrollments.courseId} IS NOT NULL`
        )
      );

    // Get bundle enrollments - using separate queries to debug the issue
    const bundleEnrollmentsRaw = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.userId, userId),
          sql`${courseEnrollments.bundleId} IS NOT NULL`
        )
      );
    
    // Fetch bundle details separately
    const bundleEnrollmentsList = await Promise.all(
      bundleEnrollmentsRaw.map(async (enrollment) => {
        const bundleData = enrollment.bundleId 
          ? await db.select().from(courseBundles).where(eq(courseBundles.id, enrollment.bundleId)).limit(1)
          : [];
        return {
          enrollment,
          bundle: bundleData[0] || null,
        };
      })
    );

    const courseResults = courseEnrollmentsList.map((row: any) => ({
      ...row.enrollment,
      course: row.course,
      isFree: isCourseFreeFn(row.course?.framework),
      type: 'course' as const,
    }));

    
    const bundleResults = bundleEnrollmentsList.map((row: any) => ({
      ...row.enrollment,
      bundle: row.bundle,
      type: 'bundle' as const,
    }));

    // For backward compatibility, also return the flat array
    // The new format returns { courses, bundles } but we also spread courses for backward compat
    return [...courseResults, ...bundleResults];
  }),

  /**
   * Get enrollment details
   */
  getEnrollment: protectedProcedure
    .input(z.object({ enrollmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [enrollment] = await db
        .select({
          enrollment: courseEnrollments,
          course: courses,
        })
        .from(courseEnrollments)
        .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
        .where(
          and(
            eq(courseEnrollments.id, input.enrollmentId),
            eq(courseEnrollments.userId, ctx.user.id)
          )
        );

      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      return {
        ...enrollment.enrollment,
        course: enrollment.course,
        isFree: isCourseFreeFn(enrollment.course?.framework ?? null),
      };
    }),

  /**
   * Mark course as completed (after finishing all modules)
   */
  markCourseCompleted: protectedProcedure
    .input(z.object({ enrollmentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [enrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.id, input.enrollmentId),
            eq(courseEnrollments.userId, ctx.user.id)
          )
        );

      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      // Update enrollment status to completed
      const completionDate = new Date().toISOString();
      await db
        .update(courseEnrollments)
        .set({
          status: "completed",
          completedAt: completionDate,
        })
        .where(eq(courseEnrollments.id, input.enrollmentId));

      // Send completion certificate email
      try {
        if (!enrollment.courseId) {
          throw new Error("No course associated with enrollment");
        }

        // Get course details
        const [course] = await db
          .select()
          .from(courses)
          .where(eq(courses.id, enrollment.courseId));
        
        // Get actual user email from auth context
        const userEmail = ctx.user.email || `user${ctx.user.id}@example.com`;
        const userName = ctx.user.name || `User ${ctx.user.id}`;
        
        await sendCompletionCertificateEmail({
          userEmail,
          userName,
          courseName: course?.title || 'Course',
          completionDate,
          score: enrollment.score || undefined,
          certificateUrl: `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/certificates`,
        });
        
        console.log(`[Course Completion] Sent certificate email to ${userEmail}`);
      } catch (emailError) {
        console.error('[Course Completion] Failed to send certificate email:', emailError);
        // Don't fail the completion if email fails
      }

      return {
        success: true,
        message: "Course marked as completed. You can now take the certification exam.",
      };
    }),

  /**
   * Handle Stripe webhook for payment confirmation
   */
  handleStripeWebhook: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        status: z.enum(["complete", "expired", "open"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (input.status !== "complete") {
        return { success: false, message: "Payment not completed" };
      }

      // Get Stripe session
      const session = await getStripe().checkout.sessions.retrieve(input.sessionId);

      if (!session.metadata) {
        throw new Error("Invalid session metadata");
      }

      const userId = parseInt(session.metadata.userId);
      const courseId = parseInt(session.metadata.courseId);

      // Update enrollment to active
      await db
        .update(courseEnrollments)
        .set({
          status: "enrolled",
          subscriptionStatus: session.subscription ? "active" : "none",
          stripeSubscriptionId: session.subscription as string,
          paidAmount: session.amount_total || 0,
        })
        .where(
          and(
            eq(courseEnrollments.userId, userId),
            eq(courseEnrollments.courseId, courseId)
          )
        );

      return {
        success: true,
        message: "Payment confirmed. Course access granted.",
      };
    }),

  /**
   * Cancel an enrollment
   */
  cancelEnrollment: protectedProcedure
    .input(z.object({ enrollmentId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const [enrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.id, input.enrollmentId),
            eq(courseEnrollments.userId, ctx.user.id)
          )
        );

      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      // Delete the enrollment
      await db
        .delete(courseEnrollments)
        .where(eq(courseEnrollments.id, input.enrollmentId));

      return { success: true, message: "Enrollment cancelled" };
    }),

  /**
   * Validate a coupon code for a course
   * Public endpoint - checks if coupon is valid and returns discount info
   * Rate limited: 20 attempts per 15 minutes per IP to prevent brute-force guessing
   */
  validateCoupon: publicProcedure
    .input(
      z.object({
        code: z.string(),
        courseId: z.number().optional(),
        _clientIp: z.string().optional(), // For rate limiting
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limiting to prevent coupon code brute-force attacks
      // Use client IP from context or input for rate limiting key
      const clientIp = (ctx as any)?.req?.ip || (ctx as any)?.req?.headers?.['x-forwarded-for'] || input._clientIp || 'unknown';
      const rateLimitKey = `coupon:${clientIp}`;
      const rateLimitResult = couponValidationLimiter.check(rateLimitKey);
      
      if (!rateLimitResult.allowed) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Too many coupon validation attempts. Please try again in ${Math.ceil(rateLimitResult.resetIn / 60000)} minutes.`,
        });
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Find the coupon by code
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(
          and(
            eq(coupons.code, input.code.toUpperCase()),
            eq(coupons.active, 1)
          )
        );

      if (!coupon) {
        return {
          valid: false,
          message: "Invalid coupon code",
        };
      }

      // Check if coupon has expired
      if (coupon.expiresAt) {
        const expiryDate = new Date(coupon.expiresAt);
        if (expiryDate < new Date()) {
          return {
            valid: false,
            message: "This coupon has expired",
          };
        }
      }

      // Check if coupon has reached max uses
      if (coupon.usedCount >= coupon.maxUses) {
        return {
          valid: false,
          message: "This coupon has reached its usage limit",
        };
      }

      // Calculate discount percentage
      let discountPercent = 0;
      if (coupon.discountType === "percentage") {
        discountPercent = parseFloat(String(coupon.discountValue));
      } else {
        // For fixed amount, we'll return the value and let frontend calculate
        discountPercent = 0; // Will be handled differently
      }

      return {
        valid: true,
        couponId: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: parseFloat(String(coupon.discountValue)),
        discountPercent: coupon.discountType === "percentage" ? discountPercent : null,
        message: coupon.discountType === "percentage"
          ? `${discountPercent}% discount applied`
          : `£${coupon.discountValue} discount applied`,
        remainingUses: coupon.maxUses - coupon.usedCount,
      };
    }),
});
