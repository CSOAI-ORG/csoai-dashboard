/**
 * Byzantine Council Real-Time tRPC Router
 * 
 * Provides real-time voting capabilities with low-latency updates
 * for the 33-Agent Council voting system.
 */

import { router, publicProcedure } from '../_core/trpc.js';
import { z } from 'zod';
import {
  startVotingSession,
  recordVote,
  getSessionMetrics,
  getVoteHistory,
  getActiveSessions,
  streamComplianceAlert,
  getSystemHealthMetrics,
} from '../services/byzantineRealtimeService.js';

export const byzantineRealtimeRouter = router({
  /**
   * Start a new voting session
   */
  startSession: publicProcedure
    .input(
      z.object({
        reportId: z.number(),
        userIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      // Generate a unique session ID
      const sessionId = Math.floor(Date.now() / 1000) + Math.random();

      const session = await startVotingSession(sessionId, input.reportId, input.userIds);

      return {
        success: true,
        sessionId: Math.floor(sessionId),
        session,
      };
    }),

  /**
   * Record a vote from an AI agent
   */
  recordVote: publicProcedure
    .input(
      z.object({
        sessionId: z.number(),
        agentId: z.number(),
        agentName: z.string(),
        decision: z.enum(['approve', 'reject', 'abstain']),
        confidence: z.number().min(0).max(100),
        reasoning: z.string(),
        latency: z.number(), // milliseconds
        userIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      await recordVote(
        input.sessionId,
        {
          sessionId: input.sessionId,
          agentId: input.agentId,
          agentName: input.agentName,
          decision: input.decision,
          confidence: input.confidence,
          reasoning: input.reasoning,
          timestamp: Date.now(),
          latency: input.latency,
        },
        input.userIds
      );

      return { success: true };
    }),

  /**
   * Get current session metrics
   */
  getSessionMetrics: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(({ input }) => {
      const metrics = getSessionMetrics(input.sessionId);
      return metrics || { error: 'Session not found' };
    }),

  /**
   * Get vote history for a session
   */
  getVoteHistory: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(({ input }) => {
      return getVoteHistory(input.sessionId);
    }),

  /**
   * Get all active voting sessions
   */
  getActiveSessions: publicProcedure.query(() => {
    return getActiveSessions();
  }),

  /**
   * Stream a compliance alert
   */
  streamAlert: publicProcedure
    .input(
      z.object({
        type: z.enum(['violation', 'risk', 'approval', 'rejection']),
        severity: z.enum(['critical', 'warning', 'info']),
        message: z.string(),
        reportId: z.number(),
        userIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      await streamComplianceAlert(
        {
          type: input.type,
          severity: input.severity,
          message: input.message,
          reportId: input.reportId,
          timestamp: Date.now(),
        },
        input.userIds
      );

      return { success: true };
    }),

  /**
   * Get system health metrics
   */
  getSystemHealth: publicProcedure.query(() => {
    return getSystemHealthMetrics();
  }),
});
