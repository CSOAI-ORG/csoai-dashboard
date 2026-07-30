/**
 * Create CEASAI GBP Stripe Products
 * 
 * Creates Stripe products for the three CEASAI certification tiers:
 * - Fundamentals: £499 (or £42/month for 12 months)
 * - Advanced: £999 (or £84/month for 12 months)
 * - Expert: £1,999 (or £167/month for 12 months)
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const CEASAI_PRODUCTS = [
  {
    name: 'CEASAI Fundamentals',
    description: 'EU AI Act Essentials - 6 weeks, 10 modules, 100 exam questions. Perfect for beginners.',
    metadata: {
      tier: 'fundamentals',
      duration: '6 weeks',
      modules: '10',
      questions: '100',
      certificateValidity: '1 year',
    },
    prices: {
      oneTime: 49900, // £499
      monthly12: 4200, // £42/month for 12 months = £504
      monthly24: 2100, // £21/month for 24 months = £504
      monthly36: 1400, // £14/month for 36 months = £504
    },
  },
  {
    name: 'CEASAI Advanced',
    description: 'Professional Certification - 12 weeks, 20 modules, 200 exam questions. For professionals.',
    metadata: {
      tier: 'advanced',
      duration: '12 weeks',
      modules: '20',
      questions: '200',
      certificateValidity: '2 years',
    },
    prices: {
      oneTime: 99900, // £999
      monthly12: 8400, // £84/month for 12 months = £1,008
      monthly24: 4200, // £42/month for 24 months = £1,008
      monthly36: 2800, // £28/month for 36 months = £1,008
    },
  },
  {
    name: 'CEASAI Expert',
    description: 'Specialist Certification - 16 weeks, 30 modules, 300 exam questions. Regulatory-level expertise.',
    metadata: {
      tier: 'expert',
      duration: '16 weeks',
      modules: '30',
      questions: '300',
      certificateValidity: '3 years',
    },
    prices: {
      oneTime: 199900, // £1,999
      monthly12: 16700, // £167/month for 12 months = £2,004
      monthly24: 8400, // £84/month for 24 months = £2,016
      monthly36: 5600, // £56/month for 36 months = £2,016
    },
  },
];

async function createProducts() {
  console.log('🚀 Creating CEASAI GBP Stripe Products...\n');
  
  const results = [];
  
  for (const productDef of CEASAI_PRODUCTS) {
    console.log(`📦 Creating ${productDef.name}...`);
    
    // Create the product
    const product = await stripe.products.create({
      name: productDef.name,
      description: productDef.description,
      metadata: {
        ...productDef.metadata,
        framework: 'ceasai',
        currency: 'gbp',
      },
    });
    
    console.log(`  ✅ Product created: ${product.id}`);
    
    // Create one-time price
    const priceOneTime = await stripe.prices.create({
      product: product.id,
      unit_amount: productDef.prices.oneTime,
      currency: 'gbp',
      nickname: 'One-time payment',
      metadata: {
        paymentType: 'one-time',
        tier: productDef.metadata.tier,
      },
    });
    console.log(`  ✅ One-time price: £${productDef.prices.oneTime / 100} | ${priceOneTime.id}`);
    
    // Create 12-month plan
    const price12Month = await stripe.prices.create({
      product: product.id,
      unit_amount: productDef.prices.monthly12,
      currency: 'gbp',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      nickname: '12-month plan',
      metadata: {
        paymentType: '12-month',
        totalPayments: '12',
        tier: productDef.metadata.tier,
      },
    });
    console.log(`  ✅ 12-month plan: £${productDef.prices.monthly12 / 100}/mo | ${price12Month.id}`);
    
    // Create 24-month plan
    const price24Month = await stripe.prices.create({
      product: product.id,
      unit_amount: productDef.prices.monthly24,
      currency: 'gbp',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      nickname: '24-month plan',
      metadata: {
        paymentType: '24-month',
        totalPayments: '24',
        tier: productDef.metadata.tier,
      },
    });
    console.log(`  ✅ 24-month plan: £${productDef.prices.monthly24 / 100}/mo | ${price24Month.id}`);
    
    // Create 36-month plan
    const price36Month = await stripe.prices.create({
      product: product.id,
      unit_amount: productDef.prices.monthly36,
      currency: 'gbp',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      nickname: '36-month plan',
      metadata: {
        paymentType: '36-month',
        totalPayments: '36',
        tier: productDef.metadata.tier,
      },
    });
    console.log(`  ✅ 36-month plan: £${productDef.prices.monthly36 / 100}/mo | ${price36Month.id}`);
    
    results.push({
      tier: productDef.metadata.tier,
      productId: product.id,
      priceIds: {
        oneTime: priceOneTime.id,
        monthly12: price12Month.id,
        monthly24: price24Month.id,
        monthly36: price36Month.id,
      },
    });
    
    console.log('');
  }
  
  console.log('\n📋 Summary - Copy these IDs for configuration:\n');
  console.log(JSON.stringify(results, null, 2));
  
  console.log('\n🎉 All CEASAI GBP products created successfully!');
  
  return results;
}

createProducts().catch(console.error);
