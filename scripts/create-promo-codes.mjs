/**
 * Create Stripe promo codes for testing live payments
 */
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-02-25.clover',
});

async function createPromoCodes() {
  try {
    console.log('Creating promo codes for testing...\n');

    // Create a 100% off coupon for testing
    const testCoupon = await stripe.coupons.create({
      percent_off: 100,
      duration: 'once',
      name: 'Test Payment - 100% Off',
      metadata: {
        purpose: 'testing',
        created_by: 'script'
      }
    });

    console.log(`✅ Created test coupon: ${testCoupon.id}`);

    // Create promo codes for each tier
    const tiers = [
      { name: 'Pro Monthly', priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID },
      { name: 'Pro Yearly', priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID },
      { name: 'Enterprise Monthly', priceId: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID },
      { name: 'Enterprise Yearly', priceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID },
    ];

    const promoCodes = [];

    for (const tier of tiers) {
      const code = `TEST${tier.name.replace(/\s+/g, '').toUpperCase()}`;
      
      const promoCode = await stripe.promotionCodes.create({
        coupon: testCoupon.id,
        code: code,
        max_redemptions: 50,
        metadata: {
          tier: tier.name,
          priceId: tier.priceId,
          purpose: 'testing'
        }
      });

      promoCodes.push({
        code: promoCode.code,
        tier: tier.name,
        priceId: tier.priceId
      });

      console.log(`✅ Created promo code: ${promoCode.code} for ${tier.name}`);
    }

    console.log('\n📋 Promo Codes Summary:');
    console.log('═'.repeat(60));
    promoCodes.forEach(pc => {
      console.log(`${pc.code.padEnd(30)} → ${pc.tier}`);
    });
    console.log('═'.repeat(60));

    console.log('\n💡 Usage Instructions:');
    console.log('1. Go to the deployed domain: https://coai-dash-k34vnbtb.manus.space');
    console.log('2. Navigate to Settings → Payment');
    console.log('3. Click "Upgrade to Pro" or "Upgrade to Enterprise"');
    console.log('4. Enter one of the promo codes above at checkout');
    console.log('5. Complete the payment (will be $0.00 with 100% discount)');
    console.log('6. Verify webhook receives the event and updates database\n');

  } catch (error) {
    console.error('❌ Error creating promo codes:', error.message);
    process.exit(1);
  }
}

createPromoCodes();
