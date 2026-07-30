import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { abExperiments, abVariants, abAssignments } from "../../drizzle/schema-ab-testing";
import { eq, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const abTestingRouter = router({
  // Get all experiments
  getExperiments: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
    }

    const experiments = await db
      .select({
        id: abExperiments.id,
        name: abExperiments.name,
        description: abExperiments.description,
        hypothesis: abExperiments.hypothesis,
        targetAudience: abExperiments.targetAudience,
        startDate: abExperiments.startDate,
        endDate: abExperiments.endDate,
        status: abExperiments.status,
        successMetric: abExperiments.successMetric,
        createdAt: abExperiments.createdAt,
        variantCount: sql<number>`(SELECT COUNT(*) FROM ab_variants WHERE experimentId = ${abExperiments.id})`,
        assignmentCount: sql<number>`(SELECT COUNT(*) FROM ab_assignments WHERE experimentId = ${abExperiments.id})`,
      })
      .from(abExperiments)
      .orderBy(desc(abExperiments.createdAt));

    return experiments;
  }),

  // Get experiment details with variants
  getExperimentDetails: protectedProcedure
    .input(z.object({ experimentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const experiment = await db
        .select()
        .from(abExperiments)
        .where(eq(abExperiments.id, input.experimentId))
        .limit(1);

      if (experiment.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Experiment not found' });
      }

      const variants = await db
        .select({
          id: abVariants.id,
          name: abVariants.name,
          description: abVariants.description,
          interventionType: abVariants.interventionType,
          interventionContent: abVariants.interventionContent,
          weight: abVariants.weight,
          isControl: abVariants.isControl,
          assignmentCount: sql<number>`(SELECT COUNT(*) FROM ab_assignments WHERE variantId = ${abVariants.id})`,
          successCount: sql<number>`(SELECT COUNT(*) FROM ab_assignments WHERE variantId = ${abVariants.id} AND outcome = 'success')`,
          failureCount: sql<number>`(SELECT COUNT(*) FROM ab_assignments WHERE variantId = ${abVariants.id} AND outcome = 'failure')`,
        })
        .from(abVariants)
        .where(eq(abVariants.experimentId, input.experimentId));

      return {
        experiment: experiment[0],
        variants: variants.map((v) => ({
          ...v,
          isControl: Boolean(v.isControl),
          assignmentCount: Number(v.assignmentCount) || 0,
          successCount: Number(v.successCount) || 0,
          failureCount: Number(v.failureCount) || 0,
          conversionRate:
            Number(v.assignmentCount) > 0
              ? Math.round((Number(v.successCount) / Number(v.assignmentCount)) * 100)
              : 0,
        })),
      };
    }),

  // Create experiment
  createExperiment: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        hypothesis: z.string().optional(),
        targetAudience: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        successMetric: z.string().optional(),
        variants: z.array(
          z.object({
            name: z.string(),
            description: z.string().optional(),
            interventionType: z.string().optional(),
            interventionContent: z.string().optional(),
            weight: z.number().default(50),
            isControl: z.boolean().default(false),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Create experiment
      const experimentResult = await db.insert(abExperiments).values({
        name: input.name,
        description: input.description || null,
        hypothesis: input.hypothesis || null,
        targetAudience: input.targetAudience || null,
        startDate: input.startDate || null,
        endDate: input.endDate || null,
        successMetric: input.successMetric || null,
        createdBy: ctx.user.id,
      });

      const experimentId = Number((experimentResult as any).insertId);

      // Create variants
      for (const variant of input.variants) {
        await db.insert(abVariants).values({
          experimentId,
          name: variant.name,
          description: variant.description || null,
          interventionType: variant.interventionType || null,
          interventionContent: variant.interventionContent || null,
          weight: variant.weight,
          isControl: variant.isControl ? 1 : 0,
        });
      }

      return { experimentId };
    }),

  // Assign student to variant
  assignStudentToVariant: protectedProcedure
    .input(
      z.object({
        experimentId: z.number(),
        studentId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Check if student already assigned
      const existing = await db
        .select()
        .from(abAssignments)
        .where(
          and(
            eq(abAssignments.experimentId, input.experimentId),
            eq(abAssignments.studentId, input.studentId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return { variantId: existing[0].variantId, alreadyAssigned: true };
      }

      // Get variants with weights
      const variants = await db
        .select()
        .from(abVariants)
        .where(eq(abVariants.experimentId, input.experimentId));

      if (variants.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No variants found for experiment' });
      }

      // Weighted random selection
      const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
      let random = Math.random() * totalWeight;
      let selectedVariant = variants[0];

      for (const variant of variants) {
        random -= variant.weight;
        if (random <= 0) {
          selectedVariant = variant;
          break;
        }
      }

      // Assign student to variant
      await db.insert(abAssignments).values({
        experimentId: input.experimentId,
        variantId: selectedVariant.id,
        studentId: input.studentId,
      });

      return { variantId: selectedVariant.id, alreadyAssigned: false };
    }),

  // Record experiment outcome
  recordOutcome: protectedProcedure
    .input(
      z.object({
        experimentId: z.number(),
        studentId: z.number(),
        outcome: z.enum(["success", "failure"]),
        metrics: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      await db
        .update(abAssignments)
        .set({
          outcome: input.outcome,
          completedAt: new Date().toISOString(),
          outcomeMetrics: input.metrics || null,
        })
        .where(
          and(
            eq(abAssignments.experimentId, input.experimentId),
            eq(abAssignments.studentId, input.studentId)
          )
        );

      return { success: true };
    }),

  // Update experiment status
  updateExperimentStatus: protectedProcedure
    .input(
      z.object({
        experimentId: z.number(),
        status: z.enum(["draft", "active", "paused", "completed"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      await db
        .update(abExperiments)
        .set({ status: input.status })
        .where(eq(abExperiments.id, input.experimentId));

      return { success: true };
    }),

  // Get experiment results with statistical analysis
  getExperimentResults: protectedProcedure
    .input(z.object({ experimentId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const variants = await db
        .select({
          id: abVariants.id,
          name: abVariants.name,
          isControl: abVariants.isControl,
          totalAssignments: sql<number>`COUNT(${abAssignments.id})`,
          successCount: sql<number>`SUM(CASE WHEN ${abAssignments.outcome} = 'success' THEN 1 ELSE 0 END)`,
          failureCount: sql<number>`SUM(CASE WHEN ${abAssignments.outcome} = 'failure' THEN 1 ELSE 0 END)`,
          pendingCount: sql<number>`SUM(CASE WHEN ${abAssignments.outcome} = 'pending' THEN 1 ELSE 0 END)`,
        })
        .from(abVariants)
        .leftJoin(abAssignments, eq(abVariants.id, abAssignments.variantId))
        .where(eq(abVariants.experimentId, input.experimentId))
        .groupBy(abVariants.id);

      return variants.map((v) => {
        const total = Number(v.totalAssignments) || 0;
        const success = Number(v.successCount) || 0;
        const failure = Number(v.failureCount) || 0;
        const pending = Number(v.pendingCount) || 0;
        const conversionRate = total > 0 ? (success / total) * 100 : 0;

        return {
          id: v.id,
          name: v.name,
          isControl: Boolean(v.isControl),
          totalAssignments: total,
          successCount: success,
          failureCount: failure,
          pendingCount: pending,
          conversionRate: Math.round(conversionRate * 100) / 100,
        };
      });
    }),
});
