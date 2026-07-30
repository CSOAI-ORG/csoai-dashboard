import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  Mail,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Eye,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function EmailSchedulesIntegrated() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewRunsDialogOpen, setViewRunsDialogOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  // tRPC queries
  const { data: schedules, isLoading, refetch } = trpc.emailScheduling.list.useQuery({
    isActive: filterStatus === "all" ? undefined : filterStatus === "active",
  });

  const { data: runs } = trpc.emailScheduling.getRunHistory.useQuery(
    { scheduleId: selectedScheduleId! },
    { enabled: !!selectedScheduleId && viewRunsDialogOpen }
  );

  // tRPC mutations
  const updateSchedule = trpc.emailScheduling.update.useMutation({
    onSuccess: () => {
      toast.success("Schedule updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update schedule: ${error.message}`);
    },
  });

  const deleteSchedule = trpc.emailScheduling.delete.useMutation({
    onSuccess: () => {
      toast.success("Schedule deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete schedule: ${error.message}`);
    },
  });

  const runSchedule = trpc.emailScheduling.triggerManual.useMutation({
    onSuccess: () => {
      toast.success("Schedule triggered successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to trigger schedule: ${error.message}`);
    },
  });

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    await updateSchedule.mutateAsync({
      id,
      isActive: !currentStatus,
    });
  };

  const handleDeleteSchedule = async (id: number) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      await deleteSchedule.mutateAsync({ id });
    }
  };

  const handleViewRuns = (scheduleId: number) => {
    setSelectedScheduleId(scheduleId);
    setViewRunsDialogOpen(true);
  };

  const handleRunNow = async (id: number) => {
    await runSchedule.mutateAsync({ scheduleId: id });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      case "normal":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "low":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "running":
        return <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 space-y-8 animate-fade-in-scale">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight">Email Schedules</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage automated email campaigns and triggers
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} size="lg" className="gap-2">
            <Plus className="h-5 w-5" />
            Create Schedule
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Schedules</p>
                <p className="text-2xl font-bold">{schedules?.length || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-500/10 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {schedules?.filter((s) => s.isActive === 1).length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">
                  {schedules?.reduce((sum, s) => sum + s.sendCount, 0).toLocaleString() || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-orange-500/10 p-3">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">
                  {schedules?.filter((s) => s.nextRunAt).length || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schedules</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Schedules Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Schedule Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Emails Sent</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules?.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{schedule.name}</p>
                      <p className="text-sm text-muted-foreground">{schedule.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {schedule.triggerType.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(schedule.priority)}>
                      {schedule.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={schedule.isActive === 1}
                      onCheckedChange={() => handleToggleActive(schedule.id, schedule.isActive === 1)}
                    />
                  </TableCell>
                  <TableCell>{schedule.sendCount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{formatDate(schedule.lastRunAt)}</TableCell>
                  <TableCell className="text-sm">{formatDate(schedule.nextRunAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewRuns(schedule.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRunNow(schedule.id)}
                        disabled={schedule.isActive !== 1}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* View Runs Dialog */}
        <Dialog open={viewRunsDialogOpen} onOpenChange={setViewRunsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Run History</DialogTitle>
              <DialogDescription>
                View execution history for this email schedule
              </DialogDescription>
            </DialogHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Target Users</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Started At</TableHead>
                  <TableHead>Completed At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs?.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="capitalize">{run.runType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(run.status)}
                        <span className="capitalize">{run.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>{run.targetUserCount}</TableCell>
                    <TableCell className="text-green-600 dark:text-green-400">
                      {run.emailsSent}
                    </TableCell>
                    <TableCell className="text-red-600 dark:text-red-400">
                      {run.emailsFailed}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(run.startedAt)}</TableCell>
                    <TableCell className="text-sm">{formatDate(run.completedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
