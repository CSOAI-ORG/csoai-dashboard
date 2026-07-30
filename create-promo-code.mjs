import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { coupons } from './drizzle/schema-coupons.ts';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const db = drizzle(connection);

// Create FOUNDING10K promo code - 100% off for first 10,000 uses
const result = await db.insert(coupons).values({
  code: 'FOUNDING10K',
  description: 'Founding member offer - Free training for first 10,000 users',
  discountType: 'percentage',
  discountValue: '100.00',
  maxUses: 10000,
  usedCount: 0,
  active: 1,
  expiresAt: null, // No expiration
});

console.log('✅ Promo code FOUNDING10K created successfully!');
console.log('Details: 100% discount, max 10,000 uses, no expiration');

await connection.end();
