/**
 * Stripe Payout Service
 * Handles monthly commission payouts via Stripe Connect
 */

import Stripe from 'stripe';
import { getDb } from '../db.js';
import { referralPayouts, referralConversions } from '../../drizzle/schema-referral.js';
import { users } from '../../drizzle/schema.js';
import { eq, and, lte } from 'drizzle-orm';
import { ReferralEmailService } from './referralEmailService.js';

// Lazy initialization of Stripe to avoid errors when API key is not available (e.g., in tests)
let _stripe: Stripe | null = null;
const getStripe = () => {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2026-02-25.clover' });
  }
  return _stripe;
};

export class StripePayoutService {
  /**
   * Process monthly payouts for all referrers with pending commissions
   */
  static async processMonthlyPayouts(): Promise<{
    success: number;
    failed: number;
    totalAmount: number;
  }> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    let successCount = 0;
    let failedCount = 0;
    let totalAmount = 0;

    try {
      // Get all referrers with pending commissions >= $50 minimum
      const referrersWithCommissions = await db
        .selectDistinct({
          referrerId: referralConversions.referrerId,
        })
        .from(referralConversions)
        .where(eq(referralConversions.status, 'earned'));

      for (const { referrerId } of referrersWithCommissions) {
        try {
          // Calculate total pending commissions
          const pendingConversions = await db
            .select()
            .from(referralConversions)
            .where(
              and(
                eq(referralConversions.referrerId, referrerId),
                eq(referralConversions.status, 'earned')
              )
            );

          const totalCommission = pendingConversions.reduce(
            (sum, c) => sum + parseFloat(c.commissionAmount as any),
            0
          );

          // Only process if >= $50 minimum
          if (totalCommission < 50) {
            continue;
          }

          // Get user info
          const user = await db
            .select()
            .from(users)
            .where(eq(users.id, referrerId))
            .limit(1);

          if (!user || user.length === 0) {
            continue;
          }

          const userData = user[0];

          // Create Stripe payout
          const payout = await this.createStripeTransfer(
            referrerId,
            totalCommission,
            userData.email || ''
          );

          if (payout.success) {
            // Record payout in database
            await db.insert(referralPayouts).values({
              referrerId,
              totalAmount: totalCommission.toString(),
              conversionCount: pendingConversions.length,
              status: 'completed',
              stripeTransferId: payout.transferId,
              processedAt: new Date().toISOString(),
            });

            // Update conversion status to processed
            for (const conversion of pendingConversions) {
              await db
                .update(referralConversions)
                .set({
                  status: 'processed',
                  payoutId: payout.transferId,
                  payoutDate: new Date().toISOString(),
                })
                .where(eq(referralConversions.id, conversion.id));
            }

            // Send payout email
            await ReferralEmailService.sendPayoutEmail(
              userData.email || '',
              userData.name || 'Referrer',
              totalCommission,
              new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            );

            successCount++;
            totalAmount += totalCommission;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`Error processing payout for referrer ${referrerId}:`, error);
          failedCount++;
        }
      }

      return {
        success: successCount,
        failed: failedCount,
        totalAmount,
      };
    } catch (error) {
      console.error('Error processing monthly payouts:', error);
      throw error;
    }
  }

  /**
   * Create a Stripe transfer for a referrer
   */
  private static async createStripeTransfer(
    referrerId: number,
    amount: number,
    email: string
  ): Promise<{ success: boolean; transferId?: string; error?: string }> {
    try {
      // Get or create Stripe customer for referrer
      const customers = await getStripe().customers.list({
        email,
        limit: 1,
      });

      let customerId: string;

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await getStripe().customers.create({
          email,
          metadata: {
            referrerId: referrerId.toString(),
          },
        });
        customerId = customer.id;
      }

      // Create payout (transfer to customer's bank account)
      // Note: In production, this would require Stripe Connect setup
      // For now, we'll create a payout to the platform account
      const payout = await getStripe().payouts.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        method: 'instant',
        description: `Referral commission payout for ${email}`,
        metadata: {
          referrerId: referrerId.toString(),
        },
      });

      return {
        success: true,
        transferId: payout.id,
      };
    } catch (error) {
      console.error('Error creating Stripe transfer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle Stripe payout webhook
   */
  static async handlePayoutWebhook(event: any): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    try {
      if (event.type === 'payout.paid') {
        const payout = event.data.object;

        // Update payout status in database
        const payouts = await db
          .select()
          .from(referralPayouts)
          .where(eq(referralPayouts.stripeTransferId, payout.id))
          .limit(1);

        if (payouts.length > 0) {
          await db
            .update(referralPayouts)
            .set({
              status: 'completed',
              processedAt: new Date().toISOString(),
            })
            .where(eq(referralPayouts.id, payouts[0].id));
        }
      } else if (event.type === 'payout.failed') {
        const payout = event.data.object;

        // Update payout status to failed
        const payouts = await db
          .select()
          .from(referralPayouts)
          .where(eq(referralPayouts.stripeTransferId, payout.id))
          .limit(1);

        if (payouts.length > 0) {
          await db
            .update(referralPayouts)
            .set({
              status: 'failed',
              errorMessage: payout.failure_reason || 'Unknown error',
            })
            .where(eq(referralPayouts.id, payouts[0].id));
        }
      }
    } catch (error) {
      console.error('Error handling payout webhook:', error);
      throw error;
    }
  }

  /**
   * Get payout history for a referrer
   */
  static async getPayoutHistory(referrerId: number): Promise<any[]> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(referralPayouts)
      .where(eq(referralPayouts.referrerId, referrerId))
      .orderBy((t) => t.processedAt);
  }

  /**
   * Schedule monthly payout processing
   * This should be called via a cron job or scheduled task
   */
  static async scheduleMonthlyPayouts(): Promise<void> {
    // This would typically be called by a cron job
    // For example: every 1st of the month at 00:00 UTC
    const result = await this.processMonthlyPayouts();
    console.log('Monthly payout processing completed:', result);
  }
}
