/**
 * Teams Router
 * Handles team/cohort creation, management, and private leaderboards
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { teams, teamMemberships, teamInvitations, teamLeaderboardSnapshots, users, userStreaks, userBadges, courseEnrollments } from "../../drizzle/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import * as crypto from "crypto";

// Generate a unique invite code
function generateInviteCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Generate a unique invitation token
function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate URL-friendly slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50) + '-' + crypto.randomBytes(3).toString('hex');
}

export const teamsRouter = router({
  /**
   * Create a new team
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(100),
      description: z.string().max(500).optional(),
      visibility: z.enum(['private', 'public']).default('private'),
      maxMembers: z.number().min(2).max(1000).default(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      const slug = generateSlug(input.name);
      const inviteCode = generateInviteCode();

      // Create the team
      const [result] = await db.insert(teams).values({
        name: input.name,
        description: input.description || null,
        slug,
        inviteCode,
        ownerId: userId,
        visibility: input.visibility,
        maxMembers: input.maxMembers,
        memberCount: 1,
        settings: {
          allowMemberInvites: true,
          showOnPublicLeaderboard: false,
          weeklyDigestEnabled: true,
          competitionMode: false,
        },
      });

      const teamId = (result as any).insertId;

      // Add creator as owner member
      await db.insert(teamMemberships).values({
        teamId,
        userId,
        role: 'owner',
        status: 'active',
      });

      return {
        id: teamId,
        slug,
        inviteCode,
      };
    }),

  /**
   * Get team by ID or slug
   */
  get: protectedProcedure
    .input(z.object({
      teamId: z.number().optional(),
      slug: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let team;
      if (input.teamId) {
        [team] = await db.select().from(teams).where(eq(teams.id, input.teamId));
      } else if (input.slug) {
        [team] = await db.select().from(teams).where(eq(teams.slug, input.slug));
      }

      if (!team) {
        throw new Error('Team not found');
      }

      // Check if user is a member
      const [membership] = await db
        .select()
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, team.id),
            eq(teamMemberships.userId, ctx.user.id),
            eq(teamMemberships.status, 'active')
          )
        );

      if (!membership && team.visibility === 'private') {
        throw new Error('You are not a member of this team');
      }

      return {
        ...team,
        isMember: !!membership,
        userRole: membership?.role || null,
      };
    }),

  /**
   * Get user's teams
   */
  getMyTeams: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const userId = ctx.user.id;

    const memberships = await db
      .select({
        membership: teamMemberships,
        team: teams,
      })
      .from(teamMemberships)
      .innerJoin(teams, eq(teamMemberships.teamId, teams.id))
      .where(
        and(
          eq(teamMemberships.userId, userId),
          eq(teamMemberships.status, 'active')
        )
      );

    return memberships.map(m => ({
      ...m.team,
      role: m.membership.role,
      joinedAt: m.membership.joinedAt,
    }));
  }),

  /**
   * Join team by invite code
   */
  joinByCode: protectedProcedure
    .input(z.object({
      inviteCode: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Find team by invite code
      const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.inviteCode, input.inviteCode.toUpperCase()));

      if (!team) {
        throw new Error('Invalid invite code');
      }

      // Check if already a member
      const [existingMembership] = await db
        .select()
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, team.id),
            eq(teamMemberships.userId, userId)
          )
        );

      if (existingMembership) {
        if (existingMembership.status === 'active') {
          throw new Error('You are already a member of this team');
        }
        // Reactivate membership
        await db
          .update(teamMemberships)
          .set({ status: 'active', joinedAt: new Date().toISOString() })
          .where(eq(teamMemberships.id, existingMembership.id));
      } else {
        // Check capacity
        if (team.memberCount >= (team.maxMembers || 100)) {
          throw new Error('Team is at maximum capacity');
        }

        // Add new membership
        await db.insert(teamMemberships).values({
          teamId: team.id,
          userId,
          role: 'member',
          status: 'active',
        });
      }

      // Update member count
      await db
        .update(teams)
        .set({ memberCount: sql`${teams.memberCount} + 1` })
        .where(eq(teams.id, team.id));

      return { success: true, teamId: team.id, teamName: team.name };
    }),

  /**
   * Leave a team
   */
  leave: protectedProcedure
    .input(z.object({
      teamId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Get membership
      const [membership] = await db
        .select()
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, input.teamId),
            eq(teamMemberships.userId, userId),
            eq(teamMemberships.status, 'active')
          )
        );

      if (!membership) {
        throw new Error('You are not a member of this team');
      }

      if (membership.role === 'owner') {
        throw new Error('Team owners cannot leave. Transfer ownership first or delete the team.');
      }

      // Mark as removed
      await db
        .update(teamMemberships)
        .set({ status: 'removed' })
        .where(eq(teamMemberships.id, membership.id));

      // Update member count
      await db
        .update(teams)
        .set({ memberCount: sql`${teams.memberCount} - 1` })
        .where(eq(teams.id, input.teamId));

      return { success: true };
    }),

  /**
   * Get team leaderboard
   */
  getLeaderboard: protectedProcedure
    .input(z.object({
      teamId: z.number(),
      category: z.enum(['streak', 'badges', 'courses', 'points']).default('points'),
      period: z.enum(['weekly', 'monthly', 'all_time']).default('all_time'),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Verify user is a member
      const [membership] = await db
        .select()
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, input.teamId),
            eq(teamMemberships.userId, userId),
            eq(teamMemberships.status, 'active')
          )
        );

      if (!membership) {
        throw new Error('You are not a member of this team');
      }

      // Get all team members
      const members = await db
        .select({
          userId: teamMemberships.userId,
          role: teamMemberships.role,
          joinedAt: teamMemberships.joinedAt,
        })
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, input.teamId),
            eq(teamMemberships.status, 'active')
          )
        );

      const memberIds = members.map(m => m.userId);
      if (memberIds.length === 0) {
        return { entries: [], category: input.category, period: input.period };
      }

      let leaderboardData: any[] = [];

      if (input.category === 'streak') {
        const streaks = await db
          .select({
            userId: userStreaks.userId,
            score: userStreaks.currentStreak,
            longestStreak: userStreaks.longestStreak,
          })
          .from(userStreaks)
          .where(inArray(userStreaks.userId, memberIds))
          .orderBy(desc(userStreaks.currentStreak))
          .limit(input.limit);

        leaderboardData = streaks;
      } else if (input.category === 'badges') {
        const badgeCounts = await db
          .select({
            userId: userBadges.userId,
            score: sql<number>`COUNT(*)`.as('badge_count'),
          })
          .from(userBadges)
          .where(inArray(userBadges.userId, memberIds))
          .groupBy(userBadges.userId)
          .orderBy(desc(sql`badge_count`))
          .limit(input.limit);

        leaderboardData = badgeCounts;
      } else if (input.category === 'courses') {
        const courseCounts = await db
          .select({
            userId: courseEnrollments.userId,
            score: sql<number>`COUNT(*)`.as('course_count'),
          })
          .from(courseEnrollments)
          .where(
            and(
              inArray(courseEnrollments.userId, memberIds),
              eq(courseEnrollments.status, 'completed')
            )
          )
          .groupBy(courseEnrollments.userId)
          .orderBy(desc(sql`course_count`))
          .limit(input.limit);

        leaderboardData = courseCounts;
      } else {
        // Points - combination of streaks, badges, and courses
        // Get all data and calculate combined score
        const [streakData, badgeData, courseData] = await Promise.all([
          db.select({ userId: userStreaks.userId, streak: userStreaks.currentStreak })
            .from(userStreaks)
            .where(inArray(userStreaks.userId, memberIds)),
          db.select({ userId: userBadges.userId, count: sql<number>`COUNT(*)` })
            .from(userBadges)
            .where(inArray(userBadges.userId, memberIds))
            .groupBy(userBadges.userId),
          db.select({ userId: courseEnrollments.userId, count: sql<number>`COUNT(*)` })
            .from(courseEnrollments)
            .where(and(
              inArray(courseEnrollments.userId, memberIds),
              eq(courseEnrollments.status, 'completed')
            ))
            .groupBy(courseEnrollments.userId),
        ]);

        const pointsMap = new Map<number, number>();
        memberIds.forEach(id => pointsMap.set(id, 0));

        streakData.forEach(s => {
          const current = pointsMap.get(s.userId) || 0;
          pointsMap.set(s.userId, current + (s.streak || 0) * 10);
        });

        badgeData.forEach(b => {
          const current = pointsMap.get(b.userId) || 0;
          pointsMap.set(b.userId, current + (b.count || 0) * 50);
        });

        courseData.forEach(c => {
          const current = pointsMap.get(c.userId) || 0;
          pointsMap.set(c.userId, current + (c.count || 0) * 100);
        });

        leaderboardData = Array.from(pointsMap.entries())
          .map(([userId, score]) => ({ userId, score }))
          .sort((a, b) => b.score - a.score)
          .slice(0, input.limit);
      }

      // Add user details and ranks
      const enrichedData = await Promise.all(
        leaderboardData.map(async (entry, index) => {
          const [user] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, entry.userId));

          const memberInfo = members.find(m => m.userId === entry.userId);

          return {
            rank: index + 1,
            userId: entry.userId,
            userName: user?.name || 'Anonymous',
            avatarUrl: null,
            score: entry.score || 0,
            role: memberInfo?.role,
            isCurrentUser: entry.userId === userId,
          };
        })
      );

      // Get current user's rank if not in top results
      const currentUserEntry = enrichedData.find(e => e.isCurrentUser);
      let currentUserRank = null;
      if (!currentUserEntry) {
        const userScore = leaderboardData.find(e => e.userId === userId)?.score || 0;
        const higherCount = leaderboardData.filter(e => e.score > userScore).length;
        currentUserRank = higherCount + 1;
      }

      return {
        entries: enrichedData,
        category: input.category,
        period: input.period,
        currentUserRank,
        totalMembers: memberIds.length,
      };
    }),

  /**
   * Update team settings (admin/owner only)
   */
  updateSettings: protectedProcedure
    .input(z.object({
      teamId: z.number(),
      name: z.string().min(2).max(100).optional(),
      description: z.string().max(500).optional(),
      visibility: z.enum(['private', 'public']).optional(),
      settings: z.object({
        allowMemberInvites: z.boolean().optional(),
        showOnPublicLeaderboard: z.boolean().optional(),
        weeklyDigestEnabled: z.boolean().optional(),
        competitionMode: z.boolean().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Verify user is admin or owner
      const [membership] = await db
        .select()
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, input.teamId),
            eq(teamMemberships.userId, userId),
            eq(teamMemberships.status, 'active')
          )
        );

      if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
        throw new Error('Only team admins can update settings');
      }

      const updates: any = {};
      if (input.name) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.visibility) updates.visibility = input.visibility;
      if (input.settings) {
        const [currentTeam] = await db.select().from(teams).where(eq(teams.id, input.teamId));
        updates.settings = { ...(currentTeam?.settings || {}), ...input.settings };
      }

      if (Object.keys(updates).length > 0) {
        await db.update(teams).set(updates).where(eq(teams.id, input.teamId));
      }

      return { success: true };
    }),

  /**
   * Regenerate invite code (owner only)
   */
  regenerateInviteCode: protectedProcedure
    .input(z.object({
      teamId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Verify user is owner
      const [membership] = await db
        .select()
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, input.teamId),
            eq(teamMemberships.userId, userId),
            eq(teamMemberships.status, 'active'),
            eq(teamMemberships.role, 'owner')
          )
        );

      if (!membership) {
        throw new Error('Only team owners can regenerate invite codes');
      }

      const newCode = generateInviteCode();
      await db.update(teams).set({ inviteCode: newCode }).where(eq(teams.id, input.teamId));

      return { inviteCode: newCode };
    }),

  /**
   * Get team members
   */
  getMembers: protectedProcedure
    .input(z.object({
      teamId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Verify user is a member
      const [membership] = await db
        .select()
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, input.teamId),
            eq(teamMemberships.userId, userId),
            eq(teamMemberships.status, 'active')
          )
        );

      if (!membership) {
        throw new Error('You are not a member of this team');
      }

      const members = await db
        .select({
          id: teamMemberships.id,
          userId: teamMemberships.userId,
          role: teamMemberships.role,
          joinedAt: teamMemberships.joinedAt,
          userName: users.name,
          email: users.email,
        })
        .from(teamMemberships)
        .innerJoin(users, eq(teamMemberships.userId, users.id))
        .where(
          and(
            eq(teamMemberships.teamId, input.teamId),
            eq(teamMemberships.status, 'active')
          )
        )
        .orderBy(desc(teamMemberships.role), teamMemberships.joinedAt);

      return members;
    }),

  /**
   * Remove member (admin/owner only)
   */
  removeMember: protectedProcedure
    .input(z.object({
      teamId: z.number(),
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const currentUserId = ctx.user.id;

      // Verify current user is admin or owner
      const [currentMembership] = await db
        .select()
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, input.teamId),
            eq(teamMemberships.userId, currentUserId),
            eq(teamMemberships.status, 'active')
          )
        );

      if (!currentMembership || (currentMembership.role !== 'owner' && currentMembership.role !== 'admin')) {
        throw new Error('Only team admins can remove members');
      }

      // Get target membership
      const [targetMembership] = await db
        .select()
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, input.teamId),
            eq(teamMemberships.userId, input.userId),
            eq(teamMemberships.status, 'active')
          )
        );

      if (!targetMembership) {
        throw new Error('Member not found');
      }

      // Cannot remove owner
      if (targetMembership.role === 'owner') {
        throw new Error('Cannot remove team owner');
      }

      // Admins cannot remove other admins
      if (targetMembership.role === 'admin' && currentMembership.role !== 'owner') {
        throw new Error('Only owners can remove admins');
      }

      // Remove member
      await db
        .update(teamMemberships)
        .set({ status: 'removed' })
        .where(eq(teamMemberships.id, targetMembership.id));

      // Update member count
      await db
        .update(teams)
        .set({ memberCount: sql`${teams.memberCount} - 1` })
        .where(eq(teams.id, input.teamId));

      return { success: true };
    }),

  /**
   * Promote member to admin (owner only)
   */
  promoteMember: protectedProcedure
    .input(z.object({
      teamId: z.number(),
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const currentUserId = ctx.user.id;

      // Verify current user is owner
      const [currentMembership] = await db
        .select()
        .from(teamMemberships)
        .where(
          and(
            eq(teamMemberships.teamId, input.teamId),
            eq(teamMemberships.userId, currentUserId),
            eq(teamMemberships.status, 'active'),
            eq(teamMemberships.role, 'owner')
          )
        );

      if (!currentMembership) {
        throw new Error('Only team owners can promote members');
      }

      // Update member role
      await db
        .update(teamMemberships)
        .set({ role: 'admin' })
        .where(
          and(
            eq(teamMemberships.teamId, input.teamId),
            eq(teamMemberships.userId, input.userId),
            eq(teamMemberships.status, 'active')
          )
        );

      return { success: true };
    }),

  /**
   * Get public teams (for discovery)
   */
  getPublicTeams: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const publicTeams = await db
        .select({
          id: teams.id,
          name: teams.name,
          description: teams.description,
          slug: teams.slug,
          memberCount: teams.memberCount,
          logoUrl: teams.logoUrl,
          createdAt: teams.createdAt,
        })
        .from(teams)
        .where(eq(teams.visibility, 'public'))
        .orderBy(desc(teams.memberCount))
        .limit(input.limit)
        .offset(input.offset);

      return publicTeams;
    }),
});
