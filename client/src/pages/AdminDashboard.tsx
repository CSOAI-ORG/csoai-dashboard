import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Activity, Zap, Clock, AlertCircle } from 'lucide-react';

interface DashboardMetrics {
  activeConnections: number;
  eventThroughput: number;
  systemHealth: number;
  averageLatency: number;
  errorRate: number;
  timestamp: Date;
}

interface DashboardStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  recentEvents: any[];
  systemHealth: {
    uptime: number;
    activeConnections: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Fetch dashboard data
    const fetchData = async () => {
      try {
        // In production, these would be API calls
        // For now, we'll use mock data
        const mockMetrics: DashboardMetrics = {
          activeConnections: 1247,
          eventThroughput: 342.5,
          systemHealth: 94.2,
          averageLatency: 87.3,
          errorRate: 0.8,
          timestamp: new Date(),
        };

        const mockStats: DashboardStats = {
          totalEvents: 45230,
          eventsByType: {
            compliance_update: 12450,
            audit_result: 8920,
            enforcement_action: 6780,
            risk_alert: 5320,
            certification_issued: 4890,
            framework_update: 3420,
            council_decision: 2100,
            watchdog_report: 1350,
          },
          eventsBySeverity: {
            info: 28450,
            warning: 12340,
            critical: 4440,
          },
          recentEvents: [
            { type: 'compliance_update', severity: 'info', title: 'EU AI Act update', time: '2 min ago' },
            { type: 'audit_result', severity: 'warning', title: 'High-risk system flagged', time: '5 min ago' },
            { type: 'enforcement_action', severity: 'critical', title: 'Enforcement notice issued', time: '12 min ago' },
          ],
          systemHealth: {
            uptime: 99.9,
            activeConnections: 1247,
            memoryUsage: 342.5,
            cpuUsage: 28.3,
          },
        };

        setMetrics(mockMetrics);
        setStats(mockStats);

        // Generate alerts
        const generatedAlerts = [];
        if (mockMetrics.errorRate > 5) {
          generatedAlerts.push({
            severity: 'critical',
            message: `High error rate: ${mockMetrics.errorRate.toFixed(2)}%`,
          });
        }
        if (mockMetrics.averageLatency > 100) {
          generatedAlerts.push({
            severity: 'warning',
            message: `High latency: ${mockMetrics.averageLatency.toFixed(0)}ms`,
          });
        }
        setAlerts(generatedAlerts);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();

    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  if (!metrics || !stats) {
    return <div className="p-8 text-center">Failed to load dashboard data</div>;
  }

  const eventTypeData = Object.entries(stats.eventsByType).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value,
  }));

  const severityData = Object.entries(stats.eventsBySeverity).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = {
    info: '#3b82f6',
    warning: '#f59e0b',
    critical: '#ef4444',
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {metrics.timestamp.toLocaleTimeString()}
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <Alert key={idx} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{metrics.activeConnections.toLocaleString()}</div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Event Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{metrics.eventThroughput.toFixed(1)}</div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">events/min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{metrics.systemHealth.toFixed(1)}%</div>
              <div className={`h-8 w-8 rounded-full ${metrics.systemHealth > 80 ? 'bg-green-500' : metrics.systemHealth > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{metrics.averageLatency.toFixed(0)}ms</div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{metrics.errorRate.toFixed(2)}%</div>
              <AlertCircle className={`h-8 w-8 ${metrics.errorRate > 5 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
            <CardDescription>Total: {stats.totalEvents.toLocaleString()} events</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Events by Severity */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Severity</CardTitle>
            <CardDescription>Distribution across severity levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Latest real-time events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentEvents.map((event, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-500">{event.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={event.severity === 'critical' ? 'destructive' : event.severity === 'warning' ? 'secondary' : 'default'}>
                    {event.severity}
                  </Badge>
                  <span className="text-sm text-gray-500">{event.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health Details */}
      <Card>
        <CardHeader>
          <CardTitle>System Health Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-xl font-bold">{stats.systemHealth.uptime.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Connections</p>
              <p className="text-xl font-bold">{stats.systemHealth.activeConnections.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Memory Usage</p>
              <p className="text-xl font-bold">{stats.systemHealth.memoryUsage.toFixed(1)} MB</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CPU Usage</p>
              <p className="text-xl font-bold">{stats.systemHealth.cpuUsage.toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
