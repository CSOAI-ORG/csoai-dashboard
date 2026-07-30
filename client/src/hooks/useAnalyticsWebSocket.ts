/**
 * useAnalyticsWebSocket Hook
 * Connect to WebSocket server and listen for real-time analytics updates
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface AnalyticsUpdate {
  type: 'incident_created' | 'incident_updated' | 'compliance_assessment_created' | 'compliance_score_changed' | 'analytics_summary_updated';
  data: any;
  timestamp: number;
}

interface UseAnalyticsWebSocketOptions {
  onIncidentCreated?: (incident: any) => void;
  onIncidentUpdated?: (incident: any) => void;
  onAssessmentCreated?: (assessment: any) => void;
  onScoreChanged?: (change: any) => void;
  onSummaryUpdated?: (summary: any) => void;
  showToasts?: boolean;
}

export function useAnalyticsWebSocket(options: UseAnalyticsWebSocketOptions = {}) {
  const {
    onIncidentCreated,
    onIncidentUpdated,
    onAssessmentCreated,
    onScoreChanged,
    onSummaryUpdated,
    showToasts = true,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<AnalyticsUpdate | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    try {
      // Determine WebSocket URL based on current location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      console.log('[AnalyticsWebSocket] Connecting to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[AnalyticsWebSocket] Connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        if (showToasts) {
          toast.success('Real-time updates connected', {
            description: 'You will receive live analytics updates',
          });
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: AnalyticsUpdate = JSON.parse(event.data);
          
          // Skip connection confirmation messages
          if ((message as any).type === 'connected') {
            return;
          }

          console.log('[AnalyticsWebSocket] Received:', message.type);
          setLastUpdate(message);

          // Handle different message types
          switch (message.type) {
            case 'incident_created':
              if (onIncidentCreated) {
                onIncidentCreated(message.data);
              }
              if (showToasts) {
                toast.error(`New ${message.data.severity} incident reported`, {
                  description: message.data.title,
                });
              }
              break;

            case 'incident_updated':
              if (onIncidentUpdated) {
                onIncidentUpdated(message.data);
              }
              if (showToasts && message.data.status === 'resolved') {
                toast.success('Incident resolved', {
                  description: message.data.title,
                });
              }
              break;

            case 'compliance_assessment_created':
              if (onAssessmentCreated) {
                onAssessmentCreated(message.data);
              }
              if (showToasts) {
                toast.info('New compliance assessment', {
                  description: `${message.data.aiSystemName} - Score: ${message.data.score}%`,
                });
              }
              break;

            case 'compliance_score_changed':
              if (onScoreChanged) {
                onScoreChanged(message.data);
              }
              if (showToasts) {
                const icon = message.data.improved ? '📈' : '📉';
                const toastFn = message.data.improved ? toast.success : toast.warning;
                toastFn(`${icon} Compliance score ${message.data.improved ? 'improved' : 'declined'}`, {
                  description: `${message.data.aiSystemName}: ${message.data.change > 0 ? '+' : ''}${message.data.change.toFixed(1)}%`,
                });
              }
              break;

            case 'analytics_summary_updated':
              if (onSummaryUpdated) {
                onSummaryUpdated(message.data);
              }
              break;

            default:
              console.log('[AnalyticsWebSocket] Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('[AnalyticsWebSocket] Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[AnalyticsWebSocket] Error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('[AnalyticsWebSocket] Disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`[AnalyticsWebSocket] Reconnecting in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          if (showToasts) {
            toast.error('Real-time updates disconnected', {
              description: 'Please refresh the page to reconnect',
            });
          }
        }
      };
    } catch (error) {
      console.error('[AnalyticsWebSocket] Connection error:', error);
      setIsConnected(false);
    }
  }, [onIncidentCreated, onIncidentUpdated, onAssessmentCreated, onScoreChanged, onSummaryUpdated, showToasts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastUpdate,
    reconnect: connect,
    disconnect,
  };
}
