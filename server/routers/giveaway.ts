/**
 * Giveaway Router - £1M Training Giveaway Campaign
 * Handles giveaway applications, confirmation emails, and admin management
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { giveawayApplications } from "../../drizzle/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { Resend } from "resend";
import { giveawayApplicationLimiter } from "../utils/rateLimiter";
import { TRPCError } from "@trpc/server";

// Initialize Resend for email sending
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const giveawayRouter = router({
  /**
   * Submit a giveaway application
   * Public endpoint - anyone can apply
   */
  submitApplication: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address"),
        name: z.string().min(1, "Name is required").max(255).optional(),
        company: z.string().max(255).optional(),
        jobTitle: z.string().max(255).optional(),
        country: z.string().max(100).optional(),
        linkedinUrl: z.string().url().max(500).optional().or(z.literal("")),
        referralSource: z.string().max(100).optional(),
        courseLevel: z.enum(["fundamentals", "advanced", "specialist"]).default("fundamentals"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Rate limit giveaway applications by email (since it's a public endpoint)
      const rateLimitKey = `giveaway:${input.email.toLowerCase()}`;
      const rateLimitResult = giveawayApplicationLimiter.check(rateLimitKey);
      if (!rateLimitResult.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Too many application attempts. Please try again in ${Math.ceil(rateLimitResult.resetIn / 1000)} seconds.`,
        });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Check if email already applied
      const [existing] = await db
        .select()
        .from(giveawayApplications)
        .where(eq(giveawayApplications.email, input.email.toLowerCase()))
        .limit(1);

      if (existing) {
        // If already applied, return success but indicate they already applied
        return {
          success: true,
          alreadyApplied: true,
          applicationId: existing.id,
          status: existing.status,
          message: "You've already applied! Check your email for updates.",
        };
      }

      // Create new application
      const [application] = await db
        .insert(giveawayApplications)
        .values({
          email: input.email.toLowerCase(),
          name: input.name || "",
          company: input.company || null,
          jobTitle: input.jobTitle || null,
          country: input.country || null,
          linkedinUrl: input.linkedinUrl || null,
          referralSource: input.referralSource || null,
          courseLevel: input.courseLevel,
          status: "pending",
        })
        .$returningId() as { id: number }[];

      // Send confirmation email
      let emailSent = false;
      if (resend) {
        try {
          await resend.emails.send({
            from: "CEASAI <noreply@csoai.org>",
            to: input.email,
            subject: "🎉 Your £1M Giveaway Application Received!",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">🎁 Application Received!</h1>
                </div>
                
                <div style="background: #1f2937; padding: 40px; color: #e5e7eb;">
                  <p style="font-size: 18px; margin-bottom: 20px;">
                    Hi${input.name ? ` ${input.name}` : ''},
                  </p>
                  
                  <p style="margin-bottom: 20px;">
                    Thank you for applying to the <strong style="color: #fbbf24;">£1,000,000 AI Safety Training Giveaway</strong>!
                  </p>
                  
                  <div style="background: #374151; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0 0 10px 0;"><strong>Application Details:</strong></p>
                    <p style="margin: 5px 0;">📧 Email: ${input.email}</p>
                    <p style="margin: 5px 0;">📚 Course Level: ${input.courseLevel.charAt(0).toUpperCase() + input.courseLevel.slice(1)}</p>
                    <p style="margin: 5px 0;">⏳ Status: Under Review</p>
                  </div>
                  
                  <p style="margin-bottom: 20px;">
                    We're reviewing applications on a first-come, first-served basis. You'll receive an email within 
                    <strong>48 hours</strong> with your enrollment details if approved.
                  </p>
                  
                  <div style="background: #065f46; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #a7f3d0;">
                      <strong>What's included in your FREE certification:</strong>
                    </p>
                    <ul style="color: #d1fae5; margin: 10px 0 0 0; padding-left: 20px;">
                      <li>Full CEASAI ${input.courseLevel.charAt(0).toUpperCase() + input.courseLevel.slice(1)} course (worth £${input.courseLevel === 'fundamentals' ? '499' : input.courseLevel === 'advanced' ? '999' : '1,999'})</li>
                      <li>Official certification exam</li>
                      <li>Digital certificate upon completion</li>
                      <li>Lifetime access to course materials</li>
                      <li>Community forum access</li>
                    </ul>
                  </div>
                  
                  <p style="color: #9ca3af; font-size: 14px;">
                    Questions? Reply to this email or visit <a href="https://csoai.org/faq" style="color: #60a5fa;">our FAQ</a>.
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

          // Update confirmation email sent flag
          await db
            .update(giveawayApplications)
            .set({ confirmationEmailSent: 1 })
            .where(eq(giveawayApplications.id, application.id));
        } catch (error) {
          console.error("Failed to send confirmation email:", error);
        }
      }

      return {
        success: true,
        alreadyApplied: false,
        applicationId: application.id,
        status: "pending",
        emailSent,
        message: "Application submitted successfully! Check your email for confirmation.",
      };
    }),

  /**
   * Get giveaway statistics
   * Public endpoint - shows campaign progress
   */
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalValue: 1000000,
        spotsTotal: 2004,
        spotsClaimed: 0,
        spotsApproved: 0,
        spotsEnrolled: 0,
        daysRemaining: 32,
      };
    }

    // Get application counts by status
    const [stats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        approved: sql<number>`SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)`,
        enrolled: sql<number>`SUM(CASE WHEN status = 'enrolled' THEN 1 ELSE 0 END)`,
      })
      .from(giveawayApplications);

    // Calculate days remaining until Aug 2, 2026
    const deadline = new Date("2026-08-02");
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      totalValue: 1000000,
      spotsTotal: 2004, // £1M ÷ £499 = ~2004 Fundamentals courses
      spotsClaimed: Number(stats?.total) || 0,
      spotsApproved: Number(stats?.approved) || 0,
      spotsEnrolled: Number(stats?.enrolled) || 0,
      daysRemaining,
    };
  }),

  /**
   * Check application status by email
   * Public endpoint
   */
  checkStatus: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [application] = await db
        .select({
          id: giveawayApplications.id,
          status: giveawayApplications.status,
          courseLevel: giveawayApplications.courseLevel,
          createdAt: giveawayApplications.createdAt,
          approvedAt: giveawayApplications.approvedAt,
          enrolledAt: giveawayApplications.enrolledAt,
        })
        .from(giveawayApplications)
        .where(eq(giveawayApplications.email, input.email.toLowerCase()))
        .limit(1);

      return application || null;
    }),

  /**
   * Admin: List all giveaway applications
   */
  listApplications: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected", "waitlisted", "enrolled", "all"]).default("all"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { applications: [], total: 0 };

      // Check admin role
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      // Build query
      let query = db.select().from(giveawayApplications);

      if (input.status !== "all") {
        query = query.where(eq(giveawayApplications.status, input.status)) as any;
      }

      const applications = await query
        .orderBy(desc(giveawayApplications.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Get total count
      const [countResult] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(giveawayApplications)
        .where(input.status !== "all" ? eq(giveawayApplications.status, input.status) : undefined);

      return {
        applications,
        total: Number(countResult?.count) || 0,
      };
    }),

  /**
   * Admin: Approve an application
   */
  approveApplication: protectedProcedure
    .input(z.object({ applicationId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      // Get application
      const [application] = await db
        .select()
        .from(giveawayApplications)
        .where(eq(giveawayApplications.id, input.applicationId))
        .limit(1);

      if (!application) {
        throw new Error("Application not found");
      }

      // Update status
      await db
        .update(giveawayApplications)
        .set({
          status: "approved",
          approvedAt: new Date().toISOString(),
        })
        .where(eq(giveawayApplications.id, input.applicationId));

      // Send approval email
      if (resend && application.email) {
        try {
          await resend.emails.send({
            from: "CEASAI <noreply@csoai.org>",
            to: application.email,
            subject: "🎉 Congratulations! Your Free CEASAI Course is Ready!",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">🎓 You're Approved!</h1>
                </div>
                
                <div style="background: #1f2937; padding: 40px; color: #e5e7eb;">
                  <p style="font-size: 18px; margin-bottom: 20px;">
                    Hi${application.name ? ` ${application.name}` : ''},
                  </p>
                  
                  <p style="margin-bottom: 20px;">
                    Great news! Your application to the <strong style="color: #fbbf24;">£1,000,000 AI Safety Training Giveaway</strong> has been approved!
                  </p>
                  
                  <div style="background: #065f46; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                    <p style="margin: 0 0 15px 0; color: #a7f3d0; font-size: 18px;">
                      <strong>Your FREE Course:</strong>
                    </p>
                    <p style="margin: 0; color: white; font-size: 24px; font-weight: bold;">
                      CEASAI ${application.courseLevel?.charAt(0).toUpperCase()}${application.courseLevel?.slice(1)} Certification
                    </p>
                    <p style="margin: 10px 0 0 0; color: #d1fae5;">
                      Worth £${application.courseLevel === 'fundamentals' ? '499' : application.courseLevel === 'advanced' ? '999' : '1,999'}
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://csoai.org/training" style="display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Start Your Course Now →
                    </a>
                  </div>
                  
                  <p style="color: #9ca3af; font-size: 14px; text-align: center;">
                    Log in with this email to access your course materials.
                  </p>
                </div>
                
                <div style="background: #111827; padding: 20px; text-align: center; border-radius: 0 0 12px 12px;">
                  <p style="color: #6b7280; margin: 0; font-size: 12px;">
                    © 2025 CEASAI - Certified European AI Safety Institute
                  </p>
                </div>
              </div>
            `,
          });
        } catch (error) {
          console.error("Failed to send approval email:", error);
        }
      }

      return { success: true };
    }),

  /**
   * Admin: Reject an application
   */
  rejectApplication: protectedProcedure
    .input(
      z.object({
        applicationId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      await db
        .update(giveawayApplications)
        .set({ status: "rejected" })
        .where(eq(giveawayApplications.id, input.applicationId));

      return { success: true };
    }),

  /**
   * Admin: Bulk approve applications
   */
  bulkApprove: protectedProcedure
    .input(z.object({ applicationIds: z.array(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      let approved = 0;
      for (const id of input.applicationIds) {
        await db
          .update(giveawayApplications)
          .set({
            status: "approved",
            approvedAt: new Date().toISOString(),
          })
          .where(
            and(
              eq(giveawayApplications.id, id),
              eq(giveawayApplications.status, "pending")
            )
          );
        approved++;
      }

      return { success: true, approved };
    }),
});
