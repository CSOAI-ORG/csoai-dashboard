/**
 * Referral Program Service
 * Manages user referrals, commission tracking, and payout processing
 * 20% commission per referred analyst certification
 */

import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export interface ReferralLink {
  code: string;
  url: string;
  expiresAt: Date;
  status: 'active' | 'expired' | 'converted';
}

export interface ReferralEarnings {
  referrerId: string;
  totalEarnings: number; // in cents
  pendingEarnings: number;
  processedEarnings: number;
  totalReferrals: number;
  convertedReferrals: number;
  conversionRate: number;
  nextPayoutDate: Date;
}

export interface ReferralStats {
  totalReferrers: number;
  totalReferrals: number;
  totalConversions: number;
  totalCommissions: number; // in cents
  averageCommissionPerReferral: number;
  topReferrers: Array<{
    referrerId: string;
    earnings: number;
    referrals: number;
    conversions: number;
  }>;
}

/**
 * Referral Program Service
 * Manages referral links, commission calculations, and payouts
 */
export class ReferralProgramService {
  private static readonly COMMISSION_RATE = 20; // 20%
  private static readonly REFERRAL_VALIDITY_DAYS = 90;
  private static readonly PAYOUT_THRESHOLD_CENTS = 5000; // $50 minimum

  /**
   * Generate a unique referral code for a user
   */
  static generateReferralCode(userId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    const hash = crypto
      .createHash('sha256')
      .update(`${userId}-${timestamp}-${random}`)
      .digest('hex')
      .substr(0, 8)
      .toUpperCase();

    return `CSOAI-${hash}`;
  }

