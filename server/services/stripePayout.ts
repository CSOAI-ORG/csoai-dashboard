/**
 * Stripe Referral Payout Service
 * Manages commission calculations, payout processing, and webhook handling
 * Note: Using in-memory storage until commissions table is added to schema
 */

import Stripe from 'stripe';
import { PayoutEmailService } from './payoutEmailService';

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

export interface PayoutConfig {
  referrerId: string;
  referralId: number;
  courseId?: number;
  commissionRate: number; // percentage
  commissionAmount: number; // in cents
}

export interface PayoutResult {
  payoutId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduledDate: Date;
  completedDate?: Date;
}

// In-memory commissions storage
interface Commission {
  id: number;
  referrerId: string;
  referralId: number;
  courseId?: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'earned' | 'pending' | 'processed' | 'failed';
  payoutId?: string | null;
  createdAt: Date;
  processedAt?: Date;
}

const commissionsStore: Commission[] = [];
let commissionIdCounter = 1;

/**
 * Stripe Payout Service
 * Manages monthly commission payouts via Stripe Connect
 */
export class StripePayoutService {
  private static readonly PAYOUT_THRESHOLD_CENTS = 5000; // $50 minimum
  private static readonly PAYOUT_DAY_OF_MONTH = 1; // First day of month

  /**
   * Create a commission record for a referral
   */
  static async createCommission(config: PayoutConfig): Promise<number> {
    try {
      const commission: Commission = {
        id: commissionIdCounter++,
        referrerId: config.referrerId,
        referralId: config.referralId,
        courseId: config.courseId,
        commissionRate: config.commissionRate,
        commissionAmount: config.commissionAmount,
        status: 'earned',
        createdAt: new Date(),
      };
      commissionsStore.push(commission);
      return commission.id;
    } catch (error) {
      console.error('Failed to create commission:', error);
      throw new Error('Failed to create commission');
    }
  }

  /**
   * Calculate total pending commissions for a referrer
   */
  static async calculatePendingCommissions(referrerId: string): Promise<number> {
    try {
      const pendingCommissions = commissionsStore.filter(
        c => c.referrerId === referrerId && c.status === 'earned'
      );
      return pendingCommissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
    } catch (error) {
      console.error('Failed to calculate pending commissions:', error);
      throw new Error('Failed to calculate pending commissions');
    }
  }

