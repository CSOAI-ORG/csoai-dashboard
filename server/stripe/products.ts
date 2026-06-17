/**
 * CSOAI Stripe Products Configuration
 * Defines subscription tiers and pricing for the platform
 */

export const SUBSCRIPTION_TIERS = {
  free: {
    name: "Free",
    description: "For individuals exploring AI compliance",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "1 AI System",
      "Basic compliance tracking",
      "Community support",
      "Public Watchdog reports",
      "Basic training modules",
    ],
    limits: {
      aiSystems: 1,
      apiCalls: 100,
      councilSessions: 5,
      pdcaCycles: 2,
      teamMembers: 1,
    },
  },
  starter: {
    name: "Starter",
    description: "For individuals and small teams getting compliant",
    priceMonthly: 499,
    priceYearly: 4788, // £399/mo billed yearly (~20% off)
    stripePriceIdMonthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "price_starter_monthly",
    stripePriceIdYearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || "price_starter_yearly",
    features: [
      "5 AI Systems",
      "25 compliance assessments",
      "EU AI Act compliance tracking",
      "Email support",
      "PDF report generation",
      "API access (2,000 calls/month)",
    ],
    limits: {
      aiSystems: 5,
      apiCalls: 2000,
      councilSessions: 25,
      pdcaCycles: 10,
      teamMembers: 2,
    },
  },
  pro: {
    name: "Professional",
    description: "For teams managing multiple AI systems",
    priceMonthly: 999,
    priceYearly: 9588, // £799/mo billed yearly (~20% off)
    stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "price_pro_monthly",
    stripePriceIdYearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "price_pro_yearly",
    features: [
      "25 AI Systems",
      "Multi-framework compliance (EU AI Act, NIST, TC260)",
      "Priority email support",
      "Advanced analytics dashboard",
      "PDF report generation",
      "API access (10,000 calls/month)",
      "Watchdog Analyst certification",
      "Unlimited PDCA cycles",
    ],
    limits: {
      aiSystems: 25,
      apiCalls: 10000,
      councilSessions: 100,
      pdcaCycles: -1, // unlimited
      teamMembers: 5,
    },
  },
  enterprise: {
    name: "Enterprise",
    description: "For organizations with advanced compliance needs",
    priceMonthly: 1999,
    priceYearly: 19188, // £1,599/mo billed yearly (~20% off)
    stripePriceIdMonthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "price_enterprise_monthly",
    stripePriceIdYearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "price_enterprise_yearly",
    features: [
      "Unlimited AI Systems",
      "All compliance frameworks",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee (99.9% uptime)",
      "Unlimited API access",
      "White-label reports",
      "SSO/SAML authentication",
      "Custom training modules",
      "On-premise deployment option",
    ],
    limits: {
      aiSystems: -1, // unlimited
      apiCalls: -1, // unlimited
      councilSessions: -1, // unlimited
      pdcaCycles: -1, // unlimited
      teamMembers: -1, // unlimited
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export function getTierLimits(tier: SubscriptionTier) {
  return SUBSCRIPTION_TIERS[tier].limits;
}

export function canAccessFeature(tier: SubscriptionTier, feature: string): boolean {
  const tierFeatures = SUBSCRIPTION_TIERS[tier].features;
  return tierFeatures.some(f => f.toLowerCase().includes(feature.toLowerCase()));
}

export function isWithinLimit(tier: SubscriptionTier, resource: keyof typeof SUBSCRIPTION_TIERS.free.limits, current: number): boolean {
  const limit = SUBSCRIPTION_TIERS[tier].limits[resource];
  if (limit === -1) return true; // unlimited
  return current < limit;
}
