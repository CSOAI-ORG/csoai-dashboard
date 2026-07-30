/**
 * Resend Webhook Router
 * Handles email delivery webhooks from Resend
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { emailEvents, emailExecutionLogs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Resend webhook event schema
const resendWebhookSchema = z.object({
  type: z.enum([
    'email.sent',
    'email.delivered',
    'email.delivery_delayed',
    'email.bounced',
    'email.complained',
    'email.opened',
    'email.clicked'
  ]),
  created_at: z.string(),
  data: z.object({
    email_id: z.string(),
    to: z.union([z.string(), z.array(z.string())]),
    subject: z.string().optional(),
    click: z.object({
      link: z.string(),
      user_agent: z.string().optional(),
      ip_address: z.string().optional(),
    }).optional(),
    bounce: z.object({
      type: z.string(),
      reason: z.string(),
    }).optional(),
    complaint: z.object({
      type: z.string(),
    }).optional(),
  }),
});

export const resendWebhookRouter = router({
  // Webhook endpoint for Resend events
  handleEvent: publicProcedure
    .input(resendWebhookSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Extract recipient email
        const recipientEmail = Array.isArray(input.data.to) 
          ? input.data.to[0] 
          : input.data.to;

        // Find the corresponding email log by Resend email ID
        const emailLog = await db
          .select()
          .from(emailExecutionLogs)
          .where(eq(emailExecutionLogs.metadata, input.data.email_id))
          .limit(1);

        const emailLogId = emailLog.length > 0 ? emailLog[0].id : null;

        // Store the webhook event
        await db.insert(emailEvents).values({
          emailLogId,
          resendEmailId: input.data.email_id,
          eventType: input.type,
          recipientEmail,
          timestamp: input.created_at,
          metadata: {
            clickedLink: input.data.click?.link,
            userAgent: input.data.click?.user_agent,
            ipAddress: input.data.click?.ip_address,
            bounceType: input.data.bounce?.type,
            bounceReason: input.data.bounce?.reason,
            complaintType: input.data.complaint?.type,
          },
          rawPayload: input,
        });

        // Update email execution log status if found
        if (emailLogId) {
          const updates: any = {};
          
          switch (input.type) {
            case 'email.delivered':
              updates.status = 'delivered';
              updates.deliveredAt = input.created_at;
              break;
            case 'email.opened':
              updates.status = 'opened';
              updates.openedAt = input.created_at;
              break;
            case 'email.clicked':
              updates.status = 'clicked';
              updates.clickedAt = input.created_at;
              break;
            case 'email.bounced':
              updates.status = 'bounced';
              updates.errorMessage = input.data.bounce?.reason || 'Email bounced';
              break;
            case 'email.complained':
              updates.status = 'failed';
              updates.errorMessage = 'Spam complaint';
              break;
          }

          if (Object.keys(updates).length > 0) {
            await db
              .update(emailExecutionLogs)
              .set(updates)
              .where(eq(emailExecutionLogs.id, emailLogId));
          }
        }

        return { success: true, processed: true };
      } catch (error) {
        console.error('Error processing Resend webhook:', error);
        throw new Error('Failed to process webhook event');
      }
    }),

  // Get email events for a specific email log
  getEmailEvents: publicProcedure
    .input(z.object({ emailLogId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const events = await db
        .select()
        .from(emailEvents)
        .where(eq(emailEvents.emailLogId, input.emailLogId))
        .orderBy(emailEvents.timestamp);

      return events;
    }),

  // Get email events by Resend email ID
  getEventsByResendId: publicProcedure
    .input(z.object({ resendEmailId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const events = await db
        .select()
        .from(emailEvents)
        .where(eq(emailEvents.resendEmailId, input.resendEmailId))
        .orderBy(emailEvents.timestamp);

      return events;
    }),
});
