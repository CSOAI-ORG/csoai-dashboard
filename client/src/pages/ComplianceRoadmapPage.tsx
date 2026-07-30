/**
 * Compliance Roadmap Page
 * 4-phase remediation timeline with Gantt chart and resource allocation
 */

import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Users, TrendingUp, Download } from 'lucide-react';
import { DeadlineCountdown } from '@/components/DeadlineCountdown';
import { ComplianceGamification } from '@/components/ComplianceGamification';

interface RemediationAction {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  progress: number;
}

interface RemediationPhase {
  phase: number;
  name: string;
  duration: string;
  startDate: Date;
  endDate: Date;
  actions: RemediationAction[];
  expectedOutcome: string;
  progress: number;
}

const MOCK_PHASES: RemediationPhase[] = [
  {
    phase: 1,
    name: 'Critical Remediation',
    duration: '0-30 days',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    actions: [
      {
        id: 'action-1',
        title: 'Implement Data Protection Controls',
        description: 'Deploy encryption and access controls',
        estimatedHours: 120,
        priority: 'critical',
        owner: 'Security Officer',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'in-progress',
        progress: 60,
      },
      {
        id: 'action-2',
        title: 'Establish Governance Framework',
        description: 'Create compliance governance structure',
        estimatedHours: 80,
        priority: 'critical',
        owner: 'Compliance Officer',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: 'pending',
        progress: 0,
      },
    ],
    expectedOutcome: 'Address all critical compliance gaps',
    progress: 30,
  },
  {
    phase: 2,
    name: 'High Priority Implementation',
    duration: '1-3 months',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    actions: [
      {
        id: 'action-3',
        title: 'Deploy Transparency Controls',
        description: 'Implement disclosure and documentation',
        estimatedHours: 60,
        priority: 'high',
        owner: 'Product Manager',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'pending',
        progress: 0,
      },
    ],
    expectedOutcome: 'Implement high-priority controls',
    progress: 0,
  },
  {
    phase: 3,
    name: 'Medium Priority Enhancement',
    duration: '3-6 months',
    startDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    actions: [],
    expectedOutcome: 'Enhance compliance posture',
    progress: 0,
  },
  {
    phase: 4,
    name: 'Continuous Improvement',
    duration: '6+ months',
    startDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    actions: [],
    expectedOutcome: 'Maintain and improve compliance',
    progress: 0,
  },
];

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    low: 'bg-green-100 text-green-800 border-green-300',
  };
  return colors[priority] || colors.medium;
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'in-progress':
      return <Clock className="w-4 h-4 text-blue-600" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-600" />;
  }
};

