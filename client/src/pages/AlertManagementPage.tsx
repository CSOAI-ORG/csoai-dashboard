/**
 * Alert Management Console
 * Filtering, bulk actions, history, and notification preferences
 */

import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Bell,
  Mail,
  MessageSquare,
  Slack,
  Webhook,
  Filter,
  Download,
  Archive,
  Trash2,
} from 'lucide-react';

interface Alert {
  id: string;
  type: 'compliance_violation' | 'webhook_failure' | 'onboarding_dropoff' | 'assessment_overdue' | 'certification_expiring' | 'control_failure';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  organization: string;
  system?: string;
  createdAt: Date;
  resolvedAt?: Date;
  snoozedUntil?: Date;
}

interface NotificationPreference {
  channel: 'email' | 'push' | 'in-app' | 'slack' | 'webhook';
  enabled: boolean;
  icon: React.ReactNode;
  label: string;
}

const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert-1',
    type: 'compliance_violation',
    severity: 'critical',
    title: 'Data Protection Control Failure',
    description: 'System failed to implement required data protection controls',
    organization: 'Acme Corp',
    system: 'AI-Model-v2',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    resolvedAt: undefined,
  },
  {
    id: 'alert-2',
    type: 'webhook_failure',
    severity: 'high',
    title: 'Webhook Delivery Failed (5 retries)',
    description: 'Webhook endpoint unreachable for rule update notifications',
    organization: 'TechCorp Inc',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    resolvedAt: undefined,
  },
  {
    id: 'alert-3',
    type: 'onboarding_dropoff',
    severity: 'medium',
    title: 'Onboarding Dropoff at Framework Selection',
    description: 'Organization abandoned onboarding process at step 2',
    organization: 'Global Industries',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    resolvedAt: undefined,
  },
  {
    id: 'alert-4',
    type: 'assessment_overdue',
    severity: 'high',
    title: 'Compliance Assessment Overdue',
    description: 'EU AI Act assessment 30 days overdue',
    organization: 'Acme Corp',
    system: 'AI-Model-v1',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'alert-5',
    type: 'certification_expiring',
    severity: 'medium',
    title: 'Gold Certification Expiring in 15 Days',
    description: 'Current certification level will expire soon',
    organization: 'TechCorp Inc',
    system: 'AI-Model-v3',
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    resolvedAt: undefined,
  },
];

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  };
  return colors[severity] || colors.medium;
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    case 'high':
      return <AlertCircle className="w-4 h-4 text-orange-600" />;
    case 'medium':
      return <Clock className="w-4 h-4 text-yellow-600" />;
    default:
      return <CheckCircle className="w-4 h-4 text-green-600" />;
  }
};

const getAlertTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    compliance_violation: 'Compliance Violation',
    webhook_failure: 'Webhook Failure',
    onboarding_dropoff: 'Onboarding Dropoff',
    assessment_overdue: 'Assessment Overdue',
    certification_expiring: 'Certification Expiring',
    control_failure: 'Control Failure',
  };
  return labels[type] || type;
};

