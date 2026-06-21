/**
 * Byzantine Council Real-Time Voting Service
 *
 * Implements low-latency, real-time voting for the 33-Agent Council
 * with streaming updates and live AI inference integration.
 */

import { broadcastToUsers, RealtimeMessage } from '../websocket/server.js';
import { getDb } from '../db.js';
import { councilSessions, councilVotes, realtimeEvents } from '../../drizzle/schema.js';
import { eq } from 'drizzle-orm';

export interface VotingEvent {
  sessionId: number;
  agentId: number;
  agentName: string;
  decision: 'approve' | 'reject' | 'abstain';
  confidence: number;
  reasoning: string;
  timestamp: number;
  latency: number; // milliseconds
}

export interface CouncilVotingSession {
  sessionId: number;
  reportId: number;
  totalAgents: number;
  votesReceived: number;
  votesRequired: number;
  currentConsensus: 'pending' | 'approved' | 'rejected' | 'deadlocked';
  consensusThreshold: number;
  startTime: number;
  estimatedCompletionTime: number;
  liveMetrics: {
    approvalRate: number;
    rejectionRate: number;
    abstentionRate: number;
    averageLatency: number;
    maxLatency: number;
  };
}

// In-memory store for active voting sessions
const activeSessions = new Map<number, CouncilVotingSession>();

// Store for vote history with timestamps
const voteHistory = new Map<number, VotingEvent[]>();

function mapResultToStatus(
  result: 'approved' | 'rejected' | 'deadlocked'
): 'consensus_reached' | 'escalated_to_human' | 'completed' {
  if (result === 'approved' || result === 'rejected') return 'consensus_reached';
  return 'escalated_to_human';
}

function mapResultToFinalDecision(
  result: 'approved' | 'rejected' | 'deadlocked'
): 'approved' | 'rejected' | 'escalated' {
  if (result === 'approved') return 'approved';
  if (result === 'rejected') return 'rejected';
  return 'escalated';
}

/**
 * Start a new Byzantine Council voting session
 * Broadcasts initial session state to all connected users
 */
export async function startVotingSession(
  sessionId: number,
  reportId: number,
  userIds: number[]
): Promise<CouncilVotingSession> {
  const totalAgents = 33;
  const votesRequired = Math.ceil(totalAgents * 0.67); // 2/3 majority (Byzantine consensus)
  const startTime = Date.now();
  const estimatedCompletionTime = startTime + 30000; // 30 seconds for voting

  const session: CouncilVotingSession = {
    sessionId,
    reportId,
    totalAgents,
    votesReceived: 0,
    votesRequired,
    currentConsensus: 'pending',
    consensusThreshold: votesRequired,
    startTime,
    estimatedCompletionTime,
    liveMetrics: {
      approvalRate: 0,
      rejectionRate: 0,
      abstentionRate: 0,
      averageLatency: 0,
      maxLatency: 0,
    },
  };

  activeSessions.set(sessionId, session);
  voteHistory.set(sessionId, []);

  // Broadcast session start to all users
  const message: RealtimeMessage = {
    type: 'compliance_update',
    data: {
      event: 'voting_session_started',
      session,
    },
    timestamp: Date.now(),
  };

  broadcastToUsers(userIds, message);

  // Log to database
  const db = await getDb();
  if (db) {
    try {
      await db.insert(realtimeEvents).values({
        eventType: 'council_decision',
        title: 'Voting session started',
        description: `Council voting session ${sessionId} started for report ${reportId}`,
        severity: 'info',
        data: { event: 'voting_session_started', session },
      });
    } catch (error) {
      console.error('Failed to log voting session start:', error);
    }
  }

  return session;
}

/**
 * Record a vote from an AI agent
 * Updates session metrics and checks for consensus
 */
export async function recordVote(
  sessionId: number,
  votingEvent: VotingEvent,
  userIds: number[]
): Promise<void> {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  // Update vote history
  const history = voteHistory.get(sessionId) || [];
  history.push(votingEvent);
  voteHistory.set(sessionId, history);

  // Update metrics
  session.votesReceived = history.length;

  const approvals = history.filter((v) => v.decision === 'approve').length;
  const rejections = history.filter((v) => v.decision === 'reject').length;
  const abstentions = history.filter((v) => v.decision === 'abstain').length;

  session.liveMetrics.approvalRate = (approvals / history.length) * 100;
  session.liveMetrics.rejectionRate = (rejections / history.length) * 100;
  session.liveMetrics.abstentionRate = (abstentions / history.length) * 100;
  session.liveMetrics.averageLatency =
    history.reduce((sum, v) => sum + v.latency, 0) / history.length;
  session.liveMetrics.maxLatency = Math.max(...history.map((v) => v.latency));

  // Check for consensus
  if (approvals >= session.votesRequired) {
    session.currentConsensus = 'approved';
    await finalizeVotingSession(sessionId, 'approved', userIds);
    return;
  }

  if (rejections >= session.votesRequired) {
    session.currentConsensus = 'rejected';
    await finalizeVotingSession(sessionId, 'rejected', userIds);
    return;
  }

  // Check for deadlock (all votes in and no consensus)
  if (session.votesReceived >= session.totalAgents) {
    session.currentConsensus = 'deadlocked';
    await finalizeVotingSession(sessionId, 'deadlocked', userIds);
    return;
  }

  // Broadcast vote update
  const message: RealtimeMessage = {
    type: 'compliance_update',
    data: {
      event: 'agent_voted',
      votingEvent,
      sessionMetrics: {
        votesReceived: session.votesReceived,
        votesRequired: session.votesRequired,
        approvalRate: session.liveMetrics.approvalRate.toFixed(1),
        rejectionRate: session.liveMetrics.rejectionRate.toFixed(1),
        averageLatency: session.liveMetrics.averageLatency.toFixed(0),
        consensus: session.currentConsensus,
      },
    },
    timestamp: Date.now(),
  };

  broadcastToUsers(userIds, message);

  // Store vote in database
  const db = await getDb();
  if (db) {
    try {
      await db.insert(councilVotes).values({
        sessionId,
        agentId: votingEvent.agentId,
        decision: votingEvent.decision,
        confidence: String(votingEvent.confidence),
        reasoning: votingEvent.reasoning,
        latencyMs: votingEvent.latency,
      });
    } catch (error) {
      console.error('Failed to store council vote:', error);
    }
  }
}

