/**
 * Real-Time Alerting System
 * Push notifications, email alerts, and in-app notifications for compliance events
 */

import nodemailer from 'nodemailer';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertType =
  | 'compliance_violation'
  | 'webhook_failure'
  | 'onboarding_dropoff'
  | 'assessment_overdue'
  | 'certification_expiring'
  | 'control_failure';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  organizationId: string;
  systemId?: string;
  createdAt: string | Date;
  resolvedAt?: string | Date;
  metadata: Record<string, any>;
}

export interface NotificationChannel {
  type: 'email' | 'push' | 'in-app' | 'slack' | 'webhook';
  enabled: boolean;
  config: Record<string, any>;
}

export interface UserNotificationPreferences {
  userId: string;
  channels: NotificationChannel[];
  alertTypes: Partial<Record<AlertType, boolean>>;
  severityThreshold: AlertSeverity;
  quietHours?: { start: string; end: string };
}

export class AlertingSystem {
  private alerts: Map<string, Alert> = new Map();
  private emailTransporter: nodemailer.Transporter | null = null;
  private notificationQueue: Array<{ alert: Alert; preferences: UserNotificationPreferences }> = [];

  constructor() {
    this.initializeEmailTransporter();
  }

  /**
   * Initialize email transporter
   */
  private initializeEmailTransporter() {
    // In production, use real SMTP credentials
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    });
  }

  /**
   * Create and dispatch alert
   */
  async createAlert(
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    description: string,
    organizationId: string,
    metadata: Record<string, any> = {},
    systemId?: string
  ): Promise<Alert> {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      description,
      organizationId,
      systemId,
      createdAt: new Date()?.toString() || new Date().toISOString(),
      metadata,
    };

    this.alerts.set(alert.id, alert);

    // Dispatch notifications
    await this.dispatchNotifications(alert);

    return alert;
  }

  /**
   * Create compliance violation alert
   */
  async alertComplianceViolation(
    organizationId: string,
    systemId: string,
    requirement: string,
    severity: AlertSeverity,
    evidence: string[]
  ): Promise<Alert> {
    return this.createAlert(
      'compliance_violation',
      severity,
      `Compliance Violation Detected: ${requirement}`,
      `System ${systemId} has failed to meet ${requirement} compliance requirement.`,
      organizationId,
      { requirement, evidence, systemId },
      systemId
    );
  }

  /**
   * Create webhook failure alert
   */
  async alertWebhookFailure(
    organizationId: string,
    webhookId: string,
    failureReason: string,
    failureCount: number
  ): Promise<Alert> {
    const severity = failureCount > 5 ? 'critical' : failureCount > 3 ? 'high' : 'medium';

    return this.createAlert(
      'webhook_failure',
      severity,
      `Webhook Delivery Failure: ${webhookId}`,
      `Webhook ${webhookId} has failed ${failureCount} times. Reason: ${failureReason}`,
      organizationId,
      { webhookId, failureReason, failureCount }
    );
  }

  /**
   * Create onboarding dropoff alert
   */
  async alertOnboardingDropoff(
    organizationId: string,
    sessionId: string,
    currentStep: number,
    dropoffReason: string
  ): Promise<Alert> {
    const stepNames = [
      'Company Info',
      'Framework Selection',
      'AI Systems Mapping',
      'Compliance Baseline',
      'Team Setup',
    ];

    return this.createAlert(
      'onboarding_dropoff',
      'medium',
      `Onboarding Dropoff at Step ${currentStep}`,
      `Organization dropped off at ${stepNames[currentStep - 1] || 'Unknown'} step. Reason: ${dropoffReason}`,
      organizationId,
      { sessionId, currentStep, dropoffReason }
    );
  }

  /**
   * Create assessment overdue alert
   */
  async alertAssessmentOverdue(
    organizationId: string,
    systemId: string,
    framework: string,
    daysOverdue: number
  ): Promise<Alert> {
    return this.createAlert(
      'assessment_overdue',
      daysOverdue > 30 ? 'high' : 'medium',
      `Assessment Overdue: ${framework}`,
      `${framework} assessment for system ${systemId} is ${daysOverdue} days overdue.`,
      organizationId,
      { systemId, framework, daysOverdue },
      systemId
    );
  }

  /**
   * Create certification expiring alert
   */
  async alertCertificationExpiring(
    organizationId: string,
    systemId: string,
    certificationLevel: string,
    daysUntilExpiry: number
  ): Promise<Alert> {
    return this.createAlert(
      'certification_expiring',
      daysUntilExpiry < 30 ? 'high' : 'medium',
      `Certification Expiring: ${certificationLevel}`,
      `${certificationLevel} certification for system ${systemId} expires in ${daysUntilExpiry} days.`,
      organizationId,
      { systemId, certificationLevel, daysUntilExpiry },
      systemId
    );
  }

  /**
   * Create control failure alert
   */
  async alertControlFailure(
    organizationId: string,
    systemId: string,
    controlName: string,
    failureDescription: string
  ): Promise<Alert> {
    return this.createAlert(
      'control_failure',
      'high',
      `Control Failure: ${controlName}`,
      `Control ${controlName} for system ${systemId} has failed. ${failureDescription}`,
      organizationId,
      { systemId, controlName, failureDescription },
      systemId
    );
  }

  /**
   * Dispatch notifications to user
   */
  private async dispatchNotifications(alert: Alert) {
    // In production, would query database for user preferences
    const mockPreferences: UserNotificationPreferences = {
      userId: 'user-1',
      channels: [
        { type: 'email', enabled: true, config: { email: 'admin@example.com' } },
        { type: 'in-app', enabled: true, config: {} },
        { type: 'push', enabled: true, config: { endpoint: 'https://push.example.com' } },
      ],
      alertTypes: {
        compliance_violation: true,
        webhook_failure: true,
        onboarding_dropoff: true,
        assessment_overdue: true,
        certification_expiring: true,
        control_failure: true,
      },
      severityThreshold: 'low',
    };

    this.notificationQueue.push({ alert, preferences: mockPreferences });

    // Process queue
    await this.processNotificationQueue();
  }

  /**
   * Process notification queue
   */
  private async processNotificationQueue() {
    while (this.notificationQueue.length > 0) {
      const { alert, preferences } = this.notificationQueue.shift()!;

      // Check if alert type is enabled
      if (!preferences.alertTypes[alert.type]) {
        continue;
      }

      // Check severity threshold
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (severityOrder[alert.severity] > severityOrder[preferences.severityThreshold]) {
        continue;
      }

      // Check quiet hours
      if (preferences.quietHours && this.isInQuietHours(preferences.quietHours)) {
        // Queue for later delivery
        this.notificationQueue.push({ alert, preferences });
        continue;
      }

      // Send notifications through enabled channels
      for (const channel of preferences.channels) {
        if (!channel.enabled) continue;

        switch (channel.type) {
          case 'email':
            await this.sendEmailNotification(alert, channel.config);
            break;
          case 'push':
            await this.sendPushNotification(alert, channel.config);
            break;
          case 'in-app':
            await this.createInAppNotification(alert, preferences.userId);
            break;
          case 'slack':
            await this.sendSlackNotification(alert, channel.config);
            break;
          case 'webhook':
            await this.sendWebhookNotification(alert, channel.config);
            break;
        }
      }
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(alert: Alert, config: Record<string, any>) {
    if (!this.emailTransporter) return;

    try {
      const emailContent = this.formatEmailContent(alert);

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@coai.io',
        to: config.email,
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        html: emailContent,
      });

      console.log(`Email notification sent to ${config.email}`);
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(alert: Alert, config: Record<string, any>) {
    try {
      // In production, would integrate with push notification service
      const payload = {
        title: alert.title,
        body: alert.description,
        data: {
          alertId: alert.id,
          type: alert.type,
          severity: alert.severity,
        },
      };

      console.log(`Push notification sent: ${JSON.stringify(payload)}`);
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  /**
   * Create in-app notification
   */
  private async createInAppNotification(alert: Alert, userId: string) {
    try {
      // In production, would store in database
      const notification = {
        id: `notif-${Date.now()}`,
        userId,
        alertId: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        read: false,
        createdAt: new Date()?.toString() || new Date().toISOString(),
      };

      console.log(`In-app notification created: ${JSON.stringify(notification)}`);
    } catch (error) {
      console.error('Failed to create in-app notification:', error);
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(alert: Alert, config: Record<string, any>) {
    try {
      const color = {
        critical: '#FF0000',
        high: '#FF6600',
        medium: '#FFAA00',
        low: '#00AA00',
      }[alert.severity];

      const payload = {
        attachments: [
          {
            color,
            title: alert.title,
            text: alert.description,
            fields: [
              { title: 'Severity', value: alert.severity, short: true },
              { title: 'Type', value: alert.type, short: true },
              { title: 'Organization', value: alert.organizationId, short: true },
              { title: 'Time', value: alert.createdAt?.toString() || new Date().toISOString(), short: true },
            ],
          },
        ],
      };

      console.log(`Slack notification sent: ${JSON.stringify(payload)}`);
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(alert: Alert, config: Record<string, any>) {
    try {
      const payload = {
        alert: {
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          organizationId: alert.organizationId,
          systemId: alert.systemId,
          createdAt: alert.createdAt,
          metadata: alert.metadata,
        },
      };

      // In production, would make HTTP request
      console.log(`Webhook notification sent to ${config.url}: ${JSON.stringify(payload)}`);
    } catch (error) {
      console.error('Failed to send webhook notification:', error);
    }
  }

  /**
   * Format email content
   */
  private formatEmailContent(alert: Alert): string {
    const severityColor = {
      critical: '#FF0000',
      high: '#FF6600',
      medium: '#FFAA00',
      low: '#00AA00',
    }[alert.severity];

    return `
      <html>
        <body style="font-family: Arial, sans-serif;">
          <div style="border-left: 4px solid ${severityColor}; padding: 20px; background: #f5f5f5;">
            <h2 style="margin-top: 0; color: ${severityColor};">${alert.title}</h2>
            <p>${alert.description}</p>
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Alert ID:</strong> ${alert.id}</p>
              <p><strong>Severity:</strong> <span style="color: ${severityColor}; font-weight: bold;">${alert.severity.toUpperCase()}</span></p>
              <p><strong>Type:</strong> ${alert.type}</p>
              <p><strong>Organization:</strong> ${alert.organizationId}</p>
              <p><strong>Time:</strong> ${alert.createdAt?.toString() || new Date().toISOString()}</p>
            </div>
            <p style="color: #666; font-size: 12px;">
              This is an automated alert from COAI Compliance Platform. 
              <a href="https://coai.io/alerts/${alert.id}">View in Dashboard</a>
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(quietHours: { start: string; end: string }): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = quietHours.start.split(':').map(Number);
    const [endHour, endMin] = quietHours.end.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  /**
   * Get alerts for organization
   */
  getAlerts(organizationId: string, unreadOnly: boolean = false): Alert[] {
    return Array.from(this.alerts.values()).filter((alert) => alert.organizationId === organizationId);
  }

  /**
   * Get alert by ID
   */
  getAlert(alertId: string): Alert | undefined {
    return this.alerts.get(alertId);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): Alert | undefined {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolvedAt = new Date()?.toString() || new Date().toISOString();
    }
    return alert;
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(organizationId: string) {
    const alerts = this.getAlerts(organizationId);

    return {
      total: alerts.length,
      unresolved: alerts.filter((a: any) => !a.resolvedAt).length,
      critical: alerts.filter((a: any) => a.severity === 'critical').length,
      high: alerts.filter((a: any) => a.severity === 'high').length,
      medium: alerts.filter((a: any) => a.severity === 'medium').length,
      low: alerts.filter((a: any) => a.severity === 'low').length,
      byType: Object.fromEntries(
        Array.from(
          new Set(alerts.map((a: any) => a.type)).values()
        ).map((type) => [type, alerts.filter((a: any) => a.type === type).length])
      ),
    };
  }
}

export const alertingSystem = new AlertingSystem();
