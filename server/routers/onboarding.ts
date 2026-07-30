/**
 * Onboarding Router
 * Handles enterprise onboarding flow and setup wizard
 */

import { router, protectedProcedure } from '../_core/trpc.js';
import { z } from 'zod';
import { getDb } from '../db.js';
import { aiSystems, frameworks, assessments } from '../../drizzle/schema.js';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

// In-memory storage for onboarding sessions (in production, use database)
const onboardingSessions = new Map<string, {
  id: string;
  userId: number;
  step: number;
  companyInfo?: {
    name: string;
    industry: string;
    size: string;
    jurisdiction: string;
  };
  frameworks?: number[];
  aiSystems?: Array<{
    name: string;
    type: string;
    riskLevel: string;
  }>;
  baselineScore?: number;
  teamMembers?: Array<{
    email: string;
    role: string;
  }>;
  createdAt: string | Date;
  completedAt?: string | Date;
}>();

export const onboardingRouter = router({
  /**
   * Start a new onboarding session
   */
  startOnboarding: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const sessionId = `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const session = {
        id: sessionId,
        userId: ctx.user.id,
        step: 1,
        createdAt: new Date(),
      };

      onboardingSessions.set(sessionId, session);

      return {
        success: true,
        sessionId,
        currentStep: 1,
        message: 'Onboarding session started',
      };
    } catch (error) {
      console.error('Error starting onboarding:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to start onboarding',
      });
    }
  }),

  /**
   * Step 1: Company Information
   */
  submitCompanyInfo: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        name: z.string().min(1),
        industry: z.string().min(1),
        size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']),
        jurisdiction: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const session = onboardingSessions.get(input.sessionId);

        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Invalid onboarding session',
          });
        }

        session.companyInfo = {
          name: input.name,
          industry: input.industry,
          size: input.size,
          jurisdiction: input.jurisdiction,
        };
        session.step = 2;

        onboardingSessions.set(input.sessionId, session);

        return {
          success: true,
          currentStep: 2,
          message: 'Company information saved',
        };
      } catch (error) {
        console.error('Error submitting company info:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save company information',
        });
      }
    }),

  /**
   * Step 2: Framework Selection
   */
  selectFrameworks: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        frameworkIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const session = onboardingSessions.get(input.sessionId);

        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Invalid onboarding session',
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
          });
        }

        // Verify frameworks exist
        const selectedFrameworks = await db
          .select()
          .from(frameworks)
          .where(eq(frameworks.id, input.frameworkIds[0])); // Simplified for now

        if (selectedFrameworks.length !== input.frameworkIds.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'One or more frameworks not found',
          });
        }

        session.frameworks = input.frameworkIds;
        session.step = 3;

        onboardingSessions.set(input.sessionId, session);

        return {
          success: true,
          currentStep: 3,
          selectedFrameworks: selectedFrameworks.map((f: any) => ({
            id: f.id,
            name: f.name,
            code: f.code,
          })),
          message: 'Frameworks selected',
        };
      } catch (error) {
        console.error('Error selecting frameworks:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to select frameworks',
        });
      }
    }),

  /**
   * Step 3: AI Systems Mapping
   */
  mapAISystems: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        aiSystems: z.array(
          z.object({
            name: z.string(),
            type: z.enum(['chatbot', 'recommendation', 'classification', 'generation', 'analysis', 'other']),
            riskLevel: z.enum(['minimal', 'limited', 'high', 'unacceptable']),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const session = onboardingSessions.get(input.sessionId);

        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Invalid onboarding session',
          });
        }

        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Database connection failed',
          });
        }

        // Create AI systems in database
        const createdSystems = [];
        for (const system of input.aiSystems) {
          const [result] = await db.insert(aiSystems).values({
            userId: ctx.user.id,
            name: system.name,
            systemType: system.type as any,
            riskLevel: system.riskLevel as any,
            status: 'draft',
          }).$returningId();

          createdSystems.push({
            id: (result as any).id,
            name: system.name,
            type: system.type,
            riskLevel: system.riskLevel,
          });
        }

        session.aiSystems = input.aiSystems;
        session.step = 4;

        onboardingSessions.set(input.sessionId, session);

        return {
          success: true,
          currentStep: 4,
          createdSystems,
          message: `${createdSystems.length} AI systems registered`,
        };
      } catch (error) {
        console.error('Error mapping AI systems:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to map AI systems',
        });
      }
    }),

  /**
   * Step 4: Compliance Baseline Assessment
   */
  submitBaseline: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        assessmentAnswers: z.record(z.string(), z.enum(['yes', 'no', 'partial', 'unknown'])),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const session = onboardingSessions.get(input.sessionId);

        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Invalid onboarding session',
          });
        }

        // Calculate baseline compliance score
        const answers = Object.values(input.assessmentAnswers);
        const compliantAnswers = answers.filter((a: any) => a === 'yes').length;
        const partialAnswers = answers.filter((a: any) => a === 'partial').length;
        const baselineScore = Math.round(
          ((compliantAnswers + partialAnswers * 0.5) / answers.length) * 100
        );

        session.baselineScore = baselineScore;
        session.step = 5;

        onboardingSessions.set(input.sessionId, session);

        return {
          success: true,
          currentStep: 5,
          baselineScore,
          message: `Baseline compliance score: ${baselineScore}%`,
        };
      } catch (error) {
        console.error('Error submitting baseline:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit baseline assessment',
        });
      }
    }),

  /**
   * Step 5: Team Setup
   */
  setupTeam: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        teamMembers: z.array(
          z.object({
            email: z.string().email(),
            role: z.enum(['admin', 'compliance_officer', 'analyst', 'viewer']),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const session = onboardingSessions.get(input.sessionId);

        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Invalid onboarding session',
          });
        }

        session.teamMembers = input.teamMembers;
        session.step = 6;
        session.completedAt = new Date().toISOString();

        onboardingSessions.set(input.sessionId, session);

        return {
          success: true,
          currentStep: 6,
          message: 'Onboarding completed successfully',
          summary: {
            company: session.companyInfo,
            frameworks: session.frameworks?.length || 0,
            aiSystems: session.aiSystems?.length || 0,
            baselineScore: session.baselineScore,
            teamMembers: input.teamMembers.length,
          },
        };
      } catch (error) {
        console.error('Error setting up team:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to setup team',
        });
      }
    }),

  /**
   * Get onboarding session status
   */
  getSessionStatus: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const session = onboardingSessions.get(input.sessionId);

        if (!session || session.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Invalid onboarding session',
          });
        }

        return {
          sessionId: session.id,
          currentStep: session.step,
          isCompleted: session.completedAt !== undefined,
          companyInfo: session.companyInfo,
          frameworksCount: session.frameworks?.length || 0,
          aiSystemsCount: session.aiSystems?.length || 0,
          baselineScore: session.baselineScore,
          teamMembersCount: session.teamMembers?.length || 0,
        };
      } catch (error) {
        console.error('Error fetching session status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch session status',
        });
      }
    }),

  /**
   * Get available frameworks for selection
   */
  getAvailableFrameworks: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database connection failed',
        });
      }

      const frameworksList = await db.select().from(frameworks);

      return {
        frameworks: frameworksList.map((f: any) => ({
          id: f.id,
          name: f.name,
          code: f.code,
          description: f.description,
        })),
      };
    } catch (error) {
      console.error('Error fetching frameworks:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch frameworks',
      });
    }
  }),

  /**
   * Get baseline assessment questions
   */
  getBaselineQuestions: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Return standard baseline assessment questions
      return {
        questions: [
          {
            id: 'q1',
            category: 'governance',
            question: 'Do you have a documented AI governance framework?',
            weight: 1,
          },
          {
            id: 'q2',
            category: 'governance',
            question: 'Is there a designated AI compliance officer?',
            weight: 1,
          },
          {
            id: 'q3',
            category: 'risk',
            question: 'Have you conducted a risk assessment for your AI systems?',
            weight: 1,
          },
          {
            id: 'q4',
            category: 'risk',
            question: 'Do you have incident response procedures for AI systems?',
            weight: 1,
          },
          {
            id: 'q5',
            category: 'transparency',
            question: 'Do you provide transparency information to users about AI decisions?',
            weight: 1,
          },
          {
            id: 'q6',
            category: 'transparency',
            question: 'Do you have a mechanism for users to appeal AI decisions?',
            weight: 1,
          },
          {
            id: 'q7',
            category: 'data',
            question: 'Do you have data protection measures in place?',
            weight: 1,
          },
          {
            id: 'q8',
            category: 'data',
            question: 'Is there a data retention and deletion policy?',
            weight: 1,
          },
          {
            id: 'q9',
            category: 'monitoring',
            question: 'Do you monitor AI system performance and outcomes?',
            weight: 1,
          },
          {
            id: 'q10',
            category: 'monitoring',
            question: 'Do you have audit logs for AI system decisions?',
            weight: 1,
          },
        ],
      };
    } catch (error) {
      console.error('Error fetching baseline questions:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch baseline questions',
      });
    }
  }),
});
