import { getDb } from '../server/db';
import { courseBundles } from '../drizzle/schema';

async function verifyBundles() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    process.exit(1);
  }

  const bundles = await db.select().from(courseBundles);
  
  console.log('=== Bundle Data ===\n');
  for (const bundle of bundles) {
    console.log(`Bundle: ${bundle.name} (ID: ${bundle.id})`);
    console.log(`  One-time: £${(bundle.bundlePrice / 100).toFixed(2)}`);
    console.log(`    Stripe Price: ${bundle.stripePriceId || 'NOT SET'}`);
    console.log(`  3-month: £${bundle.bundlePrice3Month ? (bundle.bundlePrice3Month / 100).toFixed(2) + '/month' : 'NOT SET'}`);
    console.log(`    Stripe Price: ${bundle.stripePriceId3Month || 'NOT SET'}`);
    console.log(`  6-month: £${bundle.bundlePrice6Month ? (bundle.bundlePrice6Month / 100).toFixed(2) + '/month' : 'NOT SET'}`);
    console.log(`    Stripe Price: ${bundle.stripePriceId6Month || 'NOT SET'}`);
    console.log(`  12-month: £${bundle.bundlePrice12Month ? (bundle.bundlePrice12Month / 100).toFixed(2) + '/month' : 'NOT SET'}`);
    console.log(`    Stripe Price: ${bundle.stripePriceId12Month || 'NOT SET'}`);
    console.log('');
  }

  process.exit(0);
}

verifyBundles().catch(console.error);
