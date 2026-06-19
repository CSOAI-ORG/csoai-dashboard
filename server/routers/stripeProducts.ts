/**
 * Stripe Products Router - Multi-Framework Training Products
 * 
 * Sets up Stripe products for 6 compliance frameworks:
 * - EU AI Act
 * - NIST AI RMF
 * - TC260 (China)
 * - UK AI Bill
 * - Canada AI Act
 * - Australia AI Governance
 * 
 * Each framework has 3 tiers:
 * - Fundamentals: £499
 * - Professional: £999
 * - Expert: £1,999
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import Stripe from "stripe";

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

// Framework definitions
const FRAMEWORKS = [
  {
    id: "eu-ai-act",
    name: "EU AI Act",
    description: "Master Europe's first comprehensive AI regulation",
    region: "EU",
    deadline: "2026-08-02",
  },
  {
    id: "nist-ai-rmf",
    name: "NIST AI RMF",
    description: "US National Institute of Standards AI Risk Management Framework",
    region: "US",
    deadline: "2026-12-31",
  },
  {
    id: "tc260",
    name: "TC260",
    description: "China's AI governance and security framework",
    region: "China",
    deadline: "2026-06-30",
  },
  {
    id: "uk-ai-bill",
    name: "UK AI Bill",
    description: "United Kingdom's AI regulation framework",
    region: "UK",
    deadline: "2026-03-31",
  },
  {
    id: "canada-ai-act",
    name: "Canada AI Act",
    description: "Canadian artificial intelligence regulation",
    region: "Canada",
    deadline: "2026-09-30",
  },
  {
    id: "australia-ai",
    name: "Australia AI Governance",
    description: "Australian AI governance and compliance framework",
    region: "Australia",
    deadline: "2026-12-31",
  },
];

const TIERS = [
  { id: "fundamentals", name: "Fundamentals", price: 49900, description: "Essential AI safety concepts and compliance basics" },
  { id: "professional", name: "Professional", price: 99900, description: "Advanced compliance frameworks and practical applications" },
  { id: "expert", name: "Expert", price: 199900, description: "Expert-level certification with full framework mastery" },
];

export const stripeProductsRouter = router({
  /**
   * Get all framework products
   */
  getFrameworks: publicProcedure.query(async () => {
    return FRAMEWORKS.map((fw) => ({
      ...fw,
      tiers: TIERS.map((tier) => ({
        ...tier,
        stripePriceId: `price_${fw.id}_${tier.id}`, // Placeholder - actual IDs from Stripe
      })),
    }));
  }),

  /**
   * Get specific framework details
   */
  getFramework: publicProcedure
    .input(z.object({ frameworkId: z.string() }))
    .query(async ({ input }) => {
      const framework = FRAMEWORKS.find((f) => f.id === input.frameworkId);
      if (!framework) throw new Error("Framework not found");

      return {
        ...framework,
        tiers: TIERS.map((tier) => ({
          ...tier,
          stripePriceId: `price_${framework.id}_${tier.id}`,
        })),
      };
    }),

  /**
   * Create Stripe checkout session for a framework tier
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        frameworkId: z.string(),
        tierId: z.string(),
        successUrl: z.string(),
        cancelUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new Error("User not authenticated");

      const framework = FRAMEWORKS.find((f) => f.id === input.frameworkId);
      const tier = TIERS.find((t) => t.id === input.tierId);

      if (!framework || !tier) throw new Error("Invalid framework or tier");

      // Create Stripe checkout session
      const session = await getStripe().checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: `${framework.name} - ${tier.name}`,
                description: `${framework.description}\n${tier.description}`,
                metadata: {
                  frameworkId: framework.id,
                  tierId: tier.id,
                  region: framework.region,
                },
              },
              unit_amount: tier.price,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        customer_email: ctx.user.email || undefined,
        metadata: {
          userId: ctx.user.id.toString(),
          frameworkId: framework.id,
          tierId: tier.id,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  /**
   * Get user's purchased courses
   */
  getUserPurchases: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) throw new Error("User not authenticated");

    // This would query a purchases table
    // For now, return empty array
    return [];
  }),

  /**
   * Verify payment and grant access
   */
  verifyPayment: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new Error("User not authenticated");

      try {
        const session = await getStripe().checkout.sessions.retrieve(input.sessionId);

        if (session.payment_status !== "paid") {
          throw new Error("Payment not completed");
        }

        return {
          success: true,
          frameworkId: session.metadata?.frameworkId,
          tierId: session.metadata?.tierId,
          amount: session.amount_total,
        };
      } catch (error) {
        throw new Error("Failed to verify payment");
      }
    }),

  /**
   * Get pricing for all frameworks
   */
  getPricing: publicProcedure.query(async () => {
    return {
      frameworks: FRAMEWORKS,
      tiers: TIERS,
      products: FRAMEWORKS.flatMap((fw) =>
        TIERS.map((tier) => ({
          frameworkId: fw.id,
          frameworkName: fw.name,
          tierId: tier.id,
          tierName: tier.name,
          price: tier.price,
          priceFormatted: `£${(tier.price / 100).toFixed(2)}`,
          stripePriceId: `price_${fw.id}_${tier.id}`,
        }))
      ),
    };
  }),

  /**
   * Create Stripe product (admin only)
   */
  createProduct: protectedProcedure
    .input(
      z.object({
        frameworkId: z.string(),
        tierId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Add admin check
      if (!ctx.user?.id) throw new Error("User not authenticated");

      const framework = FRAMEWORKS.find((f) => f.id === input.frameworkId);
      const tier = TIERS.find((t) => t.id === input.tierId);

      if (!framework || !tier) throw new Error("Invalid framework or tier");

      // Create product in Stripe
      const product = await getStripe().products.create({
        name: `${framework.name} - ${tier.name}`,
        description: `${framework.description}\n${tier.description}`,
        metadata: {
          frameworkId: framework.id,
          tierId: tier.id,
          region: framework.region,
        },
      });

      // Create price
      const price = await getStripe().prices.create({
        product: product.id,
        unit_amount: tier.price,
        currency: "gbp",
        metadata: {
          frameworkId: framework.id,
          tierId: tier.id,
        },
      });

      return {
        productId: product.id,
        priceId: price.id,
        framework: framework.name,
        tier: tier.name,
      };
    }),

  /**
   * Get Stripe product details
   */
  getProduct: publicProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      try {
        const product = await getStripe().products.retrieve(input.productId);
        return product;
      } catch (error) {
        throw new Error("Product not found");
      }
    }),

  /**
   * List all Stripe products
   */
  listProducts: publicProcedure.query(async () => {
    try {
      const products = await getStripe().products.list({ limit: 100 });
      return products.data;
    } catch (error) {
      throw new Error("Failed to list products");
    }
  }),
});
