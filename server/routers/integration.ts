/**
 * Integration Router
 * tRPC endpoints for exam sessions, government auth, and stripe payouts
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { ExamSessionService } from '../services/examSession';
import { GovernmentAuthService } from '../services/governmentAuth';
import { StripePayoutService } from '../services/stripePayout';
import { TRPCError } from '@trpc/server';

/**
 * Exam Session Router
 */
export const examSessionRouter = router({
  /**
   * Start a new exam session with proctoring
   */
  startSession: protectedProcedure
    .input(
      z.object({
        examId: z.string(),
        certificationType: z.enum(['fundamentals', 'professional', 'expert']),
        requireProctoring: z.boolean().default(true),
        durationMinutes: z.number().min(30).max(180),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const session = await ExamSessionService.startExamSession({
          userId: ctx.user.id,
          examId: input.examId,
          certificationType: input.certificationType,
          requireProctoring: input.requireProctoring,
          durationMinutes: input.durationMinutes,
        });

        return session;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start exam session',
        });
      }
    }),

  /**
   * Submit exam with answers and proctoring results
   */
  submitExam: protectedProcedure
    .input(
      z.object({
        attemptId: z.number(),
        proctoringSessionId: z.string().optional(),
        score: z.number().min(0).max(100),
        answers: z.record(z.string(), z.string()),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const result = await ExamSessionService.submitExam(
          input.attemptId,
          input.proctoringSessionId || null,
          input.score,
          input.answers as Record<string, string>,
        );

        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit exam',
        });
      }
    }),

  /**
   * Get exam session details
   */
  getSessionDetails: protectedProcedure
    .input(z.object({ attemptId: z.number() }))
    .query(async ({ input }) => {
      try {
        const details = await ExamSessionService.getSessionDetails(input.attemptId);
        return details;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get session details',
        });
      }
    }),

  /**
   * Verify certificate
   */
  verifyCertificate: publicProcedure
    .input(z.object({ certificateNumber: z.string() }))
    .query(async ({ input }) => {
      try {
        const verification = await ExamSessionService.verifyCertificate(input.certificateNumber);
        return verification;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify certificate',
        });
      }
    }),

  /**
   * Get integrity report
   */
  getIntegrityReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const report = await ExamSessionService.getIntegrityReport(input.startDate, input.endDate);
        return report;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get integrity report',
        });
      }
    }),
});

/**
 * Government Auth Router
 */
export const governmentAuthRouter = router({
  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl: publicProcedure
    .input(
      z.object({
        jurisdiction: z.enum(['EU', 'EDPB', 'US', 'UK', 'CA', 'AU']),
        redirectUri: z.string().url(),
      }),
    )
    .query(({ input }) => {
      try {
        const url = GovernmentAuthService.generateAuthorizationUrl(
          input.jurisdiction,
          input.redirectUri,
        );
        return { authorizationUrl: url };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate authorization URL',
        });
      }
    }),

  /**
   * Exchange authorization code for tokens
   */
  exchangeCode: publicProcedure
    .input(
      z.object({
        jurisdiction: z.string(),
        code: z.string(),
        redirectUri: z.string().url(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const tokens = await GovernmentAuthService.exchangeAuthorizationCode(
          input.jurisdiction,
          input.code,
          input.redirectUri,
        );
        return tokens;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to exchange authorization code',
        });
      }
    }),

  /**
   * Verify government user access
   */
  verifyAccess: protectedProcedure
    .input(z.object({ permission: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const hasAccess = await GovernmentAuthService.verifyAccess(String(ctx.user.id), input.permission);
        return { hasAccess };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify access',
        });
      }
    }),

  /**
   * Get government user details
   */
  getUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await GovernmentAuthService.getUser(String(ctx.user.id));
      return user;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get user',
      });
    }
  }),

  /**
   * Refresh access token
   */
  refreshToken: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const result = await GovernmentAuthService.refreshAccessToken(String(ctx.user.id));
      return result;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to refresh token',
      });
    }
  }),

  /**
   * Revoke access
   */
  revokeAccess: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await GovernmentAuthService.revokeAccess(String(ctx.user.id));
      return { success: true };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to revoke access',
      });
    }
  }),
});

/**
 * Stripe Payout Router
 */
export const stripePayoutRouter = router({
  /**
   * Create a commission record
   */
  createCommission: protectedProcedure
    .input(
      z.object({
        referralId: z.number(),
        courseId: z.number().optional(),
        commissionRate: z.number().min(0).max(100),
        commissionAmount: z.number().min(0),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const commissionId = await StripePayoutService.createCommission({
          referrerId: String(ctx.user.id),
          referralId: input.referralId,
          courseId: input.courseId,
          commissionRate: input.commissionRate,
          commissionAmount: input.commissionAmount,
        });

        return { commissionId };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create commission',
        });
      }
    }),

  /**
   * Get pending commissions
   */
  getPendingCommissions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const amount = await StripePayoutService.calculatePendingCommissions(String(ctx.user.id));
      return {
        pendingAmount: amount,
        readyForPayout: amount >= 5000, // $50 minimum
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get pending commissions',
      });
    }
  }),

  /**
   * Get payout history
   */
  getPayoutHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const history = await StripePayoutService.getPayoutHistory(String(ctx.user.id));
      return history;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get payout history',
      });
    }
  }),

  /**
   * Get next payout date
   */
  getNextPayoutDate: publicProcedure.query(() => {
    try {
      const nextDate = StripePayoutService.getNextPayoutDate();
      return { nextPayoutDate: nextDate };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get next payout date',
      });
    }
  }),

  /**
   * Process monthly payouts (admin only)
   */
  processMonthlyPayouts: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // In production, check if user is admin
      const results = await StripePayoutService.processMonthlyPayouts();
      return { processed: results.length, results };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process monthly payouts',
      });
    }
  }),
});
