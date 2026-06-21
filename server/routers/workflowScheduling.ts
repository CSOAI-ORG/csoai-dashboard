/**
 * Workflow Scheduling Router
 * Manages automated workflow execution schedules
 */

import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { 
  workflowSchedules, 
  scheduleExecutionHistory, 
  scheduleStatusLog,
  emailWorkflows
} from "../../drizzle/schema";
import { eq, and, desc, lte, isNull, or } from "drizzle-orm";

// Helper function to calculate next execution time
function calculateNextExecution(schedule: any): Date | null {
  const now = new Date();
  
  if (schedule.scheduleType === 'cron') {
    // For cron, we would use a cron parser library
    // For now, return a placeholder
    // In production, use: import { parseExpression } from 'cron-parser';
    // const interval = parseExpression(schedule.cronExpression);
    // return interval.next().toDate();
    return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next day placeholder
  }
  
  if (schedule.scheduleType === 'interval') {
    const multipliers: Record<string, number> = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000,
      months: 30 * 24 * 60 * 60 * 1000,
    };
    
    const multiplier = multipliers[schedule.intervalUnit] || 60 * 60 * 1000;
    return new Date(now.getTime() + schedule.intervalValue * multiplier);
  }
  
  if (schedule.scheduleType === 'conditional') {
    // For conditional, check daily by default
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
  
  return null;
}

