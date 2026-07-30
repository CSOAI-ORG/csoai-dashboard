#!/usr/bin/env node
/**
 * Stripe Setup Script - Create Products and Prices for Courses
 * Creates Stripe products for all courses and pricing for all payment plans
 * Payment plans: One-time, 3, 6, 9, 12, 24, 36 months
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
});

// Course pricing configuration
const courses = [
  // WATCHDOG COURSES (FREE)
  {
    id: 'watchdog-fundamentals',
    name: 'Watchdog Fundamentals',
    type: 'watchdog',
    price: 0, // FREE
  },
  {
    id: 'watchdog-advanced',
    name: 'Advanced Watchdog Techniques',
    type: 'watchdog',
    price: 0, // FREE
  },
  // CSOAI COURSES (PAID)
  {
    id: 'eu-ai-act-fundamentals',
    name: 'EU AI Act Fundamentals',
    type: 'csoai',
    price: 9900, // $99.00
  },
  {
    id: 'eu-ai-act-advanced',
    name: 'EU AI Act Advanced',
    type: 'csoai',
    price: 14900, // $149.00
  },
  {
    id: 'eu-ai-act-conformity',
    name: 'EU AI Act Conformity Assessment',
    type: 'csoai',
    price: 19900, // $199.00
  },
  {
    id: 'nist-fundamentals',
    name: 'NIST AI RMF Fundamentals',
    type: 'csoai',
    price: 9900, // $99.00
  },
  {
    id: 'nist-advanced',
    name: 'NIST AI RMF Advanced',
    type: 'csoai',
    price: 14900, // $149.00
  },
  {
    id: 'iso-42001',
    name: 'ISO 42001 AI Management System',
    type: 'csoai',
    price: 19900, // $199.00
  },
];

// Payment plan multipliers (monthly subscription prices)
const paymentPlans = {
  one_time: { name: 'One-Time', mode: 'payment' },
  three_month: { name: '3 Months', mode: 'subscription', months: 3 },
  six_month: { name: '6 Months', mode: 'subscription', months: 6 },
  nine_month: { name: '9 Months', mode: 'subscription', months: 9 },
  twelve_month: { name: '12 Months', mode: 'subscription', months: 12 },
  twentyfour_month: { name: '24 Months', mode: 'subscription', months: 24 },
  thirtysix_month: { name: '36 Months', mode: 'subscription', months: 36 },
};

async function setupStripeProducts() {
  console.log('🚀 Starting Stripe product setup...\n');

  const results = [];

  for (const course of courses) {
    console.log(`📚 Setting up: ${course.name}`);

    try {
      // Create product
      const product = await stripe.products.create({
        name: course.name,
        description: `${course.type === 'watchdog' ? 'Watchdog' : 'CSOAI'} Training Course`,
        metadata: {
          courseId: course.id,
          courseType: course.type,
        },
      });

      console.log(`   ✓ Product created: ${product.id}`);

      const stripePriceIds = {};

      // For free courses, skip price creation
      if (course.price === 0) {
        console.log(`   ✓ Free course - no prices needed`);
        results.push({
          courseId: course.id,
          productId: product.id,
          stripePriceIds: { free: true },
        });
        continue;
      }

      // Create prices for each payment plan
      for (const [planKey, planConfig] of Object.entries(paymentPlans)) {
        let priceData;

        if (planConfig.mode === 'payment') {
          // One-time payment
          priceData = {
            product: product.id,
            unit_amount: course.price,
            currency: 'usd',
            type: 'one_time',
            metadata: {
              plan: planKey,
              courseId: course.id,
            },
          };
        } else {
          // Subscription - calculate monthly price
          const monthlyPrice = Math.round(course.price / planConfig.months);
          priceData = {
            product: product.id,
            unit_amount: monthlyPrice,
            currency: 'usd',
            type: 'recurring',
            recurring: {
              interval: 'month',
              interval_count: 1,
              aggregate_usage: 'sum',
            },
            metadata: {
              plan: planKey,
              courseId: course.id,
              totalMonths: planConfig.months.toString(),
            },
          };
        }

        const price = await stripe.prices.create(priceData);
        stripePriceIds[planKey] = price.id;
        console.log(`   ✓ Price created (${planConfig.name}): ${price.id}`);
      }

      results.push({
        courseId: course.id,
        productId: product.id,
        stripePriceIds,
      });
    } catch (error) {
      console.error(`   ✗ Error setting up ${course.name}:`, error.message);
      results.push({
        courseId: course.id,
        error: error.message,
      });
    }
  }

  console.log('\n✅ Stripe setup complete!\n');
  console.log('📋 Results:');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

// Run setup
setupStripeProducts().catch(console.error);
