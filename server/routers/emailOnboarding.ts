/**
 * Email Onboarding Router
 * Handles automated email sequences for new signups with personalized recommendations
 */

import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  emailSequences,
  emailTemplates,
  userEmailPreferences,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const emailOnboardingRouter = router({
  // Get available email templates
  getTemplates: publicProcedure
    .input(
      z.object({
        sequenceType: z.enum([
          "welcome",
          "course_recommendation",
          "exam_prep",
          "success_stories",
          "certification_path",
        ]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      // sequenceType column doesn't exist in schema, return all templates
      return await db.select().from(emailTemplates);
    }),

  // Start onboarding sequence for a user
  startOnboardingSequence: protectedProcedure
    .input(
      z.object({
        sequenceType: z.enum([
          "welcome",
          "course_recommendation",
          "exam_prep",
          "success_stories",
          "certification_path",
        ]),
        courseInterests: z.array(z.string()).optional(),
        experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [sequence] = await db.insert(emailSequences).values({
        userId: ctx.user.id,
        sequenceType: input.sequenceType,
        currentStep: 1,
        status: "pending",
        createdAt: new Date().toISOString(),
      }).$returningId() as { id: number }[];

      return {
        success: true,
        sequenceId: sequence.id,
        message: `${input.sequenceType} onboarding sequence started`,
      };
    }),

  // Get user's active sequences
  getActiveSequences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(emailSequences)
      .where(
        and(
          eq(emailSequences.userId, ctx.user.id),
          eq(emailSequences.status, "pending")
        )
      )
      .orderBy(desc(emailSequences.createdAt));
  }),

  // Update user email preferences
  updateEmailPreferences: protectedProcedure
    .input(
      z.object({
        welcomeEmails: z.boolean().optional(),
        courseRecommendations: z.boolean().optional(),
        examPrepGuides: z.boolean().optional(),
        successStories: z.boolean().optional(),
        certificationUpdates: z.boolean().optional(),
        frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db
        .select()
        .from(userEmailPreferences)
        .where(eq(userEmailPreferences.userId, ctx.user.id));

      if (existing.length > 0) {
        await db
          .update(userEmailPreferences)
          .set({
            marketingEmails: input.welcomeEmails ? 1 : 0,
            productUpdates: input.courseRecommendations ? 1 : 0,
            weeklyDigest: input.examPrepGuides ? 1 : 0,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(userEmailPreferences.userId, ctx.user.id));
      } else {
        await db.insert(userEmailPreferences).values({
          userId: ctx.user.id,
          optIn: 1,
          marketingEmails: input.welcomeEmails ? 1 : 0,
          productUpdates: input.courseRecommendations ? 1 : 0,
          weeklyDigest: input.examPrepGuides ? 1 : 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      return { success: true, message: "Email preferences updated" };
    }),

  // Get email campaign metrics
  getCampaignMetrics: publicProcedure
    .input(
      z.object({
        sequenceType: z.enum([
          "welcome",
          "course_recommendation",
          "exam_prep",
          "success_stories",
          "certification_path",
        ]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const templates = await db.select().from(emailTemplates);

      if (input.sequenceType) {
        return templates.filter((t: any) => t.templateId.includes(input.sequenceType));
      }

      return templates;
    }),

  // Get user email preferences
  getUserPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const preferences = await db
      .select()
      .from(userEmailPreferences)
      .where(eq(userEmailPreferences.userId, ctx.user.id));

    return preferences.length > 0 ? preferences[0] : null;
  }),
});