export const workflowSchedulingRouter = router({
  // Get all schedules for current user
  getSchedules: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const schedules = await db
      .select({
        schedule: workflowSchedules,
        workflowName: emailWorkflows.name,
      })
      .from(workflowSchedules)
      .leftJoin(emailWorkflows, eq(workflowSchedules.workflowId, emailWorkflows.id))
      .where(eq(workflowSchedules.userId, ctx.user.id))
      .orderBy(desc(workflowSchedules.createdAt));

    return schedules;
  }),

  // Get single schedule by ID
  getSchedule: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const schedule = await db
        .select()
        .from(workflowSchedules)
        .where(
          and(
            eq(workflowSchedules.id, input.id),
            eq(workflowSchedules.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!schedule.length) {
        throw new Error("Schedule not found");
      }

      return schedule[0];
    }),

  // Create new schedule
  createSchedule: protectedProcedure
    .input(
      z.object({
        workflowId: z.number(),
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        scheduleType: z.enum(['cron', 'interval', 'conditional']),
        cronExpression: z.string().optional(),
        timezone: z.string().default('UTC'),
        intervalValue: z.number().optional(),
        intervalUnit: z.enum(['minutes', 'hours', 'days', 'weeks', 'months']).optional(),
        conditions: z.any().optional(),
        targetFilters: z.any().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        maxExecutions: z.number().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify workflow belongs to user
      const workflow = await db
        .select()
        .from(emailWorkflows)
        .where(
          and(
            eq(emailWorkflows.id, input.workflowId),
            eq(emailWorkflows.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!workflow.length) {
        throw new Error("Workflow not found");
      }

      // Calculate next execution time
      const nextExecutionAt = calculateNextExecution(input);

      const result = await db.insert(workflowSchedules).values({
        userId: ctx.user.id,
        workflowId: input.workflowId,
        name: input.name,
        description: input.description || null,
        scheduleType: input.scheduleType,
        cronExpression: input.cronExpression || null,
        timezone: input.timezone,
        intervalValue: input.intervalValue || null,
        intervalUnit: input.intervalUnit || null,
        conditions: input.conditions || null,
        targetFilters: input.targetFilters || null,
        startDate: input.startDate || null,
        endDate: input.endDate || null,
        maxExecutions: input.maxExecutions || null,
        isActive: input.isActive ? 1 : 0,
        nextExecutionAt: nextExecutionAt ? nextExecutionAt.toISOString() : null,
      });

      const rawInsertId = (result as any).insertId ?? (result as any)[0]?.insertId;
      const id = typeof rawInsertId === 'bigint' ? Number(rawInsertId) : Number(rawInsertId);

      // Log the creation
      await db.insert(scheduleStatusLog).values({
        scheduleId: id,
        action: 'created',
        performedBy: ctx.user.id,
      });

      return { id, success: true };
    }),

  // Update schedule
  updateSchedule: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        cronExpression: z.string().optional(),
        timezone: z.string().optional(),
        intervalValue: z.number().optional(),
        intervalUnit: z.enum(['minutes', 'hours', 'days', 'weeks', 'months']).optional(),
        conditions: z.any().optional(),
        targetFilters: z.any().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        maxExecutions: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;

      // Get existing schedule
      const existing = await db
        .select()
        .from(workflowSchedules)
        .where(
          and(
            eq(workflowSchedules.id, id),
            eq(workflowSchedules.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!existing.length) {
        throw new Error("Schedule not found");
      }

      // Recalculate next execution if schedule changed
      const updatedSchedule = { ...existing[0], ...updates };
      const nextExecutionAt = calculateNextExecution(updatedSchedule);

      await db
        .update(workflowSchedules)
        .set({
          ...updates,
          nextExecutionAt: nextExecutionAt ? nextExecutionAt.toISOString() : null,
        })
        .where(
          and(
            eq(workflowSchedules.id, id),
            eq(workflowSchedules.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // Delete schedule
  deleteSchedule: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Log the deletion
      await db.insert(scheduleStatusLog).values({
        scheduleId: input.id,
        action: 'deleted',
        performedBy: ctx.user.id,
      });

      await db
        .delete(workflowSchedules)
        .where(
          and(
            eq(workflowSchedules.id, input.id),
            eq(workflowSchedules.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // Toggle schedule active status
  toggleSchedule: protectedProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(workflowSchedules)
        .set({ isActive: input.isActive ? 1 : 0 })
        .where(
          and(
            eq(workflowSchedules.id, input.id),
            eq(workflowSchedules.userId, ctx.user.id)
          )
        );

      // Log the action
      await db.insert(scheduleStatusLog).values({
        scheduleId: input.id,
        action: input.isActive ? 'activated' : 'paused',
        reason: input.reason || null,
        performedBy: ctx.user.id,
      });

      return { success: true };
    }),

  // Get schedule execution history
  getExecutionHistory: protectedProcedure
    .input(z.object({ scheduleId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify schedule belongs to user
      const schedule = await db
        .select()
        .from(workflowSchedules)
        .where(
          and(
            eq(workflowSchedules.id, input.scheduleId),
            eq(workflowSchedules.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!schedule.length) {
        throw new Error("Schedule not found");
      }

      const history = await db
        .select()
        .from(scheduleExecutionHistory)
        .where(eq(scheduleExecutionHistory.scheduleId, input.scheduleId))
        .orderBy(desc(scheduleExecutionHistory.scheduledFor))
        .limit(50);

      return history;
    }),

  // Get schedule status log
  getStatusLog: protectedProcedure
    .input(z.object({ scheduleId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify schedule belongs to user
      const schedule = await db
        .select()
        .from(workflowSchedules)
        .where(
          and(
            eq(workflowSchedules.id, input.scheduleId),
            eq(workflowSchedules.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!schedule.length) {
        throw new Error("Schedule not found");
      }

      const log = await db
        .select()
        .from(scheduleStatusLog)
        .where(eq(scheduleStatusLog.scheduleId, input.scheduleId))
        .orderBy(desc(scheduleStatusLog.timestamp));

      return log;
    }),

  // Get upcoming executions across all schedules
  getUpcomingExecutions: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date().toISOString();

      const upcoming = await db
        .select({
          schedule: workflowSchedules,
          workflowName: emailWorkflows.name,
        })
        .from(workflowSchedules)
        .leftJoin(emailWorkflows, eq(workflowSchedules.workflowId, emailWorkflows.id))
        .where(
          and(
            eq(workflowSchedules.userId, ctx.user.id),
            eq(workflowSchedules.isActive, 1),
            or(
              isNull(workflowSchedules.nextExecutionAt),
              lte(workflowSchedules.nextExecutionAt, now)
            )
          )
        )
        .orderBy(workflowSchedules.nextExecutionAt)
        .limit(input.limit);

      return upcoming;
    }),
});
