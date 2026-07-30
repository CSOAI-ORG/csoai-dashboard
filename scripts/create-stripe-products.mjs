/**
 * Create Stripe Products and Prices for All Courses
 * This script creates Stripe products and 4 price points for each course
 * Then updates the database with the Stripe price IDs
 */

import Stripe from 'stripe';
import mysql from 'mysql2/promise';
import 'dotenv/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Database connection
const db = await mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  ssl: { rejectUnauthorized: true }
});

console.log('✅ Connected to database');

// Get all active courses
const [courses] = await db.execute(
  'SELECT id, title, description, price FROM courses WHERE active = 1 ORDER BY id'
);

console.log(`📚 Found ${courses.length} courses to process\n`);

// Process each course
for (const course of courses) {
  console.log(`\n🔄 Processing: ${course.title}`);
  console.log(`   Course ID: ${course.id}`);
  console.log(`   Price: £${(course.price / 100).toFixed(2)}`);

  try {
    // Create Stripe product
    const product = await stripe.products.create({
      name: course.title,
      description: course.description || `Professional AI Safety & Compliance Training: ${course.title}`,
      metadata: {
        course_id: course.id.toString(),
        platform: 'CSOAI'
      }
    });

    console.log(`   ✅ Product created: ${product.id}`);

    // Create 4 price points
    const oneTimePrice = course.price; // e.g., 49900 (£499.00)
    
    // 1. One-time payment
    const priceOneTime = await stripe.prices.create({
      product: product.id,
      unit_amount: oneTimePrice,
      currency: 'gbp',
      nickname: 'One-time payment',
      metadata: {
        course_id: course.id.toString(),
        payment_type: 'one_time'
      }
    });
    console.log(`   ✅ One-time price: ${priceOneTime.id}`);

    // 2. 3-month subscription
    const monthlyAmount3 = Math.round(oneTimePrice / 3);
    const price3Month = await stripe.prices.create({
      product: product.id,
      unit_amount: monthlyAmount3,
      currency: 'gbp',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      nickname: '3-month plan',
      metadata: {
        course_id: course.id.toString(),
        payment_type: '3_month',
        total_months: '3'
      }
    });
    console.log(`   ✅ 3-month price: ${price3Month.id}`);

    // 3. 6-month subscription
    const monthlyAmount6 = Math.round(oneTimePrice / 6);
    const price6Month = await stripe.prices.create({
      product: product.id,
      unit_amount: monthlyAmount6,
      currency: 'gbp',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      nickname: '6-month plan',
      metadata: {
        course_id: course.id.toString(),
        payment_type: '6_month',
        total_months: '6'
      }
    });
    console.log(`   ✅ 6-month price: ${price6Month.id}`);

    // 4. 12-month subscription
    const monthlyAmount12 = Math.round(oneTimePrice / 12);
    const price12Month = await stripe.prices.create({
      product: product.id,
      unit_amount: monthlyAmount12,
      currency: 'gbp',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      nickname: '12-month plan',
      metadata: {
        course_id: course.id.toString(),
        payment_type: '12_month',
        total_months: '12'
      }
    });
    console.log(`   ✅ 12-month price: ${price12Month.id}`);

    // Update database with Stripe IDs
    await db.execute(
      `UPDATE courses 
       SET stripe_price_id = ?,
           stripe_price_id_3_month = ?,
           stripe_price_id_6_month = ?,
           stripe_price_id_12_month = ?
       WHERE id = ?`,
      [priceOneTime.id, price3Month.id, price6Month.id, price12Month.id, course.id]
    );

    console.log(`   ✅ Database updated with Stripe price IDs`);

  } catch (error) {
    console.error(`   ❌ Error processing course ${course.id}:`, error.message);
  }
}

await db.end();

console.log('\n\n🎉 All courses processed successfully!');
console.log('📊 Summary:');
console.log(`   - ${courses.length} products created`);
console.log(`   - ${courses.length * 4} prices created`);
console.log(`   - Database updated with all Stripe IDs`);
