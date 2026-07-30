import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { notificationAnalytics } from '../services/notificationAnalytics';
import { notificationFilter } from '../services/notificationFilter';

export const notificationAnalyticsRouter = router({
  getAnalyticsSummary: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input, ctx }) => {
      return await notificationAnalytics.getAnalyticsSummary(input.startDate, input.endDate);
    }),

  getDeliveryMetrics: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      return await notificationAnalytics.getDeliveryMetrics(input.startDate, input.endDate);
    }),

  getEngagementMetrics: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      return await notificationAnalytics.getEngagementMetrics(input.startDate, input.endDate);
    }),

  trackDelivery: protectedProcedure
    .input(z.object({
      notificationId: z.number(),
      channel: z.string(),
      status: z.enum(['pending', 'sent', 'delivered', 'failed', 'bounced']),
      failureReason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await notificationAnalytics.trackDelivery(
        input.notificationId,
        ctx.user.id,
        input.channel,
        input.status,
        input.failureReason
      );
      return { success: true };
    }),

  trackEngagement: protectedProcedure
    .input(z.object({
      notificationId: z.number(),
      action: z.enum(['viewed', 'clicked', 'dismissed', 'acted_on']),
      clickedUrl: z.string().optional(),
      engagementTime: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await notificationAnalytics.trackEngagement(
        input.notificationId,
        ctx.user.id,
        input.action,
        input.clickedUrl,
        input.engagementTime
      );
      return { success: true };
    }),

  getFilteredNotifications: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      priority: z.array(z.string()).optional(),
      type: z.array(z.string()).optional(),
      isRead: z.boolean().optional(),
      searchQuery: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
      sortBy: z.enum(['createdAt', 'priority', 'type']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .query(async ({ input, ctx }) => {
      return await notificationFilter.getFilteredNotifications({
        userId: ctx.user.id,
        ...input,
      });
    }),

  getSavedFilterPresets: protectedProcedure
    .query(async () => {
      return notificationFilter.getSavedFilterPresets();
    }),

  getSearchSuggestions: protectedProcedure
    .input(z.object({
      query: z.string(),
      limit: z.number().default(5),
    }))
    .query(async ({ input, ctx }) => {
      return await notificationFilter.getSearchSuggestions(ctx.user.id, input.query, input.limit);
    }),

  markMultipleAsRead: protectedProcedure
    .input(z.object({
      notificationIds: z.array(z.number()),
    }))
    .mutation(async ({ input, ctx }) => {
      const count = await notificationFilter.markMultipleAsRead(input.notificationIds, ctx.user.id);
      return { success: true, count };
    }),

  deleteMultiple: protectedProcedure
    .input(z.object({
      notificationIds: z.array(z.number()),
    }))
    .mutation(async ({ input, ctx }) => {
      const count = await notificationFilter.deleteMultiple(input.notificationIds, ctx.user.id);
      return { success: true, count };
    }),

  exportAsJSON: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      priority: z.array(z.string()).optional(),
      type: z.array(z.string()).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const json = await notificationFilter.exportAsJSON(ctx.user.id, {
        userId: ctx.user.id,
        ...input,
      });
      return { data: json };
    }),

  exportAsCSV: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      priority: z.array(z.string()).optional(),
      type: z.array(z.string()).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const csv = await notificationFilter.exportAsCSV(ctx.user.id, {
        userId: ctx.user.id,
        ...input,
      });
      return { data: csv };
    }),
});
