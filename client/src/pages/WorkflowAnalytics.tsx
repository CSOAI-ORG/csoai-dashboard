/**
 * Workflow Analytics Dashboard
 * Comprehensive analytics for workflow execution metrics, performance, and trends
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Calendar,
  Zap,
  AlertCircle,
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

type DateRange = "24h" | "7d" | "30d" | "90d";

export default function WorkflowAnalytics() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch workflow execution statistics
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.workflowBuilder.getWorkflowStats.useQuery({
    dateRange,
  });

  // Fetch execution history for charts
  const { data: executionHistory, isLoading: historyLoading, refetch: refetchHistory } = trpc.workflowBuilder.getExecutionHistory.useQuery({
    dateRange,
  });

  // Fetch workflow list
  const { data: workflows, refetch: refetchWorkflows } = trpc.workflowBuilder.getWorkflows.useQuery();

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchStats();
      refetchHistory();
      refetchWorkflows();
      setLastUpdated(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetchStats, refetchHistory, refetchWorkflows]);

  const handleManualRefresh = () => {
    refetchStats();
    refetchHistory();
    refetchWorkflows();
    setLastUpdated(new Date());
  };

  const handleExport = () => {
    // Export data as CSV
    const csvData = executionHistory?.map(item => ({
      date: item.date,
      total: item.total,
      success: item.success,
      failed: item.failed,
      pending: item.pending,
    })) || [];

    const csv = [
      ["Date", "Total", "Success", "Failed", "Pending"],
      ...csvData.map(row => [row.date, row.total, row.success, row.failed, row.pending]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  // Calculate metrics
  const totalExecutions = stats?.totalExecutions || 0;
  const successfulExecutions = stats?.successfulExecutions || 0;
  const failedExecutions = stats?.failedExecutions || 0;
  const pendingExecutions = stats?.pendingExecutions || 0;
  const successRate = totalExecutions > 0 ? ((successfulExecutions / totalExecutions) * 100).toFixed(1) : "0.0";
  const avgExecutionTime = stats?.avgExecutionTime || 0;
  const totalWorkflows = workflows?.length || 0;
  const activeWorkflows = workflows?.filter(w => w.isActive === 1).length || 0;

  // Prepare chart data
  const statusDistributionData = [
    { name: "Success", value: successfulExecutions, color: "#22c55e" },
    { name: "Failed", value: failedExecutions, color: "#ef4444" },
    { name: "Pending", value: pendingExecutions, color: "#f59e0b" },
  ].filter(item => item.value > 0);

  const trendData = executionHistory?.map(item => ({
    date: format(new Date(item.date), "MMM dd"),
    Success: item.success,
    Failed: item.failed,
    Pending: item.pending,
    Total: item.total,
  })) || [];

  // Performance data
  const performanceData = executionHistory?.map(item => ({
    date: format(new Date(item.date), "MMM dd"),
    avgTime: item.avgExecutionTime || 0,
    successRate: item.total > 0 ? ((item.success / item.total) * 100) : 0,
  })) || [];

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into workflow execution performance and trends
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Last updated: {format(lastUpdated, "h:mm:ss a")}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={statsLoading || historyLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(statsLoading || historyLoading) ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="flex items-center gap-4">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExecutions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {totalWorkflows} workflow{totalWorkflows !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {successfulExecutions.toLocaleString()} successful executions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Execution Time</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgExecutionTime < 1000
                ? `${avgExecutionTime.toFixed(0)}ms`
                : `${(avgExecutionTime / 1000).toFixed(2)}s`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average processing time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkflows}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalWorkflows - activeWorkflows} inactive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{successfulExecutions.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {totalExecutions > 0 ? `${successRate}% of total executions` : "No executions yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{failedExecutions.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {totalExecutions > 0
                ? `${((failedExecutions / totalExecutions) * 100).toFixed(1)}% failure rate`
                : "No failures"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingExecutions.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Currently in queue or processing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Execution Trends</TabsTrigger>
          <TabsTrigger value="distribution">Status Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Execution Trends</CardTitle>
              <CardDescription>
                Daily execution counts by status over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="Success"
                      stackId="1"
                      stroke="#22c55e"
                      fill="#22c55e"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="Failed"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="Pending"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No execution data available for the selected date range</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Execution Status Distribution</CardTitle>
              <CardDescription>
                Breakdown of workflow executions by final status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statusDistributionData.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="flex flex-col justify-center space-y-4">
                    {statusDistributionData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{item.value.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {totalExecutions > 0
                              ? `${((item.value / totalExecutions) * 100).toFixed(1)}%`
                              : "0%"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No execution data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Average Execution Time</CardTitle>
                <CardDescription>
                  Processing time trends over selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="avgTime"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="Avg Time (ms)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <p>No performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate Trend</CardTitle>
                <CardDescription>
                  Daily success rate percentage over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="successRate"
                        stroke="#22c55e"
                        strokeWidth={2}
                        name="Success Rate (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <p>No success rate data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
