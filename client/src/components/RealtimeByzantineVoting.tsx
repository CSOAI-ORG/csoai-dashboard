/**
 * Real-Time Byzantine Council Voting Component
 * 
 * Displays live voting updates with low-latency streaming
 * Shows agent votes, consensus progress, and system metrics
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface VotingMetrics {
  votesReceived: number;
  votesRequired: number;
  approvalRate: string;
  rejectionRate: string;
  averageLatency: string;
  consensus: 'pending' | 'approved' | 'rejected' | 'deadlocked';
}

interface SystemHealth {
  activeSessions: number;
  totalVotes: number;
  averageLatency: string;
  maxLatency: number;
  timestamp: number;
}

export function RealtimeByzantineVoting() {
  const [isConnected, setIsConnected] = useState(false);
  const [votingMetrics, setVotingMetrics] = useState<VotingMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [recentVotes, setRecentVotes] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('✅ Connected to real-time voting stream');

      // Subscribe to voting updates
      ws.send(
        JSON.stringify({
          type: 'subscribe',
          eventType: 'compliance_update',
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'compliance_update' && message.data.event === 'agent_voted') {
          // Update voting metrics
          setVotingMetrics(message.data.sessionMetrics);

          // Add to recent votes
          setRecentVotes((prev) => [message.data.votingEvent, ...prev.slice(0, 9)]);
        } else if (message.type === 'risk_alert') {
          // Handle alerts
          setAlerts((prev) => [message.data, ...prev.slice(0, 4)]);

          if (message.data.event === 'voting_session_completed') {
            setVotingMetrics({
              votesReceived: message.data.totalVotes,
              votesRequired: message.data.votesRequired,
              approvalRate: '0',
              rejectionRate: '0',
              averageLatency: message.data.completionTime.toString(),
              consensus: message.data.result,
            });
          }
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
      console.error('❌ WebSocket error');
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Fetch system health periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/trpc/byzantineRealtime.getSystemHealth');
        if (response.ok) {
          const data = await response.json();
          setSystemHealth(data.result?.data || null);
        }
      } catch (error) {
        console.error('Failed to fetch system health:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const getConsensusColor = (consensus: string) => {
    switch (consensus) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'rejected':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'deadlocked':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-900 border-blue-300';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-300 text-red-900';
      case 'warning':
        return 'bg-amber-50 border-amber-300 text-amber-900';
      default:
        return 'bg-blue-50 border-blue-300 text-blue-900';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2">
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4 text-emerald-600" />
            <span className="text-sm text-emerald-600 font-medium">Live Connection Active</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Connecting...</span>
          </>
        )}
      </div>

      {/* System Health */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold">{systemHealth.activeSessions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold">{systemHealth.totalVotes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Latency</p>
                <p className="text-2xl font-bold text-emerald-600">{systemHealth.averageLatency}ms</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Max Latency</p>
                <p className="text-2xl font-bold">{systemHealth.maxLatency}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Voting Session */}
      {votingMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Byzantine Council Voting
              </span>
              <Badge className={getConsensusColor(votingMetrics.consensus)}>
                {votingMetrics.consensus.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Vote Progress */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Votes Received</span>
                <span className="text-sm text-gray-600">
                  {votingMetrics.votesReceived} / {votingMetrics.votesRequired}
                </span>
              </div>
              <Progress
                value={(votingMetrics.votesReceived / votingMetrics.votesRequired) * 100}
                className="h-2"
              />
            </div>

            {/* Vote Distribution */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Approval Rate</p>
                <p className="text-lg font-bold text-emerald-600">
                  {votingMetrics.approvalRate}%
                </p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Rejection Rate</p>
                <p className="text-lg font-bold text-red-600">
                  {votingMetrics.rejectionRate}%
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Avg Latency</p>
                <p className="text-lg font-bold text-blue-600">
                  {votingMetrics.averageLatency}ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Votes */}
      {recentVotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <AnimatePresence>
                {recentVotes.map((vote, index) => (
                  <motion.div
                    key={`${vote.sessionId}-${vote.agentId}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium text-sm">{vote.agentName}</p>
                      <p className="text-xs text-gray-600">{vote.reasoning}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          vote.decision === 'approve'
                            ? 'default'
                            : vote.decision === 'reject'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {vote.decision}
                      </Badge>
                      <span className="text-xs text-gray-500">{vote.latency}ms</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Low-Latency Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <AnimatePresence>
                {alerts.map((alert, index) => (
                  <motion.div
                    key={`${alert.reportId}-${index}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`p-3 rounded border ${getAlertColor(alert.severity)}`}
                  >
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
