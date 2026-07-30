/**
 * Webhooks Management Page
 * Manage webhook subscriptions for rule updates and compliance events
 */
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Copy, Trash2, TestTube, CheckCircle, XCircle, Clock, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function WebhooksPage() {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const availableEvents = [
    { id: 'rule.created', label: 'Rule Created' },
    { id: 'rule.updated', label: 'Rule Updated' },
    { id: 'rule.deleted', label: 'Rule Deleted' },
    { id: 'framework.updated', label: 'Framework Updated' },
    { id: 'jurisdiction.updated', label: 'Jurisdiction Updated' },
    { id: 'compliance.requirement.changed', label: 'Compliance Requirement Changed' },
  ];

  // Fetch webhooks using trpc hooks
  const { data: webhooks, refetch: refetchWebhooks } = trpc.webhooks.getSubscriptions.useQuery(undefined);

  // Create webhook mutation
  const createWebhookMutation = trpc.webhooks.createSubscription.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Webhook Created',
        description: `Webhook subscription created successfully. Secret: ${data.secret}`,
      });
      setWebhookUrl('');
      setSelectedEvents([]);
      refetchWebhooks();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Update webhook mutation
  const updateWebhookMutation = trpc.webhooks.updateSubscription.useMutation({
    onSuccess: () => {
      toast({
        title: 'Webhook Updated',
        description: 'Webhook subscription updated successfully',
      });
      setWebhookUrl('');
      setSelectedEvents([]);
      setEditingId(null);
      refetchWebhooks();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Delete webhook mutation
  const deleteWebhookMutation = trpc.webhooks.deleteSubscription.useMutation({
    onSuccess: () => {
      toast({
        title: 'Webhook Deleted',
        description: 'Webhook subscription deleted successfully',
      });
      refetchWebhooks();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // Test webhook mutation
  const testWebhookMutation = trpc.webhooks.testWebhook.useMutation({
    onSuccess: () => {
      toast({
        title: 'Test Sent',
        description: 'Test webhook event sent successfully',
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleCreateWebhook = () => {
    if (!webhookUrl || selectedEvents.length === 0) {
      toast({ title: 'Error', description: 'Please enter a URL and select at least one event', variant: 'destructive' });
      return;
    }
    createWebhookMutation.mutate({
      url: webhookUrl,
      events: selectedEvents as any,
    });
  };

  const handleUpdateWebhook = (subscriptionId: string) => {
    updateWebhookMutation.mutate({
      subscriptionId,
      url: webhookUrl,
      events: selectedEvents as any,
    });
  };

  const handleDeleteWebhook = (subscriptionId: string) => {
    deleteWebhookMutation.mutate({ subscriptionId });
  };

  const handleTestWebhook = (subscriptionId: string) => {
    testWebhookMutation.mutate({ subscriptionId });
  };

  const toggleEvent = (eventId: string) => {
    if (selectedEvents.includes(eventId)) {
      setSelectedEvents(selectedEvents.filter((e) => e !== eventId));
    } else {
      setSelectedEvents([...selectedEvents, eventId]);
    }
  };

  const subscriptions = webhooks?.subscriptions || [];

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Webhook Management</h1>
        <p className="text-muted-foreground">
          Configure webhooks to receive real-time notifications about rule changes and compliance events
        </p>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Active Subscriptions</h2>
            <Button variant="outline" size="sm" onClick={() => refetchWebhooks()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {subscriptions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No webhook subscriptions yet</p>
                <p className="text-sm text-muted-foreground">Create your first webhook to receive real-time updates</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((subscription: any) => (
                <Card key={subscription.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-mono">{subscription.url}</CardTitle>
                        <Badge variant={subscription.isActive ? 'default' : 'secondary'}>
                          {subscription.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestWebhook(subscription.id)}
                          disabled={testWebhookMutation.isPending}
                        >
                          <TestTube className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWebhook(subscription.id)}
                          disabled={deleteWebhookMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {subscription.events.map((event: string) => (
                        <Badge key={event} variant="outline">
                          {event}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(subscription.createdAt).toLocaleDateString()}
                      {subscription.lastTriggeredAt && (
                        <span> | Last triggered: {new Date(subscription.lastTriggeredAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Webhook Subscription</CardTitle>
              <CardDescription>
                Configure a new webhook endpoint to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-server.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  This URL will receive POST requests when events occur
                </p>
              </div>

              <div className="space-y-3">
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-4">
                  {availableEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={event.id}
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={() => toggleEvent(event.id)}
                      />
                      <label
                        htmlFor={event.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {event.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleCreateWebhook}
                disabled={createWebhookMutation.isPending || !webhookUrl || selectedEvents.length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                {createWebhookMutation.isPending ? 'Creating...' : 'Create Webhook'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Logs</CardTitle>
              <CardDescription>Recent webhook delivery attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4" />
                <p>Delivery logs will appear here once webhooks are triggered</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