  /**
   * Process monthly payouts for all eligible referrers
   */
  static async processMonthlyPayouts(): Promise<PayoutResult[]> {
    try {
      const results: PayoutResult[] = [];

      // Get all unique referrers with pending commissions
      const allCommissions = commissionsStore.filter(c => c.status === 'earned');

      const referrerMap = new Map<string, number>();
      allCommissions.forEach((c) => {
        const current = referrerMap.get(c.referrerId) || 0;
        referrerMap.set(c.referrerId, current + (c.commissionAmount || 0));
      });

      // Process payouts for referrers meeting threshold
      for (const [referrerId, totalAmount] of referrerMap.entries()) {
        if (totalAmount >= this.PAYOUT_THRESHOLD_CENTS) {
          const result = await this.processPayout(referrerId, totalAmount);
          results.push(result);
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to process monthly payouts:', error);
      throw new Error('Failed to process monthly payouts');
    }
  }

  /**
   * Process a single payout for a referrer
   */
  static async processPayout(referrerId: string, amount: number): Promise<PayoutResult> {
    try {
      // Create Stripe payout
      const payout = await getStripe().payouts.create({
        amount,
        currency: 'usd',
        method: 'instant',
        description: `CSOAI Referral Commission - ${referrerId}`,
      });

      const payoutId = payout.id;

      // Update all earned commissions for this referrer to pending
      commissionsStore.forEach(c => {
        if (c.referrerId === referrerId && c.status === 'earned') {
          c.status = 'pending';
          c.payoutId = payoutId;
        }
      });

      return {
        payoutId,
        amount,
        status: 'processing',
        scheduledDate: new Date(),
      };
    } catch (error) {
      console.error('Failed to process payout:', error);

      // Update commissions to failed status
      commissionsStore.forEach(c => {
        if (c.referrerId === referrerId && c.status === 'pending') {
          c.status = 'failed';
        }
      });

      throw new Error('Failed to process payout');
    }
  }

  /**
   * Handle Stripe payout webhook events
   */
  static async handlePayoutWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'payout.paid':
          await this.handlePayoutPaid(event.data.object as Stripe.Payout);
          break;
        case 'payout.failed':
          await this.handlePayoutFailed(event.data.object as Stripe.Payout);
          break;
        case 'payout.canceled':
          await this.handlePayoutCanceled(event.data.object as Stripe.Payout);
          break;
        default:
          console.log(`Unhandled payout event: ${event.type}`);
      }
    } catch (error) {
      console.error('Failed to handle payout webhook:', error);
      throw new Error('Failed to handle payout webhook');
    }
  }

  /**
   * Handle successful payout
   */
  private static async handlePayoutPaid(payout: Stripe.Payout): Promise<void> {
    try {
      let referrerId: string | null = null;
      commissionsStore.forEach(c => {
        if (c.payoutId === payout.id) {
          c.status = 'processed';
          c.processedAt = new Date();
          referrerId = c.referrerId;
        }
      });
      console.log(`Payout ${payout.id} completed successfully`);

      // Send email notification
      if (referrerId) {
        await PayoutEmailService.sendPayoutProcessedEmail({
          userId: parseInt(referrerId),
          amount: payout.amount,
          currency: payout.currency,
          payoutId: payout.id,
          status: 'completed',
          processedDate: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to handle payout paid:', error);
    }
  }

  /**
   * Handle failed payout
   */
  private static async handlePayoutFailed(payout: Stripe.Payout): Promise<void> {
    try {
      let referrerId: string | null = null;
      commissionsStore.forEach(c => {
        if (c.payoutId === payout.id) {
          c.status = 'failed';
          referrerId = c.referrerId;
        }
      });
      console.log(`Payout ${payout.id} failed`);

      // Send email notification
      if (referrerId) {
        await PayoutEmailService.sendPayoutFailedEmail({
          userId: parseInt(referrerId),
          amount: payout.amount,
          currency: payout.currency,
          payoutId: payout.id,
          status: 'failed',
          errorMessage: payout.failure_message || 'Payout could not be processed',
        });
      }
    } catch (error) {
      console.error('Failed to handle payout failed:', error);
    }
  }

  /**
   * Handle canceled payout
   */
  private static async handlePayoutCanceled(payout: Stripe.Payout): Promise<void> {
    try {
      commissionsStore.forEach(c => {
        if (c.payoutId === payout.id) {
          c.status = 'earned';
          c.payoutId = null;
        }
      });
      console.log(`Payout ${payout.id} canceled`);
    } catch (error) {
      console.error('Failed to handle payout canceled:', error);
    }
  }

  /**
   * Get payout history for a referrer
   */
  static async getPayoutHistory(referrerId: string) {
    try {
      const commissionRecords = commissionsStore.filter(c => c.referrerId === referrerId);

      // Group by payout ID
      const payoutMap = new Map<string | null, Commission[]>();
      commissionRecords.forEach((c) => {
        const payoutId = c.payoutId || 'unpaid';
        if (!payoutMap.has(payoutId)) {
          payoutMap.set(payoutId, []);
        }
        payoutMap.get(payoutId)!.push(c);
      });

      const history = Array.from(payoutMap.entries()).map(([payoutId, records]) => {
        const totalAmount = records.reduce((sum, r) => sum + (r.commissionAmount || 0), 0);
        const status = records[0]?.status || 'unknown';

        return {
          payoutId: payoutId === 'unpaid' ? null : payoutId,
          amount: totalAmount,
          status,
          count: records.length,
          createdAt: records[0]?.createdAt,
          processedAt: records[0]?.processedAt,
        };
      });

      return history;
    } catch (error) {
      console.error('Failed to get payout history:', error);
      throw new Error('Failed to get payout history');
    }
  }

  /**
   * Schedule next monthly payout
   */
  static getNextPayoutDate(): Date {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, this.PAYOUT_DAY_OF_MONTH);

    // If today is already past the payout day, schedule for next month
    if (today.getDate() > this.PAYOUT_DAY_OF_MONTH) {
      nextMonth.setMonth(nextMonth.getMonth() + 1);
    }

    return nextMonth;
  }

  /**
   * Verify Stripe webhook signature
   */
  static verifyWebhookSignature(body: string, signature: string): Stripe.Event {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
      return getStripe().webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      console.error('Failed to verify webhook signature:', error);
      throw new Error('Invalid webhook signature');
    }
  }
}
