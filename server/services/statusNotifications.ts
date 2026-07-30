/**
 * Status Page Notification Service
 * Handles email notifications for incident creation, updates, and resolution
 */

import { getDb } from "../db";
import { statusSubscriptions, systemIncidents, incidentUpdates, serviceStatus } from "../../drizzle/schema-status";
import { eq, and } from "drizzle-orm";
import { Resend } from 'resend';

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

const FROM_EMAIL = 'CSOAI Status <status@csoai.org>';

async function sendEmail(params: { to: string; subject: string; html: string }) {
  const { data, error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
  
  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
  
  return data;
}

interface NotificationContext {
  incident: {
    id: number;
    title: string;
    description: string;
    status: string;
    severity: string;
    affectedServices: string;
    startedAt: string;
    resolvedAt: string | null;
  };
  update?: {
    message: string;
    status: string;
    createdAt: string;
  };
}

/**
 * Send incident notification to all active subscribers
 */
export async function notifyIncidentCreated(incidentId: number) {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    return;
  }
  
  // Get incident details
  const [incident] = await db
    .select()
    .from(systemIncidents)
    .where(eq(systemIncidents.id, incidentId))
    .limit(1);
  
  if (!incident) {
    console.error(`Incident ${incidentId} not found`);
    return;
  }
  
  // Get all active subscribers who want incident notifications
  // Note: tinyint columns use 1/0 instead of true/false in MySQL
  const subscribers = await db
    .select()
    .from(statusSubscriptions)
    .where(
      and(
        eq(statusSubscriptions.isActive, 1),
        eq(statusSubscriptions.notifyOnIncident, 1)
      )
    );
  
  // Parse affected services
  const affectedServices = incident.affectedServices 
    ? JSON.parse(incident.affectedServices) 
    : [];
  
  // Filter subscribers based on service interest
  const relevantSubscribers = subscribers.filter((sub: any) => {
    if (!sub.services) return true; // Notify all if no specific services
    const subscribedServices = JSON.parse(sub.services);
    return affectedServices.some((svc: string) => subscribedServices.includes(svc));
  });
  
  console.log(`Notifying ${relevantSubscribers.length} subscribers about incident ${incidentId}`);
  
  // Send emails
  const emailPromises = relevantSubscribers
    .filter((sub: any) => sub.email)
    .map((sub: any) => sendIncidentEmail(sub.email!, incident, 'created'));
  
  await Promise.allSettled(emailPromises);
}

/**
 * Send incident update notification to all active subscribers
 */
export async function notifyIncidentUpdated(incidentId: number, updateMessage: string) {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    return;
  }
  
  // Get incident details
  const [incident] = await db
    .select()
    .from(systemIncidents)
    .where(eq(systemIncidents.id, incidentId))
    .limit(1);
  
  if (!incident) {
    console.error(`Incident ${incidentId} not found`);
    return;
  }
  
  // Get all active subscribers who want incident notifications
  // Note: tinyint columns use 1/0 instead of true/false in MySQL
  const subscribers = await db
    .select()
    .from(statusSubscriptions)
    .where(
      and(
        eq(statusSubscriptions.isActive, 1),
        eq(statusSubscriptions.notifyOnIncident, 1)
      )
    );
  
  // Parse affected services
  const affectedServices = incident.affectedServices 
    ? JSON.parse(incident.affectedServices) 
    : [];
  
  // Filter subscribers based on service interest
  const relevantSubscribers = subscribers.filter((sub: any) => {
    if (!sub.services) return true;
    const subscribedServices = JSON.parse(sub.services);
    return affectedServices.some((svc: string) => subscribedServices.includes(svc));
  });
  
  console.log(`Notifying ${relevantSubscribers.length} subscribers about incident ${incidentId} update`);
  
  // Send emails
  const emailPromises = relevantSubscribers
    .filter((sub: any) => sub.email)
    .map((sub: any) => sendIncidentEmail(sub.email!, incident, 'updated', updateMessage));
  
  await Promise.allSettled(emailPromises);
}

/**
 * Send incident resolution notification to all active subscribers
 */
export async function notifyIncidentResolved(incidentId: number) {
  const db = await getDb();
  if (!db) {
    console.error('Database connection failed');
    return;
  }
  
  // Get incident details
  const [incident] = await db
    .select()
    .from(systemIncidents)
    .where(eq(systemIncidents.id, incidentId))
    .limit(1);
  
  if (!incident) {
    console.error(`Incident ${incidentId} not found`);
    return;
  }
  
  // Get all active subscribers who want resolution notifications
  // Note: tinyint columns use 1/0 instead of true/false in MySQL
  const subscribers = await db
    .select()
    .from(statusSubscriptions)
    .where(
      and(
        eq(statusSubscriptions.isActive, 1),
        eq(statusSubscriptions.notifyOnResolution, 1)
      )
    );
  
  // Parse affected services
  const affectedServices = incident.affectedServices 
    ? JSON.parse(incident.affectedServices) 
    : [];
  
  // Filter subscribers based on service interest
  const relevantSubscribers = subscribers.filter((sub: any) => {
    if (!sub.services) return true;
    const subscribedServices = JSON.parse(sub.services);
    return affectedServices.some((svc: string) => subscribedServices.includes(svc));
  });
  
  console.log(`Notifying ${relevantSubscribers.length} subscribers about incident ${incidentId} resolution`);
  
  // Send emails
  const emailPromises = relevantSubscribers
    .filter((sub: any) => sub.email)
    .map((sub: any) => sendIncidentEmail(sub.email!, incident, 'resolved'));
  
  await Promise.allSettled(emailPromises);
}

