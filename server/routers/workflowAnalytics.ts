/**
 * Workflow Analytics Router
 * Provides comprehensive analytics for workflow performance and email engagement
 */

import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { 
  workflowMetrics, 
  emailEngagement, 
  abTestResults, 
  workflowConversions,
  emailWorkflows,
  workflowExecutions,
  emailExecutionLogs
} from "../../drizzle/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export const workflowAnalyticsRouter = router({
  // Get workflow performance overview
  getWorkflowPerformance: protectedProcedure
    .input(
      z.object({
        workflowId: z.number(),
        startDate: z.string(), // YYYY-MM-DD
        endDate: z.string(), // YYYY-MM-DD
      })
    )
    .query(async ({ input, ctx }) => {
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

      // Get aggregated metrics for date range
      const metrics = await db
        .select()
        .from(workflowMetrics)
        .where(
          and(
            eq(workflowMetrics.workflowId, input.workflowId),
            gte(workflowMetrics.date, input.startDate),
            lte(workflowMetrics.date, input.endDate)
          )
        )
        .orderBy(workflowMetrics.date);

      // Calculate totals
      const totals = metrics.reduce(
        (acc, m) => ({
          totalExecutions: acc.totalExecutions + m.totalExecutions,
          successfulExecutions: acc.successfulExecutions + m.successfulExecutions,
          failedExecutions: acc.failedExecutions + m.failedExecutions,
          totalEmailsSent: acc.totalEmailsSent + m.totalEmailsSent,
          totalEmailsDelivered: acc.totalEmailsDelivered + m.totalEmailsDelivered,
          totalEmailsOpened: acc.totalEmailsOpened + m.totalEmailsOpened,
          totalEmailsClicked: acc.totalEmailsClicked + m.totalEmailsClicked,
          totalEmailsBounced: acc.totalEmailsBounced + m.totalEmailsBounced,
          conversionCount: acc.conversionCount + m.conversionCount,
        }),
        {
          totalExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          totalEmailsSent: 0,
          totalEmailsDelivered: 0,
          totalEmailsOpened: 0,
          totalEmailsClicked: 0,
          totalEmailsBounced: 0,
          conversionCount: 0,
        }
      );

      // Calculate rates
      const deliveryRate = totals.totalEmailsSent > 0
        ? (totals.totalEmailsDelivered / totals.totalEmailsSent) * 100
        : 0;
      const openRate = totals.totalEmailsDelivered > 0
        ? (totals.totalEmailsOpened / totals.totalEmailsDelivered) * 100
        : 0;
      const clickRate = totals.totalEmailsDelivered > 0
        ? (totals.totalEmailsClicked / totals.totalEmailsDelivered) * 100
        : 0;
      const bounceRate = totals.totalEmailsSent > 0
        ? (totals.totalEmailsBounced / totals.totalEmailsSent) * 100
        : 0;
      const conversionRate = totals.totalExecutions > 0
        ? (totals.conversionCount / totals.totalExecutions) * 100
        : 0;
      const successRate = totals.totalExecutions > 0
        ? (totals.successfulExecutions / totals.totalExecutions) * 100
        : 0;

      return {
        workflow: workflow[0],
        dateRange: { startDate: input.startDate, endDate: input.endDate },
        totals: {
          ...totals,
          deliveryRate: Number(deliveryRate.toFixed(2)),
          openRate: Number(openRate.toFixed(2)),
          clickRate: Number(clickRate.toFixed(2)),
          bounceRate: Number(bounceRate.toFixed(2)),
          conversionRate: Number(conversionRate.toFixed(2)),
          successRate: Number(successRate.toFixed(2)),
        },
        dailyMetrics: metrics,
      };
    }),

  // Get email engagement by template
  getEmailEngagement: protectedProcedure
    .input(
      z.object({
        workflowId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
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

      const engagement = await db
        .select()
        .from(emailEngagement)
        .where(
          and(
            eq(emailEngagement.workflowId, input.workflowId),
            gte(emailEngagement.date, input.startDate),
            lte(emailEngagement.date, input.endDate)
          )
        )
        .orderBy(emailEngagement.emailTemplate, emailEngagement.date);

      // Group by template
      const byTemplate = engagement.reduce((acc, e) => {
        if (!acc[e.emailTemplate]) {
          acc[e.emailTemplate] = {
            template: e.emailTemplate,
            totalSent: 0,
            totalDelivered: 0,
            totalOpened: 0,
            totalClicked: 0,
            totalBounced: 0,
            uniqueOpens: 0,
            uniqueClicks: 0,
            dailyData: [],
          };
        }
        acc[e.emailTemplate].totalSent += e.totalSent;
        acc[e.emailTemplate].totalDelivered += e.totalDelivered;
        acc[e.emailTemplate].totalOpened += e.totalOpened;
        acc[e.emailTemplate].totalClicked += e.totalClicked;
        acc[e.emailTemplate].totalBounced += e.totalBounced;
        acc[e.emailTemplate].uniqueOpens += e.uniqueOpens;
        acc[e.emailTemplate].uniqueClicks += e.uniqueClicks;
        acc[e.emailTemplate].dailyData.push(e);
        return acc;
      }, {} as Record<string, any>);

      // Calculate rates for each template
      Object.values(byTemplate).forEach((template: any) => {
        template.openRate = template.totalDelivered > 0
          ? Number(((template.totalOpened / template.totalDelivered) * 100).toFixed(2))
          : 0;
        template.clickRate = template.totalDelivered > 0
          ? Number(((template.totalClicked / template.totalDelivered) * 100).toFixed(2))
          : 0;
        template.bounceRate = template.totalSent > 0
          ? Number(((template.totalBounced / template.totalSent) * 100).toFixed(2))
          : 0;
      });

      return Object.values(byTemplate);
    }),

  // Get A/B test results
  getABTestResults: protectedProcedure
    .input(z.object({ workflowId: z.number() }))
    .query(async ({ input, ctx }) => {
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

      const tests = await db
        .select()
        .from(abTestResults)
        .where(eq(abTestResults.workflowId, input.workflowId))
        .orderBy(desc(abTestResults.createdAt));

      return tests;
    }),

  // Get conversion funnel
  getConversionFunnel: protectedProcedure
    .input(
      z.object({
        workflowId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
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

      // Get email logs for date range
      const emailLogs = await db
        .select({
          total: sql<number>`COUNT(*)`,
          sent: sql<number>`SUM(CASE WHEN status IN ('sent', 'delivered', 'opened', 'clicked') THEN 1 ELSE 0 END)`,
          delivered: sql<number>`SUM(CASE WHEN status IN ('delivered', 'opened', 'clicked') THEN 1 ELSE 0 END)`,
          opened: sql<number>`SUM(CASE WHEN status IN ('opened', 'clicked') THEN 1 ELSE 0 END)`,
          clicked: sql<number>`SUM(CASE WHEN status = 'clicked' THEN 1 ELSE 0 END)`,
        })
        .from(emailExecutionLogs)
        .where(
          and(
            eq(emailExecutionLogs.workflowId, input.workflowId),
            gte(emailExecutionLogs.createdAt, input.startDate),
            lte(emailExecutionLogs.createdAt, input.endDate)
          )
        );

      // Get conversions
      const conversions = await db
        .select({
          count: sql<number>`COUNT(*)`,
        })
        .from(workflowConversions)
        .where(
          and(
            eq(workflowConversions.workflowId, input.workflowId),
            gte(workflowConversions.convertedAt, input.startDate),
            lte(workflowConversions.convertedAt, input.endDate)
          )
        );

      const stats = emailLogs[0] || { total: 0, sent: 0, delivered: 0, opened: 0, clicked: 0 };
      const conversionCount = conversions[0]?.count || 0;

      return {
        steps: [
          { name: 'Queued', count: stats.total, rate: 100 },
          { name: 'Sent', count: stats.sent, rate: stats.total > 0 ? (stats.sent / stats.total) * 100 : 0 },
          { name: 'Delivered', count: stats.delivered, rate: stats.sent > 0 ? (stats.delivered / stats.sent) * 100 : 0 },
          { name: 'Opened', count: stats.opened, rate: stats.delivered > 0 ? (stats.opened / stats.delivered) * 100 : 0 },
          { name: 'Clicked', count: stats.clicked, rate: stats.opened > 0 ? (stats.clicked / stats.opened) * 100 : 0 },
          { name: 'Converted', count: conversionCount, rate: stats.clicked > 0 ? (conversionCount / stats.clicked) * 100 : 0 },
        ],
      };
    }),

  // Get workflow comparison (compare multiple workflows)
  compareWorkflows: protectedProcedure
    .input(
      z.object({
        workflowIds: z.array(z.number()).min(2).max(5),
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify all workflows belong to user
      const workflows = await db
        .select()
        .from(emailWorkflows)
        .where(
          and(
            sql`${emailWorkflows.id} IN (${input.workflowIds.join(',')})`,
            eq(emailWorkflows.userId, ctx.user.id)
          )
        );

      if (workflows.length !== input.workflowIds.length) {
        throw new Error("One or more workflows not found");
      }

      // Get metrics for each workflow
      const comparisons = await Promise.all(
        input.workflowIds.map(async (workflowId) => {
          const metrics = await db
            .select()
            .from(workflowMetrics)
            .where(
              and(
                eq(workflowMetrics.workflowId, workflowId),
                gte(workflowMetrics.date, input.startDate),
                lte(workflowMetrics.date, input.endDate)
              )
            );

          const totals = metrics.reduce(
            (acc, m) => ({
              totalExecutions: acc.totalExecutions + m.totalExecutions,
              successfulExecutions: acc.successfulExecutions + m.successfulExecutions,
              totalEmailsSent: acc.totalEmailsSent + m.totalEmailsSent,
              totalEmailsOpened: acc.totalEmailsOpened + m.totalEmailsOpened,
              totalEmailsClicked: acc.totalEmailsClicked + m.totalEmailsClicked,
              conversionCount: acc.conversionCount + m.conversionCount,
            }),
            {
              totalExecutions: 0,
              successfulExecutions: 0,
              totalEmailsSent: 0,
              totalEmailsOpened: 0,
              totalEmailsClicked: 0,
              conversionCount: 0,
            }
          );

          const workflow = workflows.find((w) => w.id === workflowId);

          return {
            workflowId,
            workflowName: workflow?.name || 'Unknown',
            ...totals,
            openRate: totals.totalEmailsSent > 0
              ? Number(((totals.totalEmailsOpened / totals.totalEmailsSent) * 100).toFixed(2))
              : 0,
            clickRate: totals.totalEmailsSent > 0
              ? Number(((totals.totalEmailsClicked / totals.totalEmailsSent) * 100).toFixed(2))
              : 0,
            conversionRate: totals.totalExecutions > 0
              ? Number(((totals.conversionCount / totals.totalExecutions) * 100).toFixed(2))
              : 0,
          };
        })
      );

      return comparisons;
    }),
});
