/**
 * Leaderboard Router
 * Handles leaderboard rankings for streaks, hours, badges, and courses
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { userStreaks, userBadges, courseEnrollments, users } from "../../drizzle/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

export const leaderboardRouter = router({
  /**
   * Get leaderboard by category
   */
  getLeaderboard: publicProcedure
    .input(z.object({
      category: z.enum(['streak', 'hours', 'badges', 'courses']),
      period: z.enum(['weekly', 'monthly', 'all_time']).default('all_time'),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { category, period, limit } = input;

      // Calculate date range based on period
      const now = new Date();
      let startDate: Date | null = null;
      
      if (period === 'weekly') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === 'monthly') {
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
      }

      let leaderboardData: any[] = [];

      if (category === 'streak') {
        // Get top users by current streak
        const results = await db
          .select({
            rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${userStreaks.currentStreak} DESC)`.as('rank'),
            userId: userStreaks.userId,
            score: userStreaks.currentStreak,
            longestStreak: userStreaks.longestStreak,
            totalActiveDays: userStreaks.totalActiveDays,
          })
          .from(userStreaks)
          .orderBy(desc(userStreaks.currentStreak))
          .limit(limit);

        // Get user details
        for (const result of results) {
          const [user] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, result.userId));
          
          leaderboardData.push({
            ...result,
            userName: user?.name || 'Anonymous',
          });
        }
      } else if (category === 'hours') {
        // Get top users by hours studied
        const results = await db
          .select({
            userId: courseEnrollments.userId,
            score: sql<number>`SUM(COALESCE(${courseEnrollments.timeSpentMinutes}, 0))`.as('total_minutes'),
          })
          .from(courseEnrollments)
          .groupBy(courseEnrollments.userId)
          .orderBy(desc(sql`total_minutes`))
          .limit(limit);

        let rank = 1;
        for (const result of results) {
          const [user] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, result.userId));
          
          leaderboardData.push({
            rank: rank++,
            userId: result.userId,
            score: Math.round((result.score || 0) / 60), // Convert to hours
            userName: user?.name || 'Anonymous',
          });
        }
      } else if (category === 'badges') {
        // Get top users by badges earned
        const results = await db
          .select({
            userId: userBadges.userId,
            score: sql<number>`COUNT(*)`.as('badge_count'),
          })
          .from(userBadges)
          .groupBy(userBadges.userId)
          .orderBy(desc(sql`badge_count`))
          .limit(limit);

        let rank = 1;
        for (const result of results) {
          const [user] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, result.userId));
          
          leaderboardData.push({
            rank: rank++,
            userId: result.userId,
            score: result.score,
            userName: user?.name || 'Anonymous',
          });
        }
      } else if (category === 'courses') {
        // Get top users by courses completed
        const results = await db
          .select({
            userId: courseEnrollments.userId,
            score: sql<number>`COUNT(*)`.as('completed_count'),
          })
          .from(courseEnrollments)
          .where(eq(courseEnrollments.status, 'completed'))
          .groupBy(courseEnrollments.userId)
          .orderBy(desc(sql`completed_count`))
          .limit(limit);

        let rank = 1;
        for (const result of results) {
          const [user] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, result.userId));
          
          leaderboardData.push({
            rank: rank++,
            userId: result.userId,
            score: result.score,
            userName: user?.name || 'Anonymous',
          });
        }
      }

      return {
        category,
        period,
        entries: leaderboardData,
        updatedAt: new Date().toISOString(),
      };
    }),

  /**
   * Get current user's rank in each category
   */
  getMyRanks: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const userId = ctx.user.id;

    // Get streak rank
    const streakRankResult = await db.execute(sql`
      SELECT COUNT(*) + 1 as rank
      FROM user_streaks
      WHERE currentStreak > (
        SELECT COALESCE(currentStreak, 0)
        FROM user_streaks
        WHERE userId = ${userId}
      )
    `);
    const streakRank = (streakRankResult as any)[0]?.[0]?.rank || 0;

    // Get user's streak
    const [userStreak] = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId));

    // Get hours rank
    const hoursRankResult = await db.execute(sql`
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT userId, SUM(COALESCE(timeSpentMinutes, 0)) as total
        FROM course_enrollments
        GROUP BY userId
      ) as totals
      WHERE total > (
        SELECT COALESCE(SUM(timeSpentMinutes), 0)
        FROM course_enrollments
        WHERE userId = ${userId}
      )
    `);
    const hoursRank = (hoursRankResult as any)[0]?.[0]?.rank || 0;

    // Get user's hours
    const [userHours] = await db
      .select({
        total: sql<number>`SUM(COALESCE(${courseEnrollments.timeSpentMinutes}, 0))`,
      })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId));

    // Get badges rank
    const badgesRankResult = await db.execute(sql`
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT userId, COUNT(*) as total
        FROM user_badges
        GROUP BY userId
      ) as totals
      WHERE total > (
        SELECT COUNT(*)
        FROM user_badges
        WHERE userId = ${userId}
      )
    `);
    const badgesRank = (badgesRankResult as any)[0]?.[0]?.rank || 0;

    // Get user's badges count
    const [userBadgesCount] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    // Get courses rank
    const coursesRankResult = await db.execute(sql`
      SELECT COUNT(*) + 1 as rank
      FROM (
        SELECT userId, COUNT(*) as total
        FROM course_enrollments
        WHERE status = 'completed'
        GROUP BY userId
      ) as totals
      WHERE total > (
        SELECT COUNT(*)
        FROM course_enrollments
        WHERE userId = ${userId} AND status = 'completed'
      )
    `);
    const coursesRank = (coursesRankResult as any)[0]?.[0]?.rank || 0;

    // Get user's completed courses
    const [userCourses] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.userId, userId),
          eq(courseEnrollments.status, 'completed')
        )
      );

    return {
      streak: {
        rank: streakRank,
        score: userStreak?.currentStreak || 0,
      },
      hours: {
        rank: hoursRank,
        score: Math.round((userHours?.total || 0) / 60),
      },
      badges: {
        rank: badgesRank,
        score: userBadgesCount?.count || 0,
      },
      courses: {
        rank: coursesRank,
        score: userCourses?.count || 0,
      },
    };
  }),
});
