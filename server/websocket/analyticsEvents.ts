/**
 * Analytics WebSocket Events
 * Broadcast real-time updates for incidents and compliance changes
 */

import { WebSocket } from 'ws';
import { getDb } from '../db';
import { watchdogReports, assessments, aiSystems, frameworks } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

// Store reference to WebSocket server (will be set by server.ts)
let wsServer: any = null;

export function setWebSocketServer(wss: any): void {
  wsServer = wss;
}

/**
 * Broadcast new incident to all connected clients
 */
export async function broadcastNewIncident(incidentId: number): Promise<void> {
  if (!wsServer) {
    console.warn('[AnalyticsEvents] WebSocket server not initialized');
    return;
  }

  const db = await getDb();
  if (!db) return;

  try {
    // Fetch incident details
    const [incident] = await db
      .select()
      .from(watchdogReports)
      .where(eq(watchdogReports.id, incidentId))
      .limit(1);

    if (!incident) return;

    const message = {
      type: 'incident_created',
      data: {
        id: incident.id,
        title: incident.title,
        severity: incident.severity,
        incidentType: incident.incidentType,
        aiSystemName: incident.aiSystemName,
        companyName: incident.companyName,
        status: incident.status,
        createdAt: incident.createdAt,
      },
      timestamp: Date.now(),
    };

    broadcast(message);
    console.log(`[AnalyticsEvents] Broadcasted new incident: ${incident.title}`);
  } catch (error) {
    console.error('[AnalyticsEvents] Error broadcasting new incident:', error);
  }
}

/**
 * Broadcast incident status update
 */
export async function broadcastIncidentUpdate(incidentId: number): Promise<void> {
  if (!wsServer) return;

  const db = await getDb();
  if (!db) return;

  try {
    const [incident] = await db
      .select()
      .from(watchdogReports)
      .where(eq(watchdogReports.id, incidentId))
      .limit(1);

    if (!incident) return;

    const message = {
      type: 'incident_updated',
      data: {
        id: incident.id,
        title: incident.title,
        severity: incident.severity,
        status: incident.status,
        updatedAt: incident.updatedAt,
      },
      timestamp: Date.now(),
    };

    broadcast(message);
    console.log(`[AnalyticsEvents] Broadcasted incident update: ${incident.title}`);
  } catch (error) {
    console.error('[AnalyticsEvents] Error broadcasting incident update:', error);
  }
}

/**
 * Broadcast new compliance assessment
 */
export async function broadcastNewAssessment(assessmentId: number): Promise<void> {
  if (!wsServer) return;

  const db = await getDb();
  if (!db) return;

  try {
    const [assessment] = await db
      .select({
        id: assessments.id,
        aiSystemId: assessments.aiSystemId,
        frameworkId: assessments.frameworkId,
        overallScore: assessments.overallScore,
        status: assessments.status,
        createdAt: assessments.createdAt,
      })
      .from(assessments)
      .where(eq(assessments.id, assessmentId))
      .limit(1);

    if (!assessment) return;

    // Get AI system name
    const [aiSystem] = await db
      .select({ name: aiSystems.name })
      .from(aiSystems)
      .where(eq(aiSystems.id, assessment.aiSystemId))
      .limit(1);

    // Get framework name
    const [framework] = await db
      .select({ name: frameworks.name })
      .from(frameworks)
      .where(eq(frameworks.id, assessment.frameworkId))
      .limit(1);

    const message = {
      type: 'compliance_assessment_created',
      data: {
        id: assessment.id,
        aiSystemName: aiSystem?.name || 'Unknown System',
        frameworkName: framework?.name || 'Unknown Framework',
        score: assessment.overallScore ? parseFloat(assessment.overallScore as string) : 0,
        status: assessment.status,
        createdAt: assessment.createdAt,
      },
      timestamp: Date.now(),
    };

    broadcast(message);
    console.log(`[AnalyticsEvents] Broadcasted new assessment for ${aiSystem?.name}`);
  } catch (error) {
    console.error('[AnalyticsEvents] Error broadcasting new assessment:', error);
  }
}

/**
 * Broadcast compliance score change
 */
export async function broadcastComplianceScoreChange(assessmentId: number, previousScore: number): Promise<void> {
  if (!wsServer) return;

  const db = await getDb();
  if (!db) return;

  try {
    const [assessment] = await db
      .select({
        id: assessments.id,
        aiSystemId: assessments.aiSystemId,
        frameworkId: assessments.frameworkId,
        overallScore: assessments.overallScore,
      })
      .from(assessments)
      .where(eq(assessments.id, assessmentId))
      .limit(1);

    if (!assessment) return;

    const currentScore = assessment.overallScore ? parseFloat(assessment.overallScore as string) : 0;
    const change = currentScore - previousScore;

    // Get AI system name
    const [aiSystem] = await db
      .select({ name: aiSystems.name })
      .from(aiSystems)
      .where(eq(aiSystems.id, assessment.aiSystemId))
      .limit(1);

    // Get framework name
    const [framework] = await db
      .select({ name: frameworks.name })
      .from(frameworks)
      .where(eq(frameworks.id, assessment.frameworkId))
      .limit(1);

    const message = {
      type: 'compliance_score_changed',
      data: {
        id: assessment.id,
        aiSystemName: aiSystem?.name || 'Unknown System',
        frameworkName: framework?.name || 'Unknown Framework',
        previousScore,
        currentScore,
        change,
        improved: change > 0,
      },
      timestamp: Date.now(),
    };

    broadcast(message);
    console.log(`[AnalyticsEvents] Broadcasted compliance score change for ${aiSystem?.name}: ${change > 0 ? '+' : ''}${change.toFixed(1)}%`);
  } catch (error) {
    console.error('[AnalyticsEvents] Error broadcasting compliance score change:', error);
  }
}

/**
 * Broadcast analytics summary update
 */
export function broadcastAnalyticsSummary(summary: {
  totalIncidents: number;
  criticalIncidents: number;
  avgComplianceScore: number;
  recentActivity: string;
}): void {
  if (!wsServer) return;

  const message = {
    type: 'analytics_summary_updated',
    data: summary,
    timestamp: Date.now(),
  };

  broadcast(message);
  console.log('[AnalyticsEvents] Broadcasted analytics summary update');
}

/**
 * Helper function to broadcast message to all connected clients
 */
function broadcast(message: any): void {
  if (!wsServer || !wsServer.clients) return;

  const messageStr = JSON.stringify(message);
  
  wsServer.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

/**
 * Get count of connected clients
 */
export function getConnectedClientsCount(): number {
  if (!wsServer || !wsServer.clients) return 0;
  
  let count = 0;
  wsServer.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      count++;
    }
  });
  
  return count;
}
