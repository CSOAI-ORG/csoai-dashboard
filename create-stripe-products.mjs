import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCourseProducts() {
  try {
    console.log('Creating EU AI Act Fundamentals product...');
    
    // Create the product
    const product = await stripe.products.create({
      name: 'EU AI Act Fundamentals',
      description: 'Comprehensive 8-module course covering the EU AI Act with certification upon completion. Learn prohibited practices, high-risk systems, compliance requirements, and implementation timeline.',
      metadata: {
        courseId: 'eu-ai-act-fundamentals',
        level: 'fundamentals',
        framework: 'eu-ai-act',
        region: 'EU'
      }
    });
    
    console.log(`✅ Product created: ${product.id}`);
    
    // Create one-time payment price (€499)
    const priceOneTime = await stripe.prices.create({
      product: product.id,
      unit_amount: 49900, // €499.00
      currency: 'eur',
      nickname: 'One-time payment',
      metadata: {
        paymentType: 'one-time'
      }
    });
    console.log(`✅ One-time price created: ${priceOneTime.id} (€499)`);
    
    // Create 3-month plan (€199/month)
    const price3Month = await stripe.prices.create({
      product: product.id,
      unit_amount: 19900, // €199.00
      currency: 'eur',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      nickname: '3-month plan',
      metadata: {
        paymentType: '3-month',
        totalPayments: '3'
      }
    });
    console.log(`✅ 3-month plan created: ${price3Month.id} (€199/month)`);
    
    // Create 6-month plan (€99/month)
    const price6Month = await stripe.prices.create({
      product: product.id,
      unit_amount: 9900, // €99.00
      currency: 'eur',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      nickname: '6-month plan',
      metadata: {
        paymentType: '6-month',
        totalPayments: '6'
      }
    });
    console.log(`✅ 6-month plan created: ${price6Month.id} (€99/month)`);
    
    // Create 12-month plan (€59/month)
    const price12Month = await stripe.prices.create({
      product: product.id,
      unit_amount: 5900, // €59.00
      currency: 'eur',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      nickname: '12-month plan',
      metadata: {
        paymentType: '12-month',
        totalPayments: '12'
      }
    });
    console.log(`✅ 12-month plan created: ${price12Month.id} (€59/month)`);
    
    // Output SQL to update database
    console.log('\n📋 Copy these price IDs to update the database:\n');
    console.log(`UPDATE courses SET`);
    console.log(`  stripe_price_id = '${priceOneTime.id}',`);
    console.log(`  stripe_price_id_3month = '${price3Month.id}',`);
    console.log(`  stripe_price_id_6month = '${price6Month.id}',`);
    console.log(`  stripe_price_id_12month = '${price12Month.id}'`);
    console.log(`WHERE title = 'EU AI Act Fundamentals';`);
    
  } catch (error) {
    console.error('❌ Error creating Stripe products:', error.message);
    process.exit(1);
  }
}

createCourseProducts();
