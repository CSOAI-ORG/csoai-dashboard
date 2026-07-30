/**
 * Commission Approval Service
 * Handles commission approval workflow and payout processing
 */

import { getDb } from '../db.js';
import { referralConversions, referralPayouts } from '../../drizzle/schema-referral.js';
import { eq, and } from 'drizzle-orm';

export class CommissionApprovalService {
  /**
   * Get pending commission approvals for a user
   */
  static async getPendingApprovals(userId: number): Promise<
    Array<{
      id: number;
      referredUserEmail: string;
      referredUserName?: string;
      certificationName: string;
      commissionAmount: number;
      status: string;
      submittedDate: string;
    }>
  > {
    const db = await getDb();
    if (!db) return [];

    try {
      const conversions = await db
        .select()
        .from(referralConversions)
        .where(
          and(
            eq(referralConversions.referrerId, userId),
            eq(referralConversions.status, 'earned')
          )
        );

      return conversions.map((c: any) => ({
        id: c.id,
        referredUserEmail: c.referredEmail,
        certificationName: c.certificationName || 'Unknown',
        commissionAmount: parseFloat(c.commissionAmount as any),
        status: c.status,
        submittedDate: c.convertedAt || c.createdAt,
      }));
    } catch (error) {
      console.error('Error getting pending approvals:', error);
      return [];
    }
  }

  /**
   * Approve a commission
   */
  static async approveCommission(conversionId: number, userId: number): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    const db = await getDb();
    if (!db) return { success: false, error: 'Database not available' };

    try {
      // Get the conversion record
      const conversion = await db
        .select()
        .from(referralConversions)
        .where(eq(referralConversions.id, conversionId))
        .limit(1);

      if (!conversion || conversion.length === 0) {
        return {
          success: false,
          error: 'Conversion not found',
        };
      }

      const conv = conversion[0];

      // Verify ownership
      if (conv.referrerId !== userId) {
        return {
          success: false,
          error: 'Unauthorized',
        };
      }

      // Update conversion status to 'processed'
      await db
        .update(referralConversions)
        .set({
          status: 'processed',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(referralConversions.id, conversionId));

      return {
        success: true,
        message: 'Commission approved successfully',
      };
    } catch (error) {
      console.error('Error approving commission:', error);
      return {
        success: false,
        error: 'Failed to approve commission',
      };
    }
  }

  /**
   * Reject a commission
   */
  static async rejectCommission(conversionId: number, userId: number): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    const db = await getDb();
    if (!db) return { success: false, error: 'Database not available' };

    try {
      // Get the conversion record
      const conversion = await db
        .select()
        .from(referralConversions)
        .where(eq(referralConversions.id, conversionId))
        .limit(1);

      if (!conversion || conversion.length === 0) {
        return {
          success: false,
          error: 'Conversion not found',
        };
      }

      const conv = conversion[0];

      // Verify ownership
      if (conv.referrerId !== userId) {
        return {
          success: false,
          error: 'Unauthorized',
        };
      }

      // Update conversion status to 'failed'
      await db
        .update(referralConversions)
        .set({
          status: 'failed',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(referralConversions.id, conversionId));

      return {
        success: true,
        message: 'Commission rejected successfully',
      };
    } catch (error) {
      console.error('Error rejecting commission:', error);
      return {
        success: false,
        error: 'Failed to reject commission',
      };
    }
  }

  /**
   * Get commission payout history
   */
  static async getPayoutHistory(userId: number): Promise<
    Array<{
      id: number;
      totalAmount: number;
      conversionCount: number;
      status: string;
      processedAt?: string;
      createdAt: string;
    }>
  > {
    const db = await getDb();
    if (!db) return [];

    try {
      const payouts = await db
        .select()
        .from(referralPayouts)
        .where(eq(referralPayouts.referrerId, userId));

      return payouts.map((p: any) => ({
        id: p.id,
        totalAmount: parseFloat(p.totalAmount as any),
        conversionCount: p.conversionCount,
        status: p.status,
        processedAt: p.processedAt,
        createdAt: p.createdAt,
      }));
    } catch (error) {
      console.error('Error getting payout history:', error);
      return [];
    }
  }

