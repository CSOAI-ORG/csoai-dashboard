/**
 * Newsletter Router - Newsletter subscription management
 * Handles newsletter signups, unsubscribes, and admin management
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { newsletterSubscribers } from "../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Resend } from "resend";

// Initialize Resend for email sending
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const newsletterRouter = router({
  /**
   * Subscribe to newsletter
   * Public endpoint - anyone can subscribe
   */
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address"),
        name: z.string().max(255).optional(),
        company: z.string().max(255).optional(),
        source: z.string().max(100).optional().default("footer"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if email already subscribed
      const [existing] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, input.email.toLowerCase()))
        .limit(1);

      if (existing) {
        // If already subscribed but unsubscribed, reactivate
        if (existing.status === "unsubscribed") {
          await db
            .update(newsletterSubscribers)
            .set({ 
              status: "active",
              unsubscribedAt: null,
              name: input.name || existing.name,
              company: input.company || existing.company,
            })
            .where(eq(newsletterSubscribers.id, existing.id));
          
          return {
            success: true,
            reactivated: true,
            message: "Welcome back! Your subscription has been reactivated.",
          };
        }

        return {
          success: true,
          alreadySubscribed: true,
          message: "You're already subscribed to our newsletter!",
        };
      }

      // Create new subscription
      const [subscription] = await db
        .insert(newsletterSubscribers)
        .values({
          email: input.email.toLowerCase(),
          name: input.name || null,
          company: input.company || null,
          source: input.source || "footer",
          status: "active",
        })
        .$returningId() as { id: number }[];

      // Send welcome email
      let emailSent = false;
      if (resend) {
        try {
          await resend.emails.send({
            from: "CEASAI <noreply@csoai.org>",
            to: input.email,
            subject: "Welcome to CEASAI Newsletter! 📬",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">📬 Welcome to CEASAI!</h1>
                </div>
                
                <div style="background: #1f2937; padding: 40px; color: #e5e7eb;">
                  <p style="font-size: 18px; margin-bottom: 20px;">
                    Hi${input.name ? ` ${input.name}` : ''},
                  </p>
                  
                  <p style="margin-bottom: 20px;">
                    Thank you for subscribing to the <strong style="color: #10b981;">CEASAI Newsletter</strong>!
                  </p>
                  
                  <div style="background: #374151; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px 0;"><strong>What to expect:</strong></p>
                    <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                      <li>Weekly AI safety insights and updates</li>
                      <li>New compliance framework announcements</li>
                      <li>Training course launches and promotions</li>
                      <li>Industry news and regulatory changes</li>
                      <li>Exclusive member-only content</li>
                    </ul>
                  </div>
                  
                  <p style="margin-bottom: 20px;">
                    We respect your inbox and only send valuable content. You can unsubscribe at any time.
                  </p>
                  
                  <p style="color: #9ca3af; font-size: 14px;">
                    Questions? Reply to this email or visit <a href="https://csoai.org" style="color: #60a5fa;">our website</a>.
                  </p>
                </div>
                
                <div style="background: #111827; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
                  <p style="color: #6b7280; margin: 0; font-size: 12px;">
                    © 2025 CEASAI - Certified European AI Safety Institute<br>
                    Part of the CSOAI Council of AIs
                  </p>
                </div>
              </div>
            `,
          });
          emailSent = true;

          // Update confirmation timestamp
          await db
            .update(newsletterSubscribers)
            .set({ confirmedAt: sql`CURRENT_TIMESTAMP` })
            .where(eq(newsletterSubscribers.id, subscription.id));
        } catch (error) {
          console.error("Failed to send welcome email:", error);
        }
      }

      return {
        success: true,
        alreadySubscribed: false,
        emailSent,
        message: "Successfully subscribed! Check your email for confirmation.",
      };
    }),

  /**
   * Unsubscribe from newsletter
   * Public endpoint
   */
  unsubscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [subscriber] = await db
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, input.email.toLowerCase()))
        .limit(1);

      if (!subscriber) {
        return {
          success: true,
          message: "Email not found in our newsletter list.",
        };
      }

      await db
        .update(newsletterSubscribers)
        .set({ 
          status: "unsubscribed",
          unsubscribedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(newsletterSubscribers.id, subscriber.id));

      return {
        success: true,
        message: "You have been unsubscribed from our newsletter.",
      };
    }),

  /**
   * Get newsletter statistics
   * Public endpoint - shows subscriber count
   */
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalSubscribers: 0,
        activeSubscribers: 0,
      };
    }

    const [stats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
      })
      .from(newsletterSubscribers);

    return {
      totalSubscribers: Number(stats?.total) || 0,
      activeSubscribers: Number(stats?.active) || 0,
    };
  }),

  /**
   * Admin: List all newsletter subscribers
   */
  listSubscribers: protectedProcedure
    .input(
      z.object({
        status: z.enum(["active", "unsubscribed", "bounced", "all"]).default("all"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { subscribers: [], total: 0 };

      // Check admin role
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      // Build query
      let query = db.select().from(newsletterSubscribers);

      if (input.status !== "all") {
        query = query.where(eq(newsletterSubscribers.status, input.status)) as any;
      }

      const subscribers = await query
        .orderBy(desc(newsletterSubscribers.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(newsletterSubscribers)
        .where(input.status !== "all" ? eq(newsletterSubscribers.status, input.status) : undefined);

      return {
        subscribers,
        total: Number(countResult?.count) || 0,
      };
    }),
});
