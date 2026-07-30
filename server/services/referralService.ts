/**
 * Referral Service
 * Handles referral code generation, tracking, and commission calculations
 */

import { getDb } from "../db.js";
import { referralCodes, referralConversions, referralClicks, referralPayouts, referralEmailLogs } from "../../drizzle/schema-referral.js";
import { users } from "../../drizzle/schema.js";
import { eq, and, gte, lte, sum } from "drizzle-orm";
import crypto from "crypto";

export interface ReferralStats {
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  recentActivity: any[];
}

export interface ReferralCodeInfo {
  code: string;
  status: string;
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  createdAt: string;
}

export class ReferralService {
  /**
   * Generate a new referral code for a user
   */
  static async generateReferralCode(userId: number): Promise<string> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Generate unique code
    let code: string;
    let exists = true;
    
    while (exists) {
      code = "REF-" + crypto.randomBytes(6).toString("hex").toUpperCase();
      const existing = await db
        .select()
        .from(referralCodes)
        .where(eq(referralCodes.code, code))
        .limit(1);
      
      exists = existing.length > 0;
    }

    // Store referral code
    await db.insert(referralCodes).values({
      userId,
      code: code!,
      status: "active",
      totalClicks: 0,
      totalConversions: 0,
      totalEarnings: "0.00",
    });

    return code!;
  }

  /**
   * Get referral code for a user
   */
  static async getUserReferralCode(userId: number): Promise<ReferralCodeInfo | null> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, userId))
      .limit(1);

    if (result.length === 0) return null;

    const code = result[0];
    return {
      code: code.code,
      status: code.status,
      totalClicks: code.totalClicks,
      totalConversions: code.totalConversions,
      totalEarnings: parseFloat(code.totalEarnings as any),
      createdAt: code.createdAt,
    };
  }

  /**
   * Track a referral click
   */
  static async trackReferralClick(
    code: string,
    ipAddress?: string,
    userAgent?: string,
    source?: string
  ): Promise<boolean> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Find referral code
    const refCode = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);

    if (refCode.length === 0) return false;

    const codeRecord = refCode[0];

    // Record click
    await db.insert(referralClicks).values({
      referralCodeId: codeRecord.id,
      referrerId: codeRecord.userId,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      referrerSource: (source as any) || "direct",
      clickedAt: new Date().toISOString(),
    });

    // Update click count
    await db
      .update(referralCodes)
      .set({ totalClicks: codeRecord.totalClicks + 1 })
      .where(eq(referralCodes.id, codeRecord.id));

    return true;
  }

  /**
   * Record a referral conversion (certification completion)
   */
  static async recordConversion(
    referralCode: string,
    referredUserId: number,
    referredEmail: string,
    certificationId: number,
    certificationName: string,
    certificationPrice: number
  ): Promise<boolean> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Find referral code
    const refCode = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, referralCode))
      .limit(1);

    if (refCode.length === 0) return false;

    const codeRecord = refCode[0];
    const commissionRate = 20; // 20% commission
    const commissionAmount = (certificationPrice * commissionRate) / 100;

    // Record conversion
    await db.insert(referralConversions).values({
      referralCodeId: codeRecord.id,
      referrerId: codeRecord.userId,
      referredUserId,
      referredEmail,
      certificationId,
      certificationName,
      certificationPrice: certificationPrice.toString(),
      commissionRate,
      commissionAmount: commissionAmount.toString(),
      status: "earned",
      clickedAt: new Date().toISOString(),
      convertedAt: new Date().toISOString(),
    });

    // Update referral code stats
    const newEarnings =
      parseFloat(codeRecord.totalEarnings as any) + commissionAmount;
    await db
      .update(referralCodes)
      .set({
        totalConversions: codeRecord.totalConversions + 1,
        totalEarnings: newEarnings.toString(),
      })
      .where(eq(referralCodes.id, codeRecord.id));

    return true;
  }

  /**
   * Get referral statistics for a user
   */
  static async getReferralStats(userId: number): Promise<ReferralStats> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get referral code
    const refCode = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, userId))
      .limit(1);

    if (refCode.length === 0) {
      return {
        totalClicks: 0,
        totalConversions: 0,
        totalEarnings: 0,
        recentActivity: [],
      };
    }

    const codeRecord = refCode[0];

    // Get recent conversions
    const recentConversions = await db
      .select()
      .from(referralConversions)
      .where(eq(referralConversions.referrerId, userId))
      .orderBy((t) => t.convertedAt)
      .limit(10);

    return {
      totalClicks: codeRecord.totalClicks,
      totalConversions: codeRecord.totalConversions,
      totalEarnings: parseFloat(codeRecord.totalEarnings as any),
      recentActivity: recentConversions.map((c: any) => ({
        referredEmail: c.referredEmail,
        certificationName: c.certificationName,
        commissionAmount: parseFloat(c.commissionAmount as any),
        convertedAt: c.convertedAt,
        status: c.status,
      })),
    };
  }

  /**
   * Calculate pending commissions for a user
   */
  static async calculatePendingCommissions(userId: number): Promise<number> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select({
        total: sum(referralConversions.commissionAmount),
      })
      .from(referralConversions)
      .where(
        and(
          eq(referralConversions.referrerId, userId),
          eq(referralConversions.status, "earned")
        )
      );

    return result[0]?.total ? parseFloat(result[0].total as any) : 0;
  }

  /**
   * Log referral email
   */
  static async logReferralEmail(
    referrerId: number,
    referredUserId: number | null,
    eventType: string,
    recipientEmail: string,
    subject: string,
    resendMessageId?: string
  ): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.insert(referralEmailLogs).values({
      referrerId,
      referredUserId: referredUserId || null,
      eventType: eventType as any,
      recipientEmail,
      subject,
      status: "sent",
      resendMessageId: resendMessageId || null,
      sentAt: new Date().toISOString(),
    });
  }

  /**
   * Get referral code by code string
   */
  static async getReferralCodeByCode(code: string): Promise<any | null> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);

    return result[0] || null;
  }
}
