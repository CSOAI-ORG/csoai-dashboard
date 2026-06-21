/**
 * Streaks and Badges Router
 * Handles learning streaks, badges, and achievements
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { userStreaks, badges, userBadges, dailyActivityLog, courseEnrollments } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { sendBadgeEarnedEmail, checkAndSendStreakMilestoneEmail, type BadgeInfo } from "../services/achievementEmailService";

export const streaksBadgesRouter = router({
  /**
   * Get user's current streak information
   */
  getMyStreak: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const userId = ctx.user.id;

    // Get or create streak record
    let [streak] = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId));

    if (!streak) {
      // Create initial streak record
      await db.insert(userStreaks).values({
        userId,
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
      });

      [streak] = await db
        .select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId));
    }

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalActiveDays: streak.totalActiveDays,
      lastActivityDate: streak.lastActivityDate,
    };
  }),

  /**
   * Update daily activity and streak
   * Called when user accesses courses
   */
  updateActivity: protectedProcedure
    .input(z.object({
      minutesSpent: z.number().optional(),
      courseId: z.number().optional(),
      moduleCompleted: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Update or create daily activity log
      const [existingLog] = await db
        .select()
        .from(dailyActivityLog)
        .where(
          and(
            eq(dailyActivityLog.userId, userId),
            eq(dailyActivityLog.activityDate, today)
          )
        );

      if (existingLog) {
        // Update existing log
        await db
          .update(dailyActivityLog)
          .set({
            minutesSpent: (existingLog.minutesSpent || 0) + (input.minutesSpent || 0),
            coursesAccessed: input.courseId ? (existingLog.coursesAccessed || 0) + 1 : existingLog.coursesAccessed,
            modulesCompleted: input.moduleCompleted ? (existingLog.modulesCompleted || 0) + 1 : existingLog.modulesCompleted,
          })
          .where(eq(dailyActivityLog.id, existingLog.id));
      } else {
        // Create new log
        await db.insert(dailyActivityLog).values({
          userId,
          activityDate: today,
          minutesSpent: input.minutesSpent || 0,
          coursesAccessed: input.courseId ? 1 : 0,
          modulesCompleted: input.moduleCompleted ? 1 : 0,
        });
      }

      // Update streak
      const [streak] = await db
        .select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId));

      if (streak) {
        const lastActivity = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;
        const todayDate = new Date(today);
        
        let newStreak = streak.currentStreak || 0;
        let newTotalDays = streak.totalActiveDays || 0;

        if (!lastActivity) {
          // First activity
          newStreak = 1;
          newTotalDays = 1;
        } else {
          const lastActivityDate = new Date(lastActivity.toISOString().split('T')[0]);
          const daysDiff = Math.floor((todayDate.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDiff === 0) {
            // Same day, no change to streak
          } else if (daysDiff === 1) {
            // Consecutive day
            newStreak += 1;
            newTotalDays += 1;
          } else {
            // Streak broken
            newStreak = 1;
            newTotalDays += 1;
          }
        }

        const newLongestStreak = Math.max(streak.longestStreak || 0, newStreak);

        await db
          .update(userStreaks)
          .set({
            currentStreak: newStreak,
            longestStreak: newLongestStreak,
            lastActivityDate: new Date().toISOString(),
            totalActiveDays: newTotalDays,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(userStreaks.id, streak.id));

        // Check for streak badges and return new badge if awarded
        const newBadge = await checkAndAwardStreakBadges(db, userId, newStreak, newLongestStreak);
        
        // Send streak milestone email if applicable
        const previousStreak = streak.currentStreak || 0;
        if (newStreak > previousStreak) {
          checkAndSendStreakMilestoneEmail(userId, newStreak, previousStreak).catch(err => {
            console.error('[Streaks] Error sending streak milestone email:', err);
          });
        }
        
        if (newBadge) {
          // Send badge earned email
          sendBadgeEarnedEmail(userId, newBadge as BadgeInfo).catch(err => {
            console.error('[Streaks] Error sending badge email:', err);
          });
          return { success: true, newBadge };
        }
      }

      return { success: true, newBadge: null };
    }),

  /**
   * Get all available badges
   */
  getAllBadges: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const allBadges = await db
      .select()
      .from(badges)
      .where(eq(badges.isActive, 1));

    return allBadges;
  }),

  /**
   * Get user's earned badges
   */
  getMyBadges: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const userId = ctx.user.id;

    const earnedBadges = await db
      .select({
        id: userBadges.id,
        badgeId: userBadges.badgeId,
        earnedAt: userBadges.earnedAt,
        metadata: userBadges.metadata,
        name: badges.name,
        description: badges.description,
        category: badges.category,
        icon: badges.icon,
        color: badges.color,
        points: badges.points,
      })
      .from(userBadges)
      .leftJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));

    return earnedBadges;
  }),

  /**
   * Get activity history
   */
  getActivityHistory: protectedProcedure
    .input(z.object({
      days: z.number().default(30),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      const activities = await db
        .select()
        .from(dailyActivityLog)
        .where(eq(dailyActivityLog.userId, userId))
        .orderBy(desc(dailyActivityLog.activityDate))
        .limit(input.days);

      return activities;
    }),
});

/**
 * Helper function to check and award streak badges
 * Returns the newly awarded badge if one was awarded, null otherwise
 */
async function checkAndAwardStreakBadges(
  db: any,
  userId: number,
  currentStreak: number,
  longestStreak: number
): Promise<{
  id: number;
  name: string | null;
  description: string | null;
  icon: string | null;
  color: string | null;
  points: number | null;
} | null> {
  const streakMilestones = [
    { days: 3, badgeName: '3-Day Streak' },
    { days: 7, badgeName: '7-Day Streak' },
    { days: 14, badgeName: '14-Day Streak' },
    { days: 30, badgeName: '30-Day Streak' },
    { days: 60, badgeName: '60-Day Streak' },
    { days: 100, badgeName: '100-Day Streak' },
  ];

  // Find the highest milestone the user has reached
  let highestMilestone = null;
  for (const milestone of streakMilestones) {
    if (currentStreak >= milestone.days) {
      highestMilestone = milestone;
    }
  }

  if (!highestMilestone) return null;

  // Check if badge exists
  const [badge] = await db
    .select()
    .from(badges)
    .where(eq(badges.name, highestMilestone.badgeName));

  if (!badge) return null;

  // Check if user already has this badge
  const [existingUserBadge] = await db
    .select()
    .from(userBadges)
    .where(
      and(
        eq(userBadges.userId, userId),
        eq(userBadges.badgeId, badge.id)
      )
    );

  if (existingUserBadge) return null;

  // Award badge
  await db.insert(userBadges).values({
    userId,
    badgeId: badge.id,
    progress: 100,
    metadata: JSON.stringify({ streakDays: currentStreak }),
  });

  // Return the newly awarded badge
  return {
    id: badge.id,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    color: badge.color,
    points: badge.points,
  };
}
