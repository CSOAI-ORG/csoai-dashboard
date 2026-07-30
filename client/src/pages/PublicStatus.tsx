/**
 * Public Status Page
 * Shows system uptime, active incidents, and notification subscription
 * Accessible without authentication
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, AlertCircle, Clock, Bell, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Incident {
  id: number;
  title: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  startedAt: string;
  description: string;
}

export default function PublicStatus() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Mock system status data
  const systemStatus = {
    operational: true,
    uptime: 99.98,
    lastIncident: '2025-12-15',
    services: [
      { name: 'API Services', status: 'operational' },
      { name: 'Dashboard', status: 'operational' },
      { name: 'Training Platform', status: 'operational' },
      { name: 'Certification System', status: 'operational' },
      { name: 'Watchdog Reports', status: 'operational' },
      { name: 'Compliance Tools', status: 'operational' },
    ],
  };

  // Mock active incidents (empty for now)
  const activeIncidents: Incident[] = [
    // Example incident structure:
    // {
    //   id: 1,
    //   title: 'Increased API Latency',
    //   severity: 'minor',
    //   status: 'monitoring',
    //   startedAt: '2026-01-01T10:30:00Z',
    //   description: 'We are monitoring elevated API response times. Service remains operational.',
    // },
  ];

  // Mock recent resolved incidents
  const recentIncidents: Incident[] = [
    {
      id: 1,
      title: 'Database Connection Timeout',
      severity: 'major',
      status: 'resolved',
      startedAt: '2025-12-15T14:20:00Z',
      description: 'Database connection issues have been resolved. All services are operational.',
    },
    {
      id: 2,
      title: 'Scheduled Maintenance',
      severity: 'minor',
      status: 'resolved',
      startedAt: '2025-12-01T02:00:00Z',
      description: 'Scheduled maintenance completed successfully with no service disruption.',
    },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Successfully subscribed to status updates!');
      setEmail('');
      setIsSubscribing(false);
    }, 1000);

    // TODO: Implement actual subscription via API
    // await trpc.notifications.subscribeToStatus.mutate({ email });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'major':
        return 'bg-orange-500';
      case 'minor':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'investigating':
        return <AlertCircle className="h-4 w-4" />;
      case 'identified':
        return <AlertTriangle className="h-4 w-4" />;
      case 'monitoring':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">CSOAI System Status</h1>
          <p className="text-lg text-muted-foreground">
            Real-time status and uptime information for all CSOAI services
          </p>
        </div>

        {/* Overall Status */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {systemStatus.operational ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">All Systems Operational</h2>
                      <p className="text-muted-foreground">All services are running smoothly</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Service Disruption</h2>
                      <p className="text-muted-foreground">Some services are experiencing issues</p>
                    </div>
                  </>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-3xl font-bold">{systemStatus.uptime}%</span>
                </div>
                <p className="text-sm text-muted-foreground">30-day uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>Current operational status of all services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemStatus.services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <span className="font-medium">{service.name}</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Operational</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Incidents */}
        {activeIncidents.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Active Incidents</CardTitle>
              <CardDescription>Currently ongoing incidents and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(incident.status)}
                        <h3 className="font-semibold">{incident.title}</h3>
                      </div>
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Status: {incident.status}</span>
                      <span>Started: {new Date(incident.startedAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Incidents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>Recently resolved incidents and maintenance</CardDescription>
          </CardHeader>
          <CardContent>
            {recentIncidents.length > 0 ? (
              <div className="space-y-4">
                {recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <h3 className="font-semibold">{incident.title}</h3>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Resolved
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                    <div className="text-xs text-muted-foreground">
                      {new Date(incident.startedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No recent incidents. All systems have been stable.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Notification Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Subscribe to Status Updates
            </CardTitle>
            <CardDescription>
              Get notified via email when incidents occur or are resolved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isSubscribing}>
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">
              We'll only send you updates about system status and incidents. No spam.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            For support inquiries, please visit our{' '}
            <a href="/help-center" className="text-emerald-600 hover:underline">
              Help Center
            </a>{' '}
            or{' '}
            <a href="/contact" className="text-emerald-600 hover:underline">
              Contact Us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
