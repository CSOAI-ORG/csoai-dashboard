/**
 * PDCA Cycles Management Page
 * Plan-Do-Check-Act continuous improvement cycle management
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Circle,
  ArrowRight,
  Trash2,
  Edit3,
  Target,
  Cog,
  Search,
  BarChart3,
  RefreshCw,
  ChevronRight,
  Clock,
  AlertCircle,
  FileDown,
  Loader2,
  Mail,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

// Phase configuration based on Deming/Shewhart PDCA methodology
// Reference: ASQ Quality Resources, ISO 9001:2015, Lean.org
const PHASES = [
  { 
    id: "plan", 
    label: "Plan", 
    icon: Target, 
    color: "blue",
    description: "Recognize opportunity, analyze baseline, plan change",
    guidance: [
      "Define the problem or opportunity for improvement",
      "Analyze current state and establish baseline metrics",
      "Identify root causes using data analysis",
      "Develop hypothesis for improvement",
      "Plan the change with clear success criteria",
      "Identify resources and timeline needed"
    ],
    outputs: ["Problem statement", "Root cause analysis", "Proposed countermeasures", "Success metrics"]
  },
  { 
    id: "do", 
    label: "Do", 
    icon: Play, 
    color: "green",
    description: "Test the change through small-scale implementation",
    guidance: [
      "Implement planned changes on a small scale (pilot)",
      "Execute according to the plan",
      "Document what actually happens vs. expected",
      "Collect data during implementation",
      "Note any deviations from the plan",
      "Train involved personnel as needed"
    ],
    outputs: ["Implementation records", "Data collected", "Observations log", "Deviation notes"]
  },
  { 
    id: "check", 
    label: "Check", 
    icon: Search, 
    color: "amber",
    description: "Review results, analyze data, identify learnings",
    guidance: [
      "Review and analyze collected data",
      "Compare actual results against targets",
      "Evaluate if hypothesis was correct",
      "Identify what worked and what didn't",
      "Document successes and failures",
      "Assess any unintended consequences"
    ],
    outputs: ["Analysis report", "Performance comparison", "Lessons learned", "Recommendations"]
  },
  { 
    id: "act", 
    label: "Act", 
    icon: Cog, 
    color: "purple",
    description: "Standardize success or iterate with new approach",
    guidance: [
      "If successful: Standardize the change across broader scope",
      "Update standard operating procedures",
      "Train all relevant personnel on new methods",
      "If unsuccessful: Analyze why and plan different approach",
      "Document best practices for future reference",
      "Begin next PDCA cycle for continuous improvement"
    ],
    outputs: ["Updated SOPs", "Training materials", "Best practices doc", "Next cycle plan"]
  },
] as const;

type Phase = typeof PHASES[number]["id"];

export default function PDCACycles() {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "paused">("all");
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cycleToDelete, setCycleToDelete] = useState<number | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState("");
  
  // Form state for creating new cycle
  const [newCycleForm, setNewCycleForm] = useState({
    aiSystemId: "",
    planSummary: "",
  });

  // Form state for editing phase
  const [editPhaseForm, setEditPhaseForm] = useState({
    phase: "plan" as Phase,
    summary: "",
  });

  // Queries
  const { data: cycles, refetch: refetchCycles } = trpc.pdca.list.useQuery({ status: statusFilter });
  const { data: aiSystems } = trpc.aiSystems.list.useQuery();
  const { data: selectedCycle, refetch: refetchSelectedCycle } = trpc.pdca.getById.useQuery(
    { id: selectedCycleId! },
    { enabled: !!selectedCycleId }
  );
  const { data: stats } = trpc.pdca.getStats.useQuery();

  // Mutations
  const createMutation = trpc.pdca.create.useMutation({
    onSuccess: () => {
      toast.success("PDCA cycle created", { description: "Your new improvement cycle has started." });
      setIsCreateDialogOpen(false);
      setNewCycleForm({ aiSystemId: "", planSummary: "" });
      refetchCycles();
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  const updatePhaseMutation = trpc.pdca.updatePhase.useMutation({
    onSuccess: () => {
      toast.success("Phase updated", { description: "Your changes have been saved." });
      setIsEditDialogOpen(false);
      refetchCycles();
      refetchSelectedCycle();
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  const advancePhaseMutation = trpc.pdca.advancePhase.useMutation({
    onSuccess: (result) => {
      if (result.completed) {
        toast.success("Cycle completed!", { description: "The PDCA cycle has been completed successfully." });
      } else {
        toast.success("Phase advanced", { description: `Moving to ${result.nextPhase?.toUpperCase()} phase.` });
      }
      refetchCycles();
      refetchSelectedCycle();
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  const pauseMutation = trpc.pdca.pause.useMutation({
    onSuccess: () => {
      toast.info("Cycle paused", { description: "The cycle has been paused." });
      refetchCycles();
      refetchSelectedCycle();
    },
  });

  const resumeMutation = trpc.pdca.resume.useMutation({
    onSuccess: () => {
      toast.success("Cycle resumed", { description: "The cycle is now active again." });
      refetchCycles();
      refetchSelectedCycle();
    },
  });

  const deleteMutation = trpc.pdca.delete.useMutation({
    onSuccess: () => {
      toast.success("Cycle deleted", { description: "The PDCA cycle has been removed." });
      setIsDeleteDialogOpen(false);
      setCycleToDelete(null);
      if (selectedCycleId === cycleToDelete) {
        setSelectedCycleId(null);
      }
      refetchCycles();
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  const generateReportMutation = trpc.pdca.generateReport.useMutation({
    onSuccess: (result) => {
      // Convert base64 to blob and download
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.mimeType });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Report downloaded", { description: "Your PDCA cycle report has been generated." });
    },
    onError: (error) => {
      toast.error("Error generating report", { description: error.message });
    },
  });

  const sendReportMutation = trpc.pdca.sendReport.useMutation({
    onSuccess: (result) => {
      setIsEmailDialogOpen(false);
      setEmailRecipient("");
      toast.success("Report sent!", { 
        description: `The PDCA report has been emailed successfully.`,
        action: result.previewUrl ? {
          label: "Preview",
          onClick: () => window.open(result.previewUrl, "_blank"),
        } : undefined,
      });
    },
    onError: (error) => {
      toast.error("Failed to send report", { description: error.message });
    },
  });

  const handleSendReport = () => {
    if (!selectedCycleId || !emailRecipient) return;
    sendReportMutation.mutate({
      id: selectedCycleId,
      email: emailRecipient,
    });
  };

  // Helper functions
  const getPhaseIndex = (phase: Phase) => PHASES.findIndex(p => p.id === phase);
  const getPhaseProgress = (phase: Phase) => ((getPhaseIndex(phase) + 1) / 4) * 100;
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Active</Badge>;
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">Completed</Badge>;
      case "paused":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateCycle = () => {
    if (!newCycleForm.aiSystemId || !newCycleForm.planSummary) {
      toast.error("Missing fields", { description: "Please fill in all required fields." });
      return;
    }
    createMutation.mutate({
      aiSystemId: parseInt(newCycleForm.aiSystemId),
      planSummary: newCycleForm.planSummary,
    });
  };

  const handleEditPhase = (cycle: typeof selectedCycle, phase: Phase) => {
    if (!cycle) return;
    const summaryKey = `${phase}Summary` as keyof typeof cycle;
    setEditPhaseForm({
      phase,
      summary: (cycle[summaryKey] as string) || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSavePhase = () => {
    if (!selectedCycleId || !editPhaseForm.summary) return;
    updatePhaseMutation.mutate({
      id: selectedCycleId,
      phase: editPhaseForm.phase,
      summary: editPhaseForm.summary,
    });
  };

  return (
    <DashboardLayout>
      <div className="container py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">PDCA Cycles</h1>
            <p className="text-muted-foreground mt-1">
              Plan-Do-Check-Act continuous improvement management
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Cycle
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.totalCycles}</div>
                    <div className="text-xs text-muted-foreground">Total Cycles</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.activeCycles}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.completedCycles}</div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <Pause className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.pausedCycles}</div>
                    <div className="text-xs text-muted-foreground">Paused</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Phase Distribution */}
        {stats && stats.activeCycles > 0 && (
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Active Cycles by Phase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {PHASES.map((phase) => {
                  const count = stats.phaseDistribution[phase.id] || 0;
                  const Icon = phase.icon;
                  return (
                    <div
                      key={phase.id}
                      className={cn(
                        "p-4 rounded-lg border-2 text-center transition-colors",
                        count > 0 
                          ? `border-${phase.color}-200 bg-${phase.color}-50 dark:border-${phase.color}-800 dark:bg-${phase.color}-950`
                          : "border-muted bg-muted/30"
                      )}
                    >
                      <Icon className={cn(
                        "h-6 w-6 mx-auto mb-2",
                        count > 0 ? `text-${phase.color}-600` : "text-muted-foreground"
                      )} />
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground">{phase.label}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cycles List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Cycles</CardTitle>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {cycles?.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No PDCA cycles yet</p>
                      <p className="text-sm mt-1">Create your first improvement cycle</p>
                    </div>
                  )}
                  {cycles?.map((cycle) => (
                    <motion.div
                      key={cycle.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                        selectedCycleId === cycle.id && "bg-muted"
                      )}
                      onClick={() => setSelectedCycleId(cycle.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium">Cycle #{cycle.cycleNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            {cycle.aiSystemName || "Unknown System"}
                          </div>
                        </div>
                        {getStatusBadge(cycle.status)}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Progress value={getPhaseProgress(cycle.phase as Phase)} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground uppercase font-medium">
                          {cycle.phase}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cycle Details */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedCycle ? (
                <motion.div
                  key={selectedCycle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-3">
                            Cycle #{selectedCycle.cycleNumber}
                            {getStatusBadge(selectedCycle.status)}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {selectedCycle.aiSystemName} • Started {new Date(selectedCycle.startedAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {selectedCycle.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => pauseMutation.mutate({ id: selectedCycle.id })}
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </Button>
                          )}
                          {selectedCycle.status === "paused" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resumeMutation.mutate({ id: selectedCycle.id })}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Resume
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateReportMutation.mutate({ id: selectedCycle.id })}
                            disabled={generateReportMutation.isPending}
                          >
                            {generateReportMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <FileDown className="h-4 w-4 mr-1" />
                            )}
                            {generateReportMutation.isPending ? "Generating..." : "Download"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEmailDialogOpen(true)}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => {
                              setCycleToDelete(selectedCycle.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Phase Progress */}
                      <div className="flex items-center justify-between mb-8">
                        {PHASES.map((phase, index) => {
                          const currentIndex = getPhaseIndex(selectedCycle.phase as Phase);
                          const isActive = phase.id === selectedCycle.phase;
                          const isCompleted = index < currentIndex;
                          const Icon = phase.icon;

                          return (
                            <div key={phase.id} className="flex items-center">
                              <div className="flex flex-col items-center">
                                <div
                                  className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                    isActive && "bg-primary text-primary-foreground",
                                    isCompleted && "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
                                    !isActive && !isCompleted && "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-6 w-6" />
                                  ) : (
                                    <Icon className="h-6 w-6" />
                                  )}
                                </div>
                                <span className={cn(
                                  "text-sm mt-2 font-medium",
                                  isActive && "text-primary",
                                  !isActive && "text-muted-foreground"
                                )}>
                                  {phase.label}
                                </span>
                              </div>
                              {index < PHASES.length - 1 && (
                                <ChevronRight className={cn(
                                  "h-5 w-5 mx-2",
                                  index < currentIndex ? "text-green-500" : "text-muted-foreground/30"
                                )} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Phase Cards */}
                      <Tabs defaultValue={selectedCycle.phase} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          {PHASES.map((phase) => (
                            <TabsTrigger key={phase.id} value={phase.id}>
                              {phase.label}
                            </TabsTrigger>
                          ))}
                        </TabsList>
                        {PHASES.map((phase) => {
                          const summaryKey = `${phase.id}Summary` as keyof typeof selectedCycle;
                          const summary = selectedCycle[summaryKey] as string | null;
                          const isCurrentPhase = phase.id === selectedCycle.phase;
                          const phaseIndex = getPhaseIndex(phase.id);
                          const currentIndex = getPhaseIndex(selectedCycle.phase as Phase);
                          const isCompleted = phaseIndex < currentIndex;
                          const Icon = phase.icon;

                          return (
                            <TabsContent key={phase.id} value={phase.id} className="mt-4">
                              <Card className={cn(
                                "border-2",
                                isCurrentPhase && "border-primary",
                                isCompleted && "border-green-200 dark:border-green-800"
                              )}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                        isCurrentPhase && "bg-primary/10",
                                        isCompleted && "bg-green-100 dark:bg-green-900",
                                        !isCurrentPhase && !isCompleted && "bg-muted"
                                      )}>
                                        <Icon className={cn(
                                          "h-5 w-5",
                                          isCurrentPhase && "text-primary",
                                          isCompleted && "text-green-600 dark:text-green-400",
                                          !isCurrentPhase && !isCompleted && "text-muted-foreground"
                                        )} />
                                      </div>
                                      <div>
                                        <CardTitle className="text-lg">{phase.label}</CardTitle>
                                        <CardDescription>{phase.description}</CardDescription>
                                      </div>
                                    </div>
                                    {(isCurrentPhase || isCompleted) && selectedCycle.status === "active" && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditPhase(selectedCycle, phase.id)}
                                      >
                                        <Edit3 className="h-4 w-4 mr-1" />
                                        Edit
                                      </Button>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  {summary ? (
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                      <p className="whitespace-pre-wrap">{summary}</p>
                                    </div>
                                  ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                      <p>No content yet for this phase</p>
                                      {isCurrentPhase && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="mt-4"
                                          onClick={() => handleEditPhase(selectedCycle, phase.id)}
                                        >
                                          <Edit3 className="h-4 w-4 mr-1" />
                                          Add Content
                                        </Button>
                                      )}
                                    </div>
                                  )}

                                  {/* Phase Guidance - Deming Cycle Best Practices */}
                                  {isCurrentPhase && selectedCycle.status === "active" && (
                                    <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                        <Target className="h-4 w-4 text-primary" />
                                        Phase Guidance (Deming Cycle)
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <h5 className="text-xs font-medium text-muted-foreground uppercase mb-2">Key Activities</h5>
                                          <ul className="text-sm space-y-1">
                                            {phase.guidance.map((item, i) => (
                                              <li key={i} className="flex items-start gap-2">
                                                <CheckCircle2 className="h-3 w-3 mt-1 text-green-500 flex-shrink-0" />
                                                <span>{item}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                        <div>
                                          <h5 className="text-xs font-medium text-muted-foreground uppercase mb-2">Expected Outputs</h5>
                                          <div className="flex flex-wrap gap-2">
                                            {phase.outputs.map((output, i) => (
                                              <Badge key={i} variant="secondary" className="text-xs">
                                                {output}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Advance Phase Button */}
                              {isCurrentPhase && selectedCycle.status === "active" && summary && (
                                <div className="mt-4 flex justify-end">
                                  <Button
                                    onClick={() => advancePhaseMutation.mutate({ id: selectedCycle.id })}
                                    disabled={advancePhaseMutation.isPending}
                                  >
                                    {phase.id === "act" ? (
                                      <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Complete Cycle
                                      </>
                                    ) : (
                                      <>
                                        Advance to {PHASES[phaseIndex + 1]?.label}
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </TabsContent>
                          );
                        })}
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center"
                >
                  <Card className="w-full">
                    <CardContent className="py-16 text-center">
                      <RefreshCw className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                      <h3 className="text-lg font-medium mb-2">Select a Cycle</h3>
                      <p className="text-muted-foreground mb-6">
                        Choose a PDCA cycle from the list to view details and manage phases
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Cycle
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Create Cycle Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Start New PDCA Cycle</DialogTitle>
              <DialogDescription>
                Begin a new Plan-Do-Check-Act improvement cycle for one of your AI systems.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="aiSystem">AI System</Label>
                <Select
                  value={newCycleForm.aiSystemId}
                  onValueChange={(v) => setNewCycleForm(prev => ({ ...prev, aiSystemId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an AI system" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiSystems?.map((system) => (
                      <SelectItem key={system.id} value={system.id.toString()}>
                        {system.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="planSummary">Plan Summary</Label>
                <Textarea
                  id="planSummary"
                  placeholder="Describe the improvement objectives, problems to solve, and planned changes..."
                  rows={5}
                  value={newCycleForm.planSummary}
                  onChange={(e) => setNewCycleForm(prev => ({ ...prev, planSummary: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 10 characters. Be specific about what you want to improve.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCycle}
                disabled={createMutation.isPending || !newCycleForm.aiSystemId || newCycleForm.planSummary.length < 10}
              >
                {createMutation.isPending ? "Creating..." : "Start Cycle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Phase Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit {editPhaseForm.phase.charAt(0).toUpperCase() + editPhaseForm.phase.slice(1)} Phase</DialogTitle>
              <DialogDescription>
                {PHASES.find(p => p.id === editPhaseForm.phase)?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="phaseSummary">Summary</Label>
                <Textarea
                  id="phaseSummary"
                  placeholder={`Describe the ${editPhaseForm.phase} phase activities and outcomes...`}
                  rows={8}
                  value={editPhaseForm.summary}
                  onChange={(e) => setEditPhaseForm(prev => ({ ...prev, summary: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSavePhase}
                disabled={updatePhaseMutation.isPending || editPhaseForm.summary.length < 10}
              >
                {updatePhaseMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete PDCA Cycle?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All phase data for this cycle will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => cycleToDelete && deleteMutation.mutate({ id: cycleToDelete })}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Email Report Dialog */}
        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Send Report via Email
              </DialogTitle>
              <DialogDescription>
                Enter the recipient's email address to send the PDCA cycle report as a PDF attachment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Recipient Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="recipient@example.com"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                />
              </div>
              {selectedCycle && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium">Report Details:</p>
                  <p className="text-muted-foreground mt-1">
                    Cycle #{selectedCycle.cycleNumber} • {selectedCycle.aiSystemName}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendReport}
                disabled={sendReportMutation.isPending || !emailRecipient || !emailRecipient.includes("@")}
              >
                {sendReportMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
