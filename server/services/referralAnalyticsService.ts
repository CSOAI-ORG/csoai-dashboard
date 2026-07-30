/**
 * Referral Analytics Service
 * Provides comprehensive analytics for referral program performance
 */

import { getDb } from '../db.js';
import { referralCodes, referralConversions, referralClicks, referralPayouts } from '../../drizzle/schema-referral.js';
import { eq, and, gte, lte } from 'drizzle-orm';

export interface ReferralAnalytics {
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  conversionRate: number;
  averageCommissionPerConversion: number;
  topReferralCodes: Array<{
    code: string;
    clicks: number;
    conversions: number;
    earnings: number;
  }>;
  clicksTrend: Array<{
    date: string;
    clicks: number;
  }>;
  conversionsTrend: Array<{
    date: string;
    conversions: number;
  }>;
  earningsTrend: Array<{
    date: string;
    earnings: number;
  }>;
}

export class ReferralAnalyticsService {
  /**
   * Get comprehensive referral analytics for a user
   */
  static async getReferralAnalytics(
    userId: number,
    dateRange: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<ReferralAnalytics> {
    const db = await getDb();
    if (!db) {
      return {
        totalClicks: 0,
        totalConversions: 0,
        totalEarnings: 0,
        conversionRate: 0,
        averageCommissionPerConversion: 0,
        topReferralCodes: [],
        clicksTrend: [],
        conversionsTrend: [],
        earningsTrend: [],
      };
    }

    const now = new Date();
    const startDate = new Date();

    // Calculate start date based on range
    if (dateRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (dateRange === 'quarter') {
      startDate.setMonth(now.getMonth() - 3);
    }

    try {
      // Get user's referral codes
      const codes = await db
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.userId, userId));

      const codeIds = codes.map((c: any) => c.id);

      if (codeIds.length === 0) {
        return {
          totalClicks: 0,
          totalConversions: 0,
          totalEarnings: 0,
          conversionRate: 0,
          averageCommissionPerConversion: 0,
          topReferralCodes: [],
          clicksTrend: [],
          conversionsTrend: [],
          earningsTrend: [],
        };
      }

      // Get clicks data
      const clicks = await db
        .select()
        .from(referralClicks)
        .where(
          and(
            eq(referralClicks.referrerId, userId),
            gte(referralClicks.clickedAt, startDate.toISOString())
          )
        );

      // Get conversions data
      const conversions = await db
        .select()
        .from(referralConversions)
        .where(
          and(
            eq(referralConversions.referrerId, userId),
            gte(referralConversions.createdAt, startDate.toISOString())
          )
        );

      // Calculate metrics
      const totalClicks = clicks.length;
      const totalConversions = conversions.filter((c: any) => c.status === 'earned' || c.status === 'processed').length;
      const totalEarnings = conversions.reduce((sum: number, c: any) => sum + parseFloat(c.commissionAmount || '0'), 0);
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      const averageCommissionPerConversion = totalConversions > 0 ? totalEarnings / totalConversions : 0;

      // Get top referral codes
      const topReferralCodes = await this.getTopReferralCodes(userId, 5);

      // Get trends
      const clicksTrend = await this.getClicksTrend(userId, dateRange);
      const conversionsTrend = await this.getConversionsTrend(userId, dateRange);
      const earningsTrend = await this.getEarningsTrend(userId, dateRange);

      return {
        totalClicks,
        totalConversions,
        totalEarnings,
        conversionRate,
        averageCommissionPerConversion,
        topReferralCodes,
        clicksTrend,
        conversionsTrend,
        earningsTrend,
      };
    } catch (error) {
      console.error('Error getting referral analytics:', error);
      throw error;
    }
  }

  /**
   * Get top performing referral codes for a user
   */
  private static async getTopReferralCodes(
    userId: number,
    limit: number = 5
  ): Promise<
    Array<{
      code: string;
      clicks: number;
      conversions: number;
      earnings: number;
    }>
  > {
    const db = await getDb();
    if (!db) return [];

    try {
      const codes = await db
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.userId, userId));

      const topCodes = [];

      for (const code of codes) {
        const codeClicks = await db
          .select()
          .from(referralClicks)
          .where(eq(referralClicks.referralCodeId, code.id));

        const codeConversions = await db
          .select()
          .from(referralConversions)
          .where(
            and(
              eq(referralConversions.referralCodeId, code.id),
              eq(referralConversions.status, 'earned')
            )
          );

        const earnings = codeConversions.reduce((sum: number, c: any) => sum + parseFloat(c.commissionAmount || '0'), 0);

        topCodes.push({
          code: code.code,
          clicks: codeClicks.length,
          conversions: codeConversions.length,
          earnings,
        });
      }

