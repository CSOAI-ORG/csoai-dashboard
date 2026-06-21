/**
 * CSOAI Stripe Service
 * Handles checkout sessions, subscriptions, and customer management
 */

import Stripe from "stripe";
import { SUBSCRIPTION_TIERS, SubscriptionTier } from "./products";

// Initialize Stripe with the secret key
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

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateCustomer(
  userId: number,
  email: string,
  name?: string
): Promise<string> {
  // Search for existing customer by email
  const existingCustomers = await getStripe().customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Create new customer
  const customer = await getStripe().customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId: userId.toString(),
    },
  });

  return customer.id;
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(params: {
  userId: number;
  email: string;
  name?: string;
  tier: "starter" | "pro" | "enterprise";
  billingPeriod: "monthly" | "yearly";
  successUrl: string;
  cancelUrl: string;
}): Promise<{ url: string; sessionId: string }> {
  const { userId, email, name, tier, billingPeriod, successUrl, cancelUrl } = params;

  // Get or create customer
  const customerId = await getOrCreateCustomer(userId, email, name);

  // Get the price ID for the selected tier and billing period
  const tierConfig = SUBSCRIPTION_TIERS[tier];
  const priceId = billingPeriod === "monthly" 
    ? tierConfig.stripePriceIdMonthly 
    : tierConfig.stripePriceIdYearly;

  // Create checkout session
  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId.toString(),
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: "required",
    metadata: {
      user_id: userId.toString(),
      customer_email: email,
      customer_name: name || "",
      tier,
      billing_period: billingPeriod,
    },
    subscription_data: {
      metadata: {
        user_id: userId.toString(),
        tier,
      },
    },
  });

  return {
    url: session.url!,
    sessionId: session.id,
  };
}

/**
 * Create a customer portal session for managing subscriptions
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

/**
 * Get subscription details for a customer
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    return await getStripe().subscriptions.retrieve(subscriptionId);
  } catch {
    return null;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await getStripe().subscriptions.cancel(subscriptionId);
}

/**
 * Map Stripe subscription status to our internal status
 */
export function mapSubscriptionStatus(stripeStatus: string): "active" | "canceled" | "past_due" | "trialing" | "none" {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "canceled";
    case "past_due":
    case "incomplete":
      return "past_due";
    case "trialing":
      return "trialing";
    default:
      return "none";
  }
}

/**
 * Get tier from Stripe price ID
 */
// Returns null when a real (price_xxx) id can't be resolved, so callers DO NOT
// silently downgrade a paying customer to free (e.g. when STRIPE_*_PRICE_ID envs
// aren't populated and configs fall back to placeholders). Caller must treat null
// as "leave tier unchanged" + log, not as "free".
export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  if (!priceId) return null;
  // Primary: match the real configured Stripe price IDs.
  for (const [tier, cfg] of Object.entries(SUBSCRIPTION_TIERS) as [SubscriptionTier, any][]) {
    if (priceId === cfg.stripePriceIdMonthly || priceId === cfg.stripePriceIdYearly) {
      return tier;
    }
  }
  // Fallback: legacy placeholder IDs (price_pro_monthly etc.) used in dev.
  if (priceId.includes("enterprise")) return "enterprise";
  if (priceId.includes("starter")) return "starter";
  if (priceId.includes("pro")) return "pro";
  return null;
}

/**
 * Create a checkout session for course/bundle purchase
 */
export async function createCourseCheckoutSession(params: {
  userId: number;
  email: string;
  name?: string;
  courseId?: number;
  bundleId?: number;
  stripePriceId: string;
  amount: number; // in cents
  successUrl: string;
  cancelUrl: string;
  paymentType: 'one_time' | '3_month' | '6_month' | '12_month';
}): Promise<{ url: string; sessionId: string }> {
  const { userId, email, name, courseId, bundleId, stripePriceId, amount, successUrl, cancelUrl, paymentType } = params;

  // Get or create customer
  const customerId = await getOrCreateCustomer(userId, email, name);

  // Create checkout session
  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    client_reference_id: userId.toString(),
    mode: paymentType === 'one_time' ? 'payment' : 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    metadata: {
      user_id: userId.toString(),
      customer_email: email,
      customer_name: name || '',
      courseId: courseId?.toString() || '',
      bundleId: bundleId?.toString() || '',
      paymentType,
    },
  });

  return {
    url: session.url!,
    sessionId: session.id,
  };
}
