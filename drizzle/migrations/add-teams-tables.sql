-- Teams table for organizations/study groups
CREATE TABLE IF NOT EXISTS `teams` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text,
  `slug` varchar(100) NOT NULL,
  `inviteCode` varchar(20) NOT NULL,
  `logoUrl` varchar(500),
  `ownerId` int NOT NULL,
  `visibility` enum('private', 'public') DEFAULT 'private' NOT NULL,
  `maxMembers` int DEFAULT 100,
  `memberCount` int DEFAULT 1 NOT NULL,
  `settings` json,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_teams_slug` (`slug`),
  INDEX `idx_teams_invite_code` (`inviteCode`),
  INDEX `idx_teams_owner` (`ownerId`)
);

-- Team memberships table
CREATE TABLE IF NOT EXISTS `team_memberships` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `teamId` int NOT NULL,
  `userId` int NOT NULL,
  `role` enum('owner', 'admin', 'member') DEFAULT 'member' NOT NULL,
  `joinedAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `invitedBy` int,
  `status` enum('active', 'pending', 'removed') DEFAULT 'active' NOT NULL,
  `cachedStreak` int DEFAULT 0,
  `cachedBadgeCount` int DEFAULT 0,
  `cachedCoursesCompleted` int DEFAULT 0,
  `cachedTotalPoints` int DEFAULT 0,
  `lastStatsUpdate` timestamp,
  INDEX `idx_team_memberships_team` (`teamId`),
  INDEX `idx_team_memberships_user` (`userId`),
  INDEX `idx_team_memberships_status` (`status`)
);

-- Team invitations table
CREATE TABLE IF NOT EXISTS `team_invitations` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `teamId` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `invitedBy` int NOT NULL,
  `token` varchar(64) NOT NULL,
  `status` enum('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending' NOT NULL,
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_team_invitations_team` (`teamId`),
  INDEX `idx_team_invitations_email` (`email`),
  INDEX `idx_team_invitations_token` (`token`)
);

-- Team leaderboard snapshots table
CREATE TABLE IF NOT EXISTS `team_leaderboard_snapshots` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `teamId` int NOT NULL,
  `period` varchar(20) NOT NULL,
  `periodStart` timestamp NOT NULL,
  `periodEnd` timestamp,
  `rankings` json,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `idx_team_snapshots_team` (`teamId`),
  INDEX `idx_team_snapshots_period` (`period`)
);
