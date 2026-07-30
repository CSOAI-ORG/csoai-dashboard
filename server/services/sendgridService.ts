/**
 * SendGrid Email Service
 * Handles email delivery for notifications, alerts, and reports
 */

import sgMail from '@sendgrid/mail';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface PhaseCompletionEmail {
  recipientEmail: string;
  phaseName: string;
  phaseNumber: number;
  completedAt: Date;
  organizationName: string;
  dashboardUrl: string;
}

interface AlertEmail {
  recipientEmail: string;
  alertTitle: string;
  alertMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  alertUrl: string;
}

interface DigestEmail {
  recipientEmail: string;
  organizationName: string;
  alerts: Array<{ title: string; severity: string; timestamp: Date }>;
  completedPhases: string[];
  upcomingDeadlines: Array<{ name: string; dueDate: Date }>;
}

export class SendGridService {
  private initialized = false;
  private fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@coai-dashboard.com';
  private fromName = 'COAI Dashboard';

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.initialized = true;
      console.log('[SendGrid] Service initialized');
    } else {
      console.warn('[SendGrid] API key not configured. Email sending will be disabled.');
    }
  }

  /**
   * Send phase completion email
   */
  public async sendPhaseCompletionEmail(data: PhaseCompletionEmail): Promise<void> {
    if (!this.initialized) {
      console.log('[SendGrid] Skipping email (not configured):', data.recipientEmail);
      return;
    }

    try {
      const template = this.generatePhaseCompletionTemplate(data);

      const msg = {
        to: data.recipientEmail,
        from: { email: this.fromEmail, name: this.fromName },
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: 'support@coai-dashboard.com',
      };

      const response = await sgMail.send(msg);
      console.log(`[SendGrid] Phase completion email sent to ${data.recipientEmail}:`, response[0].statusCode);
    } catch (error) {
      console.error('[SendGrid] Error sending phase completion email:', error);
      throw error;
    }
  }

  /**
   * Send alert notification email
   */
  public async sendAlertEmail(data: AlertEmail): Promise<void> {
    if (!this.initialized) {
      console.log('[SendGrid] Skipping email (not configured):', data.recipientEmail);
      return;
    }

    try {
      const template = this.generateAlertTemplate(data);

      const msg = {
        to: data.recipientEmail,
        from: { email: this.fromEmail, name: this.fromName },
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: 'support@coai-dashboard.com',
      };

      const response = await sgMail.send(msg);
      console.log(`[SendGrid] Alert email sent to ${data.recipientEmail}:`, response[0].statusCode);
    } catch (error) {
      console.error('[SendGrid] Error sending alert email:', error);
      throw error;
    }
  }

  /**
   * Send digest email
   */
  public async sendDigestEmail(data: DigestEmail): Promise<void> {
    if (!this.initialized) {
      console.log('[SendGrid] Skipping email (not configured):', data.recipientEmail);
      return;
    }

    try {
      const template = this.generateDigestTemplate(data);

      const msg = {
        to: data.recipientEmail,
        from: { email: this.fromEmail, name: this.fromName },
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: 'support@coai-dashboard.com',
      };

      const response = await sgMail.send(msg);
      console.log(`[SendGrid] Digest email sent to ${data.recipientEmail}:`, response[0].statusCode);
    } catch (error) {
      console.error('[SendGrid] Error sending digest email:', error);
      throw error;
    }
  }

  /**
   * Generate phase completion email template
   */
  private generatePhaseCompletionTemplate(data: PhaseCompletionEmail): EmailTemplate {
    const completedDate = data.completedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; }
            .content { padding: 30px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
            .phase-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Phase Completed!</h1>
              <p>Excellent progress on your compliance roadmap</p>
            </div>

            <div class="content">
              <p>Hi there,</p>

              <p>We're excited to inform you that <strong>Phase ${data.phaseNumber}: ${data.phaseName}</strong> has been completed!</p>

              <div class="phase-info">
                <h3>${data.phaseName}</h3>
                <p><strong>Completed:</strong> ${completedDate}</p>
                <p><strong>Organization:</strong> ${data.organizationName}</p>
              </div>

              <p>All required actions for this phase have been successfully completed. Your team is making excellent progress toward full compliance.</p>

              <p>Next steps:</p>
              <ul>
                <li>Review the next phase in your roadmap</li>
                <li>Assign actions to team members</li>
                <li>Track progress with real-time dashboards</li>
              </ul>

              <a href="${data.dashboardUrl}" class="button">View Dashboard</a>

              <div class="footer">
                <p>COAI Dashboard • AI Safety Certification Platform</p>
                <p>© 2025 All rights reserved</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Phase ${data.phaseNumber}: ${data.phaseName} Completed

Excellent progress! Phase ${data.phaseNumber} (${data.phaseName}) has been completed on ${completedDate}.

Organization: ${data.organizationName}

View your dashboard: ${data.dashboardUrl}

COAI Dashboard • AI Safety Certification Platform
    `;

    return {
      subject: `✅ Phase ${data.phaseNumber} Complete: ${data.phaseName}`,
      html,
      text: text.trim(),
    };
  }

  /**
   * Generate alert email template
   */
  private generateAlertTemplate(data: AlertEmail): EmailTemplate {
    const severityColor = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#7c2d12',
    }[data.severity];

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert-header { background: ${severityColor}; color: white; padding: 20px; border-radius: 8px; }
            .content { padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
            .alert-body { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${severityColor}; margin: 20px 0; }
            .button { display: inline-block; background: ${severityColor}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="alert-header">
              <h1>⚠️ Alert: ${data.alertTitle}</h1>
              <p>Severity: <strong>${data.severity.toUpperCase()}</strong></p>
            </div>

            <div class="content">
              <p>Hi there,</p>

              <div class="alert-body">
                <h3>${data.alertTitle}</h3>
                <p>${data.alertMessage}</p>
              </div>

              <p>Please review this alert and take appropriate action. Click the button below to view details and respond.</p>

              <a href="${data.alertUrl}" class="button">View Alert</a>

              <div class="footer">
                <p>COAI Dashboard • AI Safety Certification Platform</p>
                <p>© 2025 All rights reserved</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Alert: ${data.alertTitle}

Severity: ${data.severity.toUpperCase()}

${data.alertMessage}

View alert: ${data.alertUrl}

COAI Dashboard • AI Safety Certification Platform
    `;

    return {
      subject: `[${data.severity.toUpperCase()}] ${data.alertTitle}`,
      html,
      text: text.trim(),
    };
  }

  /**
   * Generate digest email template
   */
  private generateDigestTemplate(data: DigestEmail): EmailTemplate {
    const alertsHtml = data.alerts
      .map(
        (alert) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
          <strong>${alert.title}</strong><br>
          <small style="color: #6b7280;">Severity: ${alert.severity}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ${alert.timestamp.toLocaleDateString()}
        </td>
      </tr>
    `
      )
      .join('');

    const phasesHtml = data.completedPhases.map((phase) => `<li>${phase}</li>`).join('');

    const deadlinesHtml = data.upcomingDeadlines
      .map(
        (deadline) => `
      <li>
        <strong>${deadline.name}</strong> - Due ${deadline.dueDate.toLocaleDateString()}
      </li>
    `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 30px; border-radius: 8px; text-align: center; }
            .section { margin-top: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Weekly Digest</h1>
              <p>${data.organizationName}</p>
            </div>

            <div class="section">
              <div class="section-title">🔴 Recent Alerts (${data.alerts.length})</div>
              <table>
                ${alertsHtml}
              </table>
            </div>

            <div class="section">
              <div class="section-title">✅ Completed Phases</div>
              <ul>
                ${phasesHtml || '<li>No phases completed this week</li>'}
              </ul>
            </div>

            <div class="section">
              <div class="section-title">📅 Upcoming Deadlines</div>
              <ul>
                ${deadlinesHtml || '<li>No upcoming deadlines</li>'}
              </ul>
            </div>

            <a href="https://dashboard.coai.com" class="button">View Full Dashboard</a>

            <div class="footer">
              <p>COAI Dashboard • AI Safety Certification Platform</p>
              <p>© 2025 All rights reserved</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Weekly Digest - ${data.organizationName}

Recent Alerts (${data.alerts.length}):
${data.alerts.map((a: any) => `- ${a.title} (${a.severity})`).join('\n')}

Completed Phases:
${data.completedPhases.length > 0 ? data.completedPhases.map((p: any) => `- ${p}`).join('\n') : 'None'}

Upcoming Deadlines:
${data.upcomingDeadlines.length > 0 ? data.upcomingDeadlines.map((d: any) => `- ${d.name} (${d.dueDate.toLocaleDateString()})`).join('\n') : 'None'}

View dashboard: https://dashboard.coai.com

COAI Dashboard • AI Safety Certification Platform
    `;

    return {
      subject: `📊 Weekly Digest - ${data.organizationName}`,
      html,
      text: text.trim(),
    };
  }

  /**
   * Check if SendGrid is configured
   */
  public isConfigured(): boolean {
    return this.initialized;
  }
}

export const sendgridService = new SendGridService();
