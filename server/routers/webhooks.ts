/**
 * Webhooks Router
 * Handles webhook subscriptions and rule update notifications
 */

import { router, protectedProcedure } from '../_core/trpc.js';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import crypto from 'crypto';

// In-memory storage for webhooks (in production, use database)
const webhookSubscriptions = new Map<string, {
  id: string;
  userId: number;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  createdAt: string | Date;
  lastTriggeredAt?: string | Date;
}>();

const webhookDeliveries = new Map<string, {
  id: string;
  subscriptionId: string;
  eventType: string;
  status: 'pending' | 'delivered' | 'failed' | 'retrying';
  httpStatus?: number;
  error?: string;
  attemptCount: number;
  nextRetryAt?: string | Date;
  deliveredAt?: string | Date;
  createdAt: string | Date;
}>();

export const webhooksRouter = router({
  /**
   * Create a new webhook subscription
   */
  createSubscription: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
        events: z.array(z.enum([
          'rule.created',
          'rule.updated',
          'rule.deleted',
          'framework.updated',
          'jurisdiction.updated',
          'compliance.requirement.changed',
        ])),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const subscriptionId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const secret = crypto.randomBytes(32).toString('hex');

        const subscription = {
          id: subscriptionId,
          userId: ctx.user.id,
          url: input.url,
          events: input.events,
          secret,
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        webhookSubscriptions.set(subscriptionId, subscription);

        return {
          success: true,
          subscriptionId,
          secret,
          message: 'Webhook subscription created successfully',
        };
      } catch (error) {
        console.error('Error creating webhook subscription:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create webhook subscription',
        });
      }
    }),

  /**
   * Get all webhook subscriptions for a user
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const subscriptions = Array.from(webhookSubscriptions.values()).filter(
        (sub) => sub.userId === ctx.user.id
      );

      return {
        subscriptions: subscriptions.map((sub) => ({
          id: sub.id,
          url: sub.url,
          events: sub.events,
          isActive: sub.isActive,
          createdAt: sub.createdAt,
          lastTriggeredAt: sub.lastTriggeredAt,
        })),
        total: subscriptions.length,
      };
    } catch (error) {
      console.error('Error fetching webhook subscriptions:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch webhook subscriptions',
      });
    }
  }),

  /**
   * Update a webhook subscription
   */
  updateSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        url: z.string().url().optional(),
        events: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const subscription = webhookSubscriptions.get(input.subscriptionId);

        if (!subscription) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Webhook subscription not found',
          });
        }

        if (subscription.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this webhook',
          });
        }

        if (input.url) subscription.url = input.url;
        if (input.events) subscription.events = input.events;
        if (input.isActive !== undefined) subscription.isActive = input.isActive;

        webhookSubscriptions.set(input.subscriptionId, subscription);

        return {
          success: true,
          message: 'Webhook subscription updated successfully',
        };
      } catch (error) {
        console.error('Error updating webhook subscription:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update webhook subscription',
        });
      }
    }),

  /**
   * Delete a webhook subscription
   */
  deleteSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const subscription = webhookSubscriptions.get(input.subscriptionId);

        if (!subscription) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Webhook subscription not found',
          });
        }

        if (subscription.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this webhook',
          });
        }

        webhookSubscriptions.delete(input.subscriptionId);

        return {
          success: true,
          message: 'Webhook subscription deleted successfully',
        };
      } catch (error) {
        console.error('Error deleting webhook subscription:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete webhook subscription',
        });
      }
    }),

  /**
   * Get webhook delivery history
   */
  getDeliveryHistory: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const subscription = webhookSubscriptions.get(input.subscriptionId);

        if (!subscription) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Webhook subscription not found',
          });
        }

        if (subscription.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to view this webhook',
          });
        }

        const deliveries = Array.from(webhookDeliveries.values())
          .filter((d: any) => d.subscriptionId === input.subscriptionId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(input.offset, input.offset + input.limit);

        return {
          deliveries,
          total: Array.from(webhookDeliveries.values()).filter(
            (d) => d.subscriptionId === input.subscriptionId
          ).length,
        };
      } catch (error) {
        console.error('Error fetching delivery history:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch delivery history',
        });
      }
    }),

  /**
   * Test webhook delivery
   */
  testWebhook: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const subscription = webhookSubscriptions.get(input.subscriptionId);

        if (!subscription) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Webhook subscription not found',
          });
        }

        if (subscription.userId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to test this webhook',
          });
        }

        // Create a test payload
        const testPayload = {
          id: `test_${Date.now()}`,
          type: 'webhook.test',
          timestamp: new Date().toISOString(),
          data: {
            message: 'This is a test webhook delivery',
            subscriptionId: input.subscriptionId,
          },
        };

        // Generate HMAC signature
        const signature = crypto
          .createHmac('sha256', subscription.secret)
          .update(JSON.stringify(testPayload))
          .digest('hex');

        // Attempt delivery (in production, this would be async)
        try {
          const response = await fetch(subscription.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Signature': `sha256=${signature}`,
              'X-Webhook-ID': testPayload.id,
            },
            body: JSON.stringify(testPayload),
          });

          const delivery = {
            id: `delivery_${Date.now()}`,
            subscriptionId: input.subscriptionId,
            eventType: 'webhook.test',
            status: (response.ok ? 'delivered' : 'failed') as 'pending' | 'failed' | 'delivered' | 'retrying',
            httpStatus: response.status,
            attemptCount: 1,
            deliveredAt: response.ok ? new Date().toISOString() : undefined,
            createdAt: new Date().toISOString(),
          };

          webhookDeliveries.set(delivery.id, delivery);

          return {
            success: response.ok,
            httpStatus: response.status,
            message: response.ok ? 'Webhook test delivered successfully' : 'Webhook test failed',
          };
        } catch (error) {
          const delivery = {
            id: `delivery_${Date.now()}`,
            subscriptionId: input.subscriptionId,
            eventType: 'webhook.test',
            status: 'failed' as const,
            error: String(error),
            attemptCount: 1,
            createdAt: new Date().toISOString(),
          };

          webhookDeliveries.set(delivery.id, delivery);

          return {
            success: false,
            message: 'Webhook test failed',
            error: String(error),
          };
        }
      } catch (error) {
        console.error('Error testing webhook:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to test webhook',
        });
      }
    }),

  /**
   * Trigger rule update webhook for all subscribed users
   */
  triggerRuleUpdateWebhook: protectedProcedure
    .input(
      z.object({
        ruleId: z.number(),
        ruleName: z.string(),
        framework: z.string(),
        jurisdiction: z.string(),
        changeType: z.enum(['created', 'updated', 'deleted']),
        changes: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const payload = {
          id: `rule_${Date.now()}`,
          type: `rule.${input.changeType}`,
          timestamp: new Date().toISOString(),
          data: {
            ruleId: input.ruleId,
            ruleName: input.ruleName,
            framework: input.framework,
            jurisdiction: input.jurisdiction,
            changeType: input.changeType,
            changes: input.changes || {},
          },
        };

        let deliveredCount = 0;
        let failedCount = 0;

        // Send to all active subscriptions listening to rule events
        for (const [, subscription] of webhookSubscriptions) {
          if (!subscription.isActive) continue;
          if (!subscription.events.includes(`rule.${input.changeType}`)) continue;

          const signature = crypto
            .createHmac('sha256', subscription.secret)
            .update(JSON.stringify(payload))
            .digest('hex');

          try {
            const response = await fetch(subscription.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Signature': `sha256=${signature}`,
                'X-Webhook-ID': payload.id,
              },
              body: JSON.stringify(payload),
            });

            if (response.ok) {
              deliveredCount++;
              subscription.lastTriggeredAt = new Date().toISOString();
            } else {
              failedCount++;
            }
          } catch (error) {
            failedCount++;
            console.error(`Failed to deliver webhook to ${subscription.url}:`, error);
          }
        }

        return {
          success: true,
          deliveredCount,
          failedCount,
          message: `Rule update webhook delivered to ${deliveredCount} subscriptions`,
        };
      } catch (error) {
        console.error('Error triggering rule update webhook:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to trigger rule update webhook',
        });
      }
    }),
});
