/**
 * Test Stripe Price IDs Configuration
 * Validates that the configured price IDs exist in Stripe
 */

import { describe, it, expect } from "vitest";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-02-25.clover",
});

describe("Stripe Price IDs", () => {
  it("should have valid Pro Monthly price ID", async () => {
    const priceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID;
    expect(priceId).toBeDefined();
    
    const price = await stripe.prices.retrieve(priceId!);
    expect(price).toBeDefined();
    expect(price.active).toBe(true);
    expect(price.currency).toBe("gbp");
    expect(price.recurring?.interval).toBe("month");
    expect(price.unit_amount).toBe(3900); // £39.00
  });

  it("should have valid Pro Yearly price ID", async () => {
    const priceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID;
    expect(priceId).toBeDefined();
    
    const price = await stripe.prices.retrieve(priceId!);
    expect(price).toBeDefined();
    expect(price.active).toBe(true);
    expect(price.currency).toBe("gbp");
    expect(price.recurring?.interval).toBe("year");
    expect(price.unit_amount).toBe(38900); // £389.00
  });

  it("should have valid Enterprise Monthly price ID", async () => {
    const priceId = process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID;
    expect(priceId).toBeDefined();
    
    const price = await stripe.prices.retrieve(priceId!);
    expect(price).toBeDefined();
    expect(price.active).toBe(true);
    expect(price.currency).toBe("gbp");
    expect(price.recurring?.interval).toBe("month");
    expect(price.unit_amount).toBe(15900); // £159.00
  });

  it("should have valid Enterprise Yearly price ID", async () => {
    const priceId = process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID;
    expect(priceId).toBeDefined();
    
    const price = await stripe.prices.retrieve(priceId!);
    expect(price).toBeDefined();
    expect(price.active).toBe(true);
    expect(price.currency).toBe("gbp");
    expect(price.recurring?.interval).toBe("year");
    expect(price.unit_amount).toBe(158500); // £1,585.00
  });
});
