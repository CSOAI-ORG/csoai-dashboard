import { getDb } from '../db';
import { realtimeEvents } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import { broadcastToUser, broadcastToUsers, RealtimeMessage } from '../websocket/server';

export type EventType = 
  | 'compliance_update'
  | 'enforcement_action'
  | 'audit_result'
  | 'risk_alert'
  | 'certification_issued'
  | 'framework_update'
  | 'council_decision'
  | 'watchdog_report';

export type EventSeverity = 'info' | 'warning' | 'critical';

export interface CreateEventInput {
  userId?: number;
  organizationId?: number;
  aiSystemId?: number;
  eventType: EventType;
  title: string;
  description?: string;
  severity?: EventSeverity;
  data?: Record<string, any>;
}

/**
 * Create a realtime event and broadcast to users
 */
export async function createRealtimeEvent(input: CreateEventInput) {
  const db = await getDb();

  try {
    if (!db) throw new Error('Database connection failed');
    // Insert event into database
    const [result] = await db.insert(realtimeEvents).values({
      userId: input.userId,
      organizationId: input.organizationId,
      aiSystemId: input.aiSystemId,
      eventType: input.eventType,
      title: input.title,
      description: input.description,
      severity: input.severity || 'info',
      data: input.data,
      isRead: 0,
    }).$returningId();

    // Broadcast to user if userId is provided
    if (input.userId) {
      const message: RealtimeMessage = {
        type: input.eventType as any,
        data: {
          id: (result as any).id,
          ...input,
        },
        timestamp: Date.now(),
      };

      broadcastToUser(input.userId, message);
    }

    return result;
  } catch (error) {
    console.error('Failed to create realtime event:', error);
    throw error;
  }
}

/**
 * Create compliance update event
 */
export async function createComplianceUpdate(
  userId: number,
  aiSystemId: number,
  title: string,
  description: string,
  data?: Record<string, any>
) {
  return createRealtimeEvent({
    userId,
    aiSystemId,
    eventType: 'compliance_update',
    title,
    description,
    severity: 'info',
    data,
  });
}

/**
 * Create enforcement action event
 */
export async function createEnforcementAction(
  organizationId: number,
  aiSystemId: number,
  title: string,
  description: string,
  severity: EventSeverity = 'warning',
  data?: Record<string, any>
) {
  return createRealtimeEvent({
    organizationId,
    aiSystemId,
    eventType: 'enforcement_action',
    title,
    description,
    severity,
    data,
  });
}

/**
 * Create audit result event
 */
export async function createAuditResult(
  userId: number,
  aiSystemId: number,
  title: string,
  description: string,
  data?: Record<string, any>
) {
  return createRealtimeEvent({
    userId,
    aiSystemId,
    eventType: 'audit_result',
    title,
    description,
    severity: 'info',
    data,
  });
}

/**
 * Create risk alert event
 */
export async function createRiskAlert(
  userId: number,
  aiSystemId: number,
  title: string,
  description: string,
  severity: EventSeverity = 'critical',
  data?: Record<string, any>
) {
  return createRealtimeEvent({
    userId,
    aiSystemId,
    eventType: 'risk_alert',
    title,
    description,
    severity,
    data,
  });
}

/**
 * Create certification issued event
 */
export async function createCertificationIssued(
  userId: number,
  title: string,
  description: string,
  data?: Record<string, any>
) {
  return createRealtimeEvent({
    userId,
    eventType: 'certification_issued',
    title,
    description,
    severity: 'info',
    data,
  });
}

/**
 * Create framework update event
 */
export async function createFrameworkUpdate(
  title: string,
  description: string,
  data?: Record<string, any>
) {
  return createRealtimeEvent({
    eventType: 'framework_update',
    title,
    description,
    severity: 'info',
    data,
  });
}

/**
 * Create council decision event
 */
export async function createCouncilDecision(
  userId: number,
  title: string,
  description: string,
  data?: Record<string, any>
) {
  return createRealtimeEvent({
    userId,
    eventType: 'council_decision',
    title,
    description,
    severity: 'info',
    data,
  });
}

/**
 * Create watchdog report event
 */
export async function createWatchdogReport(
  userId: number,
  title: string,
  description: string,
  data?: Record<string, any>
) {
  return createRealtimeEvent({
    userId,
    eventType: 'watchdog_report',
    title,
    description,
    severity: 'info',
    data,
  });
}

/**
 * Mark event as read
 */
export async function markEventAsRead(eventId: number) {
  const db = await getDb();

  try {
    if (!db) throw new Error('Database connection failed');
    return await db
      .update(realtimeEvents)
      .set({
        isRead: 1,
        readAt: new Date().toISOString(),
      })
      .where(eq(realtimeEvents.id, eventId));
  } catch (error) {
    console.error('Failed to mark event as read:', error);
    throw error;
  }
}

/**
 * Get unread events for user
 */
export async function getUnreadEvents(userId: number) {
  const db = await getDb();

  try {
    if (!db) return [];
    return await db
      .select()
      .from(realtimeEvents)
      .where(and(eq(realtimeEvents.userId, userId), eq(realtimeEvents.isRead, 0)));
  } catch (error) {
    console.error('Failed to get unread events:', error);
    throw error;
  }
}

/**
 * Get events for user with pagination
 */
export async function getEvents(userId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();

  try {
    if (!db) return [];
    return await db
      .select()
      .from(realtimeEvents)
      .where(eq(realtimeEvents.userId, userId))
      .orderBy(desc(realtimeEvents.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error('Failed to get events:', error);
    throw error;
  }
}


