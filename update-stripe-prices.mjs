import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

// Database connection
const connection = await mysql.createConnection(process.env.DATABASE_URL);

const db = drizzle(connection, { schema, mode: 'default' });

// Stripe price IDs for each course
const courseStripeData = [
  {
    id: 1, // EU AI Act Fundamentals
    stripeProductId: 'prod_TfW0EWT7kcccZD',
    stripePriceIdOneTime: 'price_1Sl2FaPQoWxXkjBZikPsHDzO',
    stripePriceId3Month: 'price_1Sl2FfPQoWxXkjBZ35sqQ0R6',
    stripePriceId6Month: 'price_1Sl2FjPQoWxXkjBZWsZWjUOC',
    stripePriceId12Month: 'price_1Sl2FoPQoWxXkjBZJIdyNTQE',
  },
  {
    id: 2, // NIST AI RMF Fundamentals
    stripeProductId: 'prod_TiTB5y1L9N8OJ0',
    stripePriceIdOneTime: 'price_1Sl2FsPQoWxXkjBZXS48jcJl',
    stripePriceId3Month: 'price_1Sl2FxPQoWxXkjBZr7R1cjKw',
    stripePriceId6Month: 'price_1Sl2G2PQoWxXkjBZCz85uk0P',
    stripePriceId12Month: 'price_1Sl2G6PQoWxXkjBZsm8G58fB',
  },
  {
    id: 3, // ISO 42001 Fundamentals
    stripeProductId: 'prod_TiTBaTjS6uC9up',
    stripePriceIdOneTime: 'price_1Sl2GBPQoWxXkjBZHRtPgfgo',
    stripePriceId3Month: 'price_1Sl2GFPQoWxXkjBZAFdj2prD',
    stripePriceId6Month: 'price_1Sl2GJPQoWxXkjBZisJWaDtO',
    stripePriceId12Month: 'price_1Sl2GOPQoWxXkjBZfpOPrPio',
  },
];

console.log('Updating courses with Stripe price IDs...\n');

for (const courseData of courseStripeData) {
  const { id, ...stripeData } = courseData;
  
  try {
    await db.update(schema.courses)
      .set(stripeData)
      .where(eq(schema.courses.id, id));
    
    console.log(`✓ Updated course ID ${id} with Stripe data`);
    console.log(`  Product: ${stripeData.stripeProductId}`);
    console.log(`  One-time: ${stripeData.stripePriceIdOneTime}`);
    console.log(`  3-month: ${stripeData.stripePriceId3Month}`);
    console.log(`  6-month: ${stripeData.stripePriceId6Month}`);
    console.log(`  12-month: ${stripeData.stripePriceId12Month}\n`);
  } catch (error) {
    console.error(`✗ Failed to update course ID ${id}:`, error.message);
  }
}

console.log('Database update complete!');
await connection.end();
