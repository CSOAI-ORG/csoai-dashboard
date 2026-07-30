import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, index, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Teams/Organizations Table
 * Allows companies or study groups to create private leaderboards
 */
export const teams = mysqlTable("teams", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  slug: varchar({ length: 100 }).notNull(), // URL-friendly identifier
  inviteCode: varchar({ length: 20 }).notNull(), // Unique code for joining
  logoUrl: varchar({ length: 500 }),
  ownerId: int().notNull(), // User who created the team
  visibility: mysqlEnum(['private', 'public']).default('private').notNull(),
  maxMembers: int().default(100), // Maximum team size
  memberCount: int().default(1).notNull(), // Current member count
  settings: json().$type<{
    allowMemberInvites?: boolean; // Can members invite others
    showOnPublicLeaderboard?: boolean; // Show team on global leaderboard
    weeklyDigestEnabled?: boolean; // Send weekly team digest
    competitionMode?: boolean; // Enable competition features
    customBranding?: {
      primaryColor?: string;
      secondaryColor?: string;
    };
  }>(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("idx_teams_slug").on(table.slug),
  index("idx_teams_invite_code").on(table.inviteCode),
  index("idx_teams_owner").on(table.ownerId),
]);

/**
 * Team Memberships Table
 * Tracks which users belong to which teams
 */
export const teamMemberships = mysqlTable("team_memberships", {
  id: int().autoincrement().primaryKey(),
  teamId: int().notNull(),
  userId: int().notNull(),
  role: mysqlEnum(['owner', 'admin', 'member']).default('member').notNull(),
  joinedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  invitedBy: int(), // User who invited this member
  status: mysqlEnum(['active', 'pending', 'removed']).default('active').notNull(),
  // Cached stats for leaderboard performance
  cachedStreak: int().default(0),
  cachedBadgeCount: int().default(0),
  cachedCoursesCompleted: int().default(0),
  cachedTotalPoints: int().default(0),
  lastStatsUpdate: timestamp({ mode: 'string' }),
}, (table) => [
  index("idx_team_memberships_team").on(table.teamId),
  index("idx_team_memberships_user").on(table.userId),
  index("idx_team_memberships_status").on(table.status),
]);

/**
 * Team Invitations Table
 * Tracks pending invitations to teams
 */
export const teamInvitations = mysqlTable("team_invitations", {
  id: int().autoincrement().primaryKey(),
  teamId: int().notNull(),
  email: varchar({ length: 255 }).notNull(),
  invitedBy: int().notNull(),
  token: varchar({ length: 64 }).notNull(), // Unique invitation token
  status: mysqlEnum(['pending', 'accepted', 'declined', 'expired']).default('pending').notNull(),
  expiresAt: timestamp({ mode: 'string' }).notNull(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("idx_team_invitations_team").on(table.teamId),
  index("idx_team_invitations_email").on(table.email),
  index("idx_team_invitations_token").on(table.token),
]);

/**
 * Team Leaderboard Snapshots
 * Periodic snapshots for historical team rankings
 */
export const teamLeaderboardSnapshots = mysqlTable("team_leaderboard_snapshots", {
  id: int().autoincrement().primaryKey(),
  teamId: int().notNull(),
  period: varchar({ length: 20 }).notNull(), // 'weekly', 'monthly'
  periodStart: timestamp({ mode: 'string' }).notNull(),
  periodEnd: timestamp({ mode: 'string' }),
  rankings: json().$type<Array<{
    userId: number;
    userName: string;
    rank: number;
    score: number;
    streakDays: number;
    badgesEarned: number;
    coursesCompleted: number;
  }>>(),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  index("idx_team_snapshots_team").on(table.teamId),
  index("idx_team_snapshots_period").on(table.period),
]);

// Type exports
export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

export type TeamMembership = typeof teamMemberships.$inferSelect;
export type InsertTeamMembership = typeof teamMemberships.$inferInsert;

export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type InsertTeamInvitation = typeof teamInvitations.$inferInsert;

export type TeamLeaderboardSnapshot = typeof teamLeaderboardSnapshots.$inferSelect;
export type InsertTeamLeaderboardSnapshot = typeof teamLeaderboardSnapshots.$inferInsert;
