/**
 * Enhanced WebSocket Notification Manager
 * Handles real-time notification delivery tracking, message queuing, and offline support
 */
import { WebSocket } from 'ws';
import { getDb } from '../db';
import { notifications } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

interface NotificationMessage {
  type: 'notification' | 'notification_update' | 'notification_read' | 'notification_delivered';
  notificationId: number;
  userId: number;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: number;
  data?: any;
}

interface QueuedMessage {
  message: NotificationMessage;
  userId: number;
  timestamp: number;
  retries: number;
}

export class WebSocketNotificationManager {
  private messageQueue: Map<number, QueuedMessage[]> = new Map();
  private deliveryTracking: Map<number, Map<number, string>> = new Map(); // userId -> notificationId -> status
  private maxQueueSize = 100;
  private maxRetries = 3;
  private queueProcessInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize the notification manager
   */
  public initialize() {
    // Process queued messages periodically
    this.queueProcessInterval = setInterval(() => {
      this.processMessageQueue();
    }, 5000); // Every 5 seconds
    console.log('[WebSocket Notification Manager] Initialized');
  }

  /**
   * Send notification update via WebSocket to connected client
   */
  public async sendNotificationUpdate(
    ws: WebSocket,
    userId: number,
    notificationId: number,
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed',
    data?: any
  ) {
    const message: NotificationMessage = {
      type: status === 'read' ? 'notification_read' : 'notification_update',
      notificationId,
      userId,
      status,
      timestamp: Date.now(),
      data,
    };

    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        // Track delivery
        this.trackDelivery(userId, notificationId, 'delivered');
        console.log(`[WS Notification] Sent ${status} update for notification ${notificationId} to user ${userId}`);
      } catch (error) {
        console.error(`[WS Notification] Error sending update:`, error);
        // Queue for retry
        this.queueMessage(message, userId);
      }
    } else {
      // Queue message if client is disconnected
      this.queueMessage(message, userId);
    }
  }

  /**
   * Broadcast notification to all connected clients of a user
   */
  public async broadcastNotificationToUser(
    userId: number,
    notificationId: number,
    title: string,
    message: string,
    priority: string,
    type: string,
    connections: Map<string, any> // Map of connectionId -> client object with ws
  ) {
    const notificationMessage: NotificationMessage = {
      type: 'notification',
      notificationId,
      userId,
      status: 'sent',
      timestamp: Date.now(),
      data: {
        title,
        message,
        priority,
        notificationType: type,
      },
    };

    let sent = false;
    for (const [connectionId, client] of connections) {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(notificationMessage));
          sent = true;
          console.log(`[WS Notification] Broadcast to ${connectionId}`);
        } catch (error) {
          console.error(`[WS Notification] Error broadcasting:`, error);
        }
      }
    }

    if (!sent) {
      // Queue for offline delivery
      this.queueMessage(notificationMessage, userId);
    }

    // Track as sent
    this.trackDelivery(userId, notificationId, 'sent');
  }

  /**
   * Queue message for offline/retry delivery
   */
  private queueMessage(message: NotificationMessage, userId: number) {
    if (!this.messageQueue.has(userId)) {
      this.messageQueue.set(userId, []);
    }

    const queue = this.messageQueue.get(userId)!;
    if (queue.length < this.maxQueueSize) {
      queue.push({
        message,
        userId,
        timestamp: Date.now(),
        retries: 0,
      });
      console.log(`[WS Notification Queue] Queued message for user ${userId} (queue size: ${queue.length})`);
    } else {
      console.warn(`[WS Notification Queue] Queue full for user ${userId}, dropping message`);
    }
  }

  /**
   * Process queued messages when client reconnects
   */
  public async deliverQueuedMessages(
    userId: number,
    ws: WebSocket
  ): Promise<number> {
    const queue = this.messageQueue.get(userId);
    if (!queue || queue.length === 0) {
      return 0;
    }

    let delivered = 0;
    const remaining: QueuedMessage[] = [];

    for (const queuedMsg of queue) {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(queuedMsg.message));
          delivered++;
          console.log(`[WS Notification Queue] Delivered queued message for notification ${queuedMsg.message.notificationId}`);
        } else {
          remaining.push(queuedMsg);
        }
      } catch (error) {
        console.error(`[WS Notification Queue] Error delivering queued message:`, error);
        if (queuedMsg.retries < this.maxRetries) {
          queuedMsg.retries++;
          remaining.push(queuedMsg);
        }
      }
    }

    if (remaining.length > 0) {
      this.messageQueue.set(userId, remaining);
    } else {
      this.messageQueue.delete(userId);
    }

    return delivered;
  }

  /**
   * Track notification delivery status
   */
  private trackDelivery(userId: number, notificationId: number, status: string) {
    if (!this.deliveryTracking.has(userId)) {
      this.deliveryTracking.set(userId, new Map());
    }
    this.deliveryTracking.get(userId)!.set(notificationId, status);
  }

  /**
   * Get delivery status for a notification
   */
  public getDeliveryStatus(userId: number, notificationId: number): string | null {
    return this.deliveryTracking.get(userId)?.get(notificationId) || null;
  }

  /**
   * Process message queue periodically
   */
  private async processMessageQueue() {
    for (const [userId, queue] of this.messageQueue) {
      if (queue.length === 0) continue;

      // Remove old messages (older than 24 hours)
      const now = Date.now();
      const filtered = queue.filter(msg => now - msg.timestamp < 24 * 60 * 60 * 1000);

      if (filtered.length === 0) {
        this.messageQueue.delete(userId);
      } else {
        this.messageQueue.set(userId, filtered);
      }
    }
  }

  /**
   * Update notification status in database
   */
  public async updateNotificationStatus(
    notificationId: number,
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  ) {
    try {
      const db = await getDb();
      if (!db) return;

      const updateData: any = {};
      if (status === 'read') {
        updateData.isRead = 1;
        updateData.readAt = new Date().toISOString();
      }
      // Add more status tracking as needed

      if (Object.keys(updateData).length > 0) {
        await db
          .update(notifications)
          .set(updateData)
          .where(eq(notifications.id, notificationId));
      }
    } catch (error) {
      console.error('[WS Notification] Error updating status:', error);
    }
  }

  /**
   * Get queue stats
   */
  public getQueueStats() {
    let totalQueued = 0;
    for (const queue of this.messageQueue.values()) {
      totalQueued += queue.length;
    }
    return {
      totalQueued,
      usersWithQueue: this.messageQueue.size,
    };
  }

  /**
   * Shutdown the manager
   */
  public shutdown() {
    if (this.queueProcessInterval) {
      clearInterval(this.queueProcessInterval);
    }
    this.messageQueue.clear();
    this.deliveryTracking.clear();
    console.log('[WebSocket Notification Manager] Shutdown');
  }
}

// Export singleton instance
export const wsNotificationManager = new WebSocketNotificationManager();
