/**
 * Payout Scheduling Service
 * Handles automated payout batch creation and scheduling
 */

import { getDb } from '../db.js';
import { referralConversions, referralPayouts } from '../../drizzle/schema-referral.js';
import { users } from '../../drizzle/schema.js';
import { eq, and, gte, lte } from 'drizzle-orm';

export enum PayoutFrequency {
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export class PayoutSchedulingService {
  /**
   * Process scheduled payouts for all users
   * Should be called by a cron job or scheduled task
   */
  static async processScheduledPayouts(): Promise<{
    success: boolean;
    payoutsProcessed: number;
    totalAmount: number;
    message?: string;
    error?: string;
  }> {
    try {
      const db = await getDb();
    if (!db) throw new Error("Database not available");
      let payoutsProcessed = 0;
      let totalAmount = 0;

      // Get all users with active referral programs
      const allUsers = await db.select().from(users);

      for (const user of allUsers) {
        // Get user's payout preference (default to monthly)
        const payoutFrequency = (user.payoutFrequency as string) || PayoutFrequency.MONTHLY;

        // Check if payout is due
        const isPayoutDue = this.isPayoutDue(user.lastPayoutDate, payoutFrequency);

        if (!isPayoutDue) {
          continue;
        }

        // Get all processed conversions that haven't been paid out
        const processedConversions = await db
          .select()
          .from(referralConversions)
          .where(
            and(
              eq(referralConversions.referrerId, user.id),
              eq(referralConversions.status, 'processed')
            )
          );

        if (processedConversions.length === 0) {
          continue;
        }

        // Calculate total payout
        const payoutAmount = processedConversions.reduce(
          (sum, c) => sum + parseFloat(c.commissionAmount as any),
          0
        );

        // Create payout batch
        const result = await db.insert(referralPayouts).values({
          referrerId: user.id,
          totalAmount: payoutAmount.toString(),
          conversionCount: processedConversions.length,
          status: 'pending',
          scheduledFor: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });

        payoutsProcessed++;
        totalAmount += payoutAmount;

        // Update user's last payout date
        await db
          .update(users)
          .set({
            lastPayoutDate: new Date().toISOString(),
          })
          .where(eq(users.id, user.id));

        console.log(`Created payout batch for user ${user.id}: $${payoutAmount}`);
      }

      return {
        success: true,
        payoutsProcessed,
        totalAmount,
        message: `Processed ${payoutsProcessed} payouts totaling $${totalAmount.toFixed(2)}`,
      };
    } catch (error) {
      console.error('Error processing scheduled payouts:', error);
      return {
        success: false,
        payoutsProcessed: 0,
        totalAmount: 0,
        error: 'Failed to process scheduled payouts',
      };
    }
  }

  /**
   * Check if payout is due based on frequency and last payout date
   */
  private static isPayoutDue(lastPayoutDate: string | null, frequency: string): boolean {
    const now = new Date();
    const last = lastPayoutDate ? new Date(lastPayoutDate) : new Date(0);

    const daysSinceLastPayout = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    switch (frequency) {
      case PayoutFrequency.WEEKLY:
        return daysSinceLastPayout >= 7;
      case PayoutFrequency.BIWEEKLY:
        return daysSinceLastPayout >= 14;
      case PayoutFrequency.MONTHLY:
        return daysSinceLastPayout >= 30;
      default:
        return daysSinceLastPayout >= 30;
    }
  }

  /**
   * Set payout frequency for a user
   */
  static async setPayoutFrequency(
    userId: number,
    frequency: PayoutFrequency
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      const db = await getDb();
    if (!db) throw new Error("Database not available");

      await db
        .update(users)
        .set({
          payoutFrequency: frequency,
        })
        .where(eq(users.id, userId));

      return {
        success: true,
        message: `Payout frequency updated to ${frequency}`,
      };
    } catch (error) {
      console.error('Error setting payout frequency:', error);
      return {
        success: false,
        error: 'Failed to set payout frequency',
      };
    }
  }

