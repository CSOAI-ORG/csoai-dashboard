/**
 * Notification Email Templates
 * Automated email templates for the notification preferences system
 * Integrates with existing Resend email infrastructure
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'CSOAI <noreply@csoai.org>';
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'https://coai.manus.space';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email template for compliance alerts
 */
export async function sendComplianceAlertEmail(
  to: string,
  userName: string,
  alertTitle: string,
  alertDescription: string,
  systemName: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  alertUrl: string
): Promise<EmailResult> {
  try {
    const severityColors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };

    const severityEmojis = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🚨',
      critical: '🔴'
    };

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${severityEmojis[severity]} Compliance Alert: ${alertTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6; 
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header { 
      background: ${severityColors[severity]};
      color: white; 
      padding: 30px;
      text-align: center;
    }
    .content { 
      padding: 30px;
    }
    .alert-box {
      background: #fef2f2;
      border-left: 4px solid ${severityColors[severity]};
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .cta-button {
      display: inline-block;
      background: ${severityColors[severity]};
      color: white;
      padding: 12px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 15px 0;
    }
    .footer { 
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${severityEmojis[severity]} Compliance Alert</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.95;">Severity: ${severity.toUpperCase()}</p>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>A new compliance alert has been detected for your AI system:</p>
      
      <div class="alert-box">
        <h3 style="margin-top: 0; color: ${severityColors[severity]};">${alertTitle}</h3>
        <p><strong>System:</strong> ${systemName}</p>
        <p><strong>Description:</strong> ${alertDescription}</p>
        <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
      </div>
      
      <p>Please review this alert and take appropriate action to ensure compliance.</p>
      
      <div style="text-align: center;">
        <a href="${alertUrl}" class="cta-button">View Alert Details →</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        You're receiving this email because you have compliance alerts enabled in your notification preferences.
        <a href="${FRONTEND_URL}/notification-preferences" style="color: #10b981;">Manage preferences</a>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>CSOAI - Council of AIs</strong></p>
      <p><a href="${FRONTEND_URL}/dashboard">Dashboard</a> • <a href="${FRONTEND_URL}/settings">Settings</a></p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[NotificationEmail] Error sending compliance alert:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[NotificationEmail] Error sending compliance alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Email template for system updates
 */
export async function sendSystemUpdateEmail(
  to: string,
  userName: string,
  updateTitle: string,
  updateDescription: string,
  updateType: 'feature' | 'maintenance' | 'security' | 'announcement'
): Promise<EmailResult> {
  try {
    const typeEmojis = {
      feature: '✨',
      maintenance: '🔧',
      security: '🔒',
      announcement: '📢'
    };

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${typeEmojis[updateType]} CSOAI Update: ${updateTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6; 
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header { 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white; 
      padding: 30px;
      text-align: center;
    }
    .content { 
      padding: 30px;
    }
    .update-box {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer { 
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${typeEmojis[updateType]} System Update</h1>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <div class="update-box">
        <h3 style="margin-top: 0; color: #10b981;">${updateTitle}</h3>
        <p>${updateDescription}</p>
      </div>
      
      <p>For more details, visit your <a href="${FRONTEND_URL}/dashboard" style="color: #10b981;">dashboard</a>.</p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        You're receiving this email because you have system updates enabled in your notification preferences.
        <a href="${FRONTEND_URL}/notification-preferences" style="color: #10b981;">Manage preferences</a>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>CSOAI - Council of AIs</strong></p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[NotificationEmail] Error sending system update:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[NotificationEmail] Error sending system update:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Email template for PDCA cycle updates
 */
export async function sendPDCACycleUpdateEmail(
  to: string,
  userName: string,
  cycleName: string,
  systemName: string,
  phase: 'Plan' | 'Do' | 'Check' | 'Act',
  status: string,
  cycleUrl: string
): Promise<EmailResult> {
  try {
    const phaseEmojis = {
      Plan: '📋',
      Do: '⚙️',
      Check: '🔍',
      Act: '✅'
    };

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${phaseEmojis[phase]} PDCA Update: ${cycleName} - ${phase} Phase`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6; 
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header { 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white; 
      padding: 30px;
      text-align: center;
    }
    .content { 
      padding: 30px;
    }
    .cycle-box {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .cta-button {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 12px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 15px 0;
    }
    .footer { 
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${phaseEmojis[phase]} PDCA Cycle Update</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.95;">${phase} Phase</p>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Your PDCA cycle has been updated:</p>
      
      <div class="cycle-box">
        <h3 style="margin-top: 0; color: #10b981;">${cycleName}</h3>
        <p><strong>System:</strong> ${systemName}</p>
        <p><strong>Current Phase:</strong> ${phase}</p>
        <p><strong>Status:</strong> ${status}</p>
      </div>
      
      <div style="text-align: center;">
        <a href="${cycleUrl}" class="cta-button">View PDCA Cycle →</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        You're receiving this email because you have PDCA updates enabled in your notification preferences.
        <a href="${FRONTEND_URL}/notification-preferences" style="color: #10b981;">Manage preferences</a>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>CSOAI - Council of AIs</strong></p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[NotificationEmail] Error sending PDCA update:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[NotificationEmail] Error sending PDCA update:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Email template for training reminders
 */
export async function sendTrainingReminderEmail(
  to: string,
  userName: string,
  courseName: string,
  progressPercentage: number,
  courseUrl: string
): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `📚 Training Reminder: Continue ${courseName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6; 
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header { 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white; 
      padding: 30px;
      text-align: center;
    }
    .content { 
      padding: 30px;
    }
    .progress-bar {
      background: #e5e7eb;
      height: 20px;
      border-radius: 10px;
      overflow: hidden;
      margin: 20px 0;
    }
    .progress-fill {
      background: #10b981;
      height: 100%;
      width: ${progressPercentage}%;
      transition: width 0.3s;
    }
    .cta-button {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 12px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 15px 0;
    }
    .footer { 
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 Training Reminder</h1>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>You're making great progress on <strong>${courseName}</strong>! Keep up the momentum.</p>
      
      <p><strong>Your Progress:</strong></p>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
      <p style="text-align: center; font-weight: 600; color: #10b981;">${progressPercentage}% Complete</p>
      
      <p>Continue your learning journey and get one step closer to certification!</p>
      
      <div style="text-align: center;">
        <a href="${courseUrl}" class="cta-button">Continue Course →</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        You're receiving this email because you have training reminders enabled in your notification preferences.
        <a href="${FRONTEND_URL}/notification-preferences" style="color: #10b981;">Manage preferences</a>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>CSOAI - Council of AIs</strong></p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[NotificationEmail] Error sending training reminder:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[NotificationEmail] Error sending training reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Email template for case assignment notifications
 */
export async function sendCaseAssignmentEmail(
  to: string,
  userName: string,
  caseId: number,
  caseTitle: string,
  systemName: string,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  caseUrl: string
): Promise<EmailResult> {
  try {
    const priorityColors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      urgent: '#dc2626'
    };

    const priorityEmojis = {
      low: '📋',
      medium: '⚠️',
      high: '🚨',
      urgent: '🔴'
    };

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${priorityEmojis[priority]} New Case Assignment: ${caseTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6; 
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header { 
      background: ${priorityColors[priority]};
      color: white; 
      padding: 30px;
      text-align: center;
    }
    .content { 
      padding: 30px;
    }
    .case-box {
      background: #f0fdf4;
      border-left: 4px solid ${priorityColors[priority]};
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .cta-button {
      display: inline-block;
      background: ${priorityColors[priority]};
      color: white;
      padding: 12px 28px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 15px 0;
    }
    .footer { 
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${priorityEmojis[priority]} New Case Assignment</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.95;">Priority: ${priority.toUpperCase()}</p>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>A new case has been assigned to you for review:</p>
      
      <div class="case-box">
        <h3 style="margin-top: 0; color: ${priorityColors[priority]};">${caseTitle}</h3>
        <p><strong>Case ID:</strong> #${caseId}</p>
        <p><strong>System:</strong> ${systemName}</p>
        <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
      </div>
      
      <p>Please review this case and provide your analysis.</p>
      
      <div style="text-align: center;">
        <a href="${caseUrl}" class="cta-button">Review Case →</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        You're receiving this email because you have case assignments enabled in your notification preferences.
        <a href="${FRONTEND_URL}/notification-preferences" style="color: #10b981;">Manage preferences</a>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>CSOAI - Council of AIs</strong></p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[NotificationEmail] Error sending case assignment:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[NotificationEmail] Error sending case assignment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Email template for notification preference confirmation
 */
export async function sendPreferenceUpdateConfirmationEmail(
  to: string,
  userName: string,
  updatedPreferences: string[]
): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: '✅ Notification Preferences Updated',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6; 
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header { 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white; 
      padding: 30px;
      text-align: center;
    }
    .content { 
      padding: 30px;
    }
    .preferences-list {
      background: #f0fdf4;
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
    }
    .preferences-list ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .preferences-list li {
      margin: 8px 0;
    }
    .footer { 
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Preferences Updated</h1>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Your notification preferences have been successfully updated.</p>
      
      <div class="preferences-list">
        <strong>Active Notifications:</strong>
        <ul>
          ${updatedPreferences.map(pref => `<li>${pref}</li>`).join('')}
        </ul>
      </div>
      
      <p>You can update your preferences at any time from your <a href="${FRONTEND_URL}/notification-preferences" style="color: #10b981;">notification settings</a>.</p>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The CSOAI Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>CSOAI - Council of AIs</strong></p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[NotificationEmail] Error sending preference confirmation:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[NotificationEmail] Error sending preference confirmation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}
