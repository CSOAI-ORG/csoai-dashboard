#!/usr/bin/env node
/**
 * Comprehensive Stripe Payment Testing Script
 * Tests all subscription tiers with promotion codes
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Test configuration
const PROMO_CODES = {
  'pro-monthly': 'TEST-PRO-MONTHLY',
  'pro-yearly': 'TEST-PRO-YEARLY',
  'enterprise-monthly': 'TEST-ENT-MONTHLY',
  'enterprise-yearly': 'TEST-ENT-YEARLY'
};

const PRICE_IDS = {
  'pro-monthly': process.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID || process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  'pro-yearly': process.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID || process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  'enterprise-monthly': process.env.VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
  'enterprise-yearly': process.env.VITE_STRIPE_ENTERPRISE_YEARLY_PRICE_ID || process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID
};

// Test results storage
const testResults = [];

/**
 * Create a test customer
 */
async function createTestCustomer(email) {
  try {
    const customer = await stripe.customers.create({
      email,
      name: `Test Customer ${Date.now()}`,
      metadata: {
        test: 'true',
        created_by: 'automated_test'
      }
    });
    console.log(`✓ Created test customer: ${customer.id} (${email})`);
    return customer;
  } catch (error) {
    console.error(`✗ Failed to create customer: ${error.message}`);
    throw error;
  }
}

/**
 * Create a checkout session with promo code
 */
async function createCheckoutSession(customer, tier, promoCode, priceId) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      discounts: [{
        promotion_code: promoCode
      }],
      success_url: 'https://coai-dash-k34vnbtb.manus.space/settings/billing?success=true',
      cancel_url: 'https://coai-dash-k34vnbtb.manus.space/pricing?canceled=true',
      allow_promotion_codes: true,
      metadata: {
        tier,
        test: 'true'
      }
    });
    
    console.log(`✓ Created checkout session: ${session.id}`);
    console.log(`  URL: ${session.url}`);
    console.log(`  Amount Total: £${(session.amount_total || 0) / 100}`);
    console.log(`  Amount Subtotal: £${(session.amount_subtotal || 0) / 100}`);
    
    return session;
  } catch (error) {
    console.error(`✗ Failed to create checkout session: ${error.message}`);
    throw error;
  }
}

/**
 * Retrieve promotion code details
 */
async function getPromoCodeDetails(code) {
  try {
    const promoCodes = await stripe.promotionCodes.list({
      code,
      limit: 1
    });
    
    if (promoCodes.data.length === 0) {
      throw new Error(`Promotion code ${code} not found`);
    }
    
    return promoCodes.data[0];
  } catch (error) {
    console.error(`✗ Failed to retrieve promo code: ${error.message}`);
    throw error;
  }
}

/**
 * Test a single subscription tier
 */
