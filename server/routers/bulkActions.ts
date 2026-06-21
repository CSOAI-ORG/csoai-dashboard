import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { users, courseEnrollments, emailQueue, userTrainingProgress } from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { bulkOperationLimiter, emailSendLimiter } from "../utils/rateLimiter";

// ============================================
// BULK ACTIONS ROUTER
// ============================================

export const bulkActionsRouter = router({
  // Send bulk email to selected students
  sendBulkEmail: protectedProcedure
    .input(z.object({
      userIds: z.array(z.number()).min(1),
      subject: z.string().min(1).max(255),
      message: z.string().min(1),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
      templateKey: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Rate limit bulk email operations
      const rateLimitKey = `bulk-email:${ctx.user.id}`;
      const rateLimitResult = emailSendLimiter.check(rateLimitKey);
      if (!rateLimitResult.allowed) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Too many email operations. Please try again in ${Math.ceil(rateLimitResult.resetIn / 60000)} minutes.`,
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Get user emails
      const targetUsers = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
        })
        .from(users)
        .where(inArray(users.id, input.userIds));

      if (targetUsers.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'No valid users found' });
      }

      // Queue emails for all users
      const emailPromises = targetUsers.map(user => 
        db.insert(emailQueue).values({
          userId: user.id,
          toEmail: user.email || '',
          subject: input.subject,
          htmlContent: `<p>Hello ${user.name},</p>\n${input.message.replace(/\n/g, '<br>')}`,
          textContent: `Hello ${user.name},\n\n${input.message}`,
          templateKey: input.templateKey,
          templateData: { userName: user.name, message: input.message } as any,
          priority: input.priority,
          status: 'pending',
        })
      );

      await Promise.all(emailPromises);

      return {
        success: true,
        emailsQueued: targetUsers.length,
        recipients: targetUsers.map(u => ({ id: u.id, email: u.email })),
      };
    }),

  // Update enrollment status for multiple students
  updateBulkEnrollmentStatus: protectedProcedure
    .input(z.object({
      userIds: z.array(z.number()).min(1),
      courseId: z.number().optional(),
      status: z.enum(['enrolled', 'in_progress', 'completed', 'suspended', 'cancelled']),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Build conditions
      const conditions = [inArray(courseEnrollments.userId, input.userIds)];
      
      if (input.courseId) {
        conditions.push(eq(courseEnrollments.courseId, input.courseId));
      }

      // Update enrollments
      const result = await db
        .update(courseEnrollments)
        .set({ 
          status: input.status,
          updatedAt: new Date().toISOString(),
        })
        .where(and(...conditions));

      return {
        success: true,
        updatedCount: (result as any).rowsAffected || 0,
        status: input.status,
      };
    }),

  // Update user account status (active/suspended/inactive)
  updateBulkUserStatus: protectedProcedure
    .input(z.object({
      userIds: z.array(z.number()).min(1),
      status: z.enum(['active', 'suspended', 'inactive', 'pending']),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const result = await db
        .update(users)
        .set({ 
          status: input.status,
          updatedAt: new Date().toISOString(),
        })
        .where(inArray(users.id, input.userIds));

      return {
        success: true,
        updatedCount: (result as any).rowsAffected || 0,
        status: input.status,
      };
    }),

  // Reset progress for multiple students in a course
  resetBulkProgress: protectedProcedure
    .input(z.object({
      userIds: z.array(z.number()).min(1),
      moduleIds: z.array(z.number()).optional(), // If empty, reset all modules
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const conditions = [inArray(userTrainingProgress.userId, input.userIds)];
      
      if (input.moduleIds && input.moduleIds.length > 0) {
        conditions.push(inArray(userTrainingProgress.moduleId, input.moduleIds));
      }

      // Reset progress
      const result = await db
        .update(userTrainingProgress)
        .set({
          status: 'not_started',
          progressPercent: 0,
          completedAt: null,
          updatedAt: new Date().toISOString(),
        })
        .where(and(...conditions));

      return {
        success: true,
        resetCount: (result as any).rowsAffected || 0,
      };
    }),

  // Assign multiple students to a course
  bulkEnrollStudents: protectedProcedure
    .input(z.object({
      userIds: z.array(z.number()).min(1),
      courseId: z.number(),
      cohortId: z.number().optional(),
      paymentStatus: z.enum(['pending', 'completed', 'failed', 'free']).default('free'),
    }))
    .mutation(async ({ input, ctx }) => {
      // Rate limit bulk enrollment operations
      const rateLimitKey = `bulk-enroll:${ctx.user.id}`;
      const rateLimitResult = bulkOperationLimiter.check(rateLimitKey);
      if (!rateLimitResult.allowed) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Too many bulk operations. Please try again in ${Math.ceil(rateLimitResult.resetIn / 60000)} minutes.`,
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Check for existing enrollments
      const existingEnrollments = await db
        .select({ userId: courseEnrollments.userId })
        .from(courseEnrollments)
        .where(
          and(
            inArray(courseEnrollments.userId, input.userIds),
            eq(courseEnrollments.courseId, input.courseId)
          )
        );

      const existingUserIds = new Set(existingEnrollments.map(e => e.userId));
      const newUserIds = input.userIds.filter(id => !existingUserIds.has(id));

      if (newUserIds.length === 0) {
        return {
          success: true,
          enrolledCount: 0,
          skippedCount: input.userIds.length,
          message: 'All users are already enrolled in this course',
        };
      }

      // Create new enrollments
      const enrollmentValues = newUserIds.map(userId => ({
        userId,
        courseId: input.courseId,
        cohortId: input.cohortId,
        enrollmentType: 'course' as const,
        paymentStatus: input.paymentStatus,
        status: 'enrolled' as const,
        enrolledAt: new Date().toISOString(),
      }));

      await db.insert(courseEnrollments).values(enrollmentValues);

      return {
        success: true,
        enrolledCount: newUserIds.length,
        skippedCount: existingUserIds.size,
        newEnrollments: newUserIds,
      };
    }),

  // Unenroll multiple students from a course
  bulkUnenrollStudents: protectedProcedure
    .input(z.object({
      userIds: z.array(z.number()).min(1),
      courseId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const result = await db
        .delete(courseEnrollments)
        .where(
          and(
            inArray(courseEnrollments.userId, input.userIds),
            eq(courseEnrollments.courseId, input.courseId)
          )
        );

      return {
        success: true,
        unenrolledCount: (result as any).rowsAffected || 0,
      };
    }),

  // Send reminder to students with incomplete courses
  sendBulkReminder: protectedProcedure
    .input(z.object({
      userIds: z.array(z.number()).min(1),
      reminderType: z.enum(['course_incomplete', 'module_incomplete', 'certification_pending', 'custom']),
      customMessage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Get user details
      const targetUsers = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
        })
        .from(users)
        .where(inArray(users.id, input.userIds));

      // Generate message based on reminder type
      let subject = '';
      let message = '';

      switch (input.reminderType) {
        case 'course_incomplete':
          subject = 'Reminder: Complete Your Course';
          message = 'You have an incomplete course. Please log in to continue your learning journey.';
          break;
        case 'module_incomplete':
          subject = 'Reminder: Finish Your Module';
          message = 'You have unfinished modules. Take a few minutes to complete them today!';
          break;
        case 'certification_pending':
          subject = 'Reminder: Complete Your Certification';
          message = 'Your certification is pending. Complete the remaining requirements to earn your certificate.';
          break;
        case 'custom':
          subject = 'Important Reminder';
          message = input.customMessage || 'This is a reminder from your instructor.';
          break;
      }

      // Queue reminder emails
      const emailPromises = targetUsers.map(user =>
        db.insert(emailQueue).values({
          userId: user.id,
          toEmail: user.email || '',
          subject,
          htmlContent: `<p>Hello ${user.name},</p>\n<p>${message}</p>`,
          textContent: `Hello ${user.name},\n\n${message}`,
          templateKey: 'reminder_email',
          templateData: { userName: user.name, message } as any,
          priority: 'normal',
          status: 'pending',
        })
      );

      await Promise.all(emailPromises);

      return {
        success: true,
        remindersSent: targetUsers.length,
      };
    }),

  // Get bulk action history/audit log
  getBulkActionHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
      actionType: z.enum(['email', 'status_update', 'enrollment', 'progress_reset']).optional(),
    }).optional())
    .query(async () => {
      // This would query a bulk_actions_log table if it existed
      // For now, return empty array as placeholder
      return [];
    }),

  // Preview bulk action (dry run)
  previewBulkAction: protectedProcedure
    .input(z.object({
      userIds: z.array(z.number()).min(1),
      actionType: z.enum(['email', 'status_update', 'enrollment', 'unenrollment']),
      actionParams: z.any(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Get affected users
      const affectedUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          status: users.status,
        })
        .from(users)
        .where(inArray(users.id, input.userIds));

      // Return preview data
      return {
        actionType: input.actionType,
        affectedUserCount: affectedUsers.length,
        affectedUsers: affectedUsers.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          currentStatus: u.status,
        })),
        estimatedImpact: {
          emailsToSend: input.actionType === 'email' ? affectedUsers.length : 0,
          recordsToUpdate: input.actionType === 'status_update' ? affectedUsers.length : 0,
        },
      };
    }),
});
