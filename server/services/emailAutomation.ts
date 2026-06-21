/**
 * Email Automation Scheduler
 * Manages automated email sequences for user onboarding
 */

import { getDb } from "../db";
import { emailSequences, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { renderEmailTemplate } from "./emailTemplates";

export interface EmailSequenceConfig {
  sequenceType: "welcome" | "course_recommendation" | "exam_prep" | "success_stories" | "certification_path";
  delayDays: number;
  templateId: string;
  enabled: boolean;
}

// Default email sequence configuration
export const defaultSequenceConfig: Record<string, EmailSequenceConfig[]> = {
  welcome: [
    {
      sequenceType: "welcome",
      delayDays: 0,
      templateId: "welcome",
      enabled: true,
    },
    {
      sequenceType: "welcome",
      delayDays: 1,
      templateId: "course_recommendation",
      enabled: true,
    },
    {
      sequenceType: "welcome",
      delayDays: 3,
      templateId: "exam_prep",
      enabled: true,
    },
    {
      sequenceType: "welcome",
      delayDays: 7,
      templateId: "success_stories",
      enabled: true,
    },
    {
      sequenceType: "welcome",
      delayDays: 14,
      templateId: "certification_path",
      enabled: true,
    },
  ],
};

/**
 * Mock email sending function
 */
async function sendEmail(to: string, subject: string, html: string, text?: string): Promise<void> {
  console.log(`[EmailAutomation] Sending email to ${to}: ${subject}`);
  // In production, integrate with actual email service
}

/**
 * Trigger an email sequence for a user
 */
export async function triggerEmailSequence(
  userId: number,
  sequenceType: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; sequenceId?: number; error?: string }> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get user info
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userRecord.length) {
      return { success: false, error: "User not found" };
    }

    const user = userRecord[0];

    // Create email sequence record
    const result = await db.insert(emailSequences).values({
      userId,
      sequenceType,
      currentStep: 1,
      status: "active",
      metadata: metadata || null,
    });

    // Send first email in sequence
    const config = defaultSequenceConfig[sequenceType];
    if (config && config.length > 0) {
      const firstEmail = config[0];
      if (firstEmail.enabled && user.email) {
        const rendered = renderEmailTemplate(firstEmail.templateId, {
          firstName: user.name?.split(" ")[0] || "there",
          dashboardUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/dashboard`,
          coursesUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/courses`,
          communityUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/community`,
        });

        if (rendered) {
          await sendEmail(user.email, rendered.subject, rendered.html, rendered.text);
        }
      }
    }

    const rawInsertId = (result as any).insertId ?? (result as any)[0]?.insertId;
    return {
      success: true,
      sequenceId: typeof rawInsertId === "bigint" ? Number(rawInsertId) : Number(rawInsertId),
    };
  } catch (error) {
    console.error("Failed to trigger email sequence:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Process scheduled emails (call this periodically from a cron job)
 */
export async function processScheduledEmails(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get all active sequences
    const activeSequences = await db
      .select()
      .from(emailSequences)
      .where(eq(emailSequences.status, "active"));

    console.log(`[EmailAutomation] Processing ${activeSequences.length} active sequences`);

    for (const sequence of activeSequences) {
      const config = defaultSequenceConfig[sequence.sequenceType];
      if (!config) continue;

      const currentStep = sequence.currentStep;
      const stepConfig = config[currentStep - 1];
      if (!stepConfig) {
        // Sequence completed
        await db
          .update(emailSequences)
          .set({ status: "completed" })
          .where(eq(emailSequences.id, sequence.id));
        continue;
      }

      // Check if enough time has passed
      const createdAt = new Date(sequence.createdAt);
      const delayMs = stepConfig.delayDays * 24 * 60 * 60 * 1000;
      const sendAt = new Date(createdAt.getTime() + delayMs);

      if (new Date() >= sendAt) {
        // Get user
        const userRecord = await db
          .select()
          .from(users)
          .where(eq(users.id, sequence.userId))
          .limit(1);

        if (userRecord.length && userRecord[0].email) {
          const user = userRecord[0];
          const rendered = renderEmailTemplate(stepConfig.templateId, {
            firstName: user.name?.split(" ")[0] || "there",
            dashboardUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/dashboard`,
            coursesUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/courses`,
            communityUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/community`,
          });

          if (rendered) {
            await sendEmail(user.email!, rendered.subject, rendered.html, rendered.text);
          }

          // Update sequence step
          await db
            .update(emailSequences)
            .set({
              currentStep: currentStep + 1,
              updatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
            })
            .where(eq(emailSequences.id, sequence.id));
        }
      }
    }
  } catch (error) {
    console.error("Failed to process scheduled emails:", error);
  }
}

/**
 * Cancel an email sequence for a user
 */
export async function cancelEmailSequence(
  userId: number,
  sequenceType: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(emailSequences)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(emailSequences.userId, userId),
          eq(emailSequences.sequenceType, sequenceType),
          eq(emailSequences.status, "active")
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Failed to cancel email sequence:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get email sequence status for a user
 */
export async function getEmailSequenceStatus(
  userId: number,
  sequenceType: string
): Promise<{ active: boolean; currentStep: number; totalSteps: number } | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const sequence = await db
      .select()
      .from(emailSequences)
      .where(
        and(
          eq(emailSequences.userId, userId),
          eq(emailSequences.sequenceType, sequenceType)
        )
      )
      .limit(1);

    if (!sequence.length) return null;

    const config = defaultSequenceConfig[sequenceType];
    return {
      active: sequence[0].status === "active",
      currentStep: sequence[0].currentStep,
      totalSteps: config?.length || 0,
    };
  } catch (error) {
    console.error("Failed to get email sequence status:", error);
    return null;
  }
}
