/**
 * Workflow Builder Router
 * Handles visual email automation workflows
 */

import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { emailWorkflows, workflowExecutions, workflowStepExecutions, emailExecutionLogs } from "../../drizzle/schema-workflows";
import { users } from "../../drizzle/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { subDays, format } from "date-fns";

export const workflowBuilderRouter = router({
  // Get all workflows for current user
  getWorkflows: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const workflows = await db
      .select()
      .from(emailWorkflows)
      .where(eq(emailWorkflows.userId, ctx.user.id))
      .orderBy(desc(emailWorkflows.updatedAt));

    return workflows;
  }),

  // Get single workflow by ID
  getWorkflow: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const workflow = await db
        .select()
        .from(emailWorkflows)
        .where(
          and(
            eq(emailWorkflows.id, input.id),
            eq(emailWorkflows.userId, ctx.user.id)
          )
        )
        .limit(1);

      if (!workflow.length) {
        throw new Error("Workflow not found");
      }

      return workflow[0];
    }),

  // Create new workflow
  createWorkflow: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        triggerType: z.enum(['cohort_join', 'date_based', 'manual', 'enrollment', 'completion']),
        triggerConfig: z.any().optional(),
        workflowData: z.any(),
        isActive: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(emailWorkflows).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description || null,
        triggerType: input.triggerType,
        triggerConfig: input.triggerConfig || null,
        workflowData: input.workflowData,
        isActive: input.isActive ? 1 : 0,
      });

      const id = Number((result as any)[0]?.insertId ?? result.insertId);
      return { id, success: true };
    }),

  // Update workflow
  updateWorkflow: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        triggerType: z.enum(['cohort_join', 'date_based', 'manual', 'enrollment', 'completion']).optional(),
        triggerConfig: z.any().optional(),
        workflowData: z.any().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;

      await db
        .update(emailWorkflows)
        .set(updates)
        .where(
          and(
            eq(emailWorkflows.id, id),
            eq(emailWorkflows.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // Delete workflow
  deleteWorkflow: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(emailWorkflows)
        .where(
          and(
            eq(emailWorkflows.id, input.id),
            eq(emailWorkflows.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // Toggle workflow active status
  toggleWorkflow: protectedProcedure
    .input(z.object({ id: z.number(), isActive: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(emailWorkflows)
        .set({ isActive: input.isActive ? 1 : 0 })
        .where(
          and(
            eq(emailWorkflows.id, input.id),
            eq(emailWorkflows.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // Update workflow schedule
  updateWorkflowSchedule: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        schedule: z.object({
          cronExpression: z.string(),
          timezone: z.string(),
        }).nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(emailWorkflows)
        .set({ schedule: input.schedule })
        .where(
          and(
            eq(emailWorkflows.id, input.id),
            eq(emailWorkflows.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // Get workflow execution history (per-workflow list)
  getWorkflowExecutionHistory: protectedProcedure
    .input(z.object({ workflowId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // First verify the workflow belongs to the user
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

      const executions = await db
        .select()
        .from(workflowExecutions)
        .where(eq(workflowExecutions.workflowId, input.workflowId))
        .orderBy(desc(workflowExecutions.createdAt))
        .limit(50);

      return executions;
    }),

  // Get execution details with step-by-step breakdown
  getExecutionDetails: protectedProcedure
    .input(z.object({ executionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const execution = await db
        .select()
        .from(workflowExecutions)
        .where(eq(workflowExecutions.id, input.executionId))
        .limit(1);

      if (!execution.length) {
        throw new Error("Execution not found");
      }

      const steps = await db
        .select()
        .from(workflowStepExecutions)
        .where(eq(workflowStepExecutions.executionId, input.executionId))
        .orderBy(workflowStepExecutions.createdAt);

      return {
        execution: execution[0],
        steps,
      };
    }),

  // Manually trigger a workflow
  triggerWorkflow: protectedProcedure
    .input(
      z.object({
        workflowId: z.number(),
        targetUserId: z.number().optional(), // For testing or manual triggers
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

      // Create execution record
      const result = await db.insert(workflowExecutions).values({
        workflowId: input.workflowId,
        userId: input.targetUserId || ctx.user.id,
        status: "pending",
      });

      // TODO: Trigger actual workflow execution in background
      // For now, just create the execution record

      const executionId = typeof result.insertId === 'bigint' ? Number(result.insertId) : Number(result.insertId);
      return { executionId, success: true };
    }),

  // Get email execution logs for a workflow
  getEmailLogs: protectedProcedure
    .input(
      z.object({
        workflowId: z.number().optional(),
        executionId: z.number().optional(),
        status: z.enum(['queued', 'sent', 'delivered', 'bounced', 'failed', 'opened', 'clicked']).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input, ctx }) => {      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db
        .select({
          id: emailExecutionLogs.id,
          executionId: emailExecutionLogs.executionId,
          stepExecutionId: emailExecutionLogs.stepExecutionId,
          workflowId: emailExecutionLogs.workflowId,
          recipientUserId: emailExecutionLogs.recipientUserId,
          recipientEmail: emailExecutionLogs.recipientEmail,
          recipientName: emailExecutionLogs.recipientName,
          emailSubject: emailExecutionLogs.emailSubject,
          emailTemplate: emailExecutionLogs.emailTemplate,
          status: emailExecutionLogs.status,
          sentAt: emailExecutionLogs.sentAt,
          deliveredAt: emailExecutionLogs.deliveredAt,
          openedAt: emailExecutionLogs.openedAt,
          clickedAt: emailExecutionLogs.clickedAt,
          errorMessage: emailExecutionLogs.errorMessage,
          metadata: emailExecutionLogs.metadata,
          createdAt: emailExecutionLogs.createdAt,
          workflowName: emailWorkflows.name,
        })
        .from(emailExecutionLogs)
        .leftJoin(emailWorkflows, eq(emailExecutionLogs.workflowId, emailWorkflows.id))
        .where(eq(emailWorkflows.userId, ctx.user.id))
        .orderBy(desc(emailExecutionLogs.createdAt))
        .limit(input.limit);

      const logs = await query;
      return logs;
    }),

  // Get email log statistics
  getEmailLogStats: protectedProcedure
    .input(
      z.object({
        workflowId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all logs for user's workflows
      const logs = await db
        .select({
          status: emailExecutionLogs.status,
          count: emailExecutionLogs.id,
        })
        .from(emailExecutionLogs)
        .leftJoin(emailWorkflows, eq(emailExecutionLogs.workflowId, emailWorkflows.id))
        .where(eq(emailWorkflows.userId, ctx.user.id));

      // Count by status
      const stats = {
        total: logs.length,
        queued: logs.filter(l => l.status === 'queued').length,
        sent: logs.filter(l => l.status === 'sent').length,
        delivered: logs.filter(l => l.status === 'delivered').length,
        bounced: logs.filter(l => l.status === 'bounced').length,
        failed: logs.filter(l => l.status === 'failed').length,
        opened: logs.filter(l => l.status === 'opened').length,
        clicked: logs.filter(l => l.status === 'clicked').length,
      };

      return stats;
    }),

  // Get workflow execution statistics
  getWorkflowStats: protectedProcedure
    .input(
      z.object({
        dateRange: z.enum(["24h", "7d", "30d", "90d"]).default("30d"),
        workflowId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      switch (input.dateRange) {
        case "24h":
          startDate = subDays(now, 1);
          break;
        case "7d":
          startDate = subDays(now, 7);
          break;
        case "30d":
          startDate = subDays(now, 30);
          break;
        case "90d":
          startDate = subDays(now, 90);
          break;
        default:
          startDate = subDays(now, 30);
      }

      // Build query conditions
      const conditions = [
        eq(emailWorkflows.userId, ctx.user.id),
        gte(workflowExecutions.createdAt, startDate),
      ];

      if (input.workflowId) {
        conditions.push(eq(workflowExecutions.workflowId, input.workflowId));
      }

      // Get all executions in date range
      const executions = await db
        .select({
          id: workflowExecutions.id,
          status: workflowExecutions.status,
          startedAt: workflowExecutions.startedAt,
          completedAt: workflowExecutions.completedAt,
        })
        .from(workflowExecutions)
        .leftJoin(emailWorkflows, eq(workflowExecutions.workflowId, emailWorkflows.id))
        .where(and(...conditions));

      // Calculate statistics
      const totalExecutions = executions.length;
      const successfulExecutions = executions.filter(e => e.status === "completed").length;
      const failedExecutions = executions.filter(e => e.status === "failed").length;
      const pendingExecutions = executions.filter(e => e.status === "pending" || e.status === "running").length;

      // Calculate average execution time (only for completed executions)
      const completedExecutions = executions.filter(
        e => e.status === "completed" && e.startedAt && e.completedAt
      );
      
      let avgExecutionTime = 0;
      if (completedExecutions.length > 0) {
        const totalTime = completedExecutions.reduce((sum, e) => {
          if (e.startedAt && e.completedAt) {
            const start = new Date(e.startedAt).getTime();
            const end = new Date(e.completedAt).getTime();
            return sum + (end - start);
          }
          return sum;
        }, 0);
        avgExecutionTime = Math.round(totalTime / completedExecutions.length);
      }

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        pendingExecutions,
        avgExecutionTime, // in milliseconds
        successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
      };
    }),

  // Get execution history for charts (daily aggregates)
  getExecutionHistory: protectedProcedure
    .input(
      z.object({
        dateRange: z.enum(["24h", "7d", "30d", "90d"]).default("30d"),
        workflowId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      let days: number;
      switch (input.dateRange) {
        case "24h":
          startDate = subDays(now, 1);
          days = 1;
          break;
        case "7d":
          startDate = subDays(now, 7);
          days = 7;
          break;
        case "30d":
          startDate = subDays(now, 30);
          days = 30;
          break;
        case "90d":
          startDate = subDays(now, 90);
          days = 90;
          break;
        default:
          startDate = subDays(now, 30);
          days = 30;
      }

      // Build query conditions
      const conditions = [
        eq(emailWorkflows.userId, ctx.user.id),
        gte(workflowExecutions.createdAt, startDate),
      ];

      if (input.workflowId) {
        conditions.push(eq(workflowExecutions.workflowId, input.workflowId));
      }

      // Get all executions
      const executions = await db
        .select({
          id: workflowExecutions.id,
          status: workflowExecutions.status,
          createdAt: workflowExecutions.createdAt,
          startedAt: workflowExecutions.startedAt,
          completedAt: workflowExecutions.completedAt,
        })
        .from(workflowExecutions)
        .leftJoin(emailWorkflows, eq(workflowExecutions.workflowId, emailWorkflows.id))
        .where(and(...conditions))
        .orderBy(workflowExecutions.createdAt);

      // Group by date
      const dailyData: Record<string, {
        date: string;
        total: number;
        success: number;
        failed: number;
        pending: number;
        executionTimes: number[];
      }> = {};

      // Initialize all dates in range
      for (let i = 0; i <= days; i++) {
        const date = format(subDays(now, days - i), "yyyy-MM-dd");
        dailyData[date] = {
          date,
          total: 0,
          success: 0,
          failed: 0,
          pending: 0,
          executionTimes: [],
        };
      }

      // Aggregate executions by date
      executions.forEach(execution => {
        const date = format(new Date(execution.createdAt), "yyyy-MM-dd");
        if (dailyData[date]) {
          dailyData[date].total++;
          
          if (execution.status === "completed") {
            dailyData[date].success++;
            
            // Calculate execution time if available
            if (execution.startedAt && execution.completedAt) {
              const start = new Date(execution.startedAt).getTime();
              const end = new Date(execution.completedAt).getTime();
              dailyData[date].executionTimes.push(end - start);
            }
          } else if (execution.status === "failed") {
            dailyData[date].failed++;
          } else if (execution.status === "pending" || execution.status === "running") {
            dailyData[date].pending++;
          }
        }
      });

      // Calculate average execution time per day
      const result = Object.values(dailyData).map(day => ({
        date: day.date,
        total: day.total,
        success: day.success,
        failed: day.failed,
        pending: day.pending,
        avgExecutionTime: day.executionTimes.length > 0
          ? Math.round(day.executionTimes.reduce((a, b) => a + b, 0) / day.executionTimes.length)
          : 0,
      }));

      return result;
    }),
});
