/**
 * Admin Analytics Dashboard
 * Visual charts showing incident trends, compliance scores, and user activity metrics
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Shield, Activity } from 'lucide-react';
export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // TODO: Fetch analytics data from backend when endpoints are ready
  // const { data: incidentTrends } = trpc.watchdog.getIncidentTrends.useQuery({ days: parseInt(timeRange) });
  // const { data: complianceScores } = trpc.compliance.getComplianceHistory.useQuery({ days: parseInt(timeRange) });
  // const { data: userActivity } = trpc.users.getUserActivityMetrics.useQuery({ days: parseInt(timeRange) });

  // Mock data for demonstration (fallback if API not ready)
  const mockIncidentData = [
    { date: '2025-12-01', incidents: 12, resolved: 10 },
    { date: '2025-12-08', incidents: 15, resolved: 13 },
    { date: '2025-12-15', incidents: 8, resolved: 7 },
    { date: '2025-12-22', incidents: 18, resolved: 15 },
    { date: '2025-12-29', incidents: 14, resolved: 12 },
    { date: '2026-01-05', incidents: 10, resolved: 9 },
  ];

  const mockComplianceData = [
    { date: '2025-12-01', euAiAct: 75, nist: 82, tc260: 68 },
    { date: '2025-12-08', euAiAct: 78, nist: 84, tc260: 71 },
    { date: '2025-12-15', euAiAct: 80, nist: 86, tc260: 74 },
    { date: '2025-12-22', euAiAct: 83, nist: 88, tc260: 77 },
    { date: '2025-12-29', euAiAct: 85, nist: 90, tc260: 80 },
    { date: '2026-01-05', euAiAct: 87, nist: 91, tc260: 82 },
  ];

  const mockUserActivityData = [
    { month: 'Aug', signups: 45, certifications: 12, reports: 28 },
    { month: 'Sep', signups: 62, certifications: 18, reports: 35 },
    { month: 'Oct', signups: 78, certifications: 24, reports: 42 },
    { month: 'Nov', signups: 95, certifications: 31, reports: 56 },
    { month: 'Dec', signups: 112, certifications: 38, reports: 67 },
    { month: 'Jan', signups: 128, certifications: 45, reports: 74 },
  ];

  // Use mock data (replace with API data when endpoints are ready)
  const incidentData = mockIncidentData;
  const complianceData = mockComplianceData;
  const activityData = mockUserActivityData;

  // Summary stats
  const totalIncidents = incidentData.reduce((sum: number, item: any) => sum + (item.incidents || 0), 0);
  const resolvedIncidents = incidentData.reduce((sum: number, item: any) => sum + (item.resolved || 0), 0);
  const resolutionRate = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0;

  const latestCompliance = complianceData[complianceData.length - 1];
  const avgComplianceScore = latestCompliance 
    ? Math.round((latestCompliance.euAiAct + latestCompliance.nist + latestCompliance.tc260) / 3)
    : 0;

  const totalUsers = activityData.reduce((sum: number, item: any) => sum + (item.signups || 0), 0);
  const totalCertifications = activityData.reduce((sum: number, item: any) => sum + (item.certifications || 0), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Visual insights into incident trends, compliance scores, and user activity metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents}</div>
            <p className="text-xs text-muted-foreground">
              {resolutionRate}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgComplianceScore}%</div>
            <p className="text-xs text-muted-foreground">
              Across all frameworks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Signups in period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certifications</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCertifications}</div>
            <p className="text-xs text-muted-foreground">
              Completed in period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
          <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
          <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange} className="space-y-4">
          {/* Incident Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Trends</CardTitle>
              <CardDescription>
                Number of incidents reported and resolved over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={incidentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="incidents" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                    name="Incidents Reported"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="resolved" 
                    stackId="2"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                    name="Incidents Resolved"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Compliance Scores Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Scores Over Time</CardTitle>
              <CardDescription>
                Compliance scores across different frameworks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="euAiAct" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="EU AI Act"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="nist" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="NIST AI RMF"
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tc260" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="TC260"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Activity Metrics</CardTitle>
              <CardDescription>
                Signups, certifications, and incident reports by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="signups" fill="#3b82f6" name="Signups" />
                  <Bar dataKey="certifications" fill="#10b981" name="Certifications" />
                  <Bar dataKey="reports" fill="#f59e0b" name="Reports Submitted" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
