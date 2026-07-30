/**
 * Workflow Analytics Endpoints
 * Additional endpoints for workflow execution analytics
 */

import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { emailWorkflows, workflowExecutions } from "../../drizzle/schema-workflows";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { subDays, startOfDay, endOfDay, format } from "date-fns";

export const workflowAnalyticsRouter = router({
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
        gte(workflowExecutions.createdAt, startDate.toISOString()),
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
        gte(workflowExecutions.createdAt, startDate.toISOString()),
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

  // Get workflow performance comparison
  getWorkflowComparison: protectedProcedure
    .input(
      z.object({
        dateRange: z.enum(["24h", "7d", "30d", "90d"]).default("30d"),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all user's workflows
      const workflows = await db
        .select()
        .from(emailWorkflows)
        .where(eq(emailWorkflows.userId, ctx.user.id));

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

      // Get stats for each workflow
      const workflowStats = await Promise.all(
        workflows.map(async (workflow) => {
          const executions = await db
            .select({
              id: workflowExecutions.id,
              status: workflowExecutions.status,
            })
            .from(workflowExecutions)
            .where(
              and(
                eq(workflowExecutions.workflowId, workflow.id),
                gte(workflowExecutions.createdAt, startDate.toISOString())
              )
            );

          const total = executions.length;
          const success = executions.filter(e => e.status === "completed").length;
          const failed = executions.filter(e => e.status === "failed").length;

          return {
            workflowId: workflow.id,
            workflowName: workflow.name,
            total,
            success,
            failed,
            successRate: total > 0 ? (success / total) * 100 : 0,
          };
        })
      );

      return workflowStats;
    }),
});
