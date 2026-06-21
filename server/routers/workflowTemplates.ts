/**
 * Workflow Templates Router
 * Handles pre-built workflow templates
 */

import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { emailWorkflows } from "../../drizzle/schema";
import { workflowTemplates, templateUsage } from "../../drizzle/schema-workflow-templates";
import { eq, and, desc, sql } from "drizzle-orm";

export const workflowTemplatesRouter = router({
  // Get all public templates
  getTemplates: protectedProcedure
    .input(
      z.object({
        category: z.enum(['welcome', 'course', 'engagement', 'certification', 'reminder', 'nurture']).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db
        .select()
        .from(workflowTemplates)
        .where(eq(workflowTemplates.isPublic, true))
        .orderBy(desc(workflowTemplates.usageCount));

      const templates = await query;

      // Filter by category if provided
      if (input?.category) {
        return templates.filter(t => t.category === input.category);
      }

      return templates;
    }),

  // Get single template
  getTemplate: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const template = await db
        .select()
        .from(workflowTemplates)
        .where(eq(workflowTemplates.id, input.id))
        .limit(1);

      if (!template.length) {
        throw new Error("Template not found");
      }

      return template[0];
    }),

  // Clone template to create new workflow
  cloneTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        name: z.string().min(1).max(255).optional(),
        customizations: z.any().optional(), // Allow users to customize before cloning
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get template
      const template = await db
        .select()
        .from(workflowTemplates)
        .where(eq(workflowTemplates.id, input.templateId))
        .limit(1);

      if (!template.length) {
        throw new Error("Template not found");
      }

      const templateData = template[0];

      // Create new workflow from template
      const workflowResult = await db.insert(emailWorkflows).values({
        userId: ctx.user.id,
        name: input.name || `${templateData.name} (Copy)`,
        description: templateData.description,
        triggerType: templateData.triggerType,
        triggerConfig: input.customizations?.triggerConfig || templateData.triggerConfig,
        workflowData: input.customizations?.workflowData || templateData.workflowData,
        isActive: 0, // Start inactive so user can review
      });

      const rawInsertId = (workflowResult as any).insertId ?? (workflowResult as any)[0]?.insertId;
      const workflowId = typeof rawInsertId === 'bigint' ? Number(rawInsertId) : Number(rawInsertId);

      // Track template usage
      await db.insert(templateUsage).values({
        templateId: input.templateId,
        userId: ctx.user.id,
        workflowId: workflowId,
      });

      // Increment usage count
      await db
        .update(workflowTemplates)
        .set({ 
          usageCount: sql`${workflowTemplates.usageCount} + 1` 
        })
        .where(eq(workflowTemplates.id, input.templateId));

      return { workflowId, success: true };
    }),

  // Get template statistics
  getTemplateStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const templates = await db
      .select()
      .from(workflowTemplates)
      .where(eq(workflowTemplates.isPublic, true));

    const stats = {
      total: templates.length,
      byCategory: {
        welcome: templates.filter(t => t.category === 'welcome').length,
        course: templates.filter(t => t.category === 'course').length,
        engagement: templates.filter(t => t.category === 'engagement').length,
        certification: templates.filter(t => t.category === 'certification').length,
        reminder: templates.filter(t => t.category === 'reminder').length,
        nurture: templates.filter(t => t.category === 'nurture').length,
      },
      totalUsage: templates.reduce((sum, t) => sum + (t.usageCount || 0), 0),
    };

    return stats;
  }),
});