  /**
   * Create a new referral link for a user
   */
  static async createReferralLink(userId: string): Promise<ReferralLink> {
    try {
      const code = this.generateReferralCode(userId);
      const expiresAt = new Date(Date.now() + this.REFERRAL_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

      // In production, save to database
      // await db.insert(referrals).values({
      //   referrerId: userId,
      //   referralCode: code,
      //   status: 'active',
      //   expiresAt,
      //   createdAt: new Date().toISOString(),
      // });

      return {
        code,
        url: `https://csoai.org/join?ref=${code}`,
        expiresAt,
        status: 'active',
      };
    } catch (error) {
      console.error('Failed to create referral link:', error);
      throw new Error('Failed to create referral link');
    }
  }

  /**
   * Track a referral conversion (when referred user completes certification)
   */
  static async trackConversion(referralCode: string, referredUserId: string, coursePrice: number) {
    try {
      // Calculate commission (20% of course price)
      const commissionAmount = Math.round(coursePrice * this.COMMISSION_RATE) / 100;

      // In production, update referral status and create commission record
      // await db.update(referrals)
      //   .set({
      //     referredUserId,
      //     status: 'converted',
      //     conversionDate: new Date().toISOString(),
      //     commissionAmount,
      //   })
      //   .where(eq(referrals.referralCode, referralCode));

      // await db.insert(commissions).values({
      //   referrerId: referrer.id,
      //   referralId: referral.id,
      //   courseId: course.id,
      //   commissionRate: this.COMMISSION_RATE,
      //   commissionAmount,
      //   status: 'earned',
      //   createdAt: new Date().toISOString(),
      // });

      return {
        referralCode,
        referredUserId,
        commissionAmount,
        status: 'tracked',
      };
    } catch (error) {
      console.error('Failed to track conversion:', error);
      throw new Error('Failed to track conversion');
    }
  }

  /**
   * Get referral earnings for a user
   */
  static async getReferralEarnings(userId: string): Promise<ReferralEarnings> {
    try {
      // In production, query commissions table
      // const commissions = await db.query.commissions.findMany({
      //   where: eq(commissions.referrerId, userId),
      // });

      // For now, return structure
      return {
        referrerId: userId,
        totalEarnings: 0,
        pendingEarnings: 0,
        processedEarnings: 0,
        totalReferrals: 0,
        convertedReferrals: 0,
        conversionRate: 0,
        nextPayoutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    } catch (error) {
      console.error('Failed to get referral earnings:', error);
      throw new Error('Failed to get referral earnings');
    }
  }

  /**
   * Get referral statistics for dashboard
   */
  static async getReferralStats(): Promise<ReferralStats> {
    try {
      // In production, aggregate from referrals and commissions tables
      // const referrals = await db.query.referrals.findMany();
      // const commissions = await db.query.commissions.findMany();

      // For now, return structure
      return {
        totalReferrers: 0,
        totalReferrals: 0,
        totalConversions: 0,
        totalCommissions: 0,
        averageCommissionPerReferral: 0,
        topReferrers: [],
      };
    } catch (error) {
      console.error('Failed to get referral statistics:', error);
      throw new Error('Failed to get referral statistics');
    }
  }

  /**
   * Process pending payouts for referrers
   */
  static async processPendingPayouts() {
    try {
      // In production, query pending commissions and process Stripe payouts
      // const pendingCommissions = await db.query.commissions.findMany({
      //   where: eq(commissions.status, 'pending'),
      // });

      // Group by referrer and calculate total
      // For each referrer with >= $50 pending:
      //   - Create Stripe payout
      //   - Update commission status to 'processed'
      //   - Record payout date

      return {
        processed: 0,
        failed: 0,
        totalAmount: 0,
      };
    } catch (error) {
      console.error('Failed to process payouts:', error);
      throw new Error('Failed to process payouts');
    }
  }

  /**
   * Generate referral marketing materials
   */
  static generateMarketingMaterials(referralCode: string, userName: string) {
    const referralUrl = `https://csoai.org/join?ref=${referralCode}`;

    return {
      emailTemplate: `
Hi there!

I'm earning 20% commission by referring analysts to CSOAI - the world's leading AI Safety Certification platform.

Join me and get certified as an AI Safety Analyst:
${referralUrl}

You'll get:
✅ Industry-recognized certification
✅ Job board access
✅ Government integration
✅ Career advancement

Use my referral link above and we both benefit!

Best,
${userName}
      `,
      socialTemplate: `
🚀 I'm becoming a certified AI Safety Analyst with CSOAI!

Join me reviewing AI systems for compliance.

Get 20% off with my referral link:
${referralUrl}

#AISafety #Certification #Jobs
      `,
      linkedinTemplate: `
I'm excited to share that I'm pursuing my CEASA (Certified EU AI Safety Analyst) certification with CSOAI.

If you're interested in joining the fastest-growing AI safety profession, use my referral link:
${referralUrl}

Benefits:
• Industry-recognized certification
• Job opportunities
• Government compliance oversight
• Career advancement in AI governance

Looking forward to seeing you in the program!
      `,
    };
  }

  /**
   * Validate referral code
   */
  static async validateReferralCode(code: string): Promise<boolean> {
    try {
      // In production, check if code exists, is active, and not expired
      // const referral = await db.query.referrals.findFirst({
      //   where: eq(referrals.referralCode, code),
      // });

      // return referral && referral.status === 'active' && new Date().toISOString() < referral.expiresAt;

      return true; // Placeholder
    } catch (error) {
      console.error('Failed to validate referral code:', error);
      return false;
    }
  }

  /**
   * Get top referrers leaderboard
   */
  static async getTopReferrers(limit = 10): Promise<
    Array<{
      userId: string;
      earnings: number;
      referrals: number;
      conversions: number;
      rank: number;
    }>
  > {
    try {
      // In production, query and rank referrers by earnings
      // const topReferrers = await db.query.commissions.findMany({
      //   orderBy: desc(sum(commissions.commissionAmount)),
      //   limit,
      // });

      return [];
    } catch (error) {
      console.error('Failed to get top referrers:', error);
      throw new Error('Failed to get top referrers');
    }
  }
}
