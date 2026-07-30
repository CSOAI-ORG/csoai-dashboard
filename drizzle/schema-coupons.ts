import { mysqlTable, int, varchar, timestamp, decimal } from "drizzle-orm/mysql-core";

export const coupons = mysqlTable("coupons", {
  id: int().autoincrement().notNull(),
  code: varchar({ length: 50 }).notNull().unique(),
  description: varchar({ length: 255 }),
  discountType: varchar({ length: 20 }).notNull(), // 'percentage' or 'fixed'
  discountValue: decimal({ precision: 10, scale: 2 }).notNull(), // 100.00 for 100% off, or fixed amount
  maxUses: int().notNull(), // Total times coupon can be used
  usedCount: int().default(0).notNull(), // How many times it's been used
  expiresAt: timestamp({ mode: 'string' }),
  active: int().default(1).notNull(),
  createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const couponUsage = mysqlTable("coupon_usage", {
  id: int().autoincrement().notNull(),
  couponId: int().notNull(),
  userId: int().notNull(),
  orderId: int(), // Link to order/enrollment
  usedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});