  /**
   * Create a payout batch for approved commissions
   */
  static async createPayoutBatch(userId: number): Promise<{
    success: boolean;
    payoutId?: number;
    totalAmount?: number;
    conversionCount?: number;
    message?: string;
    error?: string;
  }> {
    const db = await getDb();
    if (!db) return { success: false, error: 'Database not available' };

    try {
      // Get all processed conversions that haven't been paid out
      const processedConversions = await db
        .select()
        .from(referralConversions)
        .where(
          and(
            eq(referralConversions.referrerId, userId),
            eq(referralConversions.status, 'processed')
          )
        );

      if (processedConversions.length === 0) {
        return {
          success: false,
          error: 'No processed commissions to payout',
        };
      }

      // Calculate total
      const totalAmount = processedConversions.reduce(
        (sum, c) => sum + parseFloat(c.commissionAmount as any),
        0
      );

      // Create payout record
      const result = await db.insert(referralPayouts).values({
        referrerId: userId,
        totalAmount: totalAmount.toString(),
        conversionCount: processedConversions.length,
        status: 'pending',
        scheduledFor: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      return {
        success: true,
        payoutId: result[0]?.insertId || 0 as number,
        totalAmount,
        conversionCount: processedConversions.length,
        message: 'Payout batch created successfully',
      };
    } catch (error) {
      console.error('Error creating payout batch:', error);
      return {
        success: false,
        error: 'Failed to create payout batch',
      };
    }
  }

  /**
   * Mark payout as completed
   */
  static async completePayoutBatch(payoutId: number, userId: number): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    const db = await getDb();
    if (!db) return { success: false, error: 'Database not available' };

    try {
      // Get the payout record
      const payout = await db
        .select()
        .from(referralPayouts)
        .where(eq(referralPayouts.id, payoutId))
        .limit(1);

      if (!payout || payout.length === 0) {
        return {
          success: false,
          error: 'Payout not found',
        };
      }

      const p = payout[0];

      // Verify ownership
      if (p.referrerId !== userId) {
        return {
          success: false,
          error: 'Unauthorized',
        };
      }

      // Update payout status to 'completed'
      await db
        .update(referralPayouts)
        .set({
          status: 'completed',
          processedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(referralPayouts.id, payoutId));

      return {
        success: true,
        message: 'Payout completed successfully',
      };
    } catch (error) {
      console.error('Error completing payout:', error);
      return {
        success: false,
        error: 'Failed to complete payout',
      };
    }
  }

  /**
   * Get commission statistics
   */
  static async getCommissionStats(userId: number): Promise<{
    totalEarned: number;
    totalProcessed: number;
    totalPending: number;
    totalFailed: number;
    averageCommission: number;
  }> {
    const db = await getDb();
    if (!db) return { totalEarned: 0, totalProcessed: 0, totalPending: 0, totalFailed: 0, averageCommission: 0 };

    try {
      const conversions = await db
        .select()
        .from(referralConversions)
        .where(eq(referralConversions.referrerId, userId));

      const earned = conversions.filter((c: any) => c.status === 'earned');
      const processed = conversions.filter((c: any) => c.status === 'processed');
      const pending = conversions.filter((c: any) => c.status === 'pending');
      const failed = conversions.filter((c: any) => c.status === 'failed');

      const totalEarned = earned.reduce((sum: number, c: any) => sum + parseFloat(c.commissionAmount as any), 0);
      const totalProcessed = processed.reduce((sum: number, c: any) => sum + parseFloat(c.commissionAmount as any), 0);
      const totalPending = pending.reduce((sum: number, c: any) => sum + parseFloat(c.commissionAmount as any), 0);
      const totalFailed = failed.reduce((sum: number, c: any) => sum + parseFloat(c.commissionAmount as any), 0);

      const averageCommission = conversions.length > 0 ? totalEarned / conversions.length : 0;

      return {
        totalEarned,
        totalProcessed,
        totalPending,
        totalFailed,
        averageCommission,
      };
    } catch (error) {
      console.error('Error getting commission stats:', error);
      return {
        totalEarned: 0,
        totalProcessed: 0,
        totalPending: 0,
        totalFailed: 0,
        averageCommission: 0,
      };
    }
  }
}
