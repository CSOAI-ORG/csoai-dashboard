/**
 * Create subscription prices for bundles
 * 
 * Bundle pricing:
 * - Foundation Bundle (3 Core Frameworks): £999 one-time
 *   - 3-month: £333/month (3 payments)
 *   - 6-month: £166.50/month (6 payments)
 *   - 12-month: £83.25/month (12 payments)
 * 
 * - Complete Certification (All 7 Modules): £1,999 one-time
 *   - 3-month: £666.33/month (3 payments)
 *   - 6-month: £333.17/month (6 payments)
 *   - 12-month: £166.58/month (12 payments)
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Bundle product IDs from Stripe
const FOUNDATION_BUNDLE_PRODUCT_ID = 'prod_TiW9A5d8Lods4d';
const COMPLETE_BUNDLE_PRODUCT_ID = 'prod_TiW9rFtS2P974w';

async function createSubscriptionPrices() {
  console.log('Creating subscription prices for bundles...\n');

  // Foundation Bundle - £999 total
  // 3-month: £333/month
  const foundationBundle3Month = await stripe.prices.create({
    product: FOUNDATION_BUNDLE_PRODUCT_ID,
    unit_amount: 33300, // £333.00 in pence
    currency: 'gbp',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: {
      bundle_type: 'foundation',
      payment_plan: '3_month',
      total_payments: '3',
    },
  });
  console.log(`Foundation Bundle 3-month: ${foundationBundle3Month.id} (£333/month)`);

  // 6-month: £166.50/month
  const foundationBundle6Month = await stripe.prices.create({
    product: FOUNDATION_BUNDLE_PRODUCT_ID,
    unit_amount: 16650, // £166.50 in pence
    currency: 'gbp',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: {
      bundle_type: 'foundation',
      payment_plan: '6_month',
      total_payments: '6',
    },
  });
  console.log(`Foundation Bundle 6-month: ${foundationBundle6Month.id} (£166.50/month)`);

  // 12-month: £83.25/month
  const foundationBundle12Month = await stripe.prices.create({
    product: FOUNDATION_BUNDLE_PRODUCT_ID,
    unit_amount: 8325, // £83.25 in pence
    currency: 'gbp',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: {
      bundle_type: 'foundation',
      payment_plan: '12_month',
      total_payments: '12',
    },
  });
  console.log(`Foundation Bundle 12-month: ${foundationBundle12Month.id} (£83.25/month)`);

  // Complete Bundle - £1,999 total
  // 3-month: £666.33/month
  const completeBundle3Month = await stripe.prices.create({
    product: COMPLETE_BUNDLE_PRODUCT_ID,
    unit_amount: 66633, // £666.33 in pence
    currency: 'gbp',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: {
      bundle_type: 'complete',
      payment_plan: '3_month',
      total_payments: '3',
    },
  });
  console.log(`Complete Bundle 3-month: ${completeBundle3Month.id} (£666.33/month)`);

  // 6-month: £333.17/month
  const completeBundle6Month = await stripe.prices.create({
    product: COMPLETE_BUNDLE_PRODUCT_ID,
    unit_amount: 33317, // £333.17 in pence
    currency: 'gbp',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: {
      bundle_type: 'complete',
      payment_plan: '6_month',
      total_payments: '6',
    },
  });
  console.log(`Complete Bundle 6-month: ${completeBundle6Month.id} (£333.17/month)`);

  // 12-month: £166.58/month
  const completeBundle12Month = await stripe.prices.create({
    product: COMPLETE_BUNDLE_PRODUCT_ID,
    unit_amount: 16658, // £166.58 in pence
    currency: 'gbp',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: {
      bundle_type: 'complete',
      payment_plan: '12_month',
      total_payments: '12',
    },
  });
  console.log(`Complete Bundle 12-month: ${completeBundle12Month.id} (£166.58/month)`);

  console.log('\n=== Summary ===');
  console.log('\nFoundation Bundle (prod_TiW9A5d8Lods4d):');
  console.log(`  3-month: ${foundationBundle3Month.id}`);
  console.log(`  6-month: ${foundationBundle6Month.id}`);
  console.log(`  12-month: ${foundationBundle12Month.id}`);
  
  console.log('\nComplete Bundle (prod_TiW9rFtS2P974w):');
  console.log(`  3-month: ${completeBundle3Month.id}`);
  console.log(`  6-month: ${completeBundle6Month.id}`);
  console.log(`  12-month: ${completeBundle12Month.id}`);

  console.log('\n=== SQL Update Commands ===');
  console.log(`
-- Foundation Bundle (id=1)
UPDATE course_bundles 
SET 
  bundlePrice3Month = 33300,
  bundlePrice6Month = 16650,
  bundlePrice12Month = 8325,
  stripePriceId3Month = '${foundationBundle3Month.id}',
  stripePriceId6Month = '${foundationBundle6Month.id}',
  stripePriceId12Month = '${foundationBundle12Month.id}'
WHERE name LIKE '%Foundation%';

-- Complete Bundle (id=2)
UPDATE course_bundles 
SET 
  bundlePrice3Month = 66633,
  bundlePrice6Month = 33317,
  bundlePrice12Month = 16658,
  stripePriceId3Month = '${completeBundle3Month.id}',
  stripePriceId6Month = '${completeBundle6Month.id}',
  stripePriceId12Month = '${completeBundle12Month.id}'
WHERE name LIKE '%Complete%';
  `);
}

createSubscriptionPrices().catch(console.error);
