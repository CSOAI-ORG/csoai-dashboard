/**
 * Advanced Features Router
 * tRPC endpoints for exam proctoring, government portal, and referral program
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { ExamProctoringService } from '../services/examProctoring';
import { GovernmentPortalService } from '../services/governmentPortal';
import { ReferralProgramService } from '../services/referralProgram';
import { TRPCError } from '@trpc/server';

/**
 * Exam Proctoring Router
 */
export const proctoringRouter = router({
  /**
   * Start a proctored exam session
   */
  startSession: protectedProcedure
    .input(
      z.object({
        examId: z.string(),
        certificationType: z.enum(['fundamentals', 'professional', 'expert']),
        requireProctoring: z.boolean().default(true),
        recordSession: z.boolean().default(true),
        allowScreenSharing: z.boolean().default(false),
        allowExternalApps: z.boolean().default(false),
        durationMinutes: z.number().min(30).max(180),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + input.durationMinutes * 60 * 1000);

        const sessionId = await ExamProctoringService.startSession({
          examId: input.examId,
          userId: String(ctx.user.id),
          certificationType: input.certificationType,
          requireProctoring: input.requireProctoring,
          recordSession: input.recordSession,
          allowScreenSharing: input.allowScreenSharing,
          allowExternalApps: input.allowExternalApps,
          startTime,
          endTime,
        });

        return {
          sessionId,
          startTime,
          endTime,
          durationMinutes: input.durationMinutes,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to start proctoring session',
        });
      }
    }),

  /**
   * Record a proctoring event
   */
  recordEvent: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        eventType: z.enum([
          'eye_movement',
          'face_detection',
          'screen_change',
          'audio_detection',
          'suspicious_behavior',
        ]),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string(),
        metadata: z.record(z.string(), z.any()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await ExamProctoringService.recordEvent(input.sessionId, {
          type: input.eventType as any,
          severity: input.severity as any,
          description: input.description,
          timestamp: new Date(),
          metadata: input.metadata,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record proctoring event',
        });
      }
    }),

  /**
   * Analyze proctoring session and generate integrity report
   */
  analyzeSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      try {
        const result = await ExamProctoringService.analyzeSession(input.sessionId);
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to analyze proctoring session',
        });
      }
    }),

  /**
   * Get proctoring session details
   */
  getSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      try {
        const session = await ExamProctoringService.getSession(input.sessionId);
        return session;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get proctoring session',
        });
      }
    }),

  /**
   * Get user's proctoring history
   */
  getUserSessions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const sessions = await ExamProctoringService.getUserSessions(String(ctx.user.id));
      return sessions;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get user proctoring sessions',
      });
    }
  }),

  /**
   * Get proctoring statistics
   */
  getStatistics: publicProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const startDate = input.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDate = input.endDate || new Date();

        const stats = await ExamProctoringService.getStatistics(startDate, endDate);
        return stats;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get proctoring statistics',
        });
      }
    }),
});

/**
 * Government Portal Router
 */
export const governmentPortalRouter = router({
  /**
   * Get comprehensive analytics for government oversight
   */
  getAnalytics: publicProcedure
    .input(z.object({ jurisdiction: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        const analytics = await GovernmentPortalService.getAnalytics(input.jurisdiction);
        return analytics;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get government analytics',
        });
      }
    }),

  /**
   * Get certified analysts list
   */
  getCertifiedAnalysts: publicProcedure
    .input(
      z.object({
        jurisdiction: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      try {
        const analysts = await GovernmentPortalService.getCertifiedAnalysts({ jurisdiction: input.jurisdiction });
        return analysts;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get certified analysts',
        });
      }
    }),

  /**
   * Get compliance status by framework
   */
  getComplianceStatus: publicProcedure
    .input(z.object({ framework: z.string() }))
    .query(async ({ input }) => {
      try {
        const status = await GovernmentPortalService.getAnalytics(input.framework);
        return status;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get compliance status',
        });
      }
    }),

  /**
   * Get incident analysis
   */
  getIncidentAnalysis: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .query(async ({ input }) => {
      try {
        const reports = await GovernmentPortalService.getIncidentReports({
          startDate: input.startDate,
          endDate: input.endDate,
        });
        return { reports, total: reports.length };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get incident analysis',
        });
      }
    }),

  /**
   * Generate compliance report
   */
  generateReport: publicProcedure
    .input(
      z.object({
        framework: z.string(),
        format: z.enum(['pdf', 'json', 'csv']),
      }),
    )
    .query(async ({ input }) => {
      try {
        const report = await GovernmentPortalService.getAnalytics(input.framework);
        return { report, format: input.format };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate compliance report',
        });
      }
    }),

  /**
   * Get enforcement actions
   */
  getEnforcementActions: publicProcedure
    .input(z.object({ jurisdiction: z.string().optional() }))
    .query(async ({ input }) => {
      try {
        const actions = await GovernmentPortalService.getIncidentReports({});
        return actions;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get enforcement actions',
        });
      }
    }),
});

/**
 * Referral Program Router
 */
export const referralRouter = router({
  /**
   * Create a referral link for the current user
   */
  createLink: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const link = await ReferralProgramService.createReferralLink(String(ctx.user.id));
      return link;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create referral link',
      });
    }
  }),

  /**
   * Track a referral conversion
   */
  trackConversion: publicProcedure
    .input(
      z.object({
        referralCode: z.string(),
        referredUserId: z.string(),
        coursePrice: z.number().min(0),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const result = await ReferralProgramService.trackConversion(
          input.referralCode,
          input.referredUserId,
          input.coursePrice,
        );
        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to track referral conversion',
        });
      }
    }),

  /**
   * Get referral earnings for current user
   */
  getEarnings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const earnings = await ReferralProgramService.getReferralEarnings(String(ctx.user.id));
      return earnings;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get referral earnings',
      });
    }
  }),

  /**
   * Get referral statistics
   */
  getStats: publicProcedure.query(async () => {
    try {
      const stats = await ReferralProgramService.getReferralStats();
      return stats;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get referral statistics',
      });
    }
  }),

  /**
   * Get marketing materials for referral link
   */
  getMarketingMaterials: protectedProcedure
    .input(z.object({ referralCode: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const materials = ReferralProgramService.generateMarketingMaterials(
          input.referralCode,
          ctx.user.name || 'Friend',
        );
        return materials;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get marketing materials',
        });
      }
    }),

  /**
   * Validate referral code
   */
  validateCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      try {
        const isValid = await ReferralProgramService.validateReferralCode(input.code);
        return { isValid };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to validate referral code',
        });
      }
    }),

  /**
   * Get top referrers leaderboard
   */
  getTopReferrers: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(10) }))
    .query(async ({ input }) => {
      try {
        const topReferrers = await ReferralProgramService.getTopReferrers(input.limit);
        return topReferrers;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get top referrers',
        });
      }
    }),
});
