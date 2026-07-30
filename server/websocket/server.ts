import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { getDb } from '../db';
import { websocketConnections, realtimeEvents } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// Map to store active WebSocket connections by user ID
const userConnections = new Map<number, Set<WebSocket>>();

// Map to store connection metadata
const connectionMetadata = new Map<WebSocket, { userId: number; connectionId: string }>();

export interface RealtimeMessage {
  type: 'compliance_update' | 'enforcement_action' | 'audit_result' | 'risk_alert' | 'notification';
  data: any;
  timestamp: number;
}

/**
 * Initialize WebSocket server
 */
export function initializeWebSocketServer(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    handleConnection(ws, req);
  });

  // Cleanup interval - remove stale connections
  setInterval(() => {
    cleanupStaleConnections();
  }, 30000); // Every 30 seconds

  return wss;
}

/**
 * Handle new WebSocket connection
 */
async function handleConnection(ws: WebSocket, req: any): Promise<void> {
  const userId = extractUserIdFromRequest(req);

  if (!userId) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  const connectionId = generateConnectionId();
  const metadata = { userId, connectionId };
  connectionMetadata.set(ws, metadata);

  // Add to user connections
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId)!.add(ws);

  // Store in database
  const dbInstance = await getDb();
  try {
    if (dbInstance) {
      await dbInstance.insert(websocketConnections).values({
        userId,
        connectionId,
        isActive: 1,
      });
    }
  } catch (error) {
    console.error('Failed to store WebSocket connection:', error);
  }

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: 'connected',
      connectionId,
      timestamp: Date.now(),
    })
  );

  // Handle messages
  ws.on('message', (data: Buffer) => handleMessage(ws, data));

  // Handle disconnection
  ws.on('close', () => handleDisconnection(ws, userId));

  // Handle errors
  ws.on('error', (error: Error) => {
    console.error('WebSocket error:', error);
  });
}

/**
 * Handle incoming WebSocket messages
 */
async function handleMessage(ws: WebSocket, data: Buffer) {
  try {
    const message = JSON.parse(data.toString());

    switch (message.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        break;

      case 'subscribe':
        handleSubscribe(ws, message);
        break;

      case 'unsubscribe':
        handleUnsubscribe(ws, message);
        break;

      default:
        console.warn('Unknown message type:', message.type);
    }
  } catch (error) {
    console.error('Failed to handle WebSocket message:', error);
  }
}

/**
 * Handle disconnection
 */
async function handleDisconnection(ws: WebSocket, userId: number) {
  const metadata = connectionMetadata.get(ws);

  if (metadata) {
    // Remove from in-memory map
    const userConns = userConnections.get(userId);
    if (userConns) {
      userConns.delete(ws);
      if (userConns.size === 0) {
        userConnections.delete(userId);
      }
    }

    // Mark as inactive in database
    const dbInstance = await getDb();
    try {
      if (dbInstance) {
        await dbInstance
          .update(websocketConnections)
          .set({ isActive: 0 })
          .where(eq(websocketConnections.connectionId, metadata.connectionId));
      }
    } catch (error) {
      console.error('Failed to update WebSocket connection status:', error);
    }

    connectionMetadata.delete(ws);
  }
}

/**
 * Handle subscription to event types
 */
function handleSubscribe(ws: WebSocket, message: any) {
  const metadata = connectionMetadata.get(ws);
  if (!metadata) return;

  // Store subscription info in connection metadata
  if (!('subscriptions' in metadata)) {
    (metadata as any).subscriptions = new Set();
  }
  (metadata as any).subscriptions.add(message.eventType);

  ws.send(
    JSON.stringify({
      type: 'subscribed',
      eventType: message.eventType,
      timestamp: Date.now(),
    })
  );
}

/**
 * Handle unsubscription
 */
function handleUnsubscribe(ws: WebSocket, message: any) {
  const metadata = connectionMetadata.get(ws);
  if (!metadata) return;

  if ('subscriptions' in metadata) {
    (metadata as any).subscriptions.delete(message.eventType);
  }

  ws.send(
    JSON.stringify({
      type: 'unsubscribed',
      eventType: message.eventType,
      timestamp: Date.now(),
    })
  );
}

/**
 * Broadcast message to specific user
 */
export function broadcastToUser(userId: number, message: RealtimeMessage) {
  const connections = userConnections.get(userId);
  if (!connections) return;

  const payload = JSON.stringify(message);
  connections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}

/**
 * Broadcast message to multiple users
 */
export function broadcastToUsers(userIds: number[], message: RealtimeMessage) {
  userIds.forEach((userId) => broadcastToUser(userId, message));
}

/**
 * Broadcast message to all connected users
 */
export function broadcastToAll(message: RealtimeMessage) {
  userConnections.forEach((connections) => {
    const payload = JSON.stringify(message);
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  });
}

/**
 * Broadcast to users in an organization
 */
export async function broadcastToOrganization(organizationId: number, message: RealtimeMessage) {
  const db = await getDb();

  try {
    // This would require a join with users table to find all users in the organization
    // For now, we'll need to implement this based on your user-organization relationship
    // Placeholder implementation
    console.log(`Broadcasting to organization ${organizationId}:`, message);
  } catch (error) {
    console.error('Failed to broadcast to organization:', error);
  }
}

/**
 * Cleanup stale connections
 */
async function cleanupStaleConnections() {
  const dbInstance = await getDb();

  try {
    if (!dbInstance) return;
    
    // Find stale connections (no heartbeat for 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    await dbInstance
      .update(websocketConnections)
      .set({ isActive: 0 })
      .where(eq(websocketConnections.isActive, 1));
    // Add condition for lastHeartbeat < fiveMinutesAgo when available
  } catch (error) {
    console.error('Failed to cleanup stale connections:', error);
  }
}

/**
 * Extract user ID from request (from auth cookie or header)
 */
function extractUserIdFromRequest(req: any): number | null {
  // This should extract the user ID from the request
  // Typically from a JWT token in the Authorization header or from a session cookie
  // Implementation depends on your auth system

  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  try {
    // Parse JWT or session token
    // This is a placeholder - implement based on your auth system
    const token = authHeader.replace('Bearer ', '');
    // Decode token and extract userId
    // For now, return null
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Generate unique connection ID
 */
function generateConnectionId(): string {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get active connection count
 */
export function getActiveConnectionCount(): number {
  let count = 0;
  userConnections.forEach((connections) => {
    count += connections.size;
  });
  return count;
}

/**
 * Get users with active connections
 */
export function getActiveUsers(): number[] {
  return Array.from(userConnections.keys());
}
