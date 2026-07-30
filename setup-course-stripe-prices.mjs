/**
 * Setup Stripe Products and Prices for Courses
 * Creates Stripe products/prices and updates database with price IDs
 */

import Stripe from 'stripe';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { courses } from './drizzle/schema.ts';
import { eq, ne } from 'drizzle-orm';
import 'dotenv/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Connect to database
const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

console.log('🚀 Starting Stripe product and price setup for courses...\n');

// Get all paid courses (not Watchdog)
const paidCourses = await db
  .select()
  .from(courses)
  .where(ne(courses.framework, 'watchdog'));

console.log(`Found ${paidCourses.length} paid courses to set up\n`);

for (const course of paidCourses) {
  console.log(`\n📚 Processing: ${course.title}`);
  console.log(`   Framework: ${course.framework}`);
  
  try {
    // Create Stripe product
    const product = await stripe.products.create({
      name: course.title,
      description: course.description || `${course.framework} compliance training course`,
      metadata: {
        courseId: course.id.toString(),
        framework: course.framework || 'general',
        level: course.level || 'fundamentals',
      },
    });
    
    console.log(`   ✅ Product created: ${product.id}`);
    
    // Create prices for different payment plans
    // One-time payment
    const oneTimePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round((course.price || 299) * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        courseId: course.id.toString(),
        paymentType: 'one_time',
      },
    });
    console.log(`   💰 One-time price: ${oneTimePrice.id} ($${course.price || 299})`);
    
    // 3-month subscription
    const threeMonthPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(((course.price || 299) / 3) * 100), // Divide by 3 months
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      metadata: {
        courseId: course.id.toString(),
        paymentType: '3_month',
        totalMonths: '3',
      },
    });
    console.log(`   💰 3-month price: ${threeMonthPrice.id} ($${Math.round((course.price || 299) / 3)}/mo)`);
    
    // 6-month subscription
    const sixMonthPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(((course.price || 299) / 6) * 100), // Divide by 6 months
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      metadata: {
        courseId: course.id.toString(),
        paymentType: '6_month',
        totalMonths: '6',
      },
    });
    console.log(`   💰 6-month price: ${sixMonthPrice.id} ($${Math.round((course.price || 299) / 6)}/mo)`);
    
    // 12-month subscription
    const twelveMonthPrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(((course.price || 299) / 12) * 100), // Divide by 12 months
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      metadata: {
        courseId: course.id.toString(),
        paymentType: '12_month',
        totalMonths: '12',
      },
    });
    console.log(`   💰 12-month price: ${twelveMonthPrice.id} ($${Math.round((course.price || 299) / 12)}/mo)`);
    
    // Update course with Stripe price IDs
    await db
      .update(courses)
      .set({
        stripeProductId: product.id,
        stripePriceId: oneTimePrice.id,
        stripePriceId3Month: threeMonthPrice.id,
        stripePriceId6Month: sixMonthPrice.id,
        stripePriceId12Month: twelveMonthPrice.id,
      })
      .where(eq(courses.id, course.id));
    
    console.log(`   ✅ Database updated with price IDs`);
    
  } catch (error) {
    console.error(`   ❌ Error processing course ${course.id}:`, error.message);
  }
}

await connection.end();

console.log('\n\n✅ Stripe setup complete! All paid courses now have payment options.');
console.log('🎉 Users can now enroll in courses with flexible payment plans.\n');