export const ComplianceRoadmapPage: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());
  const [phases, setPhases] = useState<RemediationPhase[]>(MOCK_PHASES);

  // Fetch roadmap data from tRPC
  const { data: roadmapData, isLoading, error } = trpc.enterprise.getComplianceRoadmap.useQuery({});

  useEffect(() => {
    if (roadmapData?.phases) {
      setPhases(roadmapData.phases as RemediationPhase[]);
    }
  }, [roadmapData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">Error loading roadmap: {error.message}</p>
      </div>
    );
  }

  const toggleActionExpanded = (actionId: string) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(actionId)) {
      newExpanded.delete(actionId);
    } else {
      newExpanded.add(actionId);
    }
    setExpandedActions(newExpanded);
  };

  const totalHours = phases.reduce(
    (sum, phase) => sum + phase.actions.reduce((actionSum, action) => actionSum + action.estimatedHours, 0),
    0
  );

  const completedHours = phases.reduce(
    (sum, phase) =>
      sum +
      phase.actions
        .filter((action) => action.status === 'completed')
        .reduce((actionSum, action) => actionSum + action.estimatedHours, 0),
    0
  );

  const overallProgress = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Compliance Remediation Roadmap</h1>
          <p className="text-muted-foreground">4-phase timeline for addressing compliance gaps</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Roadmap
        </Button>
      </div>

      {/* EU AI Act deadline countdown */}
      <DeadlineCountdown variant="full" />

      {/* Gamified milestone progress: level, phases conquered, next milestone */}
      <ComplianceGamification
        overallScore={overallProgress}
        frameworks={phases.map((phase) => ({ name: phase.name, score: phase.progress }))}
        conqueredThreshold={100}
      />

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>Remediation effort tracking across all phases</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Effort</p>
              <p className="text-2xl font-bold">{totalHours}h</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedHours}h</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold text-orange-600">{totalHours - completedHours}h</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold text-blue-600">{overallProgress}%</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Timeline Gantt Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Remediation Timeline</CardTitle>
          <CardDescription>4-phase timeline with key milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases.map((phase) => (
              <div key={phase.phase} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      Phase {phase.phase}: {phase.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{phase.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{phase.progress}% Complete</p>
                  </div>
                </div>

                {/* Gantt Bar */}
                <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className={`h-full rounded-lg transition-all ${
                      phase.phase === 1
                        ? 'bg-red-500'
                        : phase.phase === 2
                          ? 'bg-orange-500'
                          : phase.phase === 3
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                    }`}
                    style={{ width: `${phase.progress}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white pointer-events-none">
                    {phase.progress > 0 && `${phase.progress}%`}
                  </div>
                </div>

                {/* Phase Details */}
                <div className="text-xs text-muted-foreground">
                  {phase.startDate.toLocaleDateString()} → {phase.endDate.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Phase Details Tabs */}
      <Tabs value={`phase-${selectedPhase}`} onValueChange={(val) => setSelectedPhase(parseInt(val.split('-')[1]))}>
        <TabsList className="grid w-full grid-cols-4">
          {phases.map((phase) => (
            <TabsTrigger key={phase.phase} value={`phase-${phase.phase}`}>
              Phase {phase.phase}
            </TabsTrigger>
          ))}
        </TabsList>

        {phases.map((phase) => (
          <TabsContent key={phase.phase} value={`phase-${phase.phase}`} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{phase.name}</CardTitle>
                    <CardDescription>{phase.duration}</CardDescription>
                  </div>
                  <Badge variant="outline">{phase.progress}% Complete</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Phase Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Actions</p>
                    <p className="text-2xl font-bold">{phase.actions.length}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Effort</p>
                    <p className="text-2xl font-bold">
                      {phase.actions.reduce((sum, action) => sum + action.estimatedHours, 0)}h
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Expected Outcome</p>
                    <p className="text-sm font-medium">{phase.expectedOutcome}</p>
                  </div>
                </div>

                {/* Actions List */}
                <div className="space-y-3 pt-4 border-t">
                  {phase.actions.length > 0 ? (
                    phase.actions.map((action) => (
                      <div
                        key={action.id}
                        className="border rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors"
                      >
                        {/* Action Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(action.status)}
                              <h4 className="font-semibold">{action.title}</h4>
                              <Badge className={getPriorityColor(action.priority)}>
                                {action.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                          </div>
                          <button
                            onClick={() => toggleActionExpanded(action.id)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {expandedActions.has(action.id) ? '−' : '+'}
                          </button>
                        </div>

                        {/* Action Details */}
                        {expandedActions.has(action.id) && (
                          <div className="pt-3 border-t space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <p className="text-xs text-muted-foreground">Estimated Hours</p>
                                <p className="font-semibold">{action.estimatedHours}h</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Owner</p>
                                <p className="font-semibold text-sm flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {action.owner}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Start Date</p>
                                <p className="font-semibold text-sm">{action.startDate.toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">End Date</p>
                                <p className="font-semibold text-sm">{action.endDate.toLocaleDateString()}</p>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm text-muted-foreground">{action.progress}%</span>
                              </div>
                              <Progress value={action.progress} className="h-2" />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                              {action.status === 'pending' && (
                                <Button size="sm" variant="outline">
                                  Start Action
                                </Button>
                              )}
                              {action.status === 'in-progress' && (
                                <Button size="sm" variant="outline">
                                  Update Progress
                                </Button>
                              )}
                              <Button size="sm" variant="ghost">
                                View Details
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No actions defined for this phase yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Resource Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Allocation</CardTitle>
          <CardDescription>Team members and their assigned remediation actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Security Officer', 'Compliance Officer', 'Product Manager', 'Operations Manager'].map((owner) => {
              const ownerActions = phases.flatMap((p) => p.actions).filter((a) => a.owner === owner);
              const ownerHours = ownerActions.reduce((sum, a) => sum + a.estimatedHours, 0);

              return (
                <div key={owner} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{owner}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ownerActions.length} actions • {ownerHours}h
                    </div>
                  </div>
                  <Progress value={(ownerHours / totalHours) * 100} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
