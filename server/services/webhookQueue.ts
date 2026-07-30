import crypto from "crypto";

/**
 * Webhook Event Types
 */
export enum WebhookEventType {
  COMPLIANCE_REQUIREMENT_UPDATED = "compliance.requirement.updated",
  COMPLIANCE_SCORE_CHANGED = "compliance.score.changed",
  AUDIT_REQUIRED = "audit.required",
  ENFORCEMENT_ACTION_ISSUED = "enforcement.action.issued",
  ENFORCEMENT_ACTION_RESOLVED = "enforcement.action.resolved",
  SYSTEM_FLAGGED = "system.flagged",
  SYSTEM_UNFLAGGED = "system.unflagged"
}

/**
 * Webhook Delivery Status
 */
export enum DeliveryStatus {
  PENDING = "pending",
  DELIVERED = "delivered",
  FAILED = "failed",
  RETRYING = "retrying",
  PERMANENT_FAILURE = "permanent_failure"
}

/**
 * Webhook Event Payload
 */
export interface WebhookEventPayload {
  id: string;
  type: WebhookEventType;
  timestamp: string | Date;
  data: Record<string, unknown>;
  companyId: string;
}

/**
 * Webhook Delivery Record
 */
export interface WebhookDelivery {
  id: string;
  eventId: string;
  subscriptionId: string;
  url: string;
  status: DeliveryStatus;
  httpStatus?: number;
  responseBody?: string;
  error?: string;
  attemptCount: number;
  nextRetryAt?: string | Date;
  deliveredAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Webhook Subscription
 */
export interface WebhookSubscription {
  id: string;
  companyId: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  isActive: boolean;
  createdAt: string | Date;
  lastTriggeredAt?: string | Date;
}

/**
 * Webhook Queue Service
 * Manages webhook event queuing, delivery, and retry logic
 */
export class WebhookQueueService {
  private queue: Map<string, WebhookDelivery> = new Map();
  private retrySchedule: Map<string, NodeJS.Timeout> = new Map();
  private subscriptions: Map<string, WebhookSubscription> = new Map();

  // Configuration
  private readonly MAX_RETRIES = 5;
  private readonly INITIAL_RETRY_DELAY_MS = 1000; // 1 second
  private readonly MAX_RETRY_DELAY_MS = 3600000; // 1 hour
  private readonly TIMEOUT_MS = 30000; // 30 seconds
  private readonly DELIVERY_BATCH_SIZE = 10;

  constructor() {
    this.initializeQueue();
  }

  /**
   * Initialize the webhook queue service
   */
  private initializeQueue(): void {
    console.log("[WebhookQueue] Initializing webhook queue service");
    // In production, load pending deliveries from database
    // For now, start fresh
  }

  /**
   * Register a webhook subscription
   */
  registerSubscription(subscription: WebhookSubscription): void {
    this.subscriptions.set(subscription.id, subscription);
    console.log(`[WebhookQueue] Registered subscription: ${subscription.id}`);
  }

  /**
   * Unregister a webhook subscription
   */
  unregisterSubscription(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
    console.log(`[WebhookQueue] Unregistered subscription: ${subscriptionId}`);
  }

  /**
   * Get all active subscriptions for a company
   */
  getSubscriptionsForCompany(companyId: string): WebhookSubscription[] {
    return Array.from(this.subscriptions.values()).filter(
      sub => sub.companyId === companyId && sub.isActive
    );
  }

  /**
   * Get subscriptions that should receive an event
   */
  getSubscriptionsForEvent(
    companyId: string,
    eventType: WebhookEventType
  ): WebhookSubscription[] {
    return this.getSubscriptionsForCompany(companyId).filter(sub =>
      sub.events.includes(eventType)
    );
  }

  /**
   * Queue a webhook event for delivery
   */
  async queueEvent(event: WebhookEventPayload): Promise<void> {
    console.log(`[WebhookQueue] Queueing event: ${event.type} for company ${event.companyId}`);

    const subscriptions = this.getSubscriptionsForEvent(event.companyId, event.type);

    if (subscriptions.length === 0) {
      console.log(`[WebhookQueue] No subscriptions for event: ${event.type}`);
      return;
    }

    // Create delivery records for each subscription
    for (const subscription of subscriptions) {
      const delivery: WebhookDelivery = {
        id: this.generateId("whd"),
        eventId: event.id,
        subscriptionId: subscription.id,
        url: subscription.url,
        status: DeliveryStatus.PENDING,
        attemptCount: 0,
        createdAt: new Date()?.toString() || new Date().toISOString(),
        updatedAt: new Date()?.toString() || new Date().toISOString()
      };

      this.queue.set(delivery.id, delivery);
      console.log(`[WebhookQueue] Created delivery: ${delivery.id}`);

      // Attempt immediate delivery
      await this.attemptDelivery(delivery, event);
    }
  }

