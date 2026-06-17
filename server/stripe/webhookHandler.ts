/**
 * CSOAI Stripe Webhook Handler
 * Processes Stripe webhook events for subscription management
 */

import type { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "../db";
import { users, courseEnrollments, courseBundles, courses } from "../../drizzle/schema";
import { sendEnrollmentConfirmationEmail } from '../services/courseEmailService';
import { eq, and } from "drizzle-orm";
import { mapSubscriptionStatus, getTierFromPriceId } from "./stripeService";

// Lazy initialization of Stripe to avoid errors when API key is not available (e.g., in tests)
let _stripe: Stripe | null = null;
const getStripe = () => {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' });
  }
  return _stripe;
};

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe Webhook] Invoice paid: ${invoice.id}`);
        // Could trigger email notification here
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe Webhook] Invoice payment failed: ${invoice.id}`);
        // Could trigger email notification here
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error processing event:`, err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id || session.client_reference_id;
  
  if (!userId) {
    console.error("[Stripe Webhook] No user ID in checkout session");
    return;
  }

  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] Database not available");
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const courseId = session.metadata?.courseId;
  const bundleId = session.metadata?.bundleId;
  const paymentType = session.metadata?.paymentType;

  // Check if this is a course enrollment payment
  if ((courseId || bundleId) && paymentType) {
    console.log(`[Stripe Webhook] Course enrollment checkout completed for user ${userId}, course: ${courseId}, bundle: ${bundleId}, paymentType: ${paymentType}`);

    // Find the enrollment record by session ID
    const [enrollment] = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.stripePaymentIntentId, session.id))
      .limit(1);

    if (enrollment) {
      // Update enrollment with payment details
      await db.update(courseEnrollments)
        .set({
          amountPaid: session.amount_total || 0,
          stripeSubscriptionId: subscriptionId || null,
          subscriptionStatus: subscriptionId ? "active" : "none",
          paymentStatus: "completed",
        })
        .where(eq(courseEnrollments.id, enrollment.id));

      console.log(`[Stripe Webhook] Updated enrollment ${enrollment.id} with payment details`);
      
      // Send enrollment confirmation email
      try {
        // Get course/bundle details
        let itemName = 'Course';
        let itemDescription = '';
        
        if (enrollment.courseId) {
          const [course] = await db.select().from(courses).where(eq(courses.id, enrollment.courseId));
          if (course) {
            itemName = course.title;
            itemDescription = course.description || '';
          }
        } else if (enrollment.bundleId) {
          const [bundle] = await db.select().from(courseBundles).where(eq(courseBundles.id, enrollment.bundleId));
          if (bundle) {
            itemName = bundle.name;
            itemDescription = bundle.description || '';
          }
        }
        
        // TODO: Get actual user email from auth system
        const userEmail = `user${enrollment.userId}@example.com`;
        const userName = `User ${enrollment.userId}`;
        
        await sendEnrollmentConfirmationEmail({
          userEmail,
          userName,
          courseName: itemName,
          courseDescription: itemDescription,
          enrollmentDate: new Date().toISOString(),
          isFree: false,
          amountPaid: session.amount_total || 0,
        });
        
        console.log(`[Stripe Webhook] Sent enrollment confirmation email to ${userEmail}`);
      } catch (emailError) {
        console.error('[Stripe Webhook] Failed to send confirmation email:', emailError);
        // Don't fail the webhook if email fails
      }
      
      // If it's a bundle enrollment, create individual course enrollments
      if (enrollment.bundleId && enrollment.enrollmentType === 'bundle') {
        const [bundle] = await db
          .select()
          .from(courseBundles)
          .where(eq(courseBundles.id, enrollment.bundleId));
        
        if (bundle && bundle.courseIds) {
          const courseIds = Array.isArray(bundle.courseIds) ? bundle.courseIds : JSON.parse(bundle.courseIds as string);
          
          console.log(`[Stripe Webhook] Expanding bundle ${bundle.id} into ${courseIds.length} individual course enrollments`);
          
          for (const courseId of courseIds) {
            const cid = parseInt(courseId);
            // Idempotency: Stripe redelivers events at-least-once. Skip if this
            // bundle's course enrollment already exists (else retries duplicate it).
            const [dupe] = await db
              .select()
              .from(courseEnrollments)
              .where(and(
                eq(courseEnrollments.userId, enrollment.userId),
                eq(courseEnrollments.courseId, cid),
                eq(courseEnrollments.bundleId, enrollment.bundleId),
              ))
              .limit(1);
            if (dupe) continue;
            await db.insert(courseEnrollments).values({
              userId: enrollment.userId,
              courseId: cid,
              bundleId: enrollment.bundleId,
              enrollmentType: 'course',
              paymentStatus: 'completed',
              amountPaid: 0,
              couponId: enrollment.couponId,
            });
          }
          
          console.log(`[Stripe Webhook] Successfully created ${courseIds.length} individual course enrollments for bundle ${bundle.id}`);
        }
      }
    } else {
      console.error(`[Stripe Webhook] No enrollment found for session ${session.id}`);
    }
    return;
  }

  // Otherwise, this is a platform subscription.
  // Default to "free" (NOT "pro") when tier metadata is absent — never grant a
  // paid tier for free on a tier-less/anomalous checkout. Legit checkouts always
  // carry metadata.tier (set server-side in createCheckoutSession).
  const tier = (session.metadata?.tier as "starter" | "pro" | "enterprise") || "free";
  if (!session.metadata?.tier) {
    console.error(`[Stripe Webhook] checkout.session ${session.id} had NO tier metadata — defaulting to free (investigate)`);
  }
  const uid = parseInt(userId);
  if (!Number.isInteger(uid)) {
    console.error(`[Stripe Webhook] invalid userId '${userId}' on checkout ${session.id} — skipping tier update`);
    return;
  }
  console.log(`[Stripe Webhook] Platform subscription checkout completed for user ${uid}, tier: ${tier}`);

  // Update user with Stripe IDs and subscription info
  await db.update(users)
    .set({
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionTier: tier,
      subscriptionStatus: "active",
    })
    .where(eq(users.id, uid));
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  
  if (!userId) {
    console.error("[Stripe Webhook] No user ID in subscription metadata");
    return;
  }

  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] Database not available");
    return;
  }

  // Check if this is a course enrollment subscription
  const [enrollment] = await db
    .select()
    .from(courseEnrollments)
    .where(eq(courseEnrollments.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (enrollment) {
    // Update course enrollment subscription status
    const status = subscription.status === "active" ? "active" : 
                   subscription.status === "canceled" ? "cancelled" :
                   subscription.status === "past_due" ? "past_due" : "none";

    console.log(`[Stripe Webhook] Course subscription updated for enrollment ${enrollment.id}: ${status}`);

    await db.update(courseEnrollments)
      .set({
        subscriptionStatus: status,
        status: status === "active" ? "in_progress" : "failed",
      })
      .where(eq(courseEnrollments.id, enrollment.id));
    return;
  }

  // Otherwise, this is a platform subscription
  const uid = parseInt(userId);
  if (!Number.isInteger(uid)) {
    console.error(`[Stripe Webhook] invalid userId '${userId}' on subscription ${subscription.id} — skipping`);
    return;
  }
  const status = mapSubscriptionStatus(subscription.status);
  const priceId = subscription.items.data[0]?.price?.id || "";
  const tier = getTierFromPriceId(priceId);
  // If the price id can't be resolved (e.g. STRIPE_*_PRICE_ID envs unset), DO NOT
  // downgrade the customer — update status/subscription id only, leave tier intact.
  const setFields: Record<string, unknown> = {
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: status,
  };
  if (tier) {
    setFields.subscriptionTier = tier;
  } else {
    console.error(`[Stripe Webhook] could not resolve tier for price '${priceId}' (sub ${subscription.id}) — leaving subscriptionTier unchanged`);
  }
  console.log(`[Stripe Webhook] Platform subscription updated for user ${uid}: ${status}, tier: ${tier ?? '(unchanged)'}`);

  await db.update(users)
    .set(setFields)
    .where(eq(users.id, uid));
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;
  
  if (!userId) {
    console.error("[Stripe Webhook] No user ID in subscription metadata");
    return;
  }

  const db = await getDb();
  if (!db) {
    console.error("[Stripe Webhook] Database not available");
    return;
  }

  // Check if this is a course enrollment subscription
  const [enrollment] = await db
    .select()
    .from(courseEnrollments)
    .where(eq(courseEnrollments.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (enrollment) {
    console.log(`[Stripe Webhook] Course subscription canceled for enrollment ${enrollment.id}`);

    await db.update(courseEnrollments)
      .set({
        subscriptionStatus: "cancelled",
        status: "failed",
      })
      .where(eq(courseEnrollments.id, enrollment.id));
    return;
  }

  // Otherwise, this is a platform subscription
  console.log(`[Stripe Webhook] Platform subscription canceled for user ${userId}`);

  await db.update(users)
    .set({
      subscriptionTier: "free",
      subscriptionStatus: "canceled",
    })
    .where(eq(users.id, parseInt(userId)));
}
