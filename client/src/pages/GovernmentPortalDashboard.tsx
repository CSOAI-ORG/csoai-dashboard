/**
 * Government Portal Dashboard
 * Real-time compliance oversight for EU Commission, EDPB, and national authorities
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Download,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  FileText,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GovernmentAnalytics {
  totalCertifiedAnalysts: number;
  certificationsByLevel: {
    fundamentals: number;
    professional: number;
    expert: number;
  };
  complianceReports: {
    total: number;
    byFramework: Record<string, number>;
    byStatus: Record<string, number>;
  };
  incidentMetrics: {
    totalReports: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    resolutionRate: number;
  };
  trends: {
    certifications: Array<{ date: string; count: number }>;
    incidents: Array<{ date: string; count: number }>;
    compliance: Array<{ date: string; score: number }>;
  };
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function GovernmentPortalDashboard() {
  const [analytics, setAnalytics] = useState<GovernmentAnalytics | null>(null);
  const [selectedFramework, setSelectedFramework] = useState('eu_ai_act');
  const [jurisdiction, setJurisdiction] = useState('EU');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setAnalytics({
        totalCertifiedAnalysts: 1247,
        certificationsByLevel: {
          fundamentals: 847,
          professional: 312,
          expert: 88,
        },
        complianceReports: {
          total: 3421,
          byFramework: {
            eu_ai_act: 1205,
            nist_rmf: 892,
            tc260: 756,
            iso_42001: 568,
          },
          byStatus: {
            compliant: 2156,
            under_review: 892,
            flagged: 267,
            non_compliant: 106,
          },
        },
        incidentMetrics: {
          totalReports: 2847,
          byCategory: {
            bias: 654,
            safety: 512,
            privacy: 489,
            transparency: 423,
            other: 769,
          },
          bySeverity: {
            critical: 89,
            high: 267,
            medium: 1205,
            low: 1286,
          },
          resolutionRate: 78,
        },
        trends: {
          certifications: [
            { date: '2025-12-01', count: 45 },
            { date: '2025-12-08', count: 67 },
            { date: '2025-12-15', count: 89 },
            { date: '2025-12-22', count: 112 },
          ],
          incidents: [
            { date: '2025-12-01', count: 156 },
            { date: '2025-12-08', count: 142 },
            { date: '2025-12-15', count: 178 },
            { date: '2025-12-22', count: 189 },
          ],
          compliance: [
            { date: '2025-12-01', score: 72 },
            { date: '2025-12-08', score: 75 },
            { date: '2025-12-15', score: 78 },
            { date: '2025-12-22', score: 81 },
          ],
        },
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Loading government analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Government Portal</h1>
          <p className="text-gray-600">Real-time AI Safety Compliance Oversight</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <Select value={jurisdiction} onValueChange={setJurisdiction}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EU">EU Commission</SelectItem>
              <SelectItem value="EDPB">EDPB</SelectItem>
              <SelectItem value="US">US Government</SelectItem>
              <SelectItem value="UK">UK Authority</SelectItem>
              <SelectItem value="CN">China Authority</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedFramework} onValueChange={setSelectedFramework}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="eu_ai_act">EU AI Act</SelectItem>
              <SelectItem value="nist_rmf">NIST AI RMF</SelectItem>
              <SelectItem value="tc260">TC260</SelectItem>
              <SelectItem value="iso_42001">ISO 42001</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Certified Analysts</p>
                  <p className="text-3xl font-bold">{analytics.totalCertifiedAnalysts}</p>
                </div>
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Compliance Reports</p>
                  <p className="text-3xl font-bold">{analytics.complianceReports.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Incidents Reported</p>
                  <p className="text-3xl font-bold">{analytics.incidentMetrics.totalReports}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolution Rate</p>
                  <p className="text-3xl font-bold">{analytics.incidentMetrics.resolutionRate}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Certification Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Certification Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trends.certifications}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Incident Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Incident Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trends.incidents}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Certification Levels */}
            <Card>
              <CardHeader>
                <CardTitle>Certified Analysts by Level</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Fundamentals', value: analytics.certificationsByLevel.fundamentals },
                        { name: 'Professional', value: analytics.certificationsByLevel.professional },
                        { name: 'Expert', value: analytics.certificationsByLevel.expert },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[0, 1, 2].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Incident Severity */}
            <Card>
              <CardHeader>
                <CardTitle>Incidents by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: 'Critical',
                        count: analytics.incidentMetrics.bySeverity.critical,
                      },
                      { name: 'High', count: analytics.incidentMetrics.bySeverity.high },
                      {
                        name: 'Medium',
                        count: analytics.incidentMetrics.bySeverity.medium,
                      },
                      { name: 'Low', count: analytics.incidentMetrics.bySeverity.low },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status by Framework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.complianceReports.byFramework).map(([framework, count]) => (
                  <div key={framework}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">{framework.replace(/_/g, ' ').toUpperCase()}</span>
                      <Badge variant="outline">{count} reports</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{
                          width: `${(count / analytics.complianceReports.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compliance Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.complianceReports.byStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <p className="text-sm text-gray-600 mb-1">{status.replace(/_/g, ' ')}</p>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-gray-500">
                  {((count / analytics.complianceReports.total) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
