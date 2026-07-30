/**
 * Stripe Connect Service
 * Manages connected accounts for specialists to receive payouts
 * Uses Express accounts for simplified onboarding
 */

import Stripe from 'stripe';
import { getDb } from '../db';
import { users } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
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

export interface ConnectAccountStatus {
  hasAccount: boolean;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
  } | null;
}

export interface OnboardingLinkResult {
  url: string;
  expiresAt: Date;
}

export interface TransferResult {
  transferId: string;
  amount: number;
  currency: string;
  status: string;
  destinationAccountId: string;
}

/**
 * Stripe Connect Service for managing specialist payouts
 */
export class StripeConnectService {
  /**
   * Create a new Stripe Connect Express account for a user
   */
  static async createConnectAccount(
    userId: number,
    email: string,
    country: string = 'US'
  ): Promise<string> {
    try {
      // Create Express account
      const account = await getStripe().accounts.create({
        type: 'express',
        country,
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          userId: userId.toString(),
          platform: 'csoai',
        },
      });

      // Store the account ID in the user's record
      const db = await getDb();
      if (db) {
        await db
          .update(users)
          .set({ stripeConnectAccountId: account.id } as any)
          .where(eq(users.id, userId));
      }

      return account.id;
    } catch (error) {
      console.error('Failed to create Connect account:', error);
      throw new Error('Failed to create Stripe Connect account');
    }
  }

  /**
   * Generate an onboarding link for a Connect account
   */
  static async createOnboardingLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string
  ): Promise<OnboardingLinkResult> {
    try {
      const accountLink = await getStripe().accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });

      return {
        url: accountLink.url,
        expiresAt: new Date(accountLink.expires_at * 1000),
      };
    } catch (error) {
      console.error('Failed to create onboarding link:', error);
      throw new Error('Failed to create onboarding link');
    }
  }

  /**
   * Get the status of a Connect account
   */
  static async getAccountStatus(accountId: string): Promise<ConnectAccountStatus> {
    try {
      const account = await getStripe().accounts.retrieve(accountId);

      return {
        hasAccount: true,
        accountId: account.id,
        chargesEnabled: account.charges_enabled || false,
        payoutsEnabled: account.payouts_enabled || false,
        detailsSubmitted: account.details_submitted || false,
        requirements: account.requirements ? {
          currentlyDue: account.requirements.currently_due || [],
          eventuallyDue: account.requirements.eventually_due || [],
          pastDue: account.requirements.past_due || [],
        } : null,
      };
    } catch (error) {
      console.error('Failed to get account status:', error);
      return {
        hasAccount: false,
        accountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        requirements: null,
      };
    }
  }

  /**
   * Get Connect account ID for a user
   */
  static async getUserConnectAccountId(userId: number): Promise<string | null> {
    try {
      const db = await getDb();
      if (!db) return null;

      const [user] = await db
        .select({ stripeConnectAccountId: (users as any).stripeConnectAccountId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return user?.stripeConnectAccountId || null;
    } catch (error) {
      console.error('Failed to get user Connect account ID:', error);
      return null;
    }
  }

  /**
   * Transfer funds to a connected account
   */
  static async createTransfer(
    destinationAccountId: string,
    amount: number, // in cents
    currency: string = 'usd',
    description?: string,
    metadata?: Record<string, string>
  ): Promise<TransferResult> {
    try {
      const transfer = await getStripe().transfers.create({
        amount,
        currency,
        destination: destinationAccountId,
        description: description || 'CSOAI Commission Payout',
        metadata: {
          platform: 'csoai',
          ...metadata,
        },
      });

      return {
        transferId: transfer.id,
        amount: transfer.amount,
        currency: transfer.currency,
        status: transfer.reversed ? 'reversed' : 'completed',
        destinationAccountId: transfer.destination as string,
      };
    } catch (error) {
      console.error('Failed to create transfer:', error);
      throw new Error('Failed to transfer funds to connected account');
    }
  }

  /**
   * Create a payout to a connected account's bank
   */
  static async createPayout(
    accountId: string,
    amount: number, // in cents
    currency: string = 'usd',
    description?: string
  ): Promise<{ payoutId: string; status: string }> {
    try {
      const payout = await getStripe().payouts.create(
        {
          amount,
          currency,
          description: description || 'CSOAI Commission Payout',
        },
        {
          stripeAccount: accountId,
        }
      );

      return {
        payoutId: payout.id,
        status: payout.status,
      };
    } catch (error) {
      console.error('Failed to create payout:', error);
      throw new Error('Failed to create payout');
    }
  }

  /**
   * Get the balance of a connected account
   */
  static async getAccountBalance(accountId: string): Promise<{
    available: number;
    pending: number;
    currency: string;
  }> {
    try {
      const balance = await getStripe().balance.retrieve({
        stripeAccount: accountId,
      });

      const available = balance.available.find(b => b.currency === 'usd');
      const pending = balance.pending.find(b => b.currency === 'usd');

      return {
        available: available?.amount || 0,
        pending: pending?.amount || 0,
        currency: 'usd',
      };
    } catch (error) {
      console.error('Failed to get account balance:', error);
      return {
        available: 0,
        pending: 0,
        currency: 'usd',
      };
    }
  }

  /**
   * Create a login link for the connected account dashboard
   */
  static async createDashboardLink(accountId: string): Promise<string> {
    try {
      const loginLink = await getStripe().accounts.createLoginLink(accountId);
      return loginLink.url;
    } catch (error) {
      console.error('Failed to create dashboard link:', error);
      throw new Error('Failed to create dashboard link');
    }
  }

  /**
   * Handle Connect webhook events
   */
  static async handleConnectWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;
        case 'account.application.deauthorized':
          await this.handleAccountDeauthorized(event.data.object as any);
          break;
        case 'payout.paid':
          await this.handlePayoutPaid(event.data.object as Stripe.Payout, event.account);
          break;
        case 'payout.failed':
          await this.handlePayoutFailed(event.data.object as Stripe.Payout, event.account);
          break;
        default:
          console.log(`Unhandled Connect event: ${event.type}`);
      }
    } catch (error) {
      console.error('Failed to handle Connect webhook:', error);
      throw error;
    }
  }

  /**
   * Handle account updated event
   */
  private static async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    console.log(`Connect account ${account.id} updated:`, {
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });

    // Could update user record with account status if needed
  }

  /**
   * Handle account deauthorized event
   */
  private static async handleAccountDeauthorized(data: { id: string }): Promise<void> {
    console.log(`Connect account ${data.id} deauthorized`);

    // Find and update user record
    const db = await getDb();
    if (db) {
      // Note: This requires the stripeConnectAccountId column to exist
      // await db
      //   .update(users)
      //   .set({ stripeConnectAccountId: null })
      //   .where(eq((users as any).stripeConnectAccountId, data.id));
    }
  }

  /**
   * Handle payout paid event for connected account
   */
  private static async handlePayoutPaid(
    payout: Stripe.Payout,
    accountId?: string
  ): Promise<void> {
    console.log(`Payout ${payout.id} paid for account ${accountId}:`, {
      amount: payout.amount,
      currency: payout.currency,
    });

    // Find user by Connect account ID and send email
    if (accountId) {
      const db = await getDb();
      if (db) {
        const [user] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq((users as any).stripeConnectAccountId, accountId))
          .limit(1);

        if (user) {
          await PayoutEmailService.sendPayoutProcessedEmail({
            userId: user.id,
            amount: payout.amount,
            currency: payout.currency,
            payoutId: payout.id,
            status: 'completed',
            processedDate: new Date(),
          });
        }
      }
    }
  }

  /**
   * Handle payout failed event for connected account
   */
  private static async handlePayoutFailed(
    payout: Stripe.Payout,
    accountId?: string
  ): Promise<void> {
    console.log(`Payout ${payout.id} failed for account ${accountId}:`, {
      amount: payout.amount,
      failureCode: payout.failure_code,
      failureMessage: payout.failure_message,
    });

    // Find user by Connect account ID and send email
    if (accountId) {
      const db = await getDb();
      if (db) {
        const [user] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq((users as any).stripeConnectAccountId, accountId))
          .limit(1);

        if (user) {
          await PayoutEmailService.sendPayoutFailedEmail({
            userId: user.id,
            amount: payout.amount,
            currency: payout.currency,
            payoutId: payout.id,
            status: 'failed',
            errorMessage: payout.failure_message || 'Payout could not be processed',
          });
        }
      }
    }
  }
}
