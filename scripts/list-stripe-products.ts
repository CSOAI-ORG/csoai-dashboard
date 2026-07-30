import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function listProducts() {
  const products = await stripe.products.list({ limit: 100 });
  
  console.log("=== All Stripe Products ===");
  for (const product of products.data) {
    console.log(`\nProduct: ${product.name} (${product.id})`);
    console.log(`  Active: ${product.active}`);
    
    const prices = await stripe.prices.list({ product: product.id, limit: 10 });
    for (const price of prices.data) {
      console.log(`  Price: ${price.id}`);
      console.log(`    Amount: ${price.unit_amount! / 100} ${price.currency.toUpperCase()}`);
      console.log(`    Type: ${price.type}`);
      if (price.recurring) {
        console.log(`    Recurring: ${price.recurring.interval_count} ${price.recurring.interval}(s)`);
      }
    }
  }
}

listProducts().catch(console.error);