      // Sort by earnings and return top N
      return topCodes.sort((a, b) => b.earnings - a.earnings).slice(0, limit);
    } catch (error) {
      console.error('Error getting top referral codes:', error);
      return [];
    }
  }

  /**
   * Get clicks trend data
   */
  private static async getClicksTrend(
    userId: number,
    dateRange: 'week' | 'month' | 'quarter'
  ): Promise<Array<{ date: string; clicks: number }>> {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();
    const startDate = new Date();

    if (dateRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setMonth(now.getMonth() - 3);
    }

    try {
      const clicks = await db
        .select()
        .from(referralClicks)
        .where(
          and(
            eq(referralClicks.referrerId, userId),
            gte(referralClicks.clickedAt, startDate.toISOString())
          )
        );

      // Group by date
      const clicksByDate: Record<string, number> = {};
      clicks.forEach((click: any) => {
        const date = click.clickedAt?.split('T')[0] || '';
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;
      });

      return Object.entries(clicksByDate).map(([date, count]) => ({
        date,
        clicks: count,
      }));
    } catch (error) {
      console.error('Error getting clicks trend:', error);
      return [];
    }
  }

  /**
   * Get conversions trend data
   */
  private static async getConversionsTrend(
    userId: number,
    dateRange: 'week' | 'month' | 'quarter'
  ): Promise<Array<{ date: string; conversions: number }>> {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();
    const startDate = new Date();

    if (dateRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setMonth(now.getMonth() - 3);
    }

    try {
      const conversions = await db
        .select()
        .from(referralConversions)
        .where(
          and(
            eq(referralConversions.referrerId, userId),
            gte(referralConversions.createdAt, startDate.toISOString())
          )
        );

      // Group by date
      const conversionsByDate: Record<string, number> = {};
      conversions.forEach((conv: any) => {
        const date = conv.createdAt?.split('T')[0] || '';
        conversionsByDate[date] = (conversionsByDate[date] || 0) + 1;
      });

      return Object.entries(conversionsByDate).map(([date, count]) => ({
        date,
        conversions: count,
      }));
    } catch (error) {
      console.error('Error getting conversions trend:', error);
      return [];
    }
  }

  /**
   * Get earnings trend data
   */
  private static async getEarningsTrend(
    userId: number,
    dateRange: 'week' | 'month' | 'quarter'
  ): Promise<Array<{ date: string; earnings: number }>> {
    const db = await getDb();
    if (!db) return [];

    const now = new Date();
    const startDate = new Date();

    if (dateRange === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setMonth(now.getMonth() - 3);
    }

    try {
      const conversions = await db
        .select()
        .from(referralConversions)
        .where(
          and(
            eq(referralConversions.referrerId, userId),
            eq(referralConversions.status, 'earned'),
            gte(referralConversions.createdAt, startDate.toISOString())
          )
        );

      // Group by date
      const earningsByDate: Record<string, number> = {};
      conversions.forEach((conv: any) => {
        const date = conv.createdAt?.split('T')[0] || '';
        earningsByDate[date] = (earningsByDate[date] || 0) + parseFloat(conv.commissionAmount || '0');
      });

      return Object.entries(earningsByDate).map(([date, amount]) => ({
        date,
        earnings: amount,
      }));
    } catch (error) {
      console.error('Error getting earnings trend:', error);
      return [];
    }
  }

  /**
   * Get referral summary for a user
   */
  static async getReferralSummary(userId: number): Promise<{
    totalReferralCodes: number;
    activeReferralCodes: number;
    pendingEarnings: number;
    processedEarnings: number;
  }> {
    const db = await getDb();
    if (!db) {
      return {
        totalReferralCodes: 0,
        activeReferralCodes: 0,
        pendingEarnings: 0,
        processedEarnings: 0,
      };
    }

    try {
      // Get referral codes
      const codes = await db
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.userId, userId));

      const totalReferralCodes = codes.length;
      const activeReferralCodes = codes.filter((c: any) => c.status === 'active').length;

      // Get conversions for earnings
      const conversions = await db
        .select()
        .from(referralConversions)
        .where(eq(referralConversions.referrerId, userId));

      const pendingEarnings = conversions
        .filter((c: any) => c.status === 'pending' || c.status === 'earned')
        .reduce((sum: number, c: any) => sum + parseFloat(c.commissionAmount || '0'), 0);

      const processedEarnings = conversions
        .filter((c: any) => c.status === 'processed')
        .reduce((sum: number, c: any) => sum + parseFloat(c.commissionAmount || '0'), 0);

      return {
        totalReferralCodes,
        activeReferralCodes,
        pendingEarnings,
        processedEarnings,
      };
    } catch (error) {
      console.error('Error getting referral summary:', error);
      return {
        totalReferralCodes: 0,
        activeReferralCodes: 0,
        pendingEarnings: 0,
        processedEarnings: 0,
      };
    }
  }

  /**
   * Get payout history for a user
   */
  static async getPayoutHistory(userId: number): Promise<any[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const payouts = await db
        .select()
        .from(referralPayouts)
        .where(eq(referralPayouts.referrerId, userId));

      return payouts;
    } catch (error) {
      console.error('Error getting payout history:', error);
      return [];
    }
  }
}