/**
 * Send incident email notification
 */
async function sendIncidentEmail(
  email: string,
  incident: any,
  type: 'created' | 'updated' | 'resolved',
  updateMessage?: string
) {
  const severityEmoji = ({
    minor: '⚠️',
    major: '🔴',
    critical: '🚨'
  } as Record<string, string>)[incident.severity] || '⚠️';
  
  const statusEmoji = ({
    investigating: '🔍',
    identified: '✅',
    monitoring: '👀',
    resolved: '✅'
  } as Record<string, string>)[incident.status] || '🔍';
  
  let subject = '';
  let htmlContent = '';
  
  if (type === 'created') {
    subject = `${severityEmoji} New Incident: ${incident.title}`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">CSOAI Status Update</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">
              ${severityEmoji} New Incident Detected
            </h2>
            
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
              <h3 style="color: #991b1b; margin: 0 0 10px 0;">${incident.title}</h3>
              <p style="color: #7f1d1d; margin: 0;">${incident.description}</p>
            </div>
            
            <table style="width: 100%; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Status:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${statusEmoji} ${incident.status}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Severity:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${severityEmoji} ${incident.severity}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Started:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${new Date(incident.startedAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Affected Services:</strong></td>
                <td style="padding: 10px;">${incident.affectedServices ? JSON.parse(incident.affectedServices).join(', ') : 'All services'}</td>
              </tr>
            </table>
            
            <p style="color: #6b7280; margin: 20px 0;">
              We're investigating this issue and will provide updates as we learn more.
            </p>
            
            <a href="${process.env.VITE_FRONTEND_URL}/status" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin: 10px 0;">
              View Status Page
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>You're receiving this because you subscribed to CSOAI status updates.</p>
          <p>
            <a href="${process.env.VITE_FRONTEND_URL}/status?unsubscribe=${email}" 
               style="color: #667eea; text-decoration: none;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `;
  } else if (type === 'updated') {
    subject = `${statusEmoji} Incident Update: ${incident.title}`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">CSOAI Status Update</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">
              ${statusEmoji} Incident Update
            </h2>
            
            <h3 style="color: #374151;">${incident.title}</h3>
            
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
              <p style="color: #1e40af; margin: 0;"><strong>Latest Update:</strong></p>
              <p style="color: #1e3a8a; margin: 10px 0 0 0;">${updateMessage || 'Investigating...'}</p>
            </div>
            
            <table style="width: 100%; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Current Status:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${statusEmoji} ${incident.status}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Severity:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${severityEmoji} ${incident.severity}</td>
              </tr>
            </table>
            
            <a href="${process.env.VITE_FRONTEND_URL}/status" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin: 10px 0;">
              View Full Details
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>You're receiving this because you subscribed to CSOAI status updates.</p>
          <p>
            <a href="${process.env.VITE_FRONTEND_URL}/status?unsubscribe=${email}" 
               style="color: #667eea; text-decoration: none;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `;
  } else { // resolved
    subject = `✅ Resolved: ${incident.title}`;
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">CSOAI Status Update</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; margin-top: 0;">
              ✅ Incident Resolved
            </h2>
            
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
              <h3 style="color: #065f46; margin: 0 0 10px 0;">${incident.title}</h3>
              <p style="color: #047857; margin: 0;">This incident has been resolved. All services are operating normally.</p>
            </div>
            
            <table style="width: 100%; margin: 20px 0;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Started:</strong></td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${new Date(incident.startedAt).toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 10px;"><strong>Resolved:</strong></td>
                <td style="padding: 10px;">${incident.resolvedAt ? new Date(incident.resolvedAt).toLocaleString() : 'Just now'}</td>
              </tr>
            </table>
            
            <p style="color: #6b7280; margin: 20px 0;">
              Thank you for your patience while we worked to resolve this issue.
            </p>
            
            <a href="${process.env.VITE_FRONTEND_URL}/status" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 6px; margin: 10px 0;">
              View Status Page
            </a>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
          <p>You're receiving this because you subscribed to CSOAI status updates.</p>
          <p>
            <a href="${process.env.VITE_FRONTEND_URL}/status?unsubscribe=${email}" 
               style="color: #667eea; text-decoration: none;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `;
  }
  
  try {
    await sendEmail({
      to: email,
      subject,
      html: htmlContent,
    });
    console.log(`Sent ${type} notification to ${email} for incident ${incident.id}`);
  } catch (error) {
    console.error(`Failed to send ${type} notification to ${email}:`, error);
  }
}
