/**
 * Webhook Management Page
 * Allows users to register, manage, and test webhooks
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Send, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
  deliveryCount: number;
  failureCount: number;
}

interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  statusCode?: number;
  responseTime: number;
  timestamp: Date;
  payload: any;
  error?: string;
}

const AVAILABLE_EVENTS = [
  { id: 'alert.created', label: 'Alert Created' },
  { id: 'alert.resolved', label: 'Alert Resolved' },
  { id: 'phase.completed', label: 'Phase Completed' },
  { id: 'phase.started', label: 'Phase Started' },
  { id: 'notification.sent', label: 'Notification Sent' },
  { id: 'report.generated', label: 'Report Generated' },
];

export const WebhookManagementPage: React.FC = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([
    {
      id: 'wh_1',
      url: 'https://example.com/webhooks/alerts',
      events: ['alert.created', 'alert.resolved'],
      active: true,
      createdAt: new Date('2025-01-15'),
      lastTriggeredAt: new Date('2025-01-26'),
      deliveryCount: 42,
      failureCount: 2,
    },
  ]);

  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([
    {
      id: 'del_1',
      webhookId: 'wh_1',
      event: 'alert.created',
      status: 'success',
      statusCode: 200,
      responseTime: 245,
      timestamp: new Date('2025-01-26T10:30:00'),
      payload: { alertId: 'alert-123', severity: 'high' },
    },
    {
      id: 'del_2',
      webhookId: 'wh_1',
      event: 'alert.created',
      status: 'failed',
      statusCode: 500,
      responseTime: 5000,
      timestamp: new Date('2025-01-26T09:15:00'),
      payload: { alertId: 'alert-122', severity: 'medium' },
      error: 'Internal Server Error',
    },
  ]);

  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: [] as string[],
  });

  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [testPayload, setTestPayload] = useState<any>(null);
  const [testResult, setTestResult] = useState<WebhookDelivery | null>(null);

  /**
   * Add new webhook
   */
  const handleAddWebhook = () => {
    if (!newWebhook.url || newWebhook.events.length === 0) {
      toast.error('Validation Error', {
        description: 'Please enter a URL and select at least one event',
      });
      return;
    }

    const webhook: Webhook = {
      id: `wh_${Date.now()}`,
      url: newWebhook.url,
      events: newWebhook.events,
      active: true,
      createdAt: new Date(),
      deliveryCount: 0,
      failureCount: 0,
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ url: '', events: [] });

    toast.success('Webhook Created', {
      description: `Webhook registered for ${newWebhook.events.length} event(s)`,
    });
  };

  /**
   * Delete webhook
   */
  const handleDeleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
    toast.success('Webhook Deleted', {
      description: 'The webhook has been removed',
    });
  };

  /**
   * Toggle webhook active status
   */
  const handleToggleWebhook = (id: string) => {
    setWebhooks(
      webhooks.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  };

  /**
   * Test webhook delivery
   */
  const handleTestWebhook = async (webhook: Webhook) => {
    const testPayload = {
      event: webhook.events[0],
      timestamp: new Date().toISOString(),
      data: {
        id: 'test-123',
        title: 'Test Event',
        message: 'This is a test webhook delivery',
      },
    };

    setTestPayload(testPayload);

    // Simulate webhook delivery
    const startTime = Date.now();
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': 'test-signature',
          'X-Webhook-ID': webhook.id,
        },
        body: JSON.stringify(testPayload),
      });

      const responseTime = Date.now() - startTime;

      const delivery: WebhookDelivery = {
        id: `del_${Date.now()}`,
        webhookId: webhook.id,
        event: webhook.events[0],
        status: response.ok ? 'success' : 'failed',
        statusCode: response.status,
        responseTime,
        timestamp: new Date(),
        payload: testPayload,
        error: !response.ok ? `HTTP ${response.status}` : undefined,
      };

      setTestResult(delivery);
      setDeliveries([delivery, ...deliveries]);

      const toastFn = response.ok ? toast.success : toast.error;
      toastFn('Test Delivery Sent', {
        description: `Response: ${response.status} (${responseTime}ms)`,
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const delivery: WebhookDelivery = {
        id: `del_${Date.now()}`,
        webhookId: webhook.id,
        event: webhook.events[0],
        status: 'failed',
        responseTime,
        timestamp: new Date(),
        payload: testPayload,
        error: error instanceof Error ? error.message : 'Connection failed',
      };

      setTestResult(delivery);
      setDeliveries([delivery, ...deliveries]);

      toast.error('Test Delivery Failed', {
        description: error instanceof Error ? error.message : 'Connection error',
      });
    }
  };

  /**
   * Copy webhook URL to clipboard
   */
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Copied', {
      description: 'Webhook URL copied to clipboard',
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Webhook Management</h1>
        <p className="text-muted-foreground mt-2">
          Register webhooks to receive real-time notifications about events in your organization
        </p>
      </div>

      {/* Add Webhook Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Register Webhook
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Webhook</DialogTitle>
            <DialogDescription>
              Configure a webhook to receive real-time event notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Webhook URL</label>
              <Input
                placeholder="https://example.com/webhooks/alerts"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be a valid HTTPS URL that can receive POST requests
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Subscribe to Events</label>
              <div className="space-y-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <div key={event.id} className="flex items-center">
                    <Checkbox
                      id={event.id}
                      checked={newWebhook.events.includes(event.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewWebhook({
                            ...newWebhook,
                            events: [...newWebhook.events, event.id],
                          });
                        } else {
                          setNewWebhook({
                            ...newWebhook,
                            events: newWebhook.events.filter((e) => e !== event.id),
                          });
                        }
                      }}
                    />
                    <label htmlFor={event.id} className="text-sm ml-2 cursor-pointer">
                      {event.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleAddWebhook} className="w-full">
              Register Webhook
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Webhooks List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Registered Webhooks</h2>

        {webhooks.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No webhooks registered yet. Click "Register Webhook" to get started.
            </CardContent>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{webhook.url}</CardTitle>
                      <Badge variant={webhook.active ? 'default' : 'secondary'}>
                        {webhook.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      Created {webhook.createdAt.toLocaleDateString()}
                      {webhook.lastTriggeredAt &&
                        ` • Last triggered ${webhook.lastTriggeredAt.toLocaleDateString()}`}
                    </CardDescription>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyUrl(webhook.url)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestWebhook(webhook)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Test
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Subscribed Events</h4>
                  <div className="flex flex-wrap gap-2">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="secondary">
                        {AVAILABLE_EVENTS.find((e) => e.id === event)?.label || event}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Deliveries</p>
                    <p className="text-2xl font-bold">{webhook.deliveryCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Failures</p>
                    <p className="text-2xl font-bold text-red-600">{webhook.failureCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {webhook.deliveryCount > 0
                        ? Math.round(
                            ((webhook.deliveryCount - webhook.failureCount) / webhook.deliveryCount) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delivery History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Delivery History</h2>

        <div className="space-y-2">
          {deliveries.slice(0, 10).map((delivery) => (
            <Card key={delivery.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {delivery.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}

                    <div className="flex-1">
                      <p className="font-medium">{delivery.event}</p>
                      <p className="text-sm text-muted-foreground">
                        {delivery.timestamp.toLocaleString()} • {delivery.responseTime}ms
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant={delivery.status === 'success' ? 'default' : 'destructive'}>
                      {delivery.statusCode || 'Error'} {delivery.status}
                    </Badge>
                    {delivery.error && (
                      <p className="text-xs text-red-600 mt-1">{delivery.error}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
