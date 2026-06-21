/**
 * Multi-Framework Compliance Router
 *
 * Exposes EU AI Act, NIST AI RMF, ISO 42001, GDPR, DORA and NIS2 requirements
 * through a single, framework-agnostic API.
 */

import { router, protectedProcedure } from '../_core/trpc.js';
import { z } from 'zod';
import { FrameworkComplianceService } from '../services/frameworkComplianceService.js';
import { TRPCError } from '@trpc/server';

export const frameworksRouter = router({
  /**
   * List all supported compliance frameworks with metadata.
   */
  list: protectedProcedure.query(async () => {
    try {
      return {
        frameworks: FrameworkComplianceService.getFrameworks(),
      };
    } catch (error) {
      console.error('Error fetching frameworks:', error);
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch frameworks' });
    }
  }),

  /**
   * Get a single framework by slug.
   */
  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        const framework = FrameworkComplianceService.getFramework(input.slug);
        if (!framework) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Framework not found' });
        }
        return { framework };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error fetching framework:', error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch framework' });
      }
    }),

  /**
   * Get requirements for one or all frameworks, with optional filters.
   */
  getRequirements: protectedProcedure
    .input(
      z.object({
        frameworkSlug: z.string().optional(),
        riskLevel: z.enum(['prohibited', 'high', 'limited', 'minimal', 'general']).optional(),
        systemType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const requirements = FrameworkComplianceService.getRequirements({
          frameworkSlug: input.frameworkSlug,
          riskLevel: input.riskLevel,
          systemType: input.systemType,
        });
        return {
          requirements,
          total: requirements.length,
        };
      } catch (error) {
        console.error('Error fetching framework requirements:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch framework requirements',
        });
      }
    }),

  /**
   * Score a set of implemented controls against a framework.
   */
  score: protectedProcedure
    .input(
      z.object({
        frameworkSlug: z.string().optional(),
        implementedControls: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const score = FrameworkComplianceService.calculateScore(
          input.implementedControls,
          input.frameworkSlug
        );
        const { met, missing } = FrameworkComplianceService.gapAnalysis(
          input.implementedControls,
          input.frameworkSlug
        );
        return {
          score,
          met: met.length,
          missing: missing.length,
          topGaps: missing.slice(0, 5).map((r) => ({
            id: r.id,
            framework: r.framework,
            title: r.title,
            section: r.section,
          })),
        };
      } catch (error) {
        console.error('Error scoring framework compliance:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to score framework compliance',
        });
      }
    }),
});