/**
 * Finalize voting session and trigger alerts if needed
 */
async function finalizeVotingSession(
  sessionId: number,
  result: 'approved' | 'rejected' | 'deadlocked',
  userIds: number[]
): Promise<void> {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  const completionTime = Date.now();
  const totalDuration = completionTime - session.startTime;

  // Determine alert severity based on result
  let severity: 'info' | 'warning' | 'critical' = 'info';
  let alertMessage = '';

  if (result === 'rejected') {
    severity = 'critical';
    alertMessage = `⚠️ CRITICAL: Byzantine Council REJECTED report ${session.reportId}`;
  } else if (result === 'deadlocked') {
    severity = 'warning';
    alertMessage = `⚠️ WARNING: Byzantine Council DEADLOCKED on report ${session.reportId}`;
  } else {
    alertMessage = `✅ Byzantine Council APPROVED report ${session.reportId}`;
  }

  // Broadcast final result with LOW-LATENCY alert
  const message: RealtimeMessage = {
    type: 'risk_alert',
    data: {
      event: 'voting_session_completed',
      result,
      sessionId,
      reportId: session.reportId,
      totalVotes: session.votesReceived,
      votesRequired: session.votesRequired,
      completionTime: totalDuration,
      metrics: session.liveMetrics,
      alertMessage,
      severity,
    },
    timestamp: completionTime,
  };

  broadcastToUsers(userIds, message);

  // Log to database
  const db = await getDb();
  if (db) {
    try {
      await db
        .update(councilSessions)
        .set({
          status: mapResultToStatus(result),
          finalDecision: mapResultToFinalDecision(result),
          completedAt: new Date(completionTime).toISOString().slice(0, 19).replace('T', ' '),
        })
        .where(eq(councilSessions.id, sessionId));

      await db.insert(realtimeEvents).values({
        eventType: 'council_decision',
        title: 'Voting session completed',
        description: alertMessage,
        severity,
        data: {
          result,
          sessionId,
          reportId: session.reportId,
          totalDuration,
          metrics: session.liveMetrics,
        },
      });
    } catch (error) {
      console.error('Failed to finalize voting session:', error);
    }
  }

  // Clean up session after 5 minutes
  setTimeout(() => {
    activeSessions.delete(sessionId);
    voteHistory.delete(sessionId);
  }, 5 * 60 * 1000);
}

/**
 * Get current session metrics for real-time dashboard
 */
export function getSessionMetrics(sessionId: number): CouncilVotingSession | null {
  return activeSessions.get(sessionId) || null;
}

/**
 * Get vote history for a session
 */
export function getVoteHistory(sessionId: number): VotingEvent[] {
  return voteHistory.get(sessionId) || [];
}

/**
 * Get all active sessions
 */
export function getActiveSessions(): CouncilVotingSession[] {
  return Array.from(activeSessions.values());
}

/**
 * Stream real-time compliance alerts
 * Used for low-latency alert system
 */
export async function streamComplianceAlert(
  alert: {
    type: 'violation' | 'risk' | 'approval' | 'rejection';
    severity: 'critical' | 'warning' | 'info';
    message: string;
    reportId: number;
    timestamp: number;
  },
  userIds: number[]
): Promise<void> {
  const message: RealtimeMessage = {
    type: 'risk_alert',
    data: alert,
    timestamp: Date.now(),
  };

  broadcastToUsers(userIds, message);

  // Log to database
  const db = await getDb();
  if (db) {
    try {
      const eventTypeMap: Record<string, typeof realtimeEvents.$inferInsert.eventType> = {
        violation: 'enforcement_action',
        risk: 'risk_alert',
        approval: 'council_decision',
        rejection: 'council_decision',
      };

      await db.insert(realtimeEvents).values({
        eventType: eventTypeMap[alert.type] || 'risk_alert',
        title: alert.type.toUpperCase(),
        description: alert.message,
        severity: alert.severity,
        data: alert,
      });
    } catch (error) {
      console.error('Failed to log compliance alert:', error);
    }
  }
}

/**
 * Get real-time system health metrics
 */
export function getSystemHealthMetrics() {
  const activeSessions_ = getActiveSessions();
  const totalVotes = Array.from(voteHistory.values()).reduce(
    (sum, votes) => sum + votes.length,
    0
  );

  const avgLatency =
    totalVotes > 0
      ? Array.from(voteHistory.values())
          .flat()
          .reduce((sum, vote) => sum + vote.latency, 0) / totalVotes
      : 0;

  return {
    activeSessions: activeSessions_.length,
    totalVotes,
    averageLatency: avgLatency.toFixed(0),
    maxLatency: Math.max(
      ...Array.from(voteHistory.values())
        .flat()
        .map((v) => v.latency),
      0
    ),
    timestamp: Date.now(),
  };
}
