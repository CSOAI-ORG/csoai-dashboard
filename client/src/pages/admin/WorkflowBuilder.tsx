import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Mail,
  Clock,
  GitBranch,
  Play,
  Save,
  Plus,
  Trash2,
  Power,
  PowerOff,
  Eye,
  Copy,
  Zap,
  Users,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { SchedulingDialog } from '@/components/SchedulingDialog';

// Custom node types for workflow builder
const nodeTypes = {
  trigger: TriggerNode,
  sendEmail: SendEmailNode,
  wait: WaitNode,
  condition: ConditionNode,
};

function TriggerNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg border-2 border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 min-w-[200px]">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <div className="font-semibold text-sm">Trigger</div>
      </div>
      <div className="text-xs text-muted-foreground">{data.label}</div>
      <div className="mt-2">
        <Badge variant="outline" className="text-xs">
          {data.triggerType || 'Not configured'}
        </Badge>
      </div>
    </div>
  );
}

function SendEmailNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 min-w-[200px]">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <div className="font-semibold text-sm">Send Email</div>
      </div>
      <div className="text-xs text-muted-foreground line-clamp-2">{data.label || 'Email action'}</div>
      {data.templateId && (
        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            Template: {data.templateId}
          </Badge>
        </div>
      )}
    </div>
  );
}

function WaitNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 min-w-[200px]">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <div className="font-semibold text-sm">Wait</div>
      </div>
      <div className="text-xs text-muted-foreground">{data.label || 'Delay'}</div>
      {data.duration && (
        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            {data.duration} {data.unit || 'days'}
          </Badge>
        </div>
      )}
    </div>
  );
}

function ConditionNode({ data }: { data: any }) {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 min-w-[200px]">
      <div className="flex items-center gap-2 mb-1">
        <GitBranch className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <div className="font-semibold text-sm">Condition</div>
      </div>
      <div className="text-xs text-muted-foreground line-clamp-2">{data.label || 'If/Then logic'}</div>
      {data.condition && (
        <div className="mt-2">
          <Badge variant="outline" className="text-xs">
            {data.condition}
          </Badge>
        </div>
      )}
    </div>
  );
}

