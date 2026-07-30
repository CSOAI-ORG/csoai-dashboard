/**
 * Stripe Connect Router
 * tRPC endpoints for managing Stripe Connect accounts for specialists
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import { StripeConnectService } from '../services/stripeConnect';
import { TRPCError } from '@trpc/server';

export const stripeConnectRouter = router({
  /**
   * Create or get existing Connect account for the user
   */
  createConnectAccount: protectedProcedure
    .input(z.object({
      country: z.string().default('US'),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user already has a Connect account
        const existingAccountId = await StripeConnectService.getUserConnectAccountId(ctx.user.id);
        
        if (existingAccountId) {
          // Return existing account status
          const status = await StripeConnectService.getAccountStatus(existingAccountId);
          return {
            accountId: existingAccountId,
            isNew: false,
            status,
          };
        }

        // Create new Connect account
        const email = ctx.user.email || `user-${ctx.user.id}@csoai.org`;
        const accountId = await StripeConnectService.createConnectAccount(
          ctx.user.id,
          email,
          input.country
        );

        const status = await StripeConnectService.getAccountStatus(accountId);

        return {
          accountId,
          isNew: true,
          status,
        };
      } catch (error) {
        console.error('Failed to create Connect account:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create Stripe Connect account',
        });
      }
    }),

  /**
   * Get onboarding link for Connect account
   */
  getOnboardingLink: protectedProcedure
    .input(z.object({
      refreshUrl: z.string().url(),
      returnUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const accountId = await StripeConnectService.getUserConnectAccountId(ctx.user.id);
        
        if (!accountId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No Connect account found. Please create one first.',
          });
        }

        const link = await StripeConnectService.createOnboardingLink(
          accountId,
          input.refreshUrl,
          input.returnUrl
        );

        return link;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Failed to get onboarding link:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create onboarding link',
        });
      }
    }),

  /**
   * Get Connect account status
   */
  getAccountStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const accountId = await StripeConnectService.getUserConnectAccountId(ctx.user.id);
      
      if (!accountId) {
        return {
          hasAccount: false,
          accountId: null,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
          requirements: null,
        };
      }

      return await StripeConnectService.getAccountStatus(accountId);
    } catch (error) {
      console.error('Failed to get account status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get account status',
      });
    }
  }),

  /**
   * Get account balance
   */
  getAccountBalance: protectedProcedure.query(async ({ ctx }) => {
    try {
      const accountId = await StripeConnectService.getUserConnectAccountId(ctx.user.id);
      
      if (!accountId) {
        return {
          available: 0,
          pending: 0,
          currency: 'usd',
        };
      }

      return await StripeConnectService.getAccountBalance(accountId);
    } catch (error) {
      console.error('Failed to get account balance:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get account balance',
      });
    }
  }),

  /**
   * Get dashboard link for Connect account
   */
  getDashboardLink: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const accountId = await StripeConnectService.getUserConnectAccountId(ctx.user.id);
      
      if (!accountId) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No Connect account found',
        });
      }

      // Check if account is fully onboarded
      const status = await StripeConnectService.getAccountStatus(accountId);
      
      if (!status.detailsSubmitted) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Please complete account onboarding first',
        });
      }

      const url = await StripeConnectService.createDashboardLink(accountId);
      return { url };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error('Failed to get dashboard link:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create dashboard link',
      });
    }
  }),

  /**
   * Request a manual payout (for users who want immediate payout)
   */
  requestPayout: protectedProcedure
    .input(z.object({
      amount: z.number().min(100), // Minimum $1.00 in cents
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const accountId = await StripeConnectService.getUserConnectAccountId(ctx.user.id);
        
        if (!accountId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No Connect account found',
          });
        }

        // Check account status
        const status = await StripeConnectService.getAccountStatus(accountId);
        
        if (!status.payoutsEnabled) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Payouts are not enabled for your account. Please complete onboarding.',
          });
        }

        // Check balance
        const balance = await StripeConnectService.getAccountBalance(accountId);
        
        if (balance.available < input.amount) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Insufficient balance. Available: $${(balance.available / 100).toFixed(2)}`,
          });
        }

        // Create payout
        const result = await StripeConnectService.createPayout(
          accountId,
          input.amount,
          'usd',
          'CSOAI Manual Payout Request'
        );

        return result;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Failed to request payout:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process payout request',
        });
      }
    }),
});