async function testSubscriptionTier(tier, promoCodeName, priceId) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${tier.toUpperCase()}`);
  console.log(`${'='.repeat(60)}`);
  
  const result = {
    tier,
    promoCode: promoCodeName,
    success: false,
    checkoutSessionId: null,
    amountTotal: null,
    amountSubtotal: null,
    discount: null,
    error: null
  };
  
  try {
    // Step 1: Verify promo code exists
    console.log(`\n1. Verifying promotion code: ${promoCodeName}`);
    const promoCode = await getPromoCodeDetails(promoCodeName);
    console.log(`✓ Promo code found: ${promoCode.id}`);
    console.log(`  Active: ${promoCode.active}`);
    console.log(`  Promotion Type: ${promoCode.promotion?.type}`);
    console.log(`  Coupon: ${promoCode.promotion?.coupon}`);
    
    // Step 2: Create test customer
    console.log(`\n2. Creating test customer`);
    const email = `test-${tier}-${Date.now()}@example.com`;
    const customer = await createTestCustomer(email);
    
    // Step 3: Create checkout session with promo code
    console.log(`\n3. Creating checkout session with promo code`);
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      discounts: [{
        promotion_code: promoCode.id
      }],
      success_url: 'https://coai-dash-k34vnbtb.manus.space/settings/billing?success=true',
      cancel_url: 'https://coai-dash-k34vnbtb.manus.space/pricing?canceled=true',
      metadata: {
        tier,
        test: 'true',
        promo_code: promoCodeName
      }
    });
    
    result.checkoutSessionId = session.id;
    result.amountTotal = session.amount_total;
    result.amountSubtotal = session.amount_subtotal;
    result.discount = session.total_details?.amount_discount || 0;
    
    console.log(`✓ Checkout session created successfully`);
    console.log(`  Session ID: ${session.id}`);
    console.log(`  Checkout URL: ${session.url}`);
    console.log(`  Amount Subtotal: £${(session.amount_subtotal || 0) / 100}`);
    console.log(`  Discount: £${(session.total_details?.amount_discount || 0) / 100}`);
    console.log(`  Amount Total: £${(session.amount_total || 0) / 100}`);
    
    // Verify $0.00 payment
    if (session.amount_total === 0) {
      console.log(`✓ SUCCESS: Payment amount is £0.00 (100% discount applied)`);
      result.success = true;
    } else {
      console.log(`✗ FAILED: Expected £0.00 but got £${(session.amount_total || 0) / 100}`);
      result.error = `Expected £0.00 but got £${(session.amount_total || 0) / 100}`;
    }
    
    // Step 4: Clean up test customer
    console.log(`\n4. Cleaning up test customer`);
    await stripe.customers.del(customer.id);
    console.log(`✓ Test customer deleted`);
    
  } catch (error) {
    console.error(`\n✗ Test failed: ${error.message}`);
    result.error = error.message;
  }
  
  testResults.push(result);
  return result;
}

/**
 * Print summary report
 */
function printSummary() {
  console.log(`\n\n${'='.repeat(60)}`);
  console.log(`TEST SUMMARY`);
  console.log(`${'='.repeat(60)}\n`);
  
  const passed = testResults.filter(r => r.success).length;
  const failed = testResults.filter(r => !r.success).length;
  
  console.log(`Total Tests: ${testResults.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}\n`);
  
  console.log(`Detailed Results:`);
  console.log(`${'─'.repeat(60)}`);
  
  testResults.forEach((result, index) => {
    const status = result.success ? '✓ PASS' : '✗ FAIL';
    const color = result.success ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    console.log(`\n${index + 1}. ${result.tier.toUpperCase()}`);
    console.log(`   Status: ${color}${status}${reset}`);
    console.log(`   Promo Code: ${result.promoCode}`);
    console.log(`   Checkout Session: ${result.checkoutSessionId || 'N/A'}`);
    
    if (result.amountTotal !== null) {
      console.log(`   Amount Subtotal: £${(result.amountSubtotal || 0) / 100}`);
      console.log(`   Discount: £${(result.discount || 0) / 100}`);
      console.log(`   Amount Total: £${(result.amountTotal || 0) / 100}`);
    }
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n${'='.repeat(60)}\n`);
  
  if (failed === 0) {
    console.log(`\x1b[32m✓ ALL TESTS PASSED!\x1b[0m`);
    console.log(`All subscription tiers can be purchased with £0.00 using promo codes.`);
  } else {
    console.log(`\x1b[31m✗ SOME TESTS FAILED\x1b[0m`);
    console.log(`Please review the errors above and fix the issues.`);
  }
}

/**
 * Main test execution
 */
async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`STRIPE PAYMENT END-TO-END TESTING`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\nTesting all subscription tiers with 100% off promo codes`);
  console.log(`Coupon: ruQdaYaM (100% off forever)\n`);
  
  // Verify environment variables
  console.log(`Checking environment variables...`);
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error(`✗ STRIPE_SECRET_KEY not found in environment`);
    process.exit(1);
  }
  console.log(`✓ STRIPE_SECRET_KEY found`);
  
  // Verify price IDs
  console.log(`\nVerifying price IDs...`);
  for (const [tier, priceId] of Object.entries(PRICE_IDS)) {
    if (!priceId) {
      console.error(`✗ Price ID for ${tier} not found in environment`);
      process.exit(1);
    }
    console.log(`✓ ${tier}: ${priceId}`);
  }
  
  // Run tests for each tier
  await testSubscriptionTier('pro-monthly', PROMO_CODES['pro-monthly'], PRICE_IDS['pro-monthly']);
  await testSubscriptionTier('pro-yearly', PROMO_CODES['pro-yearly'], PRICE_IDS['pro-yearly']);
  await testSubscriptionTier('enterprise-monthly', PROMO_CODES['enterprise-monthly'], PRICE_IDS['enterprise-monthly']);
  await testSubscriptionTier('enterprise-yearly', PROMO_CODES['enterprise-yearly'], PRICE_IDS['enterprise-yearly']);
  
  // Print summary
  printSummary();
  
  // Exit with appropriate code
  const failed = testResults.filter(r => !r.success).length;
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
main().catch(error => {
  console.error(`\n✗ Fatal error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