export const AlertManagementPage: React.FC = () => {
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('unresolved');
  const [filterOrganization, setFilterOrganization] = useState<string>('all');
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([
    { channel: 'email', enabled: true, icon: <Mail className="w-4 h-4" />, label: 'Email' },
    { channel: 'push', enabled: true, icon: <Bell className="w-4 h-4" />, label: 'Push Notifications' },
    { channel: 'in-app', enabled: true, icon: <MessageSquare className="w-4 h-4" />, label: 'In-App' },
    { channel: 'slack', enabled: false, icon: <Slack className="w-4 h-4" />, label: 'Slack' },
    { channel: 'webhook', enabled: false, icon: <Webhook className="w-4 h-4" />, label: 'Webhook' },
  ]);

  // Fetch alerts from tRPC
  const { data: alertsData, isLoading } = trpc.enterprise.getAlerts.useQuery({
    severity: filterSeverity as any,
    status: filterStatus as any,
  });

  // Fetch notification preferences from tRPC
  const { data: prefsData } = trpc.enterprise.getNotificationPreferences.useQuery();

  React.useEffect(() => {
    if (alertsData?.alerts) {
      setAlerts(alertsData.alerts as Alert[]);
    }
  }, [alertsData]);

  React.useEffect(() => {
    if (prefsData?.channels) {
      const newPrefs = notificationPreferences.map((pref) => ({
        ...pref,
        enabled: (prefsData.channels as any)[pref.channel] ?? pref.enabled,
      }));
      setNotificationPreferences(newPrefs);
    }
  }, [prefsData]);

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
      if (filterType !== 'all' && alert.type !== filterType) return false;
      if (filterStatus === 'unresolved' && alert.resolvedAt) return false;
      if (filterStatus === 'resolved' && !alert.resolvedAt) return false;
      if (filterOrganization !== 'all' && alert.organization !== filterOrganization) return false;
      return true;
    });
  }, [filterSeverity, filterType, filterStatus, filterOrganization]);

  // Alert statistics
  const stats = {
    total: alerts.length,
    unresolved: alerts.filter((a) => !a.resolvedAt).length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
  };

  const toggleAlertSelection = (alertId: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  const toggleAllAlerts = () => {
    if (selectedAlerts.size === filteredAlerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(filteredAlerts.map((a) => a.id)));
    }
  };

  const bulkResolveMutation = trpc.enterprise.bulkResolveAlerts.useMutation();
  const handleBulkResolve = async () => {
    try {
      await bulkResolveMutation.mutateAsync({ alertIds: Array.from(selectedAlerts) });
      setAlerts(alerts.map((a) => (selectedAlerts.has(a.id) ? { ...a, resolvedAt: new Date() } : a)));
      setSelectedAlerts(new Set());
    } catch (error) {
      console.error('Failed to resolve alerts:', error);
    }
  };

  const snoozeMutation = trpc.enterprise.snoozeAlert.useMutation();
  const handleBulkSnooze = async () => {
    try {
      for (const alertId of selectedAlerts) {
        await snoozeMutation.mutateAsync({ alertId, duration: '1d' });
      }
      setAlerts(alerts.map((a) => (selectedAlerts.has(a.id) ? { ...a, snoozedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) } : a)));
      setSelectedAlerts(new Set());
    } catch (error) {
      console.error('Failed to snooze alerts:', error);
    }
    setSelectedAlerts(new Set());
  };

  const archiveMutation = trpc.enterprise.archiveAlert.useMutation();
  const handleBulkArchive = async () => {
    try {
      for (const alertId of selectedAlerts) {
        await archiveMutation.mutateAsync({ alertId });
      }
      setAlerts(alerts.filter((a) => !selectedAlerts.has(a.id)));
      setSelectedAlerts(new Set());
    } catch (error) {
      console.error('Failed to archive alerts:', error);
    }
    setSelectedAlerts(new Set());
  };

  const toggleNotificationChannel = (channel: string) => {
    setNotificationPreferences((prefs) =>
      prefs.map((pref) =>
        pref.channel === channel ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alert Management</h1>
          <p className="text-muted-foreground">Monitor, filter, and manage compliance alerts</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Alerts
        </Button>
      </div>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-2">{stats.unresolved} unresolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-muted-foreground mt-2">Require immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.high}</div>
            <p className="text-xs text-muted-foreground mt-2">Should be addressed soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {Math.round(((stats.total - stats.unresolved) / stats.total) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">Of all alerts resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="preferences">Notification Preferences</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Severity</label>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="compliance_violation">Compliance Violation</option>
                    <option value="webhook_failure">Webhook Failure</option>
                    <option value="onboarding_dropoff">Onboarding Dropoff</option>
                    <option value="assessment_overdue">Assessment Overdue</option>
                    <option value="certification_expiring">Certification Expiring</option>
                    <option value="control_failure">Control Failure</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="unresolved">Unresolved</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Organization</label>
                  <select
                    value={filterOrganization}
                    onChange={(e) => setFilterOrganization(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All Organizations</option>
                    <option value="Acme Corp">Acme Corp</option>
                    <option value="TechCorp Inc">TechCorp Inc</option>
                    <option value="Global Industries">Global Industries</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedAlerts.size > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-blue-900">
                    {selectedAlerts.size} alert{selectedAlerts.size !== 1 ? 's' : ''} selected
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={handleBulkResolve} size="sm" variant="outline">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                    <Button onClick={handleBulkSnooze} size="sm" variant="outline">
                      <Clock className="w-4 h-4 mr-2" />
                      Snooze
                    </Button>
                    <Button onClick={handleBulkArchive} size="sm" variant="outline">
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alerts List */}
          <div className="space-y-3">
            {/* Select All */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <Checkbox
                checked={selectedAlerts.size === filteredAlerts.length && filteredAlerts.length > 0}
                onChange={toggleAllAlerts}
              />
              <span className="text-sm font-medium">
                {selectedAlerts.size === 0 ? 'Select All' : `Selected ${selectedAlerts.size}`}
              </span>
            </div>

            {/* Alert Items */}
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <Card key={alert.id} className={alert.resolvedAt ? 'opacity-60' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedAlerts.has(alert.id)}
                        onChange={() => toggleAlertSelection(alert.id)}
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(alert.severity)}
                            <h4 className="font-semibold">{alert.title}</h4>
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline">{getAlertTypeLabel(alert.type)}</Badge>
                            {alert.resolvedAt && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Resolved
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex gap-4">
                            <span>Organization: {alert.organization}</span>
                            {alert.system && <span>System: {alert.system}</span>}
                            <span>Created: {alert.createdAt.toLocaleString()}</span>
                            {alert.resolvedAt && <span>Resolved: {alert.resolvedAt.toLocaleString()}</span>}
                          </div>

                          {!alert.resolvedAt && (
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost">
                                Resolve
                              </Button>
                              <Button size="sm" variant="ghost">
                                Snooze
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No alerts match the selected filters
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Notification Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Configure how you receive compliance alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationPreferences.map((pref) => (
                <div key={pref.channel} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {pref.icon}
                    <div>
                      <p className="font-medium">{pref.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {pref.enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={pref.enabled}
                    onChange={() => toggleNotificationChannel(pref.channel)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Type Preferences</CardTitle>
              <CardDescription>Choose which alert types trigger notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { type: 'compliance_violation', label: 'Compliance Violations' },
                { type: 'webhook_failure', label: 'Webhook Failures' },
                { type: 'onboarding_dropoff', label: 'Onboarding Dropoffs' },
                { type: 'assessment_overdue', label: 'Assessments Overdue' },
                { type: 'certification_expiring', label: 'Certifications Expiring' },
                { type: 'control_failure', label: 'Control Failures' },
              ].map(({ type, label }) => (
                <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                  <p className="font-medium">{label}</p>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
              <CardDescription>No alerts will be sent during these hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <input type="time" defaultValue="22:00" className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <input type="time" defaultValue="08:00" className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
