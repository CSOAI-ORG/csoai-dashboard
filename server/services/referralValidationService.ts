/**
 * Referral Code Validation & Tracking Service
 * Validates referral codes and tracks referrer relationships on user creation
 */

import { getDb } from '../db.js';
import { referralCodes, referralConversions, referralClicks } from '../../drizzle/schema-referral.js';
import { users } from '../../drizzle/schema.js';
import { eq, and } from 'drizzle-orm';

export class ReferralValidationService {
  /**
   * Validate a referral code and check if it's active
   */
  static async validateReferralCode(code: string): Promise<{
    valid: boolean;
    referrerId?: number;
    referrerName?: string;
    error?: string;
  }> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Find the referral code
      const refCode = await db
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.code, code))
        .limit(1);

      if (!refCode || refCode.length === 0) {
        return {
          valid: false,
          error: 'Referral code not found',
        };
      }

      const referralCode = refCode[0];

      // Check if code is active
      if (referralCode.status !== 'active') {
        return {
          valid: false,
          error: `Referral code is ${referralCode.status}`,
        };
      }

      // Check if code has expired
      if (referralCode.expiresAt && new Date(referralCode.expiresAt) < new Date()) {
        return {
          valid: false,
          error: 'Referral code has expired',
        };
      }

      // Get referrer info
      const referrer = await db
        .select()
        .from(users)
        .where(eq(users.id, referralCode.userId))
        .limit(1);

      if (!referrer || referrer.length === 0) {
        return {
          valid: false,
          error: 'Referrer not found',
        };
      }

      return {
        valid: true,
        referrerId: referralCode.userId,
        referrerName: referrer[0].name || 'A CSOAI Member',
      };
    } catch (error) {
      console.error('Error validating referral code:', error);
      return {
        valid: false,
        error: 'Error validating referral code',
      };
    }
  }

  /**
   * Track referrer relationship when a new user signs up
   */
  static async trackReferrerRelationship(
    newUserId: number,
    referralCode: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    success: boolean;
    referrerId?: number;
    error?: string;
  }> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Validate the referral code
      const validation = await this.validateReferralCode(referralCode);

      if (!validation.valid || !validation.referrerId) {
        return {
          success: false,
          error: validation.error || 'Invalid referral code',
        };
      }

      // Get the referral code record
      const refCode = await db
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.code, referralCode))
        .limit(1);

      if (!refCode || refCode.length === 0) {
        return {
          success: false,
          error: 'Referral code not found',
        };
      }

      const referralCodeRecord = refCode[0];

      // Record the click
      await db.insert(referralClicks).values({
        referralCodeId: referralCodeRecord.id,
        referrerId: validation.referrerId,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        referrerSource: 'direct',
        clickedAt: new Date().toISOString(),
      });

      // Create a pending conversion record for the referred user
      const newUser = await db
        .select()
        .from(users)
        .where(eq(users.id, newUserId))
        .limit(1);

      if (newUser && newUser.length > 0) {
        await db.insert(referralConversions).values({
          referralCodeId: referralCodeRecord.id,
          referrerId: validation.referrerId,
          referredUserId: newUserId,
          referredEmail: newUser[0].email || '',
          certificationId: null,
          certificationName: null,
          certificationPrice: '0.00',
          commissionRate: 20,
          commissionAmount: '0.00',
          status: 'pending',
          clickedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
      }

      return {
        success: true,
        referrerId: validation.referrerId,
      };
    } catch (error) {
      console.error('Error tracking referrer relationship:', error);
      return {
        success: false,
        error: 'Error tracking referrer relationship',
      };
    }
  }

  /**
   * Get referral info for a user (if they were referred)
   */
  static async getReferralInfo(userId: number): Promise<{
    wasReferred: boolean;
    referrerId?: number;
    referrerName?: string;
    referralCode?: string;
    referredAt?: string;
  }> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Find conversion record for this user
      const conversion = await db
        .select()
        .from(referralConversions)
        .where(eq(referralConversions.referredUserId, userId))
        .limit(1);

      if (!conversion || conversion.length === 0) {
        return {
          wasReferred: false,
        };
      }

      const referralConversion = conversion[0];

      // Get referral code
      const refCode = await db
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.id, referralConversion.referralCodeId))
        .limit(1);

      if (!refCode || refCode.length === 0) {
        return {
          wasReferred: false,
        };
      }

      // Get referrer info
      const referrer = await db
        .select()
        .from(users)
        .where(eq(users.id, referralConversion.referrerId))
        .limit(1);

      return {
        wasReferred: true,
        referrerId: referralConversion.referrerId,
        referrerName: referrer && referrer.length > 0 ? referrer[0].name || 'A CSOAI Member' : 'A CSOAI Member',
        referralCode: refCode[0].code,
        referredAt: referralConversion.createdAt,
      };
    } catch (error) {
      console.error('Error getting referral info:', error);
      return {
        wasReferred: false,
      };
    }
  }

  /**
   * Record a conversion when a referred user completes a certification
   */
  static async recordConversion(
    referredUserId: number,
    certificationId: number,
    certificationName: string,
    certificationPrice: number
  ): Promise<{
    success: boolean;
    commissionAmount?: number;
    error?: string;
  }> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      // Find the conversion record for this user
      const conversion = await db
        .select()
        .from(referralConversions)
        .where(eq(referralConversions.referredUserId, referredUserId))
        .limit(1);

      if (!conversion || conversion.length === 0) {
        return {
          success: false,
          error: 'No referral record found for this user',
        };
      }

      const referralConversion = conversion[0];

      // Calculate commission (20% of certification price)
      const commissionAmount = certificationPrice * 0.2;

      // Update the conversion record
      await db
        .update(referralConversions)
        .set({
          certificationId,
          certificationName,
          certificationPrice: certificationPrice.toString(),
          commissionAmount: commissionAmount.toString(),
          status: 'earned',
          convertedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(referralConversions.id, referralConversion.id));

      // Update referral code stats
      await db
        .update(referralCodes)
        .set({
          totalConversions: referralConversion.referralCodeId ? (await db.select().from(referralConversions).where(eq(referralConversions.referralCodeId, referralConversion.referralCodeId))).length : 0,
          totalEarnings: (parseFloat(referralConversion.referralCodeId ? await this.getTotalEarnings(referralConversion.referralCodeId) : '0') + commissionAmount).toString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(referralCodes.id, referralConversion.referralCodeId));

      return {
        success: true,
        commissionAmount,
      };
    } catch (error) {
      console.error('Error recording conversion:', error);
      return {
        success: false,
        error: 'Error recording conversion',
      };
    }
  }

  /**
   * Get total earnings for a referral code
   */
  private static async getTotalEarnings(referralCodeId: number): Promise<string> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      const conversions = await db
        .select()
        .from(referralConversions)
        .where(
          and(
            eq(referralConversions.referralCodeId, referralCodeId),
            eq(referralConversions.status, 'earned')
          )
        );

      const total = conversions.reduce((sum: number, c: any) => sum + parseFloat(c.commissionAmount as any), 0);
      return total.toString();
    } catch (error) {
      console.error('Error calculating total earnings:', error);
      return '0';
    }
  }
}
