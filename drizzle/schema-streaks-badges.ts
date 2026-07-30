import { mysqlTable, int, varchar, timestamp, text, boolean } from "drizzle-orm/mysql-core";

/**
 * User Learning Streaks
 * Tracks daily learning activity and streak counts
 */
export const userStreaks = mysqlTable("user_streaks", {
  id: int().autoincrement().primaryKey(),
  userId: int().notNull(),
  currentStreak: int().default(0).notNull(), // Current consecutive days
  longestStreak: int().default(0).notNull(), // All-time longest streak
  lastActivityDate: timestamp({ mode: 'string' }), // Last day user was active
  totalActiveDays: int().default(0).notNull(), // Total days with activity
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

/**
 * Badge Definitions
 * Defines all available badges in the system
 */
export const badges = mysqlTable("badges", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  description: text(),
  category: varchar({ length: 50 }).notNull(), // 'completion', 'streak', 'time', 'special'
  icon: varchar({ length: 50 }), // Icon identifier (emoji or icon name)
  color: varchar({ length: 20 }), // Badge color theme
  requirement: text(), // JSON string describing requirement
  points: int().default(0), // Points awarded for earning this badge
  isActive: boolean().default(true),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

/**
 * User Badges
 * Tracks which badges users have earned
 */
export const userBadges = mysqlTable("user_badges", {
  id: int().autoincrement().primaryKey(),
  userId: int().notNull(),
  badgeId: int().notNull(),
  earnedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  progress: int().default(0), // Progress towards badge (0-100)
  metadata: text(), // JSON string with additional data (e.g., which course, date)
});

/**
 * Daily Activity Log
 * Tracks user activity by date for streak calculation
 */
export const dailyActivityLog = mysqlTable("daily_activity_log", {
  id: int().autoincrement().primaryKey(),
  userId: int().notNull(),
  activityDate: varchar({ length: 10 }).notNull(), // YYYY-MM-DD format
  minutesSpent: int().default(0).notNull(),
  coursesAccessed: int().default(0).notNull(),
  modulesCompleted: int().default(0).notNull(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});
