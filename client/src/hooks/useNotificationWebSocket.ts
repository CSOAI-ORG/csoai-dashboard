import { useEffect, useRef, useState, useCallback } from 'react';

export interface NotificationUpdate {
  type: 'notification' | 'notification_update' | 'notification_read' | 'notification_delivered' | 'ping' | 'pong';
  notificationId: number;
  userId: number;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: number;
  data?: {
    title?: string;
    message?: string;
    priority?: string;
    notificationType?: string;
  };
}

interface UseNotificationWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onNotification?: (notification: NotificationUpdate) => void;
  onStatusUpdate?: (notificationId: number, status: string) => void;
}

export function useNotificationWebSocket(options: UseNotificationWebSocketOptions = {}) {
  const {
    url = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`,
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onNotification,
    onStatusUpdate,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const messageQueueRef = useRef<NotificationUpdate[]>([]);

  const [isConnected, setIsConnected] = useState(false);
  const [queuedNotifications, setQueuedNotifications] = useState<NotificationUpdate[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [connectionHealth, setConnectionHealth] = useState<{
    isHealthy: boolean;
    lastHeartbeat: number;
    missedHeartbeats: number;
  }>({
    isHealthy: true,
    lastHeartbeat: Date.now(),
    missedHeartbeats: 0,
  });

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[Notification WS] Connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        setConnectionHealth(prev => ({
          ...prev,
          isHealthy: true,
          lastHeartbeat: Date.now(),
          missedHeartbeats: 0,
        }));

        // Subscribe to notification channel
        ws.send(JSON.stringify({
          type: 'subscribe',
          channel: 'notifications',
          timestamp: Date.now(),
        }));

        // Deliver queued notifications
        if (messageQueueRef.current.length > 0) {
          console.log(`[Notification WS] Delivering ${messageQueueRef.current.length} queued notifications`);
          messageQueueRef.current.forEach(notif => {
            if (onNotification) onNotification(notif);
          });
          messageQueueRef.current = [];
          setQueuedNotifications([]);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: NotificationUpdate = JSON.parse(event.data);

          // Update connection health
          if (message.type === 'ping' || message.type === 'pong') {
            setConnectionHealth(prev => ({
              ...prev,
              lastHeartbeat: Date.now(),
              missedHeartbeats: 0,
            }));
            return;
          }

          // Handle notification updates
          if (message.type === 'notification') {
            console.log('[Notification WS] Received notification:', message.notificationId);
            if (onNotification) {
              onNotification(message);
            }
          } else if (message.type === 'notification_update' || message.type === 'notification_delivered') {
            console.log('[Notification WS] Notification delivered:', message.notificationId);
            if (onStatusUpdate) {
              onStatusUpdate(message.notificationId, message.status);
            }
          } else if (message.type === 'notification_read') {
            console.log('[Notification WS] Notification read:', message.notificationId);
            if (onStatusUpdate) {
              onStatusUpdate(message.notificationId, 'read');
            }
          }
        } catch (err) {
          console.error('[Notification WS] Failed to parse message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('[Notification WS] Error:', event);
        setError(new Error('WebSocket error'));
        setConnectionHealth(prev => ({
          ...prev,
          isHealthy: false,
        }));
      };

      ws.onclose = () => {
        console.log('[Notification WS] Disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1);
          console.log(`[Notification WS] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError(new Error('Max reconnection attempts reached'));
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[Notification WS] Failed to create connection:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [url, reconnectInterval, maxReconnectAttempts, onNotification, onStatusUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const sendNotificationRead = useCallback((notificationId: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'notification_read',
        notificationId,
        timestamp: Date.now(),
      }));
    }
  }, []);

  const queueNotification = useCallback((notification: NotificationUpdate) => {
    messageQueueRef.current.push(notification);
    setQueuedNotifications(prev => [...prev, notification]);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Heartbeat monitoring
  useEffect(() => {
    if (!isConnected) return;

    const heartbeatInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now(),
        }));
      }

      // Check for missed heartbeats
      setConnectionHealth(prev => {
        const timeSinceLastHeartbeat = Date.now() - prev.lastHeartbeat;
        if (timeSinceLastHeartbeat > 60000) {
          return {
            ...prev,
            isHealthy: false,
            missedHeartbeats: prev.missedHeartbeats + 1,
          };
        }
        return prev;
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [isConnected]);

  return {
    isConnected,
    error,
    connectionHealth,
    queuedNotifications,
    connect,
    disconnect,
    sendNotificationRead,
    queueNotification,
  };
}
