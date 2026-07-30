/**
 * Weekly Digest Router
 * API endpoints for weekly digest functionality
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { sendWeeklyDigestEmail, sendAllWeeklyDigests, collectWeeklyDigestData } from "../services/weeklyDigestService";

export const weeklyDigestRouter = router({
  /**
   * Get preview of weekly digest data for current user
   */
  getPreview: protectedProcedure.query(async ({ ctx }) => {
    const data = await collectWeeklyDigestData(ctx.user.id);
    return data;
  }),

  /**
   * Send test digest email to current user
   */
  sendTestDigest: protectedProcedure.mutation(async ({ ctx }) => {
    const result = await sendWeeklyDigestEmail(ctx.user.id);
    return result;
  }),

  /**
   * Admin: Trigger weekly digest for all users
   */
  triggerAllDigests: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Admin access required');
    }
    
    const result = await sendAllWeeklyDigests();
    return result;
  }),

  /**
   * Admin: Send digest to specific user
   */
  sendToUser: protectedProcedure
    .input(z.object({
      userId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Admin access required');
      }
      
      const result = await sendWeeklyDigestEmail(input.userId);
      return result;
    }),
});
