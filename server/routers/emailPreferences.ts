import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { emailPreferences } from "../../drizzle/schema-email-preferences";
import { eq } from "drizzle-orm";

export const emailPreferencesRouter = router({
  // Get user's email preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const userId = ctx.user.id;

    let prefs = await db
      .select()
      .from(emailPreferences)
      .where(eq(emailPreferences.userId, userId))
      .limit(1);

    // If no preferences exist, create default ones
    if (prefs.length === 0) {
      await db.insert(emailPreferences).values({
        userId,
        certificatesEnabled: 1,
        progressReportsEnabled: 1,
        atRiskAlertsEnabled: 1,
        courseUpdatesEnabled: 1,
        achievementsEnabled: 1,
        instructorMessagesEnabled: 1,
      });

      prefs = await db
        .select()
        .from(emailPreferences)
        .where(eq(emailPreferences.userId, userId))
        .limit(1);
    }

    const pref = prefs[0];
    return {
      certificatesEnabled: Boolean(pref.certificatesEnabled),
      progressReportsEnabled: Boolean(pref.progressReportsEnabled),
      atRiskAlertsEnabled: Boolean(pref.atRiskAlertsEnabled),
      courseUpdatesEnabled: Boolean(pref.courseUpdatesEnabled),
      achievementsEnabled: Boolean(pref.achievementsEnabled),
      instructorMessagesEnabled: Boolean(pref.instructorMessagesEnabled),
    };
  }),

  // Update user's email preferences
  updatePreferences: protectedProcedure
    .input(
      z.object({
        certificatesEnabled: z.boolean().optional(),
        progressReportsEnabled: z.boolean().optional(),
        atRiskAlertsEnabled: z.boolean().optional(),
        courseUpdatesEnabled: z.boolean().optional(),
        achievementsEnabled: z.boolean().optional(),
        instructorMessagesEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const userId = ctx.user.id;

      // Ensure preferences exist
      const existing = await db
        .select()
        .from(emailPreferences)
        .where(eq(emailPreferences.userId, userId))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(emailPreferences).values({
          userId,
          certificatesEnabled: input.certificatesEnabled !== undefined ? (input.certificatesEnabled ? 1 : 0) : 1,
          progressReportsEnabled: input.progressReportsEnabled !== undefined ? (input.progressReportsEnabled ? 1 : 0) : 1,
          atRiskAlertsEnabled: input.atRiskAlertsEnabled !== undefined ? (input.atRiskAlertsEnabled ? 1 : 0) : 1,
          courseUpdatesEnabled: input.courseUpdatesEnabled !== undefined ? (input.courseUpdatesEnabled ? 1 : 0) : 1,
          achievementsEnabled: input.achievementsEnabled !== undefined ? (input.achievementsEnabled ? 1 : 0) : 1,
          instructorMessagesEnabled: input.instructorMessagesEnabled !== undefined ? (input.instructorMessagesEnabled ? 1 : 0) : 1,
        });
      } else {
        const updates: any = {};
        if (input.certificatesEnabled !== undefined) updates.certificatesEnabled = input.certificatesEnabled ? 1 : 0;
        if (input.progressReportsEnabled !== undefined) updates.progressReportsEnabled = input.progressReportsEnabled ? 1 : 0;
        if (input.atRiskAlertsEnabled !== undefined) updates.atRiskAlertsEnabled = input.atRiskAlertsEnabled ? 1 : 0;
        if (input.courseUpdatesEnabled !== undefined) updates.courseUpdatesEnabled = input.courseUpdatesEnabled ? 1 : 0;
        if (input.achievementsEnabled !== undefined) updates.achievementsEnabled = input.achievementsEnabled ? 1 : 0;
        if (input.instructorMessagesEnabled !== undefined) updates.instructorMessagesEnabled = input.instructorMessagesEnabled ? 1 : 0;

        await db
          .update(emailPreferences)
          .set(updates)
          .where(eq(emailPreferences.userId, userId));
      }

      return { success: true };
    }),
});
