/**
 * Notification Service
 * Handles real-time alerts and notifications for compliance events
 */

export type NotificationType =
  | "compliance_score_changed"
  | "audit_due"
  | "enforcement_action_issued"
  | "requirement_updated"
  | "system_flagged"
  | "audit_completed";

export type NotificationChannel = "email" | "sms" | "push" | "in_app";

export type NotificationPriority = "critical" | "high" | "medium" | "low";

export interface NotificationRecipient {
  userId: string;
  email?: string;
  phoneNumber?: string;
  pushToken?: string;
  preferences: NotificationPreferences;
}

export interface NotificationPreferences {
  channels: NotificationChannel[];
  eventTypes: NotificationType[];
  minPriority: NotificationPriority;
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    timezone: string;
  };
}

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data: Record<string, unknown>;
  channels: NotificationChannel[];
  createdAt: string | Date;
  sentAt?: string | Date;
  readAt?: string | Date;
  status: "pending" | "sent" | "failed" | "read";
}

/**
 * Notification Service
 * Manages notification creation and delivery
 */
export class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private recipients: Map<string, NotificationRecipient> = new Map();

  /**
   * Create notification
   */
  async createNotification(
    recipientId: string,
    type: NotificationType,
    priority: NotificationPriority,
    title: string,
    message: string,
    data: Record<string, unknown> = {}
  ): Promise<Notification> {
    const recipient = await this.getRecipient(recipientId);
    if (!recipient) {
      throw new Error(`Recipient ${recipientId} not found`);
    }

    // Check if notification should be sent based on preferences
    if (!this.shouldSendNotification(recipient.preferences, type, priority)) {
      console.log(`[NotificationService] Skipping notification for ${recipientId}: preferences`);
      return {
        id: "skipped",
        recipientId,
        type,
        priority,
        title,
        message,
        data,
        channels: [],
        createdAt: new Date().toISOString(),
        status: "pending"
      };
    }

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recipientId,
      type,
      priority,
      title,
      message,
      data,
      channels: recipient.preferences.channels,
      createdAt: new Date().toISOString(),
      status: "pending"
    };

    this.notifications.set(notification.id, notification);

    // Send notification asynchronously
    this.sendNotification(notification, recipient).catch(error => {
      console.error("[NotificationService] Error sending notification:", error);
      notification.status = "failed";
    });

    return notification;
  }

  /**
   * Send notification through configured channels
   */
  private async sendNotification(
    notification: Notification,
    recipient: NotificationRecipient
  ): Promise<void> {
    const sendPromises: Promise<void>[] = [];

    for (const channel of notification.channels) {
      switch (channel) {
        case "email":
          if (recipient.email) {
            sendPromises.push(this.sendEmailNotification(notification, recipient.email));
          }
          break;
        case "sms":
          if (recipient.phoneNumber) {
            sendPromises.push(this.sendSMSNotification(notification, recipient.phoneNumber));
          }
          break;
        case "push":
          if (recipient.pushToken) {
            sendPromises.push(this.sendPushNotification(notification, recipient.pushToken));
          }
          break;
        case "in_app":
          sendPromises.push(this.sendInAppNotification(notification));
          break;
      }
    }

    await Promise.allSettled(sendPromises);
    notification.sentAt = new Date().toISOString();
    notification.status = "sent";
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: Notification, email: string): Promise<void> {
    console.log(`[NotificationService] Sending email to ${email}:`, {
      title: notification.title,
      message: notification.message
    });

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // const emailService = new EmailService();
    // await emailService.send({
    //   to: email,
    //   subject: notification.title,
    //   html: this.formatEmailTemplate(notification),
    //   priority: notification.priority === 'critical' ? 'high' : 'normal'
    // });
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(notification: Notification, phoneNumber: string): Promise<void> {
    console.log(`[NotificationService] Sending SMS to ${phoneNumber}:`, notification.title);

    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    // const smsService = new SMSService();
    // await smsService.send({
    //   to: phoneNumber,
    //   message: this.formatSMSMessage(notification),
    //   priority: notification.priority
    // });
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: Notification, pushToken: string): Promise<void> {
    console.log(`[NotificationService] Sending push notification:`, {
      token: pushToken.substring(0, 20) + "...",
      title: notification.title
    });

    // TODO: Integrate with push service (Firebase Cloud Messaging, OneSignal, etc.)
    // const pushService = new PushService();
    // await pushService.send({
    //   token: pushToken,
    //   title: notification.title,
    //   body: notification.message,
    //   data: notification.data,
    //   priority: notification.priority
    // });
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(notification: Notification): Promise<void> {
    console.log(`[NotificationService] Storing in-app notification:`, notification.id);

    // TODO: Store in database for in-app display
    // await db.insert(inAppNotifications).values({
    //   id: notification.id,
    //   recipientId: notification.recipientId,
    //   title: notification.title,
    //   message: notification.message,
    //   type: notification.type,
    //   priority: notification.priority,
    //   data: notification.data,
    //   createdAt: notification.createdAt,
    //   readAt: null
    // });
  }

  /**
   * Check if notification should be sent
   */
  private shouldSendNotification(
    preferences: NotificationPreferences,
    type: NotificationType,
    priority: NotificationPriority
  ): boolean {
    // Check if event type is enabled
    if (!preferences.eventTypes.includes(type)) {
      return false;
    }

    // Check if priority meets minimum threshold
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (priorityOrder[priority] > priorityOrder[preferences.minPriority]) {
      return false;
    }

    // Check if in quiet hours
    if (preferences.quietHours?.enabled) {
      const now = new Date();
      const currentTime = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit"
      });

      const { startTime, endTime } = preferences.quietHours;
      if (currentTime >= startTime && currentTime <= endTime) {
        // Allow critical notifications even during quiet hours
        if (priority !== "critical") {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get recipient preferences
   */
  async getRecipient(recipientId: string): Promise<NotificationRecipient | null> {
    // TODO: Query from database
    return this.recipients.get(recipientId) || null;
  }

  /**
   * Update recipient preferences
   */
  async updateRecipientPreferences(
    recipientId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationRecipient | null> {
    const recipient = await this.getRecipient(recipientId);
    if (!recipient) return null;

    recipient.preferences = { ...recipient.preferences, ...preferences };
    // TODO: Update in database
    this.recipients.set(recipientId, recipient);
    return recipient;
  }

  /**
   * Get notifications for recipient
   */
  async getNotifications(
    recipientId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Notification[]> {
    // TODO: Query from database
    const recipientNotifications: Notification[] = [];
    const notificationsArray = Array.from(this.notifications.values());
    for (const notif of notificationsArray) {
      if (notif.recipientId === recipientId) {
        recipientNotifications.push(notif);
      }
    }
    return recipientNotifications.slice(offset, offset + limit);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification | null> {
    const notification = this.notifications.get(notificationId);
    if (!notification) return null;

    notification.readAt = new Date().toISOString();
    notification.status = "read";
    // TODO: Update in database
    return notification;
  }

  /**
   * Format email template
   */
  private formatEmailTemplate(notification: Notification): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h1>${notification.title}</h1>
        </div>
        <div style="padding: 20px; background-color: #f9fafb;">
          <p>${notification.message}</p>
          ${
            Object.keys(notification.data).length > 0
              ? `
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 15px;">
              <h3>Details:</h3>
              ${Object.entries(notification.data)
                .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
                .join("")}
            </div>
          `
              : ""
          }
        </div>
        <div style="background-color: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>This is an automated notification from CSOAI. Please do not reply to this email.</p>
        </div>
      </div>
    `;
  }

  /**
   * Format SMS message
   */
  private formatSMSMessage(notification: Notification): string {
    const maxLength = 160;
    const message = `${notification.title}: ${notification.message}`;
    return message.length > maxLength ? message.substring(0, maxLength - 3) + "..." : message;
  }
}

/**
 * Notification Event Triggers
 * Triggers notifications based on compliance events
 */
export class NotificationEventTrigger {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Trigger compliance score changed notification
   */
  async onComplianceScoreChanged(
    recipientId: string,
    systemName: string,
    oldScore: number,
    newScore: number
  ): Promise<void> {
    const priority = newScore < 60 ? "critical" : newScore < 75 ? "high" : "medium";
    const change = newScore - oldScore;
    const changeText = change > 0 ? `increased to ${newScore}%` : `decreased to ${newScore}%`;

    await this.notificationService.createNotification(
      recipientId,
      "compliance_score_changed",
      priority,
      `Compliance Score Changed: ${systemName}`,
      `Your system's compliance score has ${changeText} (${change > 0 ? "+" : ""}${change}%)`,
      {
        systemName,
        oldScore,
        newScore,
        change
      }
    );
  }

  /**
   * Trigger audit due notification
   */
  async onAuditDue(
    recipientId: string,
    systemName: string,
    framework: string,
    dueDate: Date
  ): Promise<void> {
    const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    const priority = daysUntilDue <= 7 ? "critical" : daysUntilDue <= 14 ? "high" : "medium";

    await this.notificationService.createNotification(
      recipientId,
      "audit_due",
      priority,
      `Audit Due: ${framework}`,
      `Your ${framework} audit for ${systemName} is due in ${daysUntilDue} days`,
      {
        systemName,
        framework,
        dueDate: dueDate.toISOString(),
        daysUntilDue
      }
    );
  }

  /**
   * Trigger enforcement action issued notification
   */
  async onEnforcementActionIssued(
    recipientId: string,
    companyName: string,
    reason: string,
    severity: string,
    dueDate: Date
  ): Promise<void> {
    await this.notificationService.createNotification(
      recipientId,
      "enforcement_action_issued",
      severity as NotificationPriority,
      `Enforcement Action Issued`,
      `An enforcement action has been issued against ${companyName}: ${reason}`,
      {
        companyName,
        reason,
        severity,
        dueDate: dueDate.toISOString()
      }
    );
  }

  /**
   * Trigger requirement updated notification
   */
  async onRequirementUpdated(
    recipientId: string,
    framework: string,
    requirement: string,
    changeDescription: string
  ): Promise<void> {
    await this.notificationService.createNotification(
      recipientId,
      "requirement_updated",
      "high",
      `Compliance Requirement Updated: ${framework}`,
      `${requirement}: ${changeDescription}`,
      {
        framework,
        requirement,
        changeDescription
      }
    );
  }

  /**
   * Trigger system flagged notification
   */
  async onSystemFlagged(
    recipientId: string,
    systemName: string,
    reason: string
  ): Promise<void> {
    await this.notificationService.createNotification(
      recipientId,
      "system_flagged",
      "critical",
      `System Flagged: ${systemName}`,
      `Your system has been flagged for review: ${reason}`,
      {
        systemName,
        reason
      }
    );
  }

  /**
   * Trigger audit completed notification
   */
  async onAuditCompleted(
    recipientId: string,
    systemName: string,
    framework: string,
    score: number,
    findings: number
  ): Promise<void> {
    const priority = score < 60 ? "critical" : score < 75 ? "high" : "medium";

    await this.notificationService.createNotification(
      recipientId,
      "audit_completed",
      priority,
      `Audit Completed: ${framework}`,
      `Your ${framework} audit for ${systemName} is complete. Score: ${score}% (${findings} findings)`,
      {
        systemName,
        framework,
        score,
        findings
      }
    );
  }
}

// Export singletons
export const notificationService = new NotificationService();
export const notificationEventTrigger = new NotificationEventTrigger(notificationService);
