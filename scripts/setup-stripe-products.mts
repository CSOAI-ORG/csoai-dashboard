import Stripe from 'stripe';
import { getDb } from '../server/db';
import { courses, courseBundles } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

async function setupStripeProducts() {
  console.log('🚀 Setting up Stripe products and prices...\n');
  
  const db = await getDb();
  
  // Get all courses
  const allCourses = await db.select().from(courses).where(eq(courses.active, 1));
  console.log(`📚 Found ${allCourses.length} courses\n`);
  
  // Create Stripe products and prices for each course
  for (const course of allCourses) {
    try {
      console.log(`Creating product for: ${course.title}`);
      
      // Create product
      const product = await stripe.products.create({
        name: course.title,
        description: course.description || undefined,
        metadata: {
          courseId: course.id.toString(),
          framework: course.framework || '',
          type: 'course',
        },
      });
      
      // Create price (one-time payment)
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: course.price, // Already in pence
        currency: 'gbp',
        metadata: {
          courseId: course.id.toString(),
        },
      });
      
      // Update course with Stripe price ID
      await db
        .update(courses)
        .set({ stripePriceId: price.id })
        .where(eq(courses.id, course.id));
      
      console.log(`  ✅ Created product ${product.id} and price ${price.id}\n`);
      
    } catch (error: any) {
      console.error(`  ❌ Error creating product for ${course.title}:`, error.message);
    }
  }
  
  // Get all bundles
  const allBundles = await db.select().from(courseBundles).where(eq(courseBundles.active, 1));
  console.log(`\n📦 Found ${allBundles.length} bundles\n`);
  
  // Create Stripe products and prices for each bundle
  for (const bundle of allBundles) {
    try {
      console.log(`Creating product for: ${bundle.name}`);
      
      // Create product
      const product = await stripe.products.create({
        name: bundle.name,
        description: bundle.description || undefined,
        metadata: {
          bundleId: bundle.id.toString(),
          type: 'bundle',
        },
      });
      
      // Create price (one-time payment)
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: bundle.bundlePrice, // Already in pence
        currency: 'gbp',
        metadata: {
          bundleId: bundle.id.toString(),
        },
      });
      
      // Update bundle with Stripe price ID
      await db
        .update(courseBundles)
        .set({ stripePriceId: price.id })
        .where(eq(courseBundles.id, bundle.id));
      
      console.log(`  ✅ Created product ${product.id} and price ${price.id}\n`);
      
    } catch (error: any) {
      console.error(`  ❌ Error creating product for ${bundle.name}:`, error.message);
    }
  }
  
  console.log('\n✨ Stripe setup complete!');
}

setupStripeProducts().catch(console.error);
