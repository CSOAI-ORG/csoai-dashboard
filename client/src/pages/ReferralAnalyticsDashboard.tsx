/**
 * Referral Analytics Dashboard
 * Comprehensive analytics for referral program performance
 */

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Users, DollarSign, MousePointerClick, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface AnalyticsData {
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  conversionRate: number;
  averageCommissionPerConversion: number;
  topReferralCodes: Array<{
    code: string;
    clicks: number;
    conversions: number;
    earnings: number;
  }>;
  clicksTrend: Array<{
    date: string;
    clicks: number;
  }>;
  conversionsTrend: Array<{
    date: string;
    conversions: number;
  }>;
  earningsTrend: Array<{
    date: string;
    earnings: number;
  }>;
}

const mockAnalyticsData: AnalyticsData = {
  totalClicks: 1250,
  totalConversions: 87,
  totalEarnings: 4350,
  conversionRate: 6.96,
  averageCommissionPerConversion: 50,
  topReferralCodes: [
    { code: 'COAI2024', clicks: 450, conversions: 35, earnings: 1750 },
    { code: 'SAFETY50', clicks: 380, conversions: 28, earnings: 1400 },
    { code: 'ANALYST20', clicks: 250, conversions: 15, earnings: 750 },
    { code: 'REFER100', clicks: 170, conversions: 9, earnings: 450 },
  ],
  clicksTrend: [
    { date: '2024-12-20', clicks: 45 },
    { date: '2024-12-21', clicks: 52 },
    { date: '2024-12-22', clicks: 38 },
    { date: '2024-12-23', clicks: 61 },
    { date: '2024-12-24', clicks: 55 },
    { date: '2024-12-25', clicks: 48 },
    { date: '2024-12-26', clicks: 51 },
  ],
  conversionsTrend: [
    { date: '2024-12-20', conversions: 3 },
    { date: '2024-12-21', conversions: 4 },
    { date: '2024-12-22', conversions: 2 },
    { date: '2024-12-23', conversions: 5 },
    { date: '2024-12-24', conversions: 4 },
    { date: '2024-12-25', conversions: 3 },
    { date: '2024-12-26', conversions: 4 },
  ],
  earningsTrend: [
    { date: '2024-12-20', earnings: 150 },
    { date: '2024-12-21', earnings: 200 },
    { date: '2024-12-22', earnings: 100 },
    { date: '2024-12-23', earnings: 250 },
    { date: '2024-12-24', earnings: 200 },
    { date: '2024-12-25', earnings: 150 },
    { date: '2024-12-26', earnings: 200 },
  ],
};

export default function ReferralAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(mockAnalyticsData);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch analytics data from API
  const { data: analyticsResponse, isLoading: isFetching, error: analyticsError } = trpc.referral.getReferralAnalytics.useQuery(
    { dateRange }
  );

  // Handle analytics data updates
  useEffect(() => {
    if (analyticsResponse?.success && analyticsResponse?.data) {
      setAnalyticsData(analyticsResponse.data as AnalyticsData);
    }
  }, [analyticsResponse]);

  useEffect(() => {
    if (analyticsError) {
      toast.error('Failed to load analytics data');
      console.error('Analytics error:', analyticsError);
    }
  }, [analyticsError]);

  // Export CSV mutation
  const exportCsvMutation = trpc.referral.exportAnalyticsAsCSV.useMutation({
    onSuccess: (response) => {
      if (response.success && response.data) {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('CSV exported successfully');
      }
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error('Failed to export CSV');
      console.error('Export error:', error);
      setIsExporting(false);
    },
  });

  // Export PDF mutation
  const exportPdfMutation = trpc.referral.exportAnalyticsAsPDF.useMutation({
    onSuccess: (response) => {
      if (response.success && response.data) {
        const binaryString = atob(response.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('PDF exported successfully');
      }
      setIsExporting(false);
    },
    onError: (error) => {
      toast.error('Failed to export PDF');
      console.error('Export error:', error);
      setIsExporting(false);
    },
  });

  const handleExportCSV = async () => {
    setIsExporting(true);
    await exportCsvMutation.mutateAsync({ dateRange });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    await exportPdfMutation.mutateAsync({ dateRange });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Referral Analytics</h1>
          <p className="text-gray-600">Track your referral program performance and earnings</p>
        </motion.div>

        {/* Date Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8 flex gap-4 items-center"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export PDF
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {isFetching && (
            <div className="col-span-full flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <span className="ml-2 text-gray-600">Loading analytics...</span>
            </div>
          )}

          {/* Total Clicks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-emerald-600" />
                Total Clicks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{analyticsData.totalClicks}</div>
              <p className="text-xs text-gray-500 mt-1">Referral link clicks</p>
            </CardContent>
          </Card>

          {/* Total Conversions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                Conversions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{analyticsData.totalConversions}</div>
              <p className="text-xs text-gray-500 mt-1">Completed certifications</p>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{analyticsData.conversionRate.toFixed(2)}%</div>
              <p className="text-xs text-gray-500 mt-1">Clicks to conversions</p>
            </CardContent>
          </Card>

          {/* Total Earnings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">${analyticsData.totalEarnings}</div>
              <p className="text-xs text-gray-500 mt-1">Commission earned</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {/* Clicks Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Clicks Trend</CardTitle>
              <CardDescription>Referral link clicks over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.clicksTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#059669" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Conversions Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Conversions Trend</CardTitle>
              <CardDescription>Completed certifications over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.conversionsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="conversions" stroke="#059669" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Earnings Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings Trend</CardTitle>
              <CardDescription>Commission earnings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.earningsTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="earnings" fill="#059669" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Referral Codes */}
          <Card>
            <CardHeader>
              <CardTitle>Top Referral Codes</CardTitle>
              <CardDescription>Best performing codes by earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topReferralCodes.map((code, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{code.code}</div>
                      <div className="text-xs text-gray-500">
                        {code.clicks} clicks • {code.conversions} conversions
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-emerald-600">${code.earnings}</div>
                      <div className="text-xs text-gray-500">earnings</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Average Commission per Conversion</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${analyticsData.averageCommissionPerConversion}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Clicks</div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.totalClicks}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Conversion Rate</div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsData.conversionRate.toFixed(2)}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
