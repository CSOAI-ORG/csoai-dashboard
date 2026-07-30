/**
 * Webhook Metrics Chart Component
 * Real-time webhook delivery metrics with success rates and latency
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export interface WebhookMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number;
  successRate: number;
  lastDeliveryTime: Date | null;
}

interface WebhookMetricsChartProps {
  refreshInterval?: number;
}

export const WebhookMetricsChart: React.FC<WebhookMetricsChartProps> = ({
  refreshInterval = 30000,
}) => {
  const [metrics, setMetrics] = useState<WebhookMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      // Mock data - in production, would call tRPC endpoint
      const mockMetrics: WebhookMetrics = {
        totalSubscriptions: 12,
        activeSubscriptions: 11,
        totalDeliveries: 1247,
        successfulDeliveries: 1234,
        failedDeliveries: 13,
        averageDeliveryTime: 245,
        successRate: 98.96,
        lastDeliveryTime: new Date(Date.now() - 5000),
      };
      setMetrics(mockMetrics);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch webhook metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading && !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhook Delivery Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhook Delivery Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Failed to load metrics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 99) return 'text-green-600';
    if (rate >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateBgColor = (rate: number) => {
    if (rate >= 99) return 'bg-green-50';
    if (rate >= 95) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Webhook Delivery Metrics</CardTitle>
            <CardDescription>Real-time webhook performance monitoring</CardDescription>
          </div>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Success Rate Highlight */}
        <div className={`p-4 rounded-lg ${getSuccessRateBgColor(metrics.successRate)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
              <p className={`text-3xl font-bold ${getSuccessRateColor(metrics.successRate)}`}>
                {metrics.successRate.toFixed(2)}%
              </p>
            </div>
            {metrics.successRate >= 99 ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : metrics.successRate >= 95 ? (
              <TrendingUp className="w-12 h-12 text-yellow-600" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-600" />
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Subscriptions */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Subscriptions</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{metrics.activeSubscriptions}</span>
              <span className="text-sm text-muted-foreground">of {metrics.totalSubscriptions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{
                  width: `${(metrics.activeSubscriptions / metrics.totalSubscriptions) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Deliveries */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Deliveries</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{metrics.totalDeliveries}</span>
              <span className="text-sm text-muted-foreground">all time</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.successfulDeliveries} successful, {metrics.failedDeliveries} failed
            </div>
          </div>

          {/* Average Latency */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Avg. Delivery Time</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{metrics.averageDeliveryTime}</span>
              <span className="text-sm text-muted-foreground">ms</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {metrics.averageDeliveryTime < 300 ? '✓ Optimal' : '⚠ Review needed'}
            </div>
          </div>

          {/* Last Delivery */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Last Delivery</p>
            {metrics.lastDeliveryTime ? (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {Math.round((Date.now() - metrics.lastDeliveryTime.getTime()) / 1000)}s ago
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {metrics.lastDeliveryTime.toLocaleTimeString()}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No deliveries yet</p>
            )}
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Badge
            variant={metrics.successRate >= 99 ? 'default' : 'secondary'}
            className={
              metrics.successRate >= 99
                ? 'bg-green-600 text-white'
                : metrics.successRate >= 95
                  ? 'bg-yellow-600 text-white'
                  : 'bg-red-600 text-white'
            }
          >
            {metrics.successRate >= 99 ? '✓ Healthy' : metrics.successRate >= 95 ? '⚠ Degraded' : '✗ Critical'}
          </Badge>
          <Badge variant="outline">
            {metrics.activeSubscriptions}/{metrics.totalSubscriptions} Active
          </Badge>
          <Badge variant="outline">
            {((metrics.successfulDeliveries / metrics.totalDeliveries) * 100).toFixed(1)}% Success
          </Badge>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-right pt-2 border-t">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};
