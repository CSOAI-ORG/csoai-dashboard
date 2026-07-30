/**
 * Referral Router
 * tRPC endpoints for referral program management
 */

import { router, protectedProcedure, publicProcedure } from '../_core/trpc.js';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { ReferralService } from '../services/referralService.js';
import { ReferralEmailService } from '../services/referralEmailService.js';
import { ReferralAnalyticsService } from '../services/referralAnalyticsService.js';
import { ReferralExportService } from '../services/referralExportService.js';

export const referralRouter = router({
  /**
   * Generate a new referral code for the authenticated user
   */
  generateCode: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const code = await ReferralService.generateReferralCode(ctx.user.id);

        return {
          success: true,
          code,
          message: 'Referral code generated successfully',
        };
      } catch (error) {
        console.error('Error generating referral code:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate referral code',
        });
      }
    }),

  /**
   * Get the referral code for the authenticated user
   */
  getReferralCode: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        let code = await ReferralService.getUserReferralCode(ctx.user.id);

        // Generate code if user doesn't have one
        if (!code) {
          const newCode = await ReferralService.generateReferralCode(ctx.user.id);
          code = await ReferralService.getUserReferralCode(ctx.user.id);
        }

        return code;
      } catch (error) {
        console.error('Error fetching referral code:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch referral code',
        });
      }
    }),

  /**
   * Get referral statistics for the authenticated user
   */
  getReferralStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const stats = await ReferralService.getReferralStats(ctx.user.id);
        return stats;
      } catch (error) {
        console.error('Error fetching referral stats:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch referral statistics',
        });
      }
    }),

  /**
   * Track a referral click (public endpoint)
   */
  trackClick: publicProcedure
    .input(
      z.object({
        code: z.string(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
        source: z.enum(['email', 'social', 'direct', 'other']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const success = await ReferralService.trackReferralClick(
          input.code,
          input.ipAddress,
          input.userAgent,
          input.source
        );

        if (!success) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invalid referral code',
          });
        }

        return {
          success: true,
          message: 'Click tracked successfully',
        };
      } catch (error) {
        console.error('Error tracking referral click:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to track referral click',
        });
      }
    }),

  /**
   * Record a referral conversion (certification completion)
   */
  recordConversion: protectedProcedure
    .input(
      z.object({
        referralCode: z.string(),
        referredUserId: z.number(),
        referredEmail: z.string().email(),
        certificationId: z.number(),
        certificationName: z.string(),
        certificationPrice: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const success = await ReferralService.recordConversion(
          input.referralCode,
          input.referredUserId,
          input.referredEmail,
          input.certificationId,
          input.certificationName,
          input.certificationPrice
        );

        if (!success) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Invalid referral code',
          });
        }

        // Send conversion email
        const referrer = await ReferralService.getReferralCodeByCode(input.referralCode);
        if (referrer && ctx.user?.email) {
          await ReferralEmailService.sendConversionEmail(
            ctx.user.email,
            ctx.user.name || 'Referrer',
            input.referredEmail,
            input.certificationName,
            (input.certificationPrice * 20) / 100
          );
        }

        return {
          success: true,
          message: 'Conversion recorded successfully',
        };
      } catch (error) {
        console.error('Error recording referral conversion:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to record referral conversion',
        });
      }
    }),

  /**
   * Get pending commissions for the authenticated user
   */
  getPendingCommissions: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const pendingCommissions = await ReferralService.calculatePendingCommissions(
          ctx.user.id
        );

        return {
          pendingCommissions,
          formattedAmount: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(pendingCommissions),
        };
      } catch (error) {
        console.error('Error fetching pending commissions:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch pending commissions',
        });
      }
    }),

  /**
   * Get referral sharing URL
   */
  getSharingUrl: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const code = await ReferralService.getUserReferralCode(ctx.user.id);

        if (!code) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No referral code found',
          });
        }

        const baseUrl = process.env.VITE_APP_URL || 'https://csoai.com';
        const sharingUrl = `${baseUrl}/signup?ref=${code.code}`;

        return {
          url: sharingUrl,
          code: code.code,
        };
      } catch (error) {
        console.error('Error getting sharing URL:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate sharing URL',
        });
      }
    }),

  /**
   * Send referral email to a contact
   */
  sendReferralEmail: protectedProcedure
    .input(
      z.object({
        recipientEmail: z.string().email(),
        recipientName: z.string().optional(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }
        const code = await ReferralService.getUserReferralCode(ctx.user.id);
        if (!code) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'No referral code found',
          });
        }
        const baseUrl = process.env.VITE_APP_URL || 'https://csoai.com';
        const sharingUrl = `${baseUrl}/signup?ref=${code.code}`;
        // In a real implementation, send email via Resend
        // For now, just log it
        console.log('Referral email would be sent to:', input.recipientEmail);
        return {
          success: true,
          message: 'Referral email sent successfully',
        };
      } catch (error) {
        console.error('Error sending referral email:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send referral email',
        });
      }
    }),

  /**
   * Get comprehensive referral analytics
   */
  getReferralAnalytics: protectedProcedure
    .input(
      z.object({
        dateRange: z.enum(['week', 'month', 'quarter']).default('month'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const analytics = await ReferralAnalyticsService.getReferralAnalytics(
          ctx.user.id,
          input.dateRange
        );

        return {
          success: true,
          data: analytics,
        };
      } catch (error) {
        console.error('Error fetching referral analytics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch referral analytics',
        });
      }
    }),

  /**
   * Get referral program summary
   */
  getReferralSummary: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const summary = await ReferralAnalyticsService.getReferralSummary(ctx.user.id);

        return {
          success: true,
          data: summary,
        };
      } catch (error) {
        console.error('Error fetching referral summary:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch referral summary',
        });
      }
    }),

  /**
   * Export analytics as CSV
   */
  exportAnalyticsAsCSV: protectedProcedure
    .input(
      z.object({
        dateRange: z.enum(['week', 'month', 'quarter']).default('month'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const csv = await ReferralExportService.exportAsCSV(ctx.user.id, input.dateRange);

        return {
          success: true,
          data: csv,
          filename: `referral-analytics-${input.dateRange}-${new Date().toISOString().split('T')[0]}.csv`,
        };
      } catch (error) {
        console.error('Error exporting analytics as CSV:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export analytics',
        });
      }
    }),

  /**
   * Export analytics as PDF
   */
  exportAnalyticsAsPDF: protectedProcedure
    .input(
      z.object({
        dateRange: z.enum(['week', 'month', 'quarter']).default('month'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const pdf = await ReferralExportService.exportAsPDF(ctx.user.id, input.dateRange);

        return {
          success: true,
          data: pdf.toString('base64'),
          filename: `referral-analytics-${input.dateRange}-${new Date().toISOString().split('T')[0]}.pdf`,
        };
      } catch (error) {
        console.error('Error exporting analytics as PDF:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to export analytics as PDF',
        });
      }
    }),

  /**
   * Get report summary text
   */
  getReportSummary: protectedProcedure
    .input(
      z.object({
        dateRange: z.enum(['week', 'month', 'quarter']).default('month'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const summary = await ReferralExportService.generateReportSummary(
          ctx.user.id,
          input.dateRange
        );

        return {
          success: true,
          data: summary,
        };
      } catch (error) {
        console.error('Error generating report summary:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate report summary',
        });
      }
    }),

  /**
   * Get pending commission approvals
   */
  getPendingApprovals: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const { CommissionApprovalService } = await import('../services/commissionApprovalService.js');
        const approvals = await CommissionApprovalService.getPendingApprovals(ctx.user.id);

        return {
          success: true,
          data: approvals,
        };
      } catch (error) {
        console.error('Error fetching pending approvals:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch pending approvals',
        });
      }
    }),

  /**
   * Approve a commission
   */
  approveCommission: protectedProcedure
    .input(z.object({ conversionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const { CommissionApprovalService } = await import('../services/commissionApprovalService.js');
        const result = await CommissionApprovalService.approveCommission(input.conversionId, ctx.user.id);

        if (!result.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: result.error || 'Failed to approve commission',
          });
        }

        return {
          success: true,
          message: result.message,
        };
      } catch (error) {
        console.error('Error approving commission:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to approve commission',
        });
      }
    }),

  /**
   * Reject a commission
   */
  rejectCommission: protectedProcedure
    .input(z.object({ conversionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const { CommissionApprovalService } = await import('../services/commissionApprovalService.js');
        const result = await CommissionApprovalService.rejectCommission(input.conversionId, ctx.user.id);

        if (!result.success) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: result.error || 'Failed to reject commission',
          });
        }

        return {
          success: true,
          message: result.message,
        };
      } catch (error) {
        console.error('Error rejecting commission:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reject commission',
        });
      }
    }),

  /**
   * Get payout history
   */
  getPayoutHistory: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const { CommissionApprovalService } = await import('../services/commissionApprovalService.js');
        const payouts = await CommissionApprovalService.getPayoutHistory(ctx.user.id);

        return {
          success: true,
          data: payouts,
        };
      } catch (error) {
        console.error('Error fetching payout history:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch payout history',
        });
      }
    }),

  /**
   * Get commission statistics
   */
  getCommissionStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const { CommissionApprovalService } = await import('../services/commissionApprovalService.js');
        const stats = await CommissionApprovalService.getCommissionStats(ctx.user.id);

        return {
          success: true,
          data: stats,
        };
      } catch (error) {
        console.error('Error fetching commission stats:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch commission stats',
        });
      }
    }),

  /**
   * Get payout settings for the authenticated user
   */
  getPayoutSettings: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const { getDb } = await import('../db.js');
        const { users } = await import('../../drizzle/schema.js');
        const { eq } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        const user = await db
          .select({
            payoutFrequency: users.payoutFrequency,
            lastPayoutDate: users.lastPayoutDate,
          })
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);

        return {
          success: true,
          data: {
            payoutFrequency: user[0]?.payoutFrequency || 'monthly',
            lastPayoutDate: user[0]?.lastPayoutDate || null,
          },
        };
      } catch (error) {
        console.error('Error fetching payout settings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch payout settings',
        });
      }
    }),

  /**
   * Update payout frequency for the authenticated user
   */
  updatePayoutFrequency: protectedProcedure
    .input(
      z.object({
        frequency: z.enum(['weekly', 'biweekly', 'monthly']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'User not authenticated',
          });
        }

        const { getDb } = await import('../db.js');
        const { users } = await import('../../drizzle/schema.js');
        const { eq } = await import('drizzle-orm');
        
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        await db
          .update(users)
          .set({
            payoutFrequency: input.frequency,
          })
          .where(eq(users.id, ctx.user.id));

        return {
          success: true,
          message: `Payout frequency updated to ${input.frequency}`,
        };
      } catch (error) {
        console.error('Error updating payout frequency:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update payout frequency',
        });
      }
    }),
});
