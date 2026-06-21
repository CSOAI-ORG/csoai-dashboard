/**
 * Stripe Setup Router - Create products and prices for all courses
 * Admin-only endpoint for initial Stripe configuration
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { courses } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

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

export const stripeSetupRouter = router({
  /**
   * Create Stripe products and prices for all courses
   * This is a one-time setup operation
   */
  createAllProducts: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all active courses
      const allCourses = await db
        .select()
        .from(courses)
        .where(eq(courses.active, 1));

      const results = [];

      for (const course of allCourses) {
        try {
          console.log(`Processing course ${course.id}: ${course.title}`);

          // Create Stripe product
          const product = await getStripe().products.create({
            name: course.title,
            description: course.description || `Professional AI Safety & Compliance Training: ${course.title}`,
            metadata: {
              course_id: course.id.toString(),
              platform: 'CSOAI'
            }
          });

          const oneTimePrice = course.price; // e.g., 49900 (£499.00)

          // Create 4 price points
          // 1. One-time payment
          const priceOneTime = await getStripe().prices.create({
            product: product.id,
            unit_amount: oneTimePrice,
            currency: 'gbp',
            nickname: 'One-time payment',
            metadata: {
              course_id: course.id.toString(),
              payment_type: 'one_time'
            }
          });

          // 2. 3-month subscription
          const monthlyAmount3 = Math.round(oneTimePrice / 3);
          const price3Month = await getStripe().prices.create({
            product: product.id,
            unit_amount: monthlyAmount3,
            currency: 'gbp',
            recurring: {
              interval: 'month',
              interval_count: 1
            },
            nickname: '3-month plan',
            metadata: {
              course_id: course.id.toString(),
              payment_type: '3_month',
              total_months: '3'
            }
          });

          // 3. 6-month subscription
          const monthlyAmount6 = Math.round(oneTimePrice / 6);
          const price6Month = await getStripe().prices.create({
            product: product.id,
            unit_amount: monthlyAmount6,
            currency: 'gbp',
            recurring: {
              interval: 'month',
              interval_count: 1
            },
            nickname: '6-month plan',
            metadata: {
              course_id: course.id.toString(),
              payment_type: '6_month',
              total_months: '6'
            }
          });

          // 4. 12-month subscription
          const monthlyAmount12 = Math.round(oneTimePrice / 12);
          const price12Month = await getStripe().prices.create({
            product: product.id,
            unit_amount: monthlyAmount12,
            currency: 'gbp',
            recurring: {
              interval: 'month',
              interval_count: 1
            },
            nickname: '12-month plan',
            metadata: {
              course_id: course.id.toString(),
              payment_type: '12_month',
              total_months: '12'
            }
          });

          // Update database with Stripe IDs
          console.log(`Updating course ${course.id} with Stripe IDs:`, {
            stripePriceId: priceOneTime.id,
            stripePriceId3Month: price3Month.id,
            stripePriceId6Month: price6Month.id,
            stripePriceId12Month: price12Month.id,
          });
          
          const updateResult = await db
            .update(courses)
            .set({
              stripePriceId: priceOneTime.id,
              stripePriceId3Month: price3Month.id,
              stripePriceId6Month: price6Month.id,
              stripePriceId12Month: price12Month.id,
            })
            .where(eq(courses.id, course.id));
          
          console.log(`Database update result for course ${course.id}:`, updateResult);

          results.push({
            courseId: course.id,
            title: course.title,
            productId: product.id,
            priceIds: {
              oneTime: priceOneTime.id,
              threeMonth: price3Month.id,
              sixMonth: price6Month.id,
              twelveMonth: price12Month.id,
            },
            status: 'success'
          });

          console.log(`✅ Course ${course.id} completed`);

        } catch (error: any) {
          console.error(`❌ Error processing course ${course.id}:`, error.message);
          results.push({
            courseId: course.id,
            title: course.title,
            status: 'error',
            error: error.message
          });
        }
      }

      return {
        totalCourses: allCourses.length,
        successCount: results.filter(r => r.status === 'success').length,
        errorCount: results.filter(r => r.status === 'error').length,
        results
      };
    }),

  /**
   * Update Stripe account display name
   */
  updateAccountName: protectedProcedure
    .input(z.object({
      displayName: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        // Update account business profile
        await getStripe().accounts.update('acct_self', {
          business_profile: {
            name: input.displayName
          }
        } as any);

        return {
          success: true,
          message: `Account display name updated to: ${input.displayName}`
        };
      } catch (error: any) {
        throw new Error(`Failed to update account: ${error.message}`);
      }
    }),
});
