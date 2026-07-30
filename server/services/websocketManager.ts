/**
 * WebSocket Manager Service
 * Handles real-time connections, alert subscriptions, and event broadcasting
 */

import { WebSocket, WebSocketServer } from 'ws';
import { getDb } from '../db';
import { websocketConnections } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'alert' | 'roadmap_update' | 'notification';
  userId?: number;
  organizationId?: number;
  channel?: string;
  data?: any;
  timestamp?: number;
}

interface SubscribedClient {
  ws: WebSocket;
  userId: number;
  connectionId: string;
  channels: Set<string>;
  lastHeartbeat: string | Date;
}

export class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, SubscribedClient> = new Map();
  private userConnections: Map<number, Set<string>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket server
   */
  public initialize(server: any) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req: any) => {
      const connectionId = this.generateConnectionId();
      console.log(`[WS] New connection: ${connectionId}`);

      ws.on('message', (data: Buffer) => {
        this.handleMessage(connectionId, ws, data);
      });

      ws.on('close', () => {
        this.handleDisconnect(connectionId);
      });

      ws.on('error', (error) => {
        console.error(`[WS] Error on ${connectionId}:`, error);
      });

      // Send welcome message
      this.sendToClient(connectionId, {
        type: 'connected',
        connectionId,
        timestamp: Date.now(),
      });
    });

    // Start heartbeat mechanism
    this.startHeartbeat();

    console.log('[WS] WebSocket server initialized');
  }

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(connectionId: string, ws: WebSocket, data: Buffer) {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(connectionId, ws, message);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(connectionId, message);
          break;
        case 'ping':
          this.sendToClient(connectionId, { type: 'pong', timestamp: Date.now() });
          break;
        default:
          console.warn(`[WS] Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`[WS] Error parsing message:`, error);
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
    }
  }

  /**
   * Handle subscription request
   */
  private async handleSubscribe(connectionId: string, ws: WebSocket, message: WebSocketMessage) {
    const { userId, organizationId, channel } = message;

    if (!userId) {
      ws.send(JSON.stringify({ type: 'error', message: 'userId required' }));
      return;
    }

    // Register client
    const client: SubscribedClient = {
      ws,
      userId,
      connectionId,
      channels: new Set([channel || `user:${userId}`]),
      lastHeartbeat: new Date().toISOString(),
    };

    this.clients.set(connectionId, client);

    // Track user connections
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(connectionId);

    // Save to database
    await this.saveConnection(userId, connectionId);

    // Send confirmation
    this.sendToClient(connectionId, {
      type: 'subscribed',
      channel: channel || `user:${userId}`,
      timestamp: Date.now(),
    });

    console.log(`[WS] User ${userId} subscribed to ${channel || 'default'}`);
  }

  /**
   * Handle unsubscribe request
   */
  private handleUnsubscribe(connectionId: string, message: WebSocketMessage) {
    const client = this.clients.get(connectionId);
    if (client && message.channel) {
      client.channels.delete(message.channel);
    }
  }

  /**
   * Handle client disconnect
   */
  private async handleDisconnect(connectionId: string) {
    const client = this.clients.get(connectionId);
    if (client) {
      // Remove from user connections
      const userConns = this.userConnections.get(client.userId);
      if (userConns) {
        userConns.delete(connectionId);
      }

      // Remove from database
      await this.removeConnection(connectionId);

      // Remove from clients
      this.clients.delete(connectionId);

      console.log(`[WS] Disconnected: ${connectionId}`);
    }
  }

  /**
   * Broadcast alert to subscribed users
   */
  public broadcastAlert(alert: any, userIds?: number[]) {
    const message = {
      type: 'alert',
      data: alert,
      timestamp: Date.now(),
    };

    if (userIds && userIds.length > 0) {
      // Send to specific users
      userIds.forEach((userId) => {
        const connections = this.userConnections.get(userId);
        if (connections) {
          connections.forEach((connId) => {
            this.sendToClient(connId, message);
          });
        }
      });
    } else {
      // Broadcast to all connected clients
      this.clients.forEach((client) => {
        this.sendToClient(client.connectionId, message);
      });
    }
  }

  /**
   * Broadcast roadmap update
   */
  public broadcastRoadmapUpdate(roadmap: any, organizationId: number) {
    const message = {
      type: 'roadmap_update',
      data: roadmap,
      organizationId,
      timestamp: Date.now(),
    };

    // Send to all users in organization
    this.clients.forEach((client) => {
      if (client.channels.has(`org:${organizationId}`) || client.channels.has(`user:${client.userId}`)) {
        this.sendToClient(client.connectionId, message);
      }
    });
  }

  /**
   * Broadcast notification
   */
  public broadcastNotification(notification: any, userId: number) {
    const message = {
      type: 'notification',
      data: notification,
      timestamp: Date.now(),
    };

    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.forEach((connId) => {
        this.sendToClient(connId, message);
      });
    }
  }

  /**
   * Send message to specific client
   */
  private sendToClient(connectionId: string, message: any) {
    const client = this.clients.get(connectionId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Start heartbeat to keep connections alive
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      this.clients.forEach((client, connectionId) => {
        const lastHeartbeat = typeof client.lastHeartbeat === 'string' ? new Date(client.lastHeartbeat) : client.lastHeartbeat;
        const timeSinceLastHeartbeat = now.getTime() - lastHeartbeat.getTime();

        // Close stale connections (no heartbeat for 60 seconds)
        if (timeSinceLastHeartbeat > 60000) {
          client.ws.close(1000, 'Heartbeat timeout');
          return;
        }

        // Send ping
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        }
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Save connection to database
   */
  private async saveConnection(userId: number, connectionId: string) {
    try {
      const db = await getDb();
      if (!db) return;
      await db.insert(websocketConnections).values({
        userId,
        connectionId,
        isActive: 1,
      });
    } catch (error) {
      console.error('[WS] Error saving connection:', error);
    }
  }

  /**
   * Remove connection from database
   */
  private async removeConnection(connectionId: string) {
    try {
      const db = await getDb();
      if (!db) return;
      await db.delete(websocketConnections).where(eq(websocketConnections.connectionId, connectionId));
    } catch (error) {
      console.error('[WS] Error removing connection:', error);
    }
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get active connections count
   */
  public getActiveConnectionsCount(): number {
    return this.clients.size;
  }

  /**
   * Get connections for user
   */
  public getUserConnections(userId: number): number {
    return this.userConnections.get(userId)?.size || 0;
  }

  /**
   * Shutdown WebSocket server
   */
  public shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.wss) {
      this.wss.close();
    }

    this.clients.clear();
    this.userConnections.clear();

    console.log('[WS] WebSocket server shutdown');
  }
}

// Export singleton instance
export const wsManager = new WebSocketManager();