  /**
   * Attempt to deliver a webhook
   */
  private async attemptDelivery(
    delivery: WebhookDelivery,
    event: WebhookEventPayload
  ): Promise<void> {
    delivery.attemptCount++;
    delivery.updatedAt = new Date()?.toString() || new Date().toISOString();

    console.log(
      `[WebhookQueue] Attempting delivery ${delivery.attemptCount}/${this.MAX_RETRIES}: ${delivery.id}`
    );

    try {
      const response = await this.sendWebhook(delivery, event);

      if (response.success) {
        delivery.status = DeliveryStatus.DELIVERED;
        delivery.httpStatus = response.httpStatus;
        delivery.deliveredAt = new Date()?.toString() || new Date().toISOString();
        console.log(`[WebhookQueue] Delivery successful: ${delivery.id}`);
      } else {
        this.handleDeliveryFailure(delivery, response);
      }
    } catch (error) {
      this.handleDeliveryFailure(delivery, {
        success: false,
        httpStatus: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  /**
   * Send a webhook request
   */
  private async sendWebhook(
    delivery: WebhookDelivery,
    event: WebhookEventPayload
  ): Promise<{
    success: boolean;
    httpStatus?: number;
    error?: string;
  }> {
    const payload = JSON.stringify(event);
    const signature = this.generateSignature(
      payload,
      this.subscriptions.get(delivery.subscriptionId)?.secret || ""
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const response = await fetch(delivery.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSOAI-Event-ID": event.id,
          "X-CSOAI-Event-Type": event.type,
          "X-CSOAI-Signature": signature,
          "X-CSOAI-Timestamp": event.timestamp?.toString() || new Date().toISOString()
        },
        body: payload,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseBody = await response.text();

      if (response.ok) {
        return {
          success: true,
          httpStatus: response.status
        };
      } else {
        return {
          success: false,
          httpStatus: response.status,
          error: `HTTP ${response.status}: ${responseBody}`
        };
      }
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Handle delivery failure with retry logic
   */
  private handleDeliveryFailure(
    delivery: WebhookDelivery,
    response: { success: boolean; httpStatus?: number; error?: string }
  ): void {
    delivery.httpStatus = response.httpStatus;
    delivery.error = response.error;

    if (delivery.attemptCount >= this.MAX_RETRIES) {
      delivery.status = DeliveryStatus.PERMANENT_FAILURE;
      console.log(`[WebhookQueue] Permanent failure after ${this.MAX_RETRIES} attempts: ${delivery.id}`);
    } else {
      delivery.status = DeliveryStatus.RETRYING;
      const delay = this.calculateBackoffDelay(delivery.attemptCount);
      delivery.nextRetryAt = new Date(Date.now() + delay);

      console.log(
        `[WebhookQueue] Scheduling retry for ${delivery.id} in ${delay}ms (attempt ${delivery.attemptCount}/${this.MAX_RETRIES})`
      );

      // Schedule retry
      this.scheduleRetry(delivery);
    }
  }

  /**
   * Calculate exponential backoff delay
   * Formula: min(initialDelay * 2^attemptCount, maxDelay) + random jitter
   */
  private calculateBackoffDelay(attemptCount: number): number {
    const exponentialDelay = Math.min(
      this.INITIAL_RETRY_DELAY_MS * Math.pow(2, attemptCount - 1),
      this.MAX_RETRY_DELAY_MS
    );

    // Add jitter (±10%)
    const jitter = exponentialDelay * 0.1 * (Math.random() * 2 - 1);
    return exponentialDelay + jitter;
  }

  /**
   * Schedule a retry for a delivery
   */
  private scheduleRetry(delivery: WebhookDelivery): void {
    const delay = delivery.nextRetryAt
      ? (typeof delivery.nextRetryAt === 'string' ? new Date(delivery.nextRetryAt).getTime() : delivery.nextRetryAt.getTime()) - Date.now()
      : this.calculateBackoffDelay(delivery.attemptCount);

    const timeoutId = setTimeout(async () => {
      const event: WebhookEventPayload = {
        id: delivery.eventId,
        type: "compliance.requirement.updated" as WebhookEventType, // This would come from DB in production
        timestamp: new Date()?.toString() || new Date().toISOString(),
        data: {},
        companyId: this.subscriptions.get(delivery.subscriptionId)?.companyId || ""
      };

      await this.attemptDelivery(delivery, event);
    }, Math.max(0, delay));

    this.retrySchedule.set(delivery.id, timeoutId);
  }

  /**
   * Get delivery status
   */
  getDeliveryStatus(deliveryId: string): WebhookDelivery | undefined {
    return this.queue.get(deliveryId);
  }

  /**
   * Get all deliveries for a subscription
   */
  getDeliveriesForSubscription(subscriptionId: string): WebhookDelivery[] {
    return Array.from(this.queue.values()).filter(d => d.subscriptionId === subscriptionId);
  }

  /**
   * Get delivery statistics
   */
  getDeliveryStats(): {
    total: number;
    delivered: number;
    failed: number;
    retrying: number;
    pending: number;
    successRate: number;
  } {
    const deliveries = Array.from(this.queue.values());
    const delivered = deliveries.filter(d => d.status === DeliveryStatus.DELIVERED).length;
    const failed = deliveries.filter(d => d.status === DeliveryStatus.PERMANENT_FAILURE).length;
    const retrying = deliveries.filter(d => d.status === DeliveryStatus.RETRYING).length;
    const pending = deliveries.filter(d => d.status === DeliveryStatus.PENDING).length;

    return {
      total: deliveries.length,
      delivered,
      failed,
      retrying,
      pending,
      successRate: deliveries.length > 0 ? (delivered / deliveries.length) * 100 : 0
    };
  }

  /**
   * Generate HMAC signature for webhook
   */
  private generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
  }

  /**
   * Generate a unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Cleanup scheduled retries
   */
  cleanup(): void {
    this.retrySchedule.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.retrySchedule.clear();
    console.log("[WebhookQueue] Cleaned up webhook queue service");
  }
}

// Export singleton instance
export const webhookQueue = new WebhookQueueService();