  /**
   * Get next scheduled payout date for a user
   */
  static async getNextPayoutDate(userId: number): Promise<{
    success: boolean;
    nextPayoutDate?: string;
    daysUntilPayout?: number;
    error?: string;
  }> {
    try {
      const db = await getDb();
    if (!db) throw new Error("Database not available");

      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user || user.length === 0) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      const userData = user[0];
      const frequency = (userData.payoutFrequency as string) || PayoutFrequency.MONTHLY;
      const lastPayoutDate = userData.lastPayoutDate ? new Date(userData.lastPayoutDate) : new Date(0);

      let nextPayoutDate = new Date(lastPayoutDate);

      switch (frequency) {
        case PayoutFrequency.WEEKLY:
          nextPayoutDate.setDate(nextPayoutDate.getDate() + 7);
          break;
        case PayoutFrequency.BIWEEKLY:
          nextPayoutDate.setDate(nextPayoutDate.getDate() + 14);
          break;
        case PayoutFrequency.MONTHLY:
          nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
          break;
      }

      const now = new Date();
      const daysUntilPayout = Math.ceil((nextPayoutDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        success: true,
        nextPayoutDate: nextPayoutDate.toISOString(),
        daysUntilPayout: Math.max(0, daysUntilPayout),
      };
    } catch (error) {
      console.error('Error getting next payout date:', error);
      return {
        success: false,
        error: 'Failed to get next payout date',
      };
    }
  }

  /**
   * Create webhook for payout event
   */
  static async createPayoutWebhook(
    userId: number,
    webhookUrl: string,
    events: string[]
  ): Promise<{
    success: boolean;
    webhookId?: string;
    message?: string;
    error?: string;
  }> {
    try {
      // TODO: Implement webhook storage in database
      // For now, just log the webhook creation

      console.log('Creating payout webhook:', {
        userId,
        webhookUrl,
        events,
      });

      return {
        success: true,
        webhookId: `webhook_${Date.now()}`,
        message: 'Webhook created successfully',
      };
    } catch (error) {
      console.error('Error creating payout webhook:', error);
      return {
        success: false,
        error: 'Failed to create webhook',
      };
    }
  }

  /**
   * Send payout webhook notification
   */
  static async sendPayoutWebhook(
    webhookUrl: string,
    payoutData: {
      payoutId: number;
      referrerId: number;
      totalAmount: number;
      conversionCount: number;
      status: string;
      createdAt: string;
    }
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // TODO: Implement actual webhook sending
      // For now, just log the webhook data

      console.log('Sending payout webhook:', {
        webhookUrl,
        payoutData,
      });

      // In production, this would make an HTTP POST request to the webhook URL
      // const response = await fetch(webhookUrl, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'X-Webhook-Signature': generateSignature(payoutData),
      //   },
      //   body: JSON.stringify(payoutData),
      // });

      return {
        success: true,
        message: 'Webhook sent successfully',
      };
    } catch (error) {
      console.error('Error sending payout webhook:', error);
      return {
        success: false,
        error: 'Failed to send webhook',
      };
    }
  }

  /**
   * Get payout statistics for a user
   */
  static async getPayoutStatistics(userId: number): Promise<{
    success: boolean;
    statistics?: {
      totalPayoutsProcessed: number;
      totalAmountPaid: number;
      averagePayoutAmount: number;
      lastPayoutDate?: string;
      nextPayoutDate?: string;
      payoutFrequency: string;
    };
    error?: string;
  }> {
    try {
      const db = await getDb();
    if (!db) throw new Error("Database not available");

      // Get user
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user || user.length === 0) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      const userData = user[0];

      // Get completed payouts
      const completedPayouts = await db
        .select()
        .from(referralPayouts)
        .where(
          and(
            eq(referralPayouts.referrerId, userId),
            eq(referralPayouts.status, 'completed')
          )
        );

      const totalAmountPaid = completedPayouts.reduce(
        (sum, p) => sum + parseFloat(p.totalAmount as any),
        0
      );

      const averagePayoutAmount = completedPayouts.length > 0 ? totalAmountPaid / completedPayouts.length : 0;

      // Get next payout date
      const nextPayoutResult = await this.getNextPayoutDate(userId);

      return {
        success: true,
        statistics: {
          totalPayoutsProcessed: completedPayouts.length,
          totalAmountPaid,
          averagePayoutAmount,
          lastPayoutDate: userData.lastPayoutDate || undefined,
          nextPayoutDate: nextPayoutResult.nextPayoutDate,
          payoutFrequency: (userData.payoutFrequency as string) || PayoutFrequency.MONTHLY,
        },
      };
    } catch (error) {
      console.error('Error getting payout statistics:', error);
      return {
        success: false,
        error: 'Failed to get payout statistics',
      };
    }
  }
}
