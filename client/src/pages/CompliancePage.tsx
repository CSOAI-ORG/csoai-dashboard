/**
 * Compliance Assessment Page
 * EU AI Act compliance tracking, certification, and reporting
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  FileText,
  Award,
  AlertTriangle,
} from 'lucide-react';

export function CompliancePage() {
  const [selectedSystem, setSelectedSystem] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<string>('');
  const [implementedControls, setImplementedControls] = useState<string[]>([]);
  const [targetCertification, setTargetCertification] = useState<'bronze' | 'silver' | 'gold' | 'platinum'>('gold');

  // Fetch AI systems
  const { data: systems } = useQuery({
    queryKey: ['aiSystems'],
    queryFn: async () => {
      return [
        { id: 1, name: 'Customer Analytics AI' },
        { id: 2, name: 'Fraud Detection System' },
      ];
    },
  });

  // Fetch requirements
  const { data: requirements } = trpc.compliance.getRequirements.useQuery({
    article: selectedArticle ? parseInt(selectedArticle) : undefined,
  });

  // Fetch articles
  const { data: articles } = trpc.compliance.getArticles.useQuery();

  // Assess compliance
  const assessMutation = trpc.compliance.assessCompliance.useMutation();

  // Generate gap analysis
  const gapAnalysisMutation = trpc.compliance.generateGapAnalysis.useMutation();

  // Get compliance roadmap
  const { data: roadmapData } = trpc.compliance.getComplianceRoadmap.useQuery(
    {
      aiSystemId: selectedSystem ? parseInt(selectedSystem) : 0,
      targetLevel: targetCertification,
    },
    { enabled: !!selectedSystem }
  );

  const handleToggleControl = (control: string) => {
    setImplementedControls((prev) =>
      prev.includes(control) ? prev.filter((c) => c !== control) : [...prev, control]
    );
  };

  const complianceScore = assessMutation.data?.complianceScore || 0;
  const certificationLevel = assessMutation.data?.certificationLevel || 'bronze';
  const gapAnalysis = gapAnalysisMutation.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Compliance Assessment</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Track EU AI Act compliance and work towards certification
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="assessment" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        {/* Assessment Tab */}
        <TabsContent value="assessment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Assessment</CardTitle>
              <CardDescription>
                Evaluate your AI system's compliance with EU AI Act requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* System Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select AI System</label>
                <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an AI system" />
                  </SelectTrigger>
                  <SelectContent>
                    {systems?.map((system) => (
                      <SelectItem key={system.id} value={system.id.toString()}>
                        {system.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Controls Checklist */}
              {selectedSystem && requirements?.requirements && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Implemented Controls</h3>
                  <div className="space-y-2">
                    {requirements.requirements.slice(0, 5).map((req: any) =>
                      req.controls.map((control: string) => (
                        <div key={control} className="flex items-center space-x-2">
                          <Checkbox
                            id={control}
                            checked={implementedControls.includes(control)}
                            onCheckedChange={() => handleToggleControl(control)}
                          />
                          <label htmlFor={control} className="text-sm cursor-pointer">
                            {control}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Assess Button */}
              <Button
                onClick={() => assessMutation.mutate({
                  aiSystemId: parseInt(selectedSystem),
                  implementedControls,
                })}
                disabled={!selectedSystem || assessMutation.isPending}
                className="w-full"
                size="lg"
              >
                Run Assessment
              </Button>

              {/* Results */}
              {assessMutation.data && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Compliance Score */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                          <div className="text-4xl font-bold text-blue-600">
                            {complianceScore}%
                          </div>
                          <p className="text-sm text-muted-foreground">Compliance Score</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Certification Level */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                          <Badge className="mx-auto" variant="outline">
                            {certificationLevel.toUpperCase()}
                          </Badge>
                          <p className="text-sm text-muted-foreground">Certification Level</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to Gold Certification</span>
                      <span className="font-medium">70% required</span>
                    </div>
                    <Progress value={Math.min(complianceScore, 100)} />
                  </div>

                  {/* Status */}
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2">
                    {complianceScore >= 70 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div className="text-sm">
                      {complianceScore >= 70
                        ? 'Your system meets Gold certification requirements'
                        : `You need ${70 - complianceScore} more points for Gold certification`}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Requirements Tab */}
        <TabsContent value="requirements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>EU AI Act Requirements</CardTitle>
              <CardDescription>
                Browse all applicable compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Article Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Article</label>
                <Select value={selectedArticle} onValueChange={setSelectedArticle}>
                  <SelectTrigger>
                    <SelectValue placeholder="All articles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Articles</SelectItem>
                    {articles?.articles?.map((article: any) => (
                      <SelectItem key={article.article} value={article.article.toString()}>
                        Article {article.article} ({article.requirementCount} requirements)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Requirements List */}
              <div className="space-y-3">
                {requirements?.requirements?.map((req: any) => (
                  <div key={req.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{req.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                      </div>
                      <Badge variant={
                        req.riskLevel === 'prohibited' ? 'destructive' :
                        req.riskLevel === 'high' ? 'secondary' :
                        'outline'
                      }>
                        {req.riskLevel}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Required Controls:</p>
                      <div className="flex flex-wrap gap-1">
                        {req.controls.map((control: string) => (
                          <Badge key={control} variant="outline" className="text-xs">
                            {control}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gap Analysis Tab */}
        <TabsContent value="gaps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gap Analysis</CardTitle>
              <CardDescription>
                Identify missing controls and compliance gaps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={() => gapAnalysisMutation.mutate({
                  aiSystemId: parseInt(selectedSystem),
                  implementedControls,
                })}
                disabled={!selectedSystem || gapAnalysisMutation.isPending}
                className="w-full"
              >
                Generate Gap Analysis
              </Button>

              {gapAnalysis && (
                <div className="space-y-4">
                  {/* Coverage */}
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Control Coverage</span>
                      <span className="text-2xl font-bold">{gapAnalysis.coverage}%</span>
                    </div>
                    <Progress value={gapAnalysis.coverage} />
                  </div>

                  {/* Implemented Controls */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Implemented Controls ({gapAnalysis.implemented.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {gapAnalysis.implemented.map((control: string) => (
                        <Badge key={control} variant="outline" className="text-xs">
                          {control}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Missing Controls */}
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      Missing Controls ({gapAnalysis.missing.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {gapAnalysis.priorityGaps.map((control: string) => (
                        <Badge key={control} variant="destructive" className="text-xs">
                          {control}
                        </Badge>
                      ))}
                    </div>
                    {gapAnalysis.missing.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{gapAnalysis.missing.length - 5} more...
                      </p>
                    )}
                  </div>

                  {/* Remediation Timeline */}
                  <div className="p-3 bg-yellow-50 rounded-lg text-sm">
                    <p className="font-medium">Estimated Remediation Time</p>
                    <p className="text-muted-foreground">{gapAnalysis.estimatedRemediationTime}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roadmap Tab */}
        <TabsContent value="roadmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Roadmap</CardTitle>
              <CardDescription>
                Your path to certification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target Certification */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Certification</label>
                <Select value={targetCertification} onValueChange={(v) => setTargetCertification(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Roadmap Phases */}
              {roadmapData?.phases && (
                <div className="space-y-3">
                  {roadmapData.phases.map((phase: any) => (
                    <div key={phase.phase} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{phase.name}</h4>
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                        </div>
                        <Badge variant="outline">Phase {phase.phase}</Badge>
                      </div>
                      <ul className="text-sm space-y-1 ml-4">
                        {phase.tasks.map((task: string) => (
                          <li key={task} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {roadmapData && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                  <p className="text-sm font-medium">Total Duration</p>
                  <p className="text-2xl font-bold text-blue-600">{roadmapData.totalDuration}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
