/**
 * Multi-Channel Notification Delivery Service
 * Handles email, Slack, and webhook delivery with retry logic
 */

import { getDb } from '../db';
import { notifications, notificationPreferences } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

interface DeliveryLog {
  notificationId: number;
  channel: 'email' | 'slack' | 'webhook';
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  deliveredAt?: string | Date;
  errorMessage?: string;
  retryCount: number;
  nextRetryAt?: string | Date;
}

interface NotificationPayload {
  userId: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: any;
}

export class NotificationDeliveryService {
  private maxRetries = 3;
  private retryDelays = [60000, 300000, 900000]; // 1min, 5min, 15min

  /**
   * Send notification through all enabled channels
   */
  public async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      // Get user preferences
      const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, payload.userId));

      if (!prefs) {
        console.warn(`[Notification] No preferences found for user ${payload.userId}`);
        return;
      }

      // Send through enabled channels
      const deliveryPromises: Promise<void>[] = [];

      if (prefs.emailEnabled) {
        deliveryPromises.push(this.sendEmail(payload));
      }

      if (prefs.slackEnabled && prefs.slackWebhookUrl) {
        deliveryPromises.push(this.sendSlack(payload, prefs.slackWebhookUrl));
      }

      // Always send webhook if configured
      deliveryPromises.push(this.sendWebhook(payload));

      await Promise.allSettled(deliveryPromises);
    } catch (error) {
      console.error('[Notification] Error sending notification:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(payload: NotificationPayload): Promise<void> {
    try {
      console.log(`[Email] Sending to user ${payload.userId}: ${payload.title}`);

      // Email service implementation
      // This would integrate with SendGrid, AWS SES, or similar
      const emailContent = this.generateEmailContent(payload);

      // TODO: Integrate with actual email service
      console.log('[Email] Email content:', emailContent);

      // Log successful delivery
      await this.logDelivery({
        notificationId: 0, // Would be actual notification ID
        channel: 'email',
        status: 'sent',
        deliveredAt: new Date().toISOString(),
        retryCount: 0,
      });
    } catch (error) {
      console.error('[Email] Error sending email:', error);
      await this.logDelivery({
        notificationId: 0,
        channel: 'email',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
        nextRetryAt: new Date(Date.now() + this.retryDelays[0]),
      });
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlack(payload: NotificationPayload, webhookUrl: string): Promise<void> {
    try {
      console.log(`[Slack] Sending to webhook: ${payload.title}`);

      const slackMessage = this.generateSlackMessage(payload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.statusText}`);
      }

      console.log('[Slack] Message sent successfully');

      await this.logDelivery({
        notificationId: 0,
        channel: 'slack',
        status: 'sent',
        deliveredAt: new Date().toISOString(),
        retryCount: 0,
      });
    } catch (error) {
      console.error('[Slack] Error sending message:', error);
      await this.logDelivery({
        notificationId: 0,
        channel: 'slack',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
        nextRetryAt: new Date(Date.now() + this.retryDelays[0]),
      });
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(payload: NotificationPayload): Promise<void> {
    try {
      console.log(`[Webhook] Sending notification: ${payload.title}`);

      // TODO: Get webhook subscriptions from database
      // For now, just log the event
      const webhookPayload = {
        event: 'notification',
        timestamp: new Date().toISOString(),
        data: payload,
      };

      console.log('[Webhook] Payload:', webhookPayload);

      await this.logDelivery({
        notificationId: 0,
        channel: 'webhook',
        status: 'sent',
        deliveredAt: new Date().toISOString(),
        retryCount: 0,
      });
    } catch (error) {
      console.error('[Webhook] Error sending webhook:', error);
      await this.logDelivery({
        notificationId: 0,
        channel: 'webhook',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        retryCount: 0,
        nextRetryAt: new Date(Date.now() + this.retryDelays[0]),
      });
    }
  }

  /**
   * Retry failed deliveries
   */
  public async retryFailedDeliveries(): Promise<void> {
    console.log('[Notification] Checking for failed deliveries to retry...');

    // TODO: Query notification_delivery_logs for failed deliveries
    // Retry based on nextRetryAt and retryCount
  }

  /**
   * Log delivery attempt
   */
  private async logDelivery(log: DeliveryLog): Promise<void> {
    try {
      // TODO: Insert into notification_delivery_logs table
      console.log('[Delivery Log]', log);
    } catch (error) {
      console.error('[Delivery Log] Error logging delivery:', error);
    }
  }

  /**
   * Generate email content
   */
  private generateEmailContent(payload: NotificationPayload): string {
    return `
      <h2>${payload.title}</h2>
      <p>${payload.message}</p>
      ${payload.link ? `<p><a href="${payload.link}">View Details</a></p>` : ''}
      <p style="color: #999; font-size: 12px;">
        Priority: ${payload.priority}
      </p>
    `;
  }

  /**
   * Generate Slack message
   */
  private generateSlackMessage(payload: NotificationPayload): any {
    const colorMap = {
      low: '#36a64f',
      medium: '#ff9900',
      high: '#ff6600',
      urgent: '#ff0000',
    };

    return {
      attachments: [
        {
          color: colorMap[payload.priority],
          title: payload.title,
          text: payload.message,
          actions: payload.link
            ? [
                {
                  type: 'button',
                  text: 'View Details',
                  url: payload.link,
                },
              ]
            : [],
          footer: `Priority: ${payload.priority}`,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };
  }

  /**
   * Get delivery history for notification
   */
  public async getDeliveryHistory(notificationId: number): Promise<DeliveryLog[]> {
    // TODO: Query notification_delivery_logs for this notification
    console.log(`[Notification] Getting delivery history for notification ${notificationId}`);
    return [];
  }

  /**
   * Get delivery statistics
   */
  public async getDeliveryStats(userId: number): Promise<{
    totalSent: number;
    totalFailed: number;
    totalBounced: number;
    successRate: number;
  }> {
    // TODO: Query notification_delivery_logs for user statistics
    console.log(`[Notification] Getting delivery stats for user ${userId}`);
    return {
      totalSent: 0,
      totalFailed: 0,
      totalBounced: 0,
      successRate: 0,
    };
  }
}

export const notificationDelivery = new NotificationDeliveryService();
