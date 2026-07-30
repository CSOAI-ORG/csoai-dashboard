/**
 * PDCA Notification Service
 * Handles email notifications for PDCA cycle events
 */

import { getDb } from '../db';
import { pdcaCycles, aiSystems, users, notificationPreferences } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

// Phase display names
const PHASE_NAMES: Record<string, string> = {
  plan: 'Plan',
  do: 'Do',
  check: 'Check',
  act: 'Act',
};

// Get phase display name
function getPhaseDisplayName(phase: string): string {
  return PHASE_NAMES[phase] || phase.charAt(0).toUpperCase() + phase.slice(1);
}

// Check if user has email notifications enabled
async function isEmailNotificationEnabled(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return true; // Default to enabled if db not available

  const [prefs] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  // If no preferences set, default to enabled
  if (!prefs) return true;

  return prefs.emailEnabled === 1;
}

// Get Resend client
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[PDCA Notifications] RESEND_API_KEY not configured');
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Send notification when a PDCA cycle advances to a new phase
 */
export async function sendPDCAPhaseAdvanceNotification(
  cycleId: number,
  previousPhase: string,
  newPhase: string,
  isCompleted: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }

    // Get cycle details with AI system and user info
    const [cycle] = await db
      .select({
        id: pdcaCycles.id,
        cycleNumber: pdcaCycles.cycleNumber,
        aiSystemId: pdcaCycles.aiSystemId,
        aiSystemName: aiSystems.name,
        userId: aiSystems.userId,
        userEmail: users.email,
        userName: users.name,
      })
      .from(pdcaCycles)
      .leftJoin(aiSystems, eq(pdcaCycles.aiSystemId, aiSystems.id))
      .leftJoin(users, eq(aiSystems.userId, users.id))
      .where(eq(pdcaCycles.id, cycleId))
      .limit(1);

    if (!cycle) {
      return { success: false, error: 'Cycle not found' };
    }

    if (!cycle.userEmail) {
      return { success: false, error: 'User email not found' };
    }

    // Check notification preferences
    if (cycle.userId) {
      const emailEnabled = await isEmailNotificationEnabled(cycle.userId);
      if (!emailEnabled) {
        return { success: true }; // Silently skip if disabled
      }
    }

    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const previousPhaseName = getPhaseDisplayName(previousPhase);
    const newPhaseName = getPhaseDisplayName(newPhase);

    const subject = isCompleted
      ? `PDCA Cycle #${cycle.cycleNumber} Completed - ${cycle.aiSystemName}`
      : `PDCA Cycle #${cycle.cycleNumber} Advanced to ${newPhaseName} Phase`;

    const htmlContent = isCompleted
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">🎉 PDCA Cycle Completed!</h2>
          <p>Hello ${cycle.userName || 'there'},</p>
          <p>Great news! Your PDCA improvement cycle has been successfully completed.</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Cycle:</strong> #${cycle.cycleNumber}</p>
            <p style="margin: 8px 0 0;"><strong>AI System:</strong> ${cycle.aiSystemName}</p>
            <p style="margin: 8px 0 0;"><strong>Status:</strong> <span style="color: #10b981;">Completed</span></p>
          </div>
          <p>Review the cycle results and consider starting a new improvement cycle to continue enhancing your AI system.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            This is an automated notification from the COAI Dashboard.
          </p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">📊 PDCA Cycle Phase Advanced</h2>
          <p>Hello ${cycle.userName || 'there'},</p>
          <p>Your PDCA improvement cycle has advanced to a new phase.</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Cycle:</strong> #${cycle.cycleNumber}</p>
            <p style="margin: 8px 0 0;"><strong>AI System:</strong> ${cycle.aiSystemName}</p>
            <p style="margin: 8px 0 0;"><strong>Previous Phase:</strong> ${previousPhaseName}</p>
            <p style="margin: 8px 0 0;"><strong>New Phase:</strong> <span style="color: #3b82f6; font-weight: bold;">${newPhaseName}</span></p>
          </div>
          <p>Log in to the dashboard to continue working on this phase.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
            This is an automated notification from the COAI Dashboard.
          </p>
        </div>
      `;

    const { error } = await resend.emails.send({
      from: 'COAI Dashboard <notifications@coai.example.com>',
      to: cycle.userEmail,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('[PDCA Notifications] Failed to send email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[PDCA Notifications] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send notification when a linked Watchdog incident is updated
 */
export async function sendLinkedIncidentUpdateNotification(
  cycleId: number,
  incidentId: number,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }

    // Get cycle details with AI system and user info
    const [cycle] = await db
      .select({
        id: pdcaCycles.id,
        cycleNumber: pdcaCycles.cycleNumber,
        phase: pdcaCycles.phase,
        aiSystemName: aiSystems.name,
        userId: aiSystems.userId,
        userEmail: users.email,
        userName: users.name,
      })
      .from(pdcaCycles)
      .leftJoin(aiSystems, eq(pdcaCycles.aiSystemId, aiSystems.id))
      .leftJoin(users, eq(aiSystems.userId, users.id))
      .where(eq(pdcaCycles.id, cycleId))
      .limit(1);

    if (!cycle) {
      return { success: false, error: 'Cycle not found' };
    }

    if (!cycle.userEmail) {
      return { success: false, error: 'User email not found' };
    }

    // Check notification preferences
    if (cycle.userId) {
      const emailEnabled = await isEmailNotificationEnabled(cycle.userId);
      if (!emailEnabled) {
        return { success: true }; // Silently skip if disabled
      }
    }

    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: 'Email service not configured' };
    }

    const statusColors: Record<string, string> = {
      resolved: '#10b981',
      dismissed: '#f59e0b',
      investigating: '#3b82f6',
      under_review: '#8b5cf6',
    };

    const statusColor = statusColors[newStatus] || '#6b7280';

    const subject = `Linked Incident #${incidentId} Updated - PDCA Cycle #${cycle.cycleNumber}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">🔔 Linked Incident Updated</h2>
        <p>Hello ${cycle.userName || 'there'},</p>
        <p>A Watchdog incident linked to your PDCA cycle has been updated.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>PDCA Cycle:</strong> #${cycle.cycleNumber} (${getPhaseDisplayName(cycle.phase || 'plan')} phase)</p>
          <p style="margin: 8px 0 0;"><strong>AI System:</strong> ${cycle.aiSystemName}</p>
          <p style="margin: 8px 0 0;"><strong>Incident ID:</strong> #${incidentId}</p>
          <p style="margin: 8px 0 0;"><strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${newStatus.replace('_', ' ').toUpperCase()}</span></p>
        </div>
        <p>This update may affect your improvement cycle. Log in to review the details.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
          This is an automated notification from the COAI Dashboard.
        </p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from: 'COAI Dashboard <notifications@coai.example.com>',
      to: cycle.userEmail,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('[PDCA Notifications] Failed to send email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[PDCA Notifications] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
