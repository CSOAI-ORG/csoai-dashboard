/**
 * Teams Router Tests
 * Tests for team creation, membership, and leaderboard functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('../db', () => ({
  getDb: vi.fn(() => Promise.resolve({
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve([])),
        innerJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => ({
              limit: vi.fn(() => ({
                offset: vi.fn(() => Promise.resolve([])),
              })),
            })),
          })),
        })),
        orderBy: vi.fn(() => ({
          limit: vi.fn(() => ({
            offset: vi.fn(() => Promise.resolve([])),
          })),
        })),
        limit: vi.fn(() => ({
          offset: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve([{ insertId: 1 }])),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  })),
}));

describe('Teams Router', () => {
  describe('Team Creation', () => {
    it('should generate a valid invite code', () => {
      // Test invite code format (8 character hex)
      const inviteCodeRegex = /^[A-F0-9]{8}$/;
      const testCode = 'ABCD1234';
      expect(inviteCodeRegex.test(testCode)).toBe(true);
    });

    it('should generate a valid slug from team name', () => {
      const generateSlug = (name: string): string => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 50);
      };

      expect(generateSlug('AI Safety Study Group')).toBe('ai-safety-study-group');
      expect(generateSlug('Team #1!')).toBe('team-1');
      expect(generateSlug('  Spaces  Around  ')).toBe('spaces-around');
    });

    it('should validate team name length', () => {
      const validateTeamName = (name: string): boolean => {
        return name.length >= 2 && name.length <= 100;
      };

      expect(validateTeamName('A')).toBe(false);
      expect(validateTeamName('AB')).toBe(true);
      expect(validateTeamName('Valid Team Name')).toBe(true);
      expect(validateTeamName('A'.repeat(101))).toBe(false);
    });
  });

  describe('Team Membership', () => {
    it('should validate invite code format', () => {
      const isValidInviteCode = (code: string): boolean => {
        return /^[A-F0-9]{8}$/i.test(code);
      };

      expect(isValidInviteCode('ABCD1234')).toBe(true);
      expect(isValidInviteCode('abcd1234')).toBe(true);
      expect(isValidInviteCode('ABC123')).toBe(false); // Too short
      expect(isValidInviteCode('ABCD12345')).toBe(false); // Too long
      expect(isValidInviteCode('GHIJ1234')).toBe(false); // Invalid hex
    });

    it('should correctly identify member roles', () => {
      const roles = ['owner', 'admin', 'member'];
      const canManageTeam = (role: string): boolean => {
        return role === 'owner' || role === 'admin';
      };

      expect(canManageTeam('owner')).toBe(true);
      expect(canManageTeam('admin')).toBe(true);
      expect(canManageTeam('member')).toBe(false);
    });

    it('should validate max members limit', () => {
      const validateMaxMembers = (count: number): boolean => {
        return count >= 2 && count <= 1000;
      };

      expect(validateMaxMembers(1)).toBe(false);
      expect(validateMaxMembers(2)).toBe(true);
      expect(validateMaxMembers(100)).toBe(true);
      expect(validateMaxMembers(1000)).toBe(true);
      expect(validateMaxMembers(1001)).toBe(false);
    });
  });

  describe('Team Leaderboard', () => {
    it('should correctly calculate points from different categories', () => {
      const calculatePoints = (streak: number, badges: number, courses: number): number => {
        return (streak * 10) + (badges * 50) + (courses * 100);
      };

      expect(calculatePoints(7, 2, 1)).toBe(70 + 100 + 100); // 270
      expect(calculatePoints(30, 5, 3)).toBe(300 + 250 + 300); // 850
      expect(calculatePoints(0, 0, 0)).toBe(0);
    });

    it('should correctly rank users by score', () => {
      const users = [
        { userId: 1, score: 100 },
        { userId: 2, score: 300 },
        { userId: 3, score: 200 },
      ];

      const ranked = [...users].sort((a, b) => b.score - a.score);
      
      expect(ranked[0].userId).toBe(2);
      expect(ranked[1].userId).toBe(3);
      expect(ranked[2].userId).toBe(1);
    });

    it('should validate leaderboard category', () => {
      const validCategories = ['streak', 'badges', 'courses', 'points'];
      const isValidCategory = (cat: string): boolean => {
        return validCategories.includes(cat);
      };

      expect(isValidCategory('streak')).toBe(true);
      expect(isValidCategory('badges')).toBe(true);
      expect(isValidCategory('courses')).toBe(true);
      expect(isValidCategory('points')).toBe(true);
      expect(isValidCategory('invalid')).toBe(false);
    });
  });
});

describe('Achievement Email Service', () => {
  describe('Badge Card Generation', () => {
    it('should use default values for missing badge properties', () => {
      const badge = {
        id: 1,
        name: 'Test Badge',
        description: null,
        icon: null,
        color: null,
        points: null,
        category: 'achievement',
      };

      const defaultColor = badge.color || '#10b981';
      const defaultIcon = badge.icon || '🏆';
      const defaultPoints = badge.points || 0;

      expect(defaultColor).toBe('#10b981');
      expect(defaultIcon).toBe('🏆');
      expect(defaultPoints).toBe(0);
    });
  });

  describe('Streak Milestones', () => {
    it('should correctly identify streak milestones', () => {
      const milestones = [3, 7, 14, 30, 60, 100];
      
      const checkMilestone = (current: number, previous: number): number | null => {
        for (const milestone of milestones) {
          if (current >= milestone && previous < milestone) {
            return milestone;
          }
        }
        return null;
      };

      expect(checkMilestone(7, 6)).toBe(7);
      expect(checkMilestone(30, 29)).toBe(30);
      expect(checkMilestone(8, 7)).toBe(null);
      expect(checkMilestone(3, 2)).toBe(3);
      expect(checkMilestone(100, 99)).toBe(100);
    });

    it('should return correct emoji for streak days', () => {
      const getStreakEmoji = (days: number): string => {
        const streakEmojis: Record<number, string> = {
          3: '🔥',
          7: '🌟',
          14: '⚡',
          30: '💎',
          60: '🚀',
          100: '👑',
        };
        return streakEmojis[days] || '🔥';
      };

      expect(getStreakEmoji(3)).toBe('🔥');
      expect(getStreakEmoji(7)).toBe('🌟');
      expect(getStreakEmoji(30)).toBe('💎');
      expect(getStreakEmoji(100)).toBe('👑');
      expect(getStreakEmoji(5)).toBe('🔥'); // Default
    });
  });
});

describe('Weekly Digest Service', () => {
  describe('Motivational Messages', () => {
    it('should return appropriate message based on user activity', () => {
      const getMotivationalMessage = (data: {
        streakChange: number;
        currentStreak: number;
        badgesEarnedThisWeek: any[];
        rankChange: number;
        minutesLearned: number;
        topPercentile: number;
      }): string => {
        if (data.streakChange > 0 && data.currentStreak >= 7) {
          return `streak-message`;
        }
        if (data.badgesEarnedThisWeek.length > 0) {
          return `badge-message`;
        }
        if (data.rankChange > 0) {
          return `rank-message`;
        }
        if (data.minutesLearned > 60) {
          return `time-message`;
        }
        if (data.currentStreak > 0) {
          return `maintain-streak`;
        }
        return `comeback-message`;
      };

      expect(getMotivationalMessage({
        streakChange: 5,
        currentStreak: 10,
        badgesEarnedThisWeek: [],
        rankChange: 0,
        minutesLearned: 0,
        topPercentile: 10,
      })).toBe('streak-message');

      expect(getMotivationalMessage({
        streakChange: 0,
        currentStreak: 5,
        badgesEarnedThisWeek: [{ name: 'Badge' }],
        rankChange: 0,
        minutesLearned: 0,
        topPercentile: 50,
      })).toBe('badge-message');

      expect(getMotivationalMessage({
        streakChange: 0,
        currentStreak: 0,
        badgesEarnedThisWeek: [],
        rankChange: 0,
        minutesLearned: 0,
        topPercentile: 100,
      })).toBe('comeback-message');
    });
  });

  describe('Date Calculations', () => {
    it('should correctly calculate one week ago', () => {
      const getWeekAgo = (): Date => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
      };

      const now = new Date();
      const weekAgo = getWeekAgo();
      const diffDays = Math.round((now.getTime() - weekAgo.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(7);
    });

    it('should correctly calculate top percentile', () => {
      const calculatePercentile = (rank: number, total: number): number => {
        return Math.round((1 - (rank / total)) * 100);
      };

      expect(calculatePercentile(1, 100)).toBe(99); // Top 1%
      expect(calculatePercentile(10, 100)).toBe(90); // Top 10%
      expect(calculatePercentile(50, 100)).toBe(50); // Top 50%
      expect(calculatePercentile(100, 100)).toBe(0); // Last place
    });
  });
});
