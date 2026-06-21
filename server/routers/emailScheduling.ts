import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { emailSchedules, emailScheduleRuns, userActivityTriggers, emailQueue, users, userCohorts, courseEnrollments } from "../../drizzle/schema";
import { eq, and, lte, inArray, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// ============================================
// INPUT SCHEMAS
// ============================================

const triggerConditionSchema = z.object({
  activityType: z.enum(['enrollment', 'course_completion', 'inactivity', 'certification_expiry', 'compliance_alert']).optional(),
  daysAfter: z.number().optional(),
  daysBefore: z.number().optional(),
  cronExpression: z.string().optional(),
  cohortId: z.number().optional(),
  courseId: z.number().optional(),
  userStatus: z.string().optional(),
});

const audienceFilterSchema = z.object({
  cohortIds: z.array(z.number()).optional(),
  courseIds: z.array(z.number()).optional(),
  userStatuses: z.array(z.string()).optional(),
  inactiveDays: z.number().optional(),
});

const createScheduleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  templateKey: z.string().min(1).max(100),
  triggerType: z.enum(['user_activity', 'time_based', 'manual']),
  triggerCondition: triggerConditionSchema,
  targetAudience: z.enum(['all_users', 'cohort', 'course_enrollees', 'inactive_users', 'custom_filter']),
  audienceFilter: audienceFilterSchema.optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  isActive: z.boolean().default(true),
});

const updateScheduleSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  templateKey: z.string().min(1).max(100).optional(),
  triggerType: z.enum(['user_activity', 'time_based', 'manual']).optional(),
  triggerCondition: triggerConditionSchema.optional(),
  targetAudience: z.enum(['all_users', 'cohort', 'course_enrollees', 'inactive_users', 'custom_filter']).optional(),
  audienceFilter: audienceFilterSchema.optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  isActive: z.boolean().optional(),
});

// ============================================
// ROUTER
// ============================================

