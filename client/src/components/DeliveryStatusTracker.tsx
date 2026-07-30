/**
 * Delivery Status Tracker Component
 * Displays notification delivery history and status
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Webhook, Clock, CheckCircle, AlertCircle, RotateCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DeliveryLog {
  id: string;
  channel: 'email' | 'slack' | 'webhook';
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  deliveredAt?: Date;
  errorMessage?: string;
  retryCount: number;
  nextRetryAt?: Date;
}

interface DeliveryStatusTrackerProps {
  notificationId: string;
  deliveryLogs: DeliveryLog[];
  onRetry?: (logId: string) => void;
  isLoading?: boolean;
}

export const DeliveryStatusTracker: React.FC<DeliveryStatusTrackerProps> = ({
  notificationId,
  deliveryLogs,
  onRetry,
  isLoading = false,
}) => {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'slack':
        return <MessageSquare className="w-4 h-4" />;
      case 'webhook':
        return <Webhook className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'bounced':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'failed':
      case 'bounced':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const stats = {
    total: deliveryLogs.length,
    sent: deliveryLogs.filter((l) => l.status === 'sent').length,
    failed: deliveryLogs.filter((l) => l.status === 'failed').length,
    pending: deliveryLogs.filter((l) => l.status === 'pending').length,
  };

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-4 gap-2">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.sent}</div>
              <p className="text-xs text-muted-foreground">Sent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery History</CardTitle>
          <CardDescription>Track notification delivery across all channels</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading delivery history...</div>
          ) : deliveryLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No delivery logs yet</div>
          ) : (
            <div className="space-y-3">
              {deliveryLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getChannelIcon(log.channel)}
                    <div className="flex-1">
                      <div className="font-medium capitalize">{log.channel}</div>
                      <div className="text-sm text-muted-foreground">
                        {log.status === 'sent' && log.deliveredAt
                          ? `Delivered ${formatDistanceToNow(new Date(log.deliveredAt), { addSuffix: true })}`
                          : log.status === 'pending' && log.nextRetryAt
                            ? `Retrying ${formatDistanceToNow(new Date(log.nextRetryAt), { addSuffix: true })}`
                            : log.errorMessage || `Status: ${log.status}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(log.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(log.status)}
                        {log.status}
                      </span>
                    </Badge>

                    {log.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRetry?.(log.id)}
                        disabled={log.retryCount >= 3}
                      >
                        <RotateCw className="w-4 h-4" />
                        {log.retryCount >= 3 ? 'Max Retries' : 'Retry'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Details */}
      {deliveryLogs.some((l) => l.errorMessage) && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base text-red-900">Delivery Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deliveryLogs
                .filter((l) => l.errorMessage)
                .map((log) => (
                  <div key={log.id} className="text-sm">
                    <span className="font-medium capitalize">{log.channel}:</span>
                    <p className="text-red-700 mt-1">{log.errorMessage}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
