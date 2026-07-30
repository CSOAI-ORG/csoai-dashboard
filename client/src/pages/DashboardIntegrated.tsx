/**
 * Integrated Executive Dashboard
 * Real-time compliance metrics, webhook performance, and onboarding analytics
 */

import React, { useState, useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ComplianceScoreCardsWidget } from '@/components/dashboard/ComplianceScoreCardsWidget';
import { WebhookMetricsChart } from '@/components/dashboard/WebhookMetricsChart';
import { OnboardingFunnelVisualization } from '@/components/dashboard/OnboardingFunnelVisualization';
import { RefreshCw, Download, Settings, AlertCircle } from 'lucide-react';

interface DashboardState {
  refreshInterval: number;
  autoRefresh: boolean;
  selectedOrganization: string;
  dateRange: 'today' | 'week' | 'month' | 'year';
}

export const DashboardIntegrated: React.FC = () => {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    refreshInterval: 30000,
    autoRefresh: true,
    selectedOrganization: 'all',
    dateRange: 'month',
  });

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle manual refresh
   */
  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    try {
      // In production, would call tRPC endpoints
      // await trpc.enterprise.getExecutiveDashboard.query();
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Handle refresh interval change
   */
  const handleRefreshIntervalChange = (interval: number) => {
    setDashboardState((prev) => ({
      ...prev,
      refreshInterval: interval,
    }));
  };

  /**
   * Handle auto-refresh toggle
   */
  const handleAutoRefreshToggle = () => {
    setDashboardState((prev) => ({
      ...prev,
      autoRefresh: !prev.autoRefresh,
    }));
  };

  /**
   * Handle export dashboard
   */
  const handleExport = async (format: 'pdf' | 'csv' | 'json') => {
    try {
      // In production, would call tRPC export endpoint
      console.log(`Exporting dashboard as ${format}`);
    } catch (error) {
      console.error('Failed to export dashboard:', error);
    }
  };

  /**
   * Set up auto-refresh
   */
  useEffect(() => {
    if (!dashboardState.autoRefresh) return;

    const interval = setInterval(handleRefresh, dashboardState.refreshInterval);
    return () => clearInterval(interval);
  }, [dashboardState.autoRefresh, dashboardState.refreshInterval, handleRefresh]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Executive Dashboard</h1>
          <p className="text-muted-foreground">Real-time compliance metrics and organizational insights</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Dashboard Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Auto-Refresh Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Auto-Refresh</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={dashboardState.autoRefresh}
                  onChange={handleAutoRefreshToggle}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-muted-foreground">
                  {dashboardState.autoRefresh ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            {/* Refresh Interval */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Refresh Interval</label>
              <select
                value={dashboardState.refreshInterval}
                onChange={(e) => handleRefreshIntervalChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value={10000}>10 seconds</option>
                <option value={30000}>30 seconds</option>
                <option value={60000}>1 minute</option>
                <option value={300000}>5 minutes</option>
              </select>
            </div>

            {/* Organization Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization</label>
              <select
                value={dashboardState.selectedOrganization}
                onChange={(e) =>
                  setDashboardState((prev) => ({
                    ...prev,
                    selectedOrganization: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Organizations</option>
                <option value="org-1">Acme Corp</option>
                <option value="org-2">TechCorp Inc</option>
                <option value="org-3">Global Industries</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <select
                value={dashboardState.dateRange}
                onChange={(e) =>
                  setDashboardState((prev) => ({
                    ...prev,
                    dateRange: e.target.value as any,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <span className="text-sm font-medium">Export:</span>
            <Button
              onClick={() => handleExport('pdf')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button
              onClick={() => handleExport('csv')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </Button>
            <Button
              onClick={() => handleExport('json')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Key Metrics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Avg. Compliance Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">82.5%</div>
                <p className="text-xs text-muted-foreground mt-2">↑ 2.3% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">3</div>
                <p className="text-xs text-muted-foreground mt-2">Require immediate action</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Onboarding Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">68%</div>
                <p className="text-xs text-muted-foreground mt-2">30 of 44 organizations</p>
              </CardContent>
            </Card>
          </div>

          {/* System Health Summary */}
          <Card>
            <CardHeader>
              <CardTitle>System Health Summary</CardTitle>
              <CardDescription>Overall platform status and key metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Systems</p>
                  <p className="text-2xl font-bold">127</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Compliant</p>
                  <p className="text-2xl font-bold text-green-600">104</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">At Risk</p>
                  <p className="text-2xl font-bold text-yellow-600">18</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Non-Compliant</p>
                  <p className="text-2xl font-bold text-red-600">5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <ComplianceScoreCardsWidget
            refreshInterval={dashboardState.refreshInterval}
            onCardClick={(systemId) => {
              console.log(`Navigate to system ${systemId} details`);
            }}
          />
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-4">
          <WebhookMetricsChart refreshInterval={dashboardState.refreshInterval} />
        </TabsContent>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-4">
          <OnboardingFunnelVisualization refreshInterval={dashboardState.refreshInterval} />
        </TabsContent>
      </Tabs>

      {/* Critical Alerts Banner */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <CardTitle className="text-red-900">Critical Alerts Require Action</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-800 mb-4">
            3 critical compliance violations detected across your systems. Review and remediate immediately to maintain
            compliance status.
          </p>
          <Button variant="destructive" size="sm">
            View Alerts
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