export const emailSchedulingRouter = router({
  // List all email schedules
  list: protectedProcedure
    .input(z.object({
      isActive: z.boolean().optional(),
      triggerType: z.enum(['user_activity', 'time_based', 'manual']).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const conditions = [];
      
      if (input?.isActive !== undefined) {
        conditions.push(eq(emailSchedules.isActive, input.isActive ? 1 : 0));
      }
      
      if (input?.triggerType) {
        conditions.push(eq(emailSchedules.triggerType, input.triggerType));
      }

      const schedules = await db
        .select()
        .from(emailSchedules)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(emailSchedules.createdAt);

      return schedules;
    }),

  // Get single schedule by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const [schedule] = await db
        .select()
        .from(emailSchedules)
        .where(eq(emailSchedules.id, input.id))
        .limit(1);

      if (!schedule) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found' });
      }

      return schedule;
    }),

  // Create new email schedule
  create: protectedProcedure
    .input(createScheduleSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const values = {
        ...input,
        createdBy: ctx.user.id,
        isActive: input.isActive === undefined ? 1 : (input.isActive ? 1 : 0),
        triggerCondition: input.triggerCondition as any,
        audienceFilter: input.audienceFilter as any,
      };
      const [newSchedule] = await db
        .insert(emailSchedules)
        .values(values as any)
        .$returningId() as any;

      return newSchedule;
    }),

  // Update existing schedule
  update: protectedProcedure
    .input(updateScheduleSchema)
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const { id, ...updates } = input;

      const updateValues: any = {
        ...updates,
        triggerCondition: updates.triggerCondition as any,
        audienceFilter: updates.audienceFilter as any,
      };
      if (updates.isActive !== undefined) updateValues.isActive = updates.isActive ? 1 : 0;
      await db
        .update(emailSchedules)
        .set(updateValues)
        .where(eq(emailSchedules.id, id));

      return { success: true };
    }),

  // Delete schedule
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      await db
        .delete(emailSchedules)
        .where(eq(emailSchedules.id, input.id));

      return { success: true };
    }),

  // Toggle schedule active status
  toggleActive: protectedProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      await db
        .update(emailSchedules)
        .set({ isActive: input.isActive ? 1 : 0 })
        .where(eq(emailSchedules.id, input.id));

      return { success: true };
    }),

  // Manually trigger a schedule run
  triggerManual: protectedProcedure
    .input(z.object({ 
      scheduleId: z.number(),
      testMode: z.boolean().default(false),
      testEmail: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const [schedule] = await db
        .select()
        .from(emailSchedules)
        .where(eq(emailSchedules.id, input.scheduleId))
        .limit(1);

      if (!schedule) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found' });
      }

      // Create schedule run record
      const [run] = await db
        .insert(emailScheduleRuns)
        .values({
          scheduleId: input.scheduleId,
          runType: input.testMode ? 'test' : 'manual',
          status: 'pending',
          startedAt: new Date().toISOString(),
        })
        .$returningId() as { id: number }[];

      // Get target users based on audience filter
      let targetUsers: any[] = [];
      
      if (input.testMode && input.testEmail) {
        // Test mode: send to specific email
        targetUsers = [{ id: 0, email: input.testEmail, name: 'Test User' }];
      } else {
        // Real mode: get users based on filter
        targetUsers = await getTargetUsers(db, schedule);
      }

      // Update run with target count
      await db
        .update(emailScheduleRuns)
        .set({ 
          status: 'running',
          targetUserCount: targetUsers.length 
        })
        .where(eq(emailScheduleRuns.id, run.id));

      // Queue emails for all target users
      let emailsSent = 0;
      let emailsFailed = 0;

      for (const user of targetUsers) {
        try {
          await db.insert(emailQueue).values({
            userId: user.id,
            toEmail: user.email,
            subject: `Scheduled Email: ${schedule.name}`,
            htmlContent: `<p>This is a scheduled email from ${schedule.name}</p>`,
            textContent: `This is a scheduled email from ${schedule.name}`,
            templateKey: schedule.templateKey,
            templateData: { userName: user.name } as any,
            priority: schedule.priority,
            status: 'pending',
          });
          emailsSent++;
        } catch (error) {
          emailsFailed++;
        }
      }

      // Update run with results
      await db
        .update(emailScheduleRuns)
        .set({
          status: 'completed',
          emailsSent,
          emailsFailed,
          completedAt: new Date().toISOString(),
        })
        .where(eq(emailScheduleRuns.id, run.id));

      // Update schedule send count
      await db
        .update(emailSchedules)
        .set({
          sendCount: sql`${emailSchedules.sendCount} + ${emailsSent}`,
          lastRunAt: new Date().toISOString(),
        })
        .where(eq(emailSchedules.id, input.scheduleId));

      return {
        runId: run.id,
        targetUserCount: targetUsers.length,
        emailsSent,
        emailsFailed,
      };
    }),

  // Get schedule run history
  getRunHistory: protectedProcedure
    .input(z.object({ 
      scheduleId: z.number(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const runs = await db
        .select()
        .from(emailScheduleRuns)
        .where(eq(emailScheduleRuns.scheduleId, input.scheduleId))
        .orderBy(emailScheduleRuns.createdAt)
        .limit(input.limit);

      return runs;
    }),

  // Get pending activity triggers
  getPendingTriggers: protectedProcedure
    .input(z.object({
      scheduleId: z.number().optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const conditions = [eq(userActivityTriggers.status, 'pending')];
      
      if (input?.scheduleId) {
        conditions.push(eq(userActivityTriggers.scheduleId, input.scheduleId));
      }

      const triggers = await db
        .select()
        .from(userActivityTriggers)
        .where(and(...conditions))
        .orderBy(userActivityTriggers.scheduledSendDate)
        .limit(input?.limit || 50);

      return triggers;
    }),
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getTargetUsers(db: NonNullable<Awaited<ReturnType<typeof getDb>>>, schedule: any): Promise<any[]> {
  const audienceFilter = schedule.audienceFilter || {};
  
  // Base query
  let query = db.select({
    id: users.id,
    email: users.email,
    name: users.name,
  }).from(users);

  // Apply filters based on target audience
  switch (schedule.targetAudience) {
    case 'cohort':
      if (audienceFilter.cohortIds && audienceFilter.cohortIds.length > 0) {
        query = query
          .innerJoin(userCohorts, eq(users.id, userCohorts.userId))
          .where(inArray(userCohorts.cohortId, audienceFilter.cohortIds)) as any;
      }
      break;

    case 'course_enrollees':
      if (audienceFilter.courseIds && audienceFilter.courseIds.length > 0) {
        query = query
          .innerJoin(courseEnrollments, eq(users.id, courseEnrollments.userId))
          .where(inArray(courseEnrollments.courseId, audienceFilter.courseIds)) as any;
      }
      break;

    case 'inactive_users':
      if (audienceFilter.inactiveDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - audienceFilter.inactiveDays);
        query = query.where(lte(users.lastSignedIn, cutoffDate.toISOString())) as any;
      }
      break;

    case 'all_users':
    default:
      // No additional filters
      break;
  }

  const results = await query;
  return results;
}