export default function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [triggerType, setTriggerType] = useState<string>('manual');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isSchedulingDialogOpen, setIsSchedulingDialogOpen] = useState(false);
  const [schedulingWorkflowId, setSchedulingWorkflowId] = useState<number | null>(null);

  const { data: workflows, refetch: refetchWorkflows } = trpc.workflowBuilder.getWorkflows.useQuery();
  const createWorkflow = trpc.workflowBuilder.createWorkflow.useMutation();
  const updateWorkflow = trpc.workflowBuilder.updateWorkflow.useMutation();
  const deleteWorkflow = trpc.workflowBuilder.deleteWorkflow.useMutation();
  const toggleWorkflow = trpc.workflowBuilder.toggleWorkflow.useMutation();
  const updateSchedule = trpc.workflowBuilder.updateWorkflowSchedule.useMutation();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `New ${type} node`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleCreateWorkflow = async () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    try {
      const result = await createWorkflow.mutateAsync({
        name: workflowName,
        description: workflowDescription,
        triggerType: triggerType as any,
        workflowData: { nodes: [], edges: [] },
        isActive: false,
      });

      toast.success('Workflow created successfully');
      setIsCreateDialogOpen(false);
      setWorkflowName('');
      setWorkflowDescription('');
      setTriggerType('manual');
      refetchWorkflows();
      setSelectedWorkflow(result.id);
    } catch (error) {
      toast.error('Failed to create workflow');
    }
  };

  const handleSaveWorkflow = async () => {
    if (!selectedWorkflow) {
      toast.error('No workflow selected');
      return;
    }

    try {
      await updateWorkflow.mutateAsync({
        id: selectedWorkflow,
        workflowData: { nodes, edges },
      });

      toast.success('Workflow saved successfully');
      setIsSaveDialogOpen(false);
      refetchWorkflows();
    } catch (error) {
      toast.error('Failed to save workflow');
    }
  };

  const handleLoadWorkflow = (workflowId: number) => {
    const workflow = workflows?.find((w) => w.id === workflowId);
    if (workflow) {
      setSelectedWorkflow(workflowId);
      const data = workflow.workflowData as any;
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      toast.success(`Loaded workflow: ${workflow.name}`);
    }
  };

  const handleDeleteWorkflow = async (workflowId: number) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await deleteWorkflow.mutateAsync({ id: workflowId });
      toast.success('Workflow deleted');
      if (selectedWorkflow === workflowId) {
        setSelectedWorkflow(null);
        setNodes([]);
        setEdges([]);
      }
      refetchWorkflows();
    } catch (error) {
      toast.error('Failed to delete workflow');
    }
  };

  const handleSaveSchedule = async (schedule: { enabled: boolean; cronExpression: string; timezone: string }) => {
    if (!schedulingWorkflowId) return;
    
    try {
      await updateSchedule.mutateAsync({
        id: schedulingWorkflowId,
        schedule: schedule.enabled ? {
          cronExpression: schedule.cronExpression,
          timezone: schedule.timezone,
        } : null,
      });
      toast.success('Schedule updated successfully');
      refetchWorkflows();
    } catch (error) {
      toast.error('Failed to update schedule');
      throw error;
    }
  };

  const handleToggleWorkflow = async (workflowId: number, isActive: boolean) => {
    try {
      await toggleWorkflow.mutateAsync({ id: workflowId, isActive: !isActive });
      toast.success(isActive ? 'Workflow deactivated' : 'Workflow activated');
      refetchWorkflows();
    } catch (error) {
      toast.error('Failed to toggle workflow');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Email Automation Workflows</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Build visual workflows to automate email campaigns
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    New Workflow
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Workflow</DialogTitle>
                    <DialogDescription>
                      Set up a new email automation workflow
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Workflow Name</Label>
                      <Input
                        id="name"
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        placeholder="Welcome Email Series"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={workflowDescription}
                        onChange={(e) => setWorkflowDescription(e.target.value)}
                        placeholder="Describe what this workflow does..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="trigger">Trigger Type</Label>
                      <Select value={triggerType} onValueChange={setTriggerType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="cohort_join">Student Joins Cohort</SelectItem>
                          <SelectItem value="enrollment">Course Enrollment</SelectItem>
                          <SelectItem value="completion">Course Completion</SelectItem>
                          <SelectItem value="date_based">Date/Time Based</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {selectedWorkflow && (
                <Button onClick={() => setIsSaveDialogOpen(true)} variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Workflow List */}
        <div className="w-80 border-r bg-card overflow-y-auto">
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
              Your Workflows
            </h3>
            {workflows?.map((workflow) => (
              <Card
                key={workflow.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedWorkflow === workflow.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleLoadWorkflow(workflow.id)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{workflow.name}</CardTitle>
                      {workflow.description && (
                        <CardDescription className="text-xs mt-1 line-clamp-2">
                          {workflow.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSchedulingWorkflowId(workflow.id);
                          setIsSchedulingDialogOpen(true);
                        }}
                        title="Schedule workflow"
                      >
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWorkflow(workflow.id, workflow.isActive === 1);
                        }}
                      >
                        {workflow.isActive ? (
                          <Power className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <PowerOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWorkflow(workflow.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant={workflow.isActive ? 'default' : 'secondary'} className="text-xs">
                      {workflow.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {workflow.triggerType.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}

            {(!workflows || workflows.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No workflows yet</p>
                <p className="text-xs mt-1">Create your first workflow to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b bg-card p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium mr-2">Add Node:</span>
              <Button size="sm" variant="outline" onClick={() => addNode('trigger')}>
                <Zap className="w-4 h-4 mr-1" />
                Trigger
              </Button>
              <Button size="sm" variant="outline" onClick={() => addNode('sendEmail')}>
                <Mail className="w-4 h-4 mr-1" />
                Send Email
              </Button>
              <Button size="sm" variant="outline" onClick={() => addNode('wait')}>
                <Clock className="w-4 h-4 mr-1" />
                Wait
              </Button>
              <Button size="sm" variant="outline" onClick={() => addNode('condition')}>
                <GitBranch className="w-4 h-4 mr-1" />
                Condition
              </Button>
            </div>
          </div>

          {/* React Flow Canvas */}
          <div className="flex-1">
            {selectedWorkflow ? (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
              >
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              </ReactFlow>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-lg font-medium">No workflow selected</p>
                  <p className="text-sm mt-2">Select a workflow from the sidebar or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Confirmation Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Workflow</DialogTitle>
            <DialogDescription>
              Save the current workflow configuration?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWorkflow}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scheduling Dialog */}
      <SchedulingDialog
        open={isSchedulingDialogOpen}
        onOpenChange={setIsSchedulingDialogOpen}
        workflowId={schedulingWorkflowId}
        workflowName={workflows?.find(w => w.id === schedulingWorkflowId)?.name || ''}
        currentSchedule={{
          enabled: !!workflows?.find(w => w.id === schedulingWorkflowId)?.schedule,
          cronExpression: (workflows?.find(w => w.id === schedulingWorkflowId)?.schedule as any)?.cronExpression,
          timezone: (workflows?.find(w => w.id === schedulingWorkflowId)?.schedule as any)?.timezone || 'UTC',
        }}
        onSave={handleSaveSchedule}
      />
    </div>
  );
}
