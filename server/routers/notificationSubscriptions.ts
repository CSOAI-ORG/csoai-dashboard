/**
 * Notification Subscriptions Router
 * Handles email subscription management for incident alerts and status notifications
 */

import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { newsletterSubscribers, watchdogReports } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "../emailService";

export const notificationSubscriptionsRouter = router({
  // Subscribe to incident notifications
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        categories: z.array(z.enum(['all', 'critical', 'high', 'medium', 'low'])).default(['all']),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if already subscribed
      const existing = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        // Update existing subscription
        await db
          .update(newsletterSubscribers)
          .set({
            status: 'active',
            updatedAt: new Date().toISOString(),
          })
          .where(eq(newsletterSubscribers.email, input.email));

        return { success: true, message: 'Subscription updated successfully' };
      }

      // Create new subscription
      await db.insert(newsletterSubscribers).values({
        email: input.email,
        name: input.name || null,
        status: 'active',
        confirmedAt: new Date().toISOString(),
      });

      // Send welcome email
      try {
        await sendEmail({
          to: input.email,
          subject: 'Welcome to CSOAI Incident Alerts',
          text: `Hi ${input.name || 'there'},\n\nThank you for subscribing to CSOAI incident alerts. You will receive notifications about AI safety incidents based on your preferences.\n\nCategories: ${input.categories.join(', ')}\n\nYou can unsubscribe at any time by clicking the unsubscribe link in any email.\n\nBest regards,\nThe CSOAI Team`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">Welcome to CSOAI Incident Alerts</h2>
              <p>Hi ${input.name || 'there'},</p>
              <p>Thank you for subscribing to CSOAI incident alerts. You will receive notifications about AI safety incidents based on your preferences.</p>
              <p><strong>Categories:</strong> ${input.categories.join(', ')}</p>
              <p>You can unsubscribe at any time by clicking the unsubscribe link in any email.</p>
              <p>Best regards,<br/>The CSOAI Team</p>
            </div>
          `,
        });
      } catch (error) {
        console.error('Failed to send welcome email:', error);
        // Don't fail the subscription if email fails
      }

      return { success: true, message: 'Subscribed successfully' };
    }),

  // Unsubscribe from notifications
  unsubscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(newsletterSubscribers)
        .set({
          status: 'unsubscribed',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(newsletterSubscribers.email, input.email));

      return { success: true, message: 'Unsubscribed successfully' };
    }),

  // Get subscription status
  getSubscription: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const subscription = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, input.email))
        .limit(1);

      if (subscription.length === 0) {
        return null;
      }

      const sub = subscription[0];
      return {
        email: sub.email,
        name: sub.name,
        status: sub.status,
        createdAt: sub.createdAt,
        confirmedAt: sub.confirmedAt,
      };
    }),

  // Send incident alert (internal use)
  sendIncidentAlert: protectedProcedure
    .input(
      z.object({
        reportId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get report details
      const report = await db
        .select()
        .from(watchdogReports)
        .where(eq(watchdogReports.id, input.reportId))
        .limit(1);

      if (report.length === 0) {
        throw new Error("Report not found");
      }

      const incident = report[0];

      // Get all active subscribers
      const subscribers = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.status, 'active'));

      // Send to all active subscribers (no preference filtering since preferences field doesn't exist)
      const relevantSubscribers = subscribers;

      // Send emails to all relevant subscribers
      const emailPromises = relevantSubscribers.map(subscriber =>
        sendEmail({
          to: subscriber.email,
          subject: `[${incident.severity.toUpperCase()}] New AI Safety Incident: ${incident.title}`,
          text: `
New AI Safety Incident Reported

Title: ${incident.title}
Severity: ${incident.severity}
Type: ${incident.incidentType}
AI System: ${incident.aiSystemName || 'Unknown'}
Company: ${incident.companyName || 'Unknown'}

Description:
${incident.description}

View full report: ${process.env.VITE_FRONTEND_URL}/watchdog/${incident.id}

---
You're receiving this because you subscribed to CSOAI incident alerts.
Unsubscribe: ${process.env.VITE_FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}
          `,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: ${incident.severity === 'critical' ? '#ef4444' : incident.severity === 'high' ? '#f97316' : '#eab308'}; color: white; padding: 16px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">New AI Safety Incident</h2>
                <p style="margin: 8px 0 0 0; opacity: 0.9;">${incident.severity.toUpperCase()} Severity</p>
              </div>
              
              <div style="padding: 24px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <h3 style="margin-top: 0; color: #111827;">${incident.title}</h3>
                
                <table style="width: 100%; margin: 16px 0;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;"><strong>Type:</strong></td>
                    <td style="padding: 8px 0;">${incident.incidentType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;"><strong>AI System:</strong></td>
                    <td style="padding: 8px 0;">${incident.aiSystemName || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;"><strong>Company:</strong></td>
                    <td style="padding: 8px 0;">${incident.companyName || 'Unknown'}</td>
                  </tr>
                </table>
                
                <div style="background-color: white; padding: 16px; border-radius: 4px; margin: 16px 0;">
                  <p style="margin: 0; color: #374151;">${incident.description}</p>
                </div>
                
                <a href="${process.env.VITE_FRONTEND_URL}/watchdog/${incident.id}" 
                   style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">
                  View Full Report
                </a>
              </div>
              
              <div style="margin-top: 24px; padding: 16px; text-align: center; color: #6b7280; font-size: 12px;">
                <p>You're receiving this because you subscribed to CSOAI incident alerts.</p>
                <a href="${process.env.VITE_FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}" 
                   style="color: #6b7280;">Unsubscribe</a>
              </div>
            </div>
          `,
        }).catch(error => {
          console.error(`Failed to send email to ${subscriber.email}:`, error);
          return null;
        })
      );

      await Promise.allSettled(emailPromises);

      return { 
        success: true, 
        message: `Sent alerts to ${relevantSubscribers.length} subscribers` 
      };
    }),

  // Send resolution notification
  sendResolutionNotification: protectedProcedure
    .input(
      z.object({
        reportId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get report details
      const report = await db
        .select()
        .from(watchdogReports)
        .where(eq(watchdogReports.id, input.reportId))
        .limit(1);

      if (report.length === 0) {
        throw new Error("Report not found");
      }

      const incident = report[0];

      // Get all active subscribers
      const subscribers = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.status, 'active'));

      // Send resolution emails
      const emailPromises = subscribers.map(subscriber =>
        sendEmail({
          to: subscriber.email,
          subject: `[RESOLVED] AI Safety Incident: ${incident.title}`,
          text: `
AI Safety Incident Resolved

Title: ${incident.title}
Severity: ${incident.severity}
Status: ${incident.status}

The incident has been resolved. View the full report for details on the resolution.

View full report: ${process.env.VITE_FRONTEND_URL}/watchdog/${incident.id}

---
You're receiving this because you subscribed to CSOAI incident alerts.
Unsubscribe: ${process.env.VITE_FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}
          `,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #10b981; color: white; padding: 16px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">Incident Resolved</h2>
                <p style="margin: 8px 0 0 0; opacity: 0.9;">Status Update</p>
              </div>
              
              <div style="padding: 24px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <h3 style="margin-top: 0; color: #111827;">${incident.title}</h3>
                <p style="color: #374151;">The incident has been resolved. View the full report for details on the resolution.</p>
                
                <a href="${process.env.VITE_FRONTEND_URL}/watchdog/${incident.id}" 
                   style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 16px;">
                  View Full Report
                </a>
              </div>
              
              <div style="margin-top: 24px; padding: 16px; text-align: center; color: #6b7280; font-size: 12px;">
                <p>You're receiving this because you subscribed to CSOAI incident alerts.</p>
                <a href="${process.env.VITE_FRONTEND_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}" 
                   style="color: #6b7280;">Unsubscribe</a>
              </div>
            </div>
          `,
        }).catch(error => {
          console.error(`Failed to send email to ${subscriber.email}:`, error);
          return null;
        })
      );

      await Promise.allSettled(emailPromises);

      return { 
        success: true, 
        message: `Sent resolution notifications to ${subscribers.length} subscribers` 
      };
    }),
});
