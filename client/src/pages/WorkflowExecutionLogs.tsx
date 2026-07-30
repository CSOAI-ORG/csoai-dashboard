/**
 * Workflow Execution Logs Page
 * Detailed viewer for email workflow execution history
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Eye, 
  MousePointerClick,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

export default function WorkflowExecutionLogs() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch email logs
  const { data: emailLogs, isLoading, refetch: refetchLogs } = trpc.workflowBuilder.getEmailLogs.useQuery({
    limit: 100,
  });

  // Fetch statistics
  const { data: stats, refetch: refetchStats } = trpc.workflowBuilder.getEmailLogStats.useQuery({});

  // Fetch workflows for filtering
  const { data: workflows } = trpc.workflowBuilder.getWorkflows.useQuery();

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchLogs();
      refetchStats();
      setLastUpdated(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetchLogs, refetchStats]);

  const handleManualRefresh = () => {
    refetchLogs();
    refetchStats();
    setLastUpdated(new Date());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "opened":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "clicked":
        return <MousePointerClick className="h-4 w-4 text-purple-500" />;
      case "failed":
      case "bounced":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "queued":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "sent":
      case "delivered":
        return "default";
      case "opened":
      case "clicked":
        return "secondary";
      case "failed":
      case "bounced":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredLogs = emailLogs?.filter((log) => {
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesSearch = 
      log.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.emailSubject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.recipientName && log.recipientName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const exportToCSV = () => {
    if (!filteredLogs) return;

    const headers = ["Date", "Workflow", "Recipient", "Email", "Subject", "Status", "Sent At", "Delivered At"];
    const rows = filteredLogs.map((log) => [
      format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss"),
      log.workflowName || "N/A",
      log.recipientName || "N/A",
      log.recipientEmail,
      log.emailSubject,
      log.status,
      log.sentAt ? format(new Date(log.sentAt), "yyyy-MM-dd HH:mm:ss") : "N/A",
      log.deliveredAt ? format(new Date(log.deliveredAt), "yyyy-MM-dd HH:mm:ss") : "N/A",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-execution-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Execution Logs</h1>
          <p className="text-muted-foreground mt-1">
            Detailed history of all emails sent through your workflows
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh-logs"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh-logs" className="text-sm cursor-pointer">
              Auto-refresh (30s)
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={handleManualRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!filteredLogs?.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" /> Queued
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.queued}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <Mail className="h-3 w-3" /> Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Delivered
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <Eye className="h-3 w-3" /> Opened
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.opened}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <MousePointerClick className="h-3 w-3" /> Clicked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clicked}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Bounced
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bounced}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                <XCircle className="h-3 w-3" /> Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by email, name, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                  <SelectItem value="clicked">Clicked</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>
            {filteredLogs?.length || 0} email{filteredLogs?.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading execution logs...</div>
          ) : !filteredLogs || filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No execution logs found. Start running workflows to see email history here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Workflow</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Delivered At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.workflowName || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {log.recipientName && (
                            <div className="font-medium">{log.recipientName}</div>
                          )}
                          <div className="text-sm text-muted-foreground">{log.recipientEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{log.emailSubject}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(log.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(log.status)}
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {log.sentAt ? format(new Date(log.sentAt), "MMM dd, HH:mm") : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {log.deliveredAt ? format(new Date(log.deliveredAt), "MMM dd, HH:mm") : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
