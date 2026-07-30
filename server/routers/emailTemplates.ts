import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { emailTemplates, emailTemplateVersions, emailTemplatePreviews } from "../../drizzle/schema";
import { eq, and, like, or, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Helper function to render template with merge tags
function renderTemplate(template: string, data: Record<string, any>): string {
  let rendered = template;
  
  // Replace {{tag}} with actual values
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(regex, String(value || ''));
  });
  
  return rendered;
}

// Helper function to validate merge tags
function validateMergeTags(template: string, availableTags: string[]): { valid: boolean; missingTags: string[] } {
  const tagRegex = /{{\\s*([^}]+)\\s*}}/g;
  const usedTags = new Set<string>();
  let match;
  
  while ((match = tagRegex.exec(template)) !== null) {
    usedTags.add(match[1].trim());
  }
  
  const missingTags = Array.from(usedTags).filter(tag => !availableTags.includes(tag));
  
  return {
    valid: missingTags.length === 0,
    missingTags,
  };
}

export const emailTemplatesRouter = router({
  // List all templates
  list: protectedProcedure
    .input(z.object({
      category: z.enum(['onboarding', 'course', 'certification', 'notification', 'marketing', 'system']).optional(),
      isActive: z.boolean().optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const conditions = [];
      
      if (input.category) {
        conditions.push(eq(emailTemplates.category, input.category));
      }
      
      if (input.isActive !== undefined) {
        conditions.push(eq(emailTemplates.isActive, input.isActive));
      }
      
      if (input.search) {
        conditions.push(
          or(
            like(emailTemplates.name, `%${input.search}%`),
            like(emailTemplates.key, `%${input.search}%`),
            like(emailTemplates.description, `%${input.search}%`)
          )
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalCount] = await Promise.all([
        db.select()
          .from(emailTemplates)
          .where(where)
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(desc(emailTemplates.updatedAt)),
        db.select({ count: sql<number>`count(*)` })
          .from(emailTemplates)
          .where(where)
          .then(result => Number(result[0].count))
      ]);

      return {
        items,
        total: totalCount,
        hasMore: input.offset + items.length < totalCount,
      };
    }),

  // Get template by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const template = await db.select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, input.id))
        .limit(1);

      if (!template || template.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        });
      }

      // Get version history
      const versions = await db.select()
        .from(emailTemplateVersions)
        .where(eq(emailTemplateVersions.templateId, input.id))
        .orderBy(desc(emailTemplateVersions.version));

      return {
        ...template[0],
        versions,
      };
    }),

  // Get template by key
  getByKey: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const template = await db.select()
        .from(emailTemplates)
        .where(eq(emailTemplates.key, input.key))
        .limit(1);

      if (!template || template.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        });
      }

      return template[0];
    }),

  // Create new template
  create: protectedProcedure
    .input(z.object({
      key: z.string().min(1).max(100),
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      category: z.enum(['onboarding', 'course', 'certification', 'notification', 'marketing', 'system']),
      subject: z.string().min(1).max(500),
      htmlBody: z.string().min(1),
      textBody: z.string().optional(),
      previewText: z.string().max(255).optional(),
      availableMergeTags: z.array(z.object({
        tag: z.string(),
        description: z.string(),
        example: z.string(),
        required: z.boolean().optional(),
      })),
      defaultValues: z.any().optional(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Check if key already exists
      const existing = await db.select()
        .from(emailTemplates)
        .where(eq(emailTemplates.key, input.key))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Template key already exists',
        });
      }

      const result = await db.insert(emailTemplates).values({
        ...input,
        createdBy: ctx.user.id,
      });

      const templateId = Number((result as any).insertId);

      // Create initial version
      await db.insert(emailTemplateVersions).values({
        templateId,
        version: 1,
        subject: input.subject,
        htmlBody: input.htmlBody,
        textBody: input.textBody,
        changeDescription: 'Initial version',
        createdBy: ctx.user.id,
      });

      return {
        id: templateId,
        success: true,
      };
    }),

  // Update template
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      category: z.enum(['onboarding', 'course', 'certification', 'notification', 'marketing', 'system']).optional(),
      subject: z.string().min(1).max(500).optional(),
      htmlBody: z.string().min(1).optional(),
      textBody: z.string().optional(),
      previewText: z.string().max(255).optional(),
      availableMergeTags: z.array(z.object({
        tag: z.string(),
        description: z.string(),
        example: z.string(),
        required: z.boolean().optional(),
      })).optional(),
      defaultValues: z.any().optional(),
      isActive: z.boolean().optional(),
      metadata: z.any().optional(),
      changeDescription: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const { id, changeDescription, ...updateData } = input;

      // Check if template exists
      const existing = await db.select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        });
      }

      // If subject or body changed, create new version
      if (updateData.subject || updateData.htmlBody) {
        const newVersion = (existing[0].version || 1) + 1;
        
        await db.insert(emailTemplateVersions).values({
          templateId: id,
          version: newVersion,
          subject: updateData.subject || existing[0].subject,
          htmlBody: updateData.htmlBody || existing[0].htmlBody,
          textBody: updateData.textBody || existing[0].textBody,
          changeDescription: changeDescription || `Version ${newVersion}`,
          createdBy: ctx.user.id,
        });

        (updateData as any).version = newVersion;
      }

      await db.update(emailTemplates)
        .set(updateData)
        .where(eq(emailTemplates.id, id));

      return { success: true };
    }),

  // Delete template
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      await db.delete(emailTemplates)
        .where(eq(emailTemplates.id, input.id));

      return { success: true };
    }),

  // Preview template with sample data
  preview: protectedProcedure
    .input(z.object({
      id: z.number(),
      sampleData: z.record(z.string(), z.any()),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const template = await db.select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, input.id))
        .limit(1);

      if (!template || template.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        });
      }

      const availableTags = ((template[0].availableMergeTags as any[]) || []).map((t: any) => t.tag);
      const validation = validateMergeTags(template[0].htmlBody, availableTags);

      if (!validation.valid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Template contains invalid merge tags: ${validation.missingTags.join(', ')}`,
        });
      }

      const renderedSubject = renderTemplate(template[0].subject, input.sampleData);
      const renderedHtml = renderTemplate(template[0].htmlBody, input.sampleData);
      const renderedText = template[0].textBody 
        ? renderTemplate(template[0].textBody, input.sampleData)
        : undefined;

      return {
        subject: renderedSubject,
        htmlBody: renderedHtml,
        textBody: renderedText,
      };
    }),

  // Save preview
  savePreview: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      previewName: z.string().min(1).max(255),
      sampleData: z.record(z.string(), z.any()),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Render the template with sample data
      const template = await db.select()
        .from(emailTemplates)
        .where(eq(emailTemplates.id, input.templateId))
        .limit(1);

      if (!template || template.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Template not found',
        });
      }

      const renderedHtml = renderTemplate(template[0].htmlBody, input.sampleData);

      const result = await db.insert(emailTemplatePreviews).values({
        templateId: input.templateId,
        previewName: input.previewName,
        sampleData: input.sampleData,
        renderedHtml,
        createdBy: ctx.user.id,
      });

      return {
        id: Number((result as any).insertId),
        success: true,
      };
    }),

  // Get saved previews
  getPreviews: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const previews = await db.select()
        .from(emailTemplatePreviews)
        .where(eq(emailTemplatePreviews.templateId, input.templateId))
        .orderBy(desc(emailTemplatePreviews.createdAt));

      return previews;
    }),

  // Validate template
  validate: protectedProcedure
    .input(z.object({
      subject: z.string(),
      htmlBody: z.string(),
      availableMergeTags: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const subjectValidation = validateMergeTags(input.subject, input.availableMergeTags);
      const bodyValidation = validateMergeTags(input.htmlBody, input.availableMergeTags);

      return {
        valid: subjectValidation.valid && bodyValidation.valid,
        subjectErrors: subjectValidation.missingTags,
        bodyErrors: bodyValidation.missingTags,
      };
    }),

  // Increment usage count
  incrementUsage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      await db.update(emailTemplates)
        .set({
          usageCount: sql`${emailTemplates.usageCount} + 1`,
          lastUsedAt: new Date().toISOString(),
        })
        .where(eq(emailTemplates.id, input.id));

      return { success: true };
    }),
});
