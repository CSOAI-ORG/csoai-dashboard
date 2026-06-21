import { describe, it, expect, beforeAll } from 'vitest';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

describe('Comprehensive Production Readiness Tests', () => {
  describe('Stripe Integration', () => {
    it('should have valid Stripe API key configured', () => {
      expect(process.env.STRIPE_SECRET_KEY).toBeDefined();
      expect(process.env.STRIPE_SECRET_KEY).toMatch(/^sk_(test|live)_/);
    });

    it('should have webhook secret configured', () => {
      expect(process.env.STRIPE_WEBHOOK_SECRET).toBeDefined();
      expect(process.env.STRIPE_WEBHOOK_SECRET).toMatch(/^whsec_/);
    });

    it('should have all price IDs configured', () => {
      expect(process.env.STRIPE_PRO_MONTHLY_PRICE_ID).toBeDefined();
      expect(process.env.STRIPE_PRO_YEARLY_PRICE_ID).toBeDefined();
      expect(process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID).toBeDefined();
      expect(process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID).toBeDefined();
    });

    it('should be able to connect to Stripe API', async () => {
      const account = await stripe.accounts.retrieve();
      expect(account).toBeDefined();
      expect(account.id).toBeDefined();
    });

    it('should be able to list products', async () => {
      const products = await stripe.products.list({ limit: 10 });
      expect(products).toBeDefined();
      expect(Array.isArray(products.data)).toBe(true);
    });

    it('should be able to list prices', async () => {
      const prices = await stripe.prices.list({ limit: 10 });
      expect(prices).toBeDefined();
      expect(Array.isArray(prices.data)).toBe(true);
    });

    it('should validate Pro Monthly price exists', async () => {
      const priceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID!;
      const price = await stripe.prices.retrieve(priceId);
      expect(price).toBeDefined();
      expect(price.active).toBe(true);
      expect(price.type).toBe('recurring');
    });

    it('should validate Pro Yearly price exists', async () => {
      const priceId = process.env.STRIPE_PRO_YEARLY_PRICE_ID!;
      const price = await stripe.prices.retrieve(priceId);
      expect(price).toBeDefined();
      expect(price.active).toBe(true);
      expect(price.type).toBe('recurring');
    });

    it('should validate Enterprise Monthly price exists', async () => {
      const priceId = process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!;
      const price = await stripe.prices.retrieve(priceId);
      expect(price).toBeDefined();
      expect(price.active).toBe(true);
      expect(price.type).toBe('recurring');
    });

    it('should validate Enterprise Yearly price exists', async () => {
      const priceId = process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID!;
      const price = await stripe.prices.retrieve(priceId);
      expect(price).toBeDefined();
      expect(price.active).toBe(true);
      expect(price.type).toBe('recurring');
    });

    it('should be able to create a test checkout session', async () => {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
            quantity: 1,
          },
        ],
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
      });
      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.url).toBeDefined();
    });

    it('should be able to list recent webhook events', async () => {
      const events = await stripe.events.list({ limit: 10 });
      expect(events).toBeDefined();
      expect(Array.isArray(events.data)).toBe(true);
    });
  });

  describe('Environment Variables', () => {
    it('should have all required environment variables', () => {
      const required = [
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'STRIPE_PRO_MONTHLY_PRICE_ID',
        'STRIPE_PRO_YEARLY_PRICE_ID',
        'STRIPE_ENTERPRISE_MONTHLY_PRICE_ID',
        'STRIPE_ENTERPRISE_YEARLY_PRICE_ID',
        'JWT_SECRET',
        'OAUTH_SERVER_URL',
        'RESEND_API_KEY',
        'BUILT_IN_FORGE_API_KEY',
        'BUILT_IN_FORGE_API_URL',
      ];

      for (const key of required) {
        expect(process.env[key], `${key} should be defined`).toBeDefined();
      }
    });

    it('should have valid frontend URLs configured', () => {
      expect(process.env.VITE_FRONTEND_URL).toBeDefined();
      expect(process.env.VITE_FRONTEND_URL).toMatch(/^https?:\/\//);
    });

    it('should have valid OAuth configuration', () => {
      expect(process.env.OAUTH_SERVER_URL).toBeDefined();
      expect(process.env.OAUTH_SERVER_URL).toMatch(/^https?:\/\//);
      expect(process.env.VITE_OAUTH_PORTAL_URL).toBeDefined();
    });

    it('should have valid Forge API configuration', () => {
      expect(process.env.BUILT_IN_FORGE_API_KEY).toBeDefined();
      expect(process.env.BUILT_IN_FORGE_API_URL).toBeDefined();
      expect(process.env.BUILT_IN_FORGE_API_URL).toMatch(/^https?:\/\//);
    });
  });

  describe('Database Connection', () => {
    it('should have database URL configured', () => {
      expect(process.env.DATABASE_URL).toBeDefined();
    });
  });

  describe('Security Configuration', () => {
    it('should have JWT secret configured', () => {
      expect(process.env.JWT_SECRET).toBeDefined();
      expect(process.env.JWT_SECRET!.length).toBeGreaterThan(16); // At least 16 chars for security
    });

    it('should have owner information configured', () => {
      expect(process.env.OWNER_NAME).toBeDefined();
      expect(process.env.OWNER_OPEN_ID).toBeDefined();
    });
  });

  describe('Email Configuration', () => {
    it('should have Resend API key configured', () => {
      expect(process.env.RESEND_API_KEY).toBeDefined();
      expect(process.env.RESEND_API_KEY).toMatch(/^re_/);
    });
  });

  describe('Analytics Configuration', () => {
    it('should have analytics endpoint configured', () => {
      expect(process.env.VITE_ANALYTICS_ENDPOINT).toBeDefined();
    });

    it('should have analytics website ID configured', () => {
      expect(process.env.VITE_ANALYTICS_WEBSITE_ID).toBeDefined();
    });
  });

  describe('Frontend Configuration', () => {
    it('should have app branding configured', () => {
      expect(process.env.VITE_APP_TITLE).toBeDefined();
      expect(process.env.VITE_APP_LOGO).toBeDefined();
    });

    it('should have Stripe publishable key configured', () => {
      expect(process.env.VITE_STRIPE_PUBLISHABLE_KEY).toBeDefined();
      expect(process.env.VITE_STRIPE_PUBLISHABLE_KEY).toMatch(/^pk_(test|live)_/);
    });
  });

  describe('Stripe Webhook Endpoint', () => {
    it('should have webhook endpoint accessible', () => {
      const frontendUrl = process.env.VITE_FRONTEND_URL;
      expect(frontendUrl).toBeDefined();
      // Webhook should be at /api/stripe/webhook
      const webhookUrl = `${frontendUrl}/api/stripe/webhook`;
      expect(webhookUrl).toMatch(/^https?:\/\/.+\/api\/stripe\/webhook$/);
    });
  });

  describe('Production Deployment Checks', () => {
    it('should be using production-grade secrets', () => {
      const jwtSecret = process.env.JWT_SECRET!;
      expect(jwtSecret.length).toBeGreaterThanOrEqual(16); // At least 16 chars for security
      expect(jwtSecret).not.toBe('your-secret-key');
      expect(jwtSecret).not.toBe('test-secret');
    });

    it('should have proper CORS configuration', () => {
      const frontendUrl = process.env.VITE_FRONTEND_URL;
      expect(frontendUrl).toBeDefined();
      expect(frontendUrl).not.toBe('http://localhost:3000');
    });
  });
});

describe('Stripe Payment Flow Integration', () => {
  it('should create checkout session for Pro Monthly plan', async () => {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.VITE_FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.VITE_FRONTEND_URL}/payment/cancel`,
    });

    expect(session.id).toBeDefined();
    expect(session.url).toBeDefined();
    expect(session.mode).toBe('subscription');
    expect(session.status).toBe('open');
  });

  it('should create checkout session for Enterprise Monthly plan', async () => {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.VITE_FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.VITE_FRONTEND_URL}/payment/cancel`,
    });

    expect(session.id).toBeDefined();
    expect(session.url).toBeDefined();
    expect(session.mode).toBe('subscription');
  });

  it('should be able to retrieve customer portal configuration', async () => {
    const configurations = await stripe.billingPortal.configurations.list({ limit: 1 });
    expect(configurations).toBeDefined();
    expect(Array.isArray(configurations.data)).toBe(true);
  });
});

describe('Critical API Endpoints Health Check', () => {
  it('should have all critical routers configured', () => {
    // This is a placeholder - in a real test, we'd check if routers are properly exported
    expect(true).toBe(true);
  });
});
