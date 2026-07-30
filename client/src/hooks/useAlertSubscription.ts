/**
 * useAlertSubscription Hook
 * Manages WebSocket connection for real-time alert updates
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface WebSocketMessage {
  type: 'connected' | 'subscribed' | 'alert' | 'roadmap_update' | 'notification' | 'pong' | 'error';
  data?: any;
  connectionId?: string;
  channel?: string;
  timestamp?: number;
  message?: string;
}

interface AlertSubscriptionOptions {
  onAlert?: (alert: any) => void;
  onRoadmapUpdate?: (roadmap: any) => void;
  onNotification?: (notification: any) => void;
  onError?: (error: string) => void;
  autoReconnect?: boolean;
  reconnectDelay?: number;
}

export function useAlertSubscription(options: AlertSubscriptionOptions = {}) {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  const {
    onAlert,
    onRoadmapUpdate,
    onNotification,
    onError,
    autoReconnect = true,
    reconnectDelay = 3000,
  } = options;

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (!user?.id) return;

    // Determine WebSocket URL based on current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WS] Connected to server');
        setIsConnected(true);

        // Subscribe to user alerts
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            userId: user.id,
            channel: `user:${user.id}`,
          })
        );
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'connected':
              console.log('[WS] Connected with ID:', message.connectionId);
              setConnectionId(message.connectionId || null);
              break;

            case 'subscribed':
              console.log('[WS] Subscribed to channel:', message.channel);
              break;

            case 'alert':
              console.log('[WS] Received alert:', message.data);
              onAlert?.(message.data);
              break;

            case 'roadmap_update':
              console.log('[WS] Received roadmap update:', message.data);
              onRoadmapUpdate?.(message.data);
              break;

            case 'notification':
              console.log('[WS] Received notification:', message.data);
              onNotification?.(message.data);
              break;

            case 'pong':
              // Heartbeat response, do nothing
              break;

            case 'error':
              console.error('[WS] Server error:', message.message);
              onError?.(message.message || 'Unknown error');
              break;

            default:
              console.warn('[WS] Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('[WS] Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WS] WebSocket error:', error);
        onError?.('WebSocket connection error');
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected from server');
        setIsConnected(false);
        setConnectionId(null);

        // Attempt to reconnect
        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WS] Attempting to reconnect...');
            connect();
          }, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WS] Error creating WebSocket:', error);
      onError?.('Failed to create WebSocket connection');
    }
  }, [user?.id, onAlert, onRoadmapUpdate, onNotification, onError, autoReconnect, reconnectDelay]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionId(null);
  }, []);

  /**
   * Send message to server
   */
  const send = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WS] WebSocket not connected');
    }
  }, []);

  /**
   * Subscribe to a channel
   */
  const subscribe = useCallback(
    (channel: string) => {
      send({
        type: 'subscribe',
        userId: user?.id,
        channel,
      });
    },
    [send, user?.id]
  );

  /**
   * Unsubscribe from a channel
   */
  const unsubscribe = useCallback(
    (channel: string) => {
      send({
        type: 'unsubscribe',
        channel,
      });
    },
    [send]
  );

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    if (user?.id) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  return {
    isConnected,
    connectionId,
    send,
    subscribe,
    unsubscribe,
    disconnect,
  };
}
