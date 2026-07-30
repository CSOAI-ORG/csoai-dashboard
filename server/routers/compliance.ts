/**
 * Compliance Router
 * Handles EU AI Act compliance assessment, certification, and reporting
 */

import { router, protectedProcedure } from '../_core/trpc.js';
import { z } from 'zod';
import { getDb } from '../db.js';
import { aiSystems } from '../../drizzle/schema.js';
import { eq } from 'drizzle-orm';
import { EUAiActComplianceService } from '../services/euAiActCompliance.js';
import { TRPCError } from '@trpc/server';

export const complianceRouter = router({
  /**
   * Get all EU AI Act requirements
   */
  getRequirements: protectedProcedure
    .input(
      z.object({
        riskLevel: z.enum(['prohibited', 'high', 'limited', 'minimal']).optional(),
        article: z.number().optional(),
        systemType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let requirements = EUAiActComplianceService.getRequirements();

        if (input.riskLevel) {
          requirements = requirements.filter((r: any) => r.riskLevel === input.riskLevel);
        }

        if (input.article) {
          requirements = requirements.filter((r: any) => r.article === input.article);
        }

        if (input.systemType) {
          requirements = EUAiActComplianceService.getRequirementsBySystemType(
            input.systemType
          );
        }

        return {
          requirements,
          total: requirements.length,
        };
      } catch (error) {
        console.error('Error fetching requirements:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch requirements',
        });
      }
    }),

  /**
   * Get compliance assessment for an AI system
   */
  assessCompliance: protectedProcedure
    .input(
      z.object({
        aiSystemId: z.number(),
        implementedControls: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
          });
        }

        // Verify user has access to this AI system
        const [system] = await db.select().from(aiSystems).where(eq(aiSystems.id, input.aiSystemId));

        if (!system || system.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this AI system',
          });
        }

        // Get applicable requirements for this system
        const systemType = system.systemType || 'general';
        const applicableRequirements =
          EUAiActComplianceService.getRequirementsBySystemType(systemType);

        // Calculate compliance score
        const complianceScore = EUAiActComplianceService.calculateComplianceScore(
          input.implementedControls,
          applicableRequirements
        );

        // Get certification level
        const certificationLevel =
          EUAiActComplianceService.getCertificationLevel(complianceScore);

        // Generate gap analysis
        const gapAnalysis = EUAiActComplianceService.generateGapAnalysis(
          input.implementedControls,
          applicableRequirements
        );

        return {
          systemId: input.aiSystemId,
          complianceScore,
          certificationLevel,
          applicableRequirements: applicableRequirements.length,
          implementedControls: input.implementedControls.length,
          gapAnalysis,
          assessment: {
            compliant: complianceScore >= 70,
            riskLevel: complianceScore >= 90 ? 'minimal' : complianceScore >= 70 ? 'limited' : 'high',
            recommendations: gapAnalysis.missing.slice(0, 5),
          },
        };
      } catch (error) {
        console.error('Error assessing compliance:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to assess compliance',
        });
      }
    }),

  /**
   * Get certification details
   */
  getCertificationDetails: protectedProcedure
    .input(
      z.object({
        level: z.enum(['bronze', 'silver', 'gold', 'platinum']),
      })
    )
    .query(async ({ input }) => {
      try {
        const certification = EUAiActComplianceService.getCertificationDetails(input.level);

        if (!certification) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Certification level not found',
          });
        }

        return certification;
      } catch (error) {
        console.error('Error fetching certification details:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch certification details',
        });
      }
    }),

  /**
   * Get evidence checklist for a requirement
   */
  getEvidenceChecklist: protectedProcedure
    .input(
      z.object({
        requirementId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const checklist = EUAiActComplianceService.getEvidenceChecklist(input.requirementId);

        return {
          requirementId: input.requirementId,
          checklist,
          total: checklist.length,
        };
      } catch (error) {
        console.error('Error fetching evidence checklist:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch evidence checklist',
        });
      }
    }),

  /**
   * Get compliance indicators for a requirement
   */
  getComplianceIndicators: protectedProcedure
    .input(
      z.object({
        requirementId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const indicators = EUAiActComplianceService.getComplianceIndicators(
          input.requirementId
        );

        return {
          requirementId: input.requirementId,
          indicators,
          total: indicators.length,
        };
      } catch (error) {
        console.error('Error fetching compliance indicators:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch compliance indicators',
        });
      }
    }),

  /**
   * Generate compliance gap analysis
   */
  generateGapAnalysis: protectedProcedure
    .input(
      z.object({
        aiSystemId: z.number(),
        implementedControls: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
          });
        }

        // Verify user has access to this AI system
        const [system] = await db.select().from(aiSystems).where(eq(aiSystems.id, input.aiSystemId));

        if (!system || system.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this AI system',
          });
        }

        // Get applicable requirements
        const systemType = system.systemType || 'general';
        const applicableRequirements =
          EUAiActComplianceService.getRequirementsBySystemType(systemType);

        // Generate gap analysis
        const gapAnalysis = EUAiActComplianceService.generateGapAnalysis(
          input.implementedControls,
          applicableRequirements
        );

        return {
          systemId: input.aiSystemId,
          ...gapAnalysis,
          priorityGaps: gapAnalysis.missing.slice(0, 10),
          estimatedRemediationTime: `${Math.ceil(gapAnalysis.missing.length / 2)} weeks`,
        };
      } catch (error) {
        console.error('Error generating gap analysis:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate gap analysis',
        });
      }
    }),

  /**
   * Get compliance roadmap for system
   */
  getComplianceRoadmap: protectedProcedure
    .input(
      z.object({
        aiSystemId: z.number(),
        targetLevel: z.enum(['bronze', 'silver', 'gold', 'platinum']),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
          });
        }

        // Verify user has access to this AI system
        const [system] = await db.select().from(aiSystems).where(eq(aiSystems.id, input.aiSystemId));

        if (!system || system.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have access to this AI system',
          });
        }

        const targetCertification = EUAiActComplianceService.getCertificationDetails(
          input.targetLevel
        );

        if (!targetCertification) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Target certification level not found',
          });
        }

        // Create roadmap phases
        const phases = [
          {
            phase: 1,
            name: 'Foundation (Weeks 1-2)',
            description: 'Establish governance and documentation',
            tasks: [
              'Create AI governance policy',
              'Document system architecture',
              'Identify applicable requirements',
              'Assign compliance responsibilities',
            ],
          },
          {
            phase: 2,
            name: 'Assessment (Weeks 3-4)',
            description: 'Conduct compliance assessment',
            tasks: [
              'Perform risk assessment',
              'Identify compliance gaps',
              'Prioritize remediation',
              'Create action plan',
            ],
          },
          {
            phase: 3,
            name: 'Implementation (Weeks 5-8)',
            description: 'Implement controls and safeguards',
            tasks: [
              'Implement technical controls',
              'Deploy monitoring systems',
              'Create documentation',
              'Conduct internal testing',
            ],
          },
          {
            phase: 4,
            name: 'Verification (Weeks 9-10)',
            description: 'Verify compliance and prepare for certification',
            tasks: [
              'Conduct compliance testing',
              'Gather evidence',
              'Prepare audit documentation',
              'Address findings',
            ],
          },
        ];

        if (input.targetLevel === 'gold' || input.targetLevel === 'platinum') {
          phases.push({
            phase: 5,
            name: 'Audit (Weeks 11-12)',
            description: 'Third-party audit and certification',
            tasks: [
              'Schedule external audit',
              'Prepare for auditor review',
              'Address audit findings',
              'Obtain certification',
            ],
          });
        }

        return {
          systemId: input.aiSystemId,
          targetLevel: input.targetLevel,
          targetCertification,
          phases,
          totalDuration: input.targetLevel === 'gold' || input.targetLevel === 'platinum' ? '12 weeks' : '10 weeks',
        };
      } catch (error) {
        console.error('Error generating compliance roadmap:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate compliance roadmap',
        });
      }
    }),

  /**
   * Get all articles and sections
   */
  getArticles: protectedProcedure.query(async () => {
    try {
      const requirements = EUAiActComplianceService.getRequirements();

      // Group by article
      const articles: Record<number, { sections: Set<string>; count: number }> = {};

      requirements.forEach((req) => {
        if (!articles[req.article]) {
          articles[req.article] = { sections: new Set(), count: 0 };
        }
        articles[req.article].sections.add(req.section);
        articles[req.article].count++;
      });

      return {
        articles: Object.entries(articles).map(([article, data]) => ({
          article: parseInt(article),
          sections: Array.from(data.sections),
          requirementCount: data.count,
        })),
      };
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch articles',
      });
    }
  }),
});
