import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft,
  Download,
  Share2,
  Award,
  TrendingUp,
  Calendar,
  Building2,
  Cpu,
  Loader2
} from 'lucide-react';

export default function ComplianceScorecard() {
  const { systemId } = useParams<{ systemId: string }>();
  const [, navigate] = useLocation();

  const { data: system } = trpc.aiSystems.getById.useQuery(
    { id: parseInt(systemId || '0') },
    { enabled: !!systemId }
  );

  const { data: assessments } = trpc.compliance.getAssessments.useQuery(
    { aiSystemId: parseInt(systemId || '0') },
    { enabled: !!systemId }
  );

  const { data: frameworks } = trpc.compliance.getFrameworks.useQuery();

  // Reuse the working PDF mutation from Compliance.tsx (returns base64 PDF).
  const generateReportMutation = trpc.compliance.generateReport.useMutation({
    onSuccess: (data) => {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${data.pdf}`;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Scorecard PDF downloaded');
    },
    onError: (error) => {
      toast.error('Failed to export PDF', { description: error.message });
    },
  });

  const handleExportPdf = () => {
    // Use the most recent completed assessment as the report basis.
    const latest = [...completedAssessments].sort(
      (a, b) =>
        new Date(b.assessment.createdAt!).getTime() -
        new Date(a.assessment.createdAt!).getTime()
    )[0];
    if (!latest) {
      toast.error('No completed assessment to export', {
        description: 'Run an assessment first to generate a PDF scorecard.',
      });
      return;
    }
    generateReportMutation.mutate({
      assessmentId: latest.assessment.id,
      includeEvidence: true,
      includeRecommendations: true,
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: `${system?.name ?? 'AI System'} — Compliance Scorecard`,
      text: `Compliance scorecard for ${system?.name ?? 'this AI system'} on CSOAI.`,
      url,
    };
    // Prefer the native Web Share API where available.
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard', {
        description: 'Share this scorecard link with your team.',
      });
    } catch {
      toast.error('Could not copy link', { description: url });
    }
  };

  if (!system) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">System Not Found</h1>
          <Button onClick={() => navigate('/ai-systems')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to AI Systems
          </Button>
        </div>
      </div>
    );
  }
  
  // Calculate overall compliance score
  const completedAssessments = assessments?.filter(a => a.assessment.status === 'completed') || [];
  const overallScore = completedAssessments.length > 0
    ? Math.round(completedAssessments.reduce((sum, a) => sum + (Number(a.assessment.overallScore) || 0), 0) / completedAssessments.length)
    : 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    if (score >= 80) return { label: 'Good', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (score >= 60) return { label: 'Fair', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return { label: 'Needs Improvement', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };
  
  const getRiskBadge = (risk: string) => {
    const colors: Record<string, string> = {
      minimal: 'bg-green-500/20 text-green-400',
      limited: 'bg-emerald-500/20 text-emerald-400',
      high: 'bg-orange-500/20 text-orange-400',
      unacceptable: 'bg-red-500/20 text-red-400',
    };
    return colors[risk] || 'bg-gray-500/20 text-gray-400';
  };
  
  const scoreBadge = getScoreBadge(overallScore);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Header */}
      <div className="border-b border-emerald-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/ai-systems')} className="text-emerald-700 hover:text-emerald-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                aria-label="Share this compliance scorecard"
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={generateReportMutation.isPending}
                aria-label="Export compliance scorecard as PDF"
                aria-busy={generateReportMutation.isPending}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              >
                {generateReportMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {generateReportMutation.isPending ? 'Exporting…' : 'Export PDF'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* System Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
              <Cpu className="h-12 w-12 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{system.name}</h1>
                <Badge className={getRiskBadge(system.riskLevel || 'minimal')}>
                  {system.riskLevel?.toUpperCase()} RISK
                </Badge>
              </div>
              <p className="text-white/60 mb-4">{system.description || 'No description provided'}</p>
              <div className="flex items-center gap-6 text-sm text-white/50">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {system.systemType}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Registered {new Date(system.createdAt!).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10 col-span-1 md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">Overall Compliance Score</p>
                  <div className="flex items-baseline gap-3">
                    <span className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
                      {overallScore}
                    </span>
                    <span className="text-2xl text-white/40">/100</span>
                  </div>
                  <Badge className={`mt-3 ${scoreBadge.color}`}>
                    {scoreBadge.label}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-lg font-semibold">+5%</span>
                  </div>
                  <p className="text-white/50 text-sm">vs last assessment</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 flex flex-col items-center justify-center h-full">
              <Award className="h-12 w-12 text-amber-400 mb-3" />
              <p className="text-white font-semibold text-lg">
                {completedAssessments.length} Assessments
              </p>
              <p className="text-white/50 text-sm">Completed</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Framework Breakdown */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              Framework Compliance
            </CardTitle>
            <CardDescription>Compliance scores across regulatory frameworks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {frameworks?.map(framework => {
                const frameworkAssessments = completedAssessments.filter(
                  a => a.assessment.frameworkId === framework.id
                );
                const frameworkScore = frameworkAssessments.length > 0
                  ? Math.round(frameworkAssessments.reduce((sum, a) => sum + (Number(a.assessment.overallScore) || 0), 0) / frameworkAssessments.length)
                  : null;
                
                return (
                  <div key={framework.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{framework.name}</p>
                        <p className="text-white/50 text-sm">{framework.version}</p>
                      </div>
                      <div className="text-right">
                        {frameworkScore !== null ? (
                          <>
                            <span className={`text-2xl font-bold ${getScoreColor(frameworkScore)}`}>
                              {frameworkScore}%
                            </span>
                            <p className="text-white/50 text-xs">
                              {frameworkAssessments.length} assessment{frameworkAssessments.length !== 1 ? 's' : ''}
                            </p>
                          </>
                        ) : (
                          <span className="text-white/40">Not assessed</span>
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={frameworkScore || 0} 
                      className="h-2 bg-white/10"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Assessment History */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Assessment History</CardTitle>
            <CardDescription>All compliance assessments for this system</CardDescription>
          </CardHeader>
          <CardContent>
            {completedAssessments.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">No completed assessments yet</p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/compliance')}
                >
                  Run First Assessment
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {completedAssessments.map(item => {
                  const framework = frameworks?.find(f => f.id === item.assessment.frameworkId);
                  const score = Number(item.assessment.overallScore) || 0;
                  return (
                    <div 
                      key={item.assessment.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          score >= 80 
                            ? 'bg-green-500/20' 
                            : score >= 60 
                              ? 'bg-yellow-500/20' 
                              : 'bg-red-500/20'
                        }`}>
                          {score >= 80 ? (
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                          ) : score >= 60 ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{framework?.name || 'Unknown Framework'}</p>
                          <p className="text-white/50 text-sm">
                            {new Date(item.assessment.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                          {score}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
