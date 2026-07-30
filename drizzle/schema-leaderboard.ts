import { mysqlTable, int, varchar, timestamp, text } from "drizzle-orm/mysql-core";

/**
 * Leaderboard Snapshots
 * Stores periodic snapshots of leaderboard rankings
 */
export const leaderboardSnapshots = mysqlTable("leaderboard_snapshots", {
  id: int().autoincrement().primaryKey(),
  userId: int().notNull(),
  period: varchar({ length: 20 }).notNull(), // 'weekly', 'monthly', 'all_time'
  periodStart: timestamp({ mode: 'string' }).notNull(),
  periodEnd: timestamp({ mode: 'string' }),
  category: varchar({ length: 30 }).notNull(), // 'streak', 'hours', 'badges', 'courses'
  score: int().default(0).notNull(),
  rank: int(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});
