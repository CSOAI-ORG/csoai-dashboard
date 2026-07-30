/**
 * Enterprise Onboarding Wizard
 * 5-step guided setup for new organizations
 */
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ChevronRight, ChevronLeft, Building2, Shield, Bot, ClipboardCheck, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function OnboardingPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState('');
  
  // Step 1: Company Info
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  
  // Step 2: Frameworks
  const [selectedFrameworks, setSelectedFrameworks] = useState<number[]>([]);
  
  // Step 3: AI Systems
  const [aiSystems, setAiSystems] = useState<Array<{ name: string; type: string; riskLevel: string }>>([]);
  const [newSystem, setNewSystem] = useState({ name: '', type: '', riskLevel: '' });
  
  // Step 4: Baseline Assessment
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  
  // Step 5: Team
  const [teamMembers, setTeamMembers] = useState<Array<{ email: string; role: string }>>([]);
  const [newMember, setNewMember] = useState({ email: '', role: '' });

  // tRPC mutations using hooks
  const startOnboardingMutation = trpc.onboarding.startOnboarding.useMutation({
    onSuccess: (data) => {
      setSessionId(data.sessionId);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const submitCompanyInfoMutation = trpc.onboarding.submitCompanyInfo.useMutation({
    onSuccess: () => {
      toast({ title: 'Company info saved', description: 'Moving to framework selection' });
      setCurrentStep(2);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const selectFrameworksMutation = trpc.onboarding.selectFrameworks.useMutation({
    onSuccess: () => {
      toast({ title: 'Frameworks selected', description: 'Moving to AI systems mapping' });
      setCurrentStep(3);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const mapAISystemsMutation = trpc.onboarding.mapAISystems.useMutation({
    onSuccess: () => {
      toast({ title: 'AI Systems mapped', description: 'Moving to baseline assessment' });
      setCurrentStep(4);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const submitBaselineAssessmentMutation = trpc.onboarding.submitBaseline.useMutation({
    onSuccess: (data: any) => {
      toast({ title: 'Assessment completed', description: `Baseline score: ${data.baselineScore}%` });
      setCurrentStep(5);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const inviteTeamMutation = trpc.onboarding.setupTeam.useMutation({
    onSuccess: () => {
      toast({ title: 'Onboarding complete!', description: 'Your team has been invited' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  // tRPC queries using hooks
  const { data: frameworksData } = trpc.onboarding.getAvailableFrameworks.useQuery(undefined, {
    enabled: currentStep === 2,
  });

  const { data: baselineQuestionsData } = trpc.onboarding.getBaselineQuestions.useQuery(undefined, {
    enabled: currentStep === 4,
  });

  // Initialize onboarding
  useEffect(() => {
    if (!sessionId) {
      startOnboardingMutation.mutate();
    }
  }, []);

  const handleSubmitCompanyInfo = () => {
    if (!companyName || !industry || !companySize || !jurisdiction) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    submitCompanyInfoMutation.mutate({
      sessionId,
      name: companyName,
      industry,
      size: companySize as any,
      jurisdiction,
    });
  };

  const handleSelectFrameworks = () => {
    if (selectedFrameworks.length === 0) {
      toast({ title: 'Error', description: 'Please select at least one framework', variant: 'destructive' });
      return;
    }
    selectFrameworksMutation.mutate({
      sessionId,
      frameworkIds: selectedFrameworks,
    });
  };

  const handleMapAISystems = () => {
    if (aiSystems.length === 0) {
      toast({ title: 'Error', description: 'Please add at least one AI system', variant: 'destructive' });
      return;
    }
    mapAISystemsMutation.mutate({
      sessionId,
      aiSystems: aiSystems.map(s => ({
        name: s.name,
        type: s.type as any,
        riskLevel: s.riskLevel as any,
      })),
    });
  };

  const handleSubmitAssessment = () => {
    submitBaselineAssessmentMutation.mutate({
      sessionId,
      assessmentAnswers: assessmentAnswers as any,
    });
  };

  const handleInviteTeam = () => {
    inviteTeamMutation.mutate({
      sessionId,
      teamMembers: teamMembers.map(m => ({
        email: m.email,
        role: m.role as any,
      })),
    });
  };

  const addAISystem = () => {
    if (newSystem.name && newSystem.type && newSystem.riskLevel) {
      setAiSystems([...aiSystems, newSystem]);
      setNewSystem({ name: '', type: '', riskLevel: '' });
    }
  };

  const addTeamMember = () => {
    if (newMember.email && newMember.role) {
      setTeamMembers([...teamMembers, newMember]);
      setNewMember({ email: '', role: '' });
    }
  };

  const steps = [
    { id: 1, title: 'Company Info', icon: Building2 },
    { id: 2, title: 'Frameworks', icon: Shield },
    { id: 3, title: 'AI Systems', icon: Bot },
    { id: 4, title: 'Assessment', icon: ClipboardCheck },
    { id: 5, title: 'Team', icon: Users },
  ];

  const frameworks = frameworksData?.frameworks || [];
  const baselineQuestions = baselineQuestionsData?.questions || [];

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Enterprise Onboarding</h1>
        <p className="text-muted-foreground">Complete these steps to set up your AI compliance program</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  currentStep > step.id
                    ? 'bg-primary text-primary-foreground'
                    : currentStep === step.id
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'bg-muted'
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className="text-sm font-medium">{step.title}</span>
            </div>
          ))}
        </div>
        <Progress value={(currentStep / 5) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        {/* Step 1: Company Info */}
        {currentStep === 1 && (
          <>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Tell us about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-10)</SelectItem>
                      <SelectItem value="small">Small (11-50)</SelectItem>
                      <SelectItem value="medium">Medium (51-200)</SelectItem>
                      <SelectItem value="large">Large (201-1000)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Jurisdiction</Label>
                  <Select value={jurisdiction} onValueChange={setJurisdiction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eu">European Union</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                      <SelectItem value="global">Global Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSubmitCompanyInfo} disabled={submitCompanyInfoMutation.isPending}>
                  {submitCompanyInfoMutation.isPending ? 'Saving...' : 'Continue'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 2: Framework Selection */}
        {currentStep === 2 && (
          <>
            <CardHeader>
              <CardTitle>Select Compliance Frameworks</CardTitle>
              <CardDescription>Choose the frameworks relevant to your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {frameworks.map((framework: any) => (
                  <div
                    key={framework.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedFrameworks.includes(framework.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      if (selectedFrameworks.includes(framework.id)) {
                        setSelectedFrameworks(selectedFrameworks.filter((id) => id !== framework.id));
                      } else {
                        setSelectedFrameworks([...selectedFrameworks, framework.id]);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox checked={selectedFrameworks.includes(framework.id)} />
                      <div>
                        <h4 className="font-medium">{framework.name}</h4>
                        <p className="text-sm text-muted-foreground">{framework.code}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleSelectFrameworks} disabled={selectFrameworksMutation.isPending}>
                  {selectFrameworksMutation.isPending ? 'Saving...' : 'Continue'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 3: AI Systems */}
        {currentStep === 3 && (
          <>
            <CardHeader>
              <CardTitle>Map Your AI Systems</CardTitle>
              <CardDescription>Add the AI systems your organization uses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="System name"
                  value={newSystem.name}
                  onChange={(e) => setNewSystem({ ...newSystem, name: e.target.value })}
                />
                <Select
                  value={newSystem.type}
                  onValueChange={(value) => setNewSystem({ ...newSystem, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chatbot">Chatbot</SelectItem>
                    <SelectItem value="recommendation">Recommendation</SelectItem>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="generation">Generation</SelectItem>
                    <SelectItem value="analysis">Analysis</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Select
                    value={newSystem.riskLevel}
                    onValueChange={(value) => setNewSystem({ ...newSystem, riskLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="unacceptable">Unacceptable</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={addAISystem}>Add</Button>
                </div>
              </div>
              
              {aiSystems.length > 0 && (
                <div className="space-y-2">
                  {aiSystems.map((system, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{system.name}</span>
                        <Badge variant="outline" className="ml-2">{system.type}</Badge>
                        <Badge variant={system.riskLevel === 'high' ? 'destructive' : 'secondary'} className="ml-2">
                          {system.riskLevel}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAiSystems(aiSystems.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleMapAISystems} disabled={mapAISystemsMutation.isPending}>
                  {mapAISystemsMutation.isPending ? 'Saving...' : 'Continue'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 4: Baseline Assessment */}
        {currentStep === 4 && (
          <>
            <CardHeader>
              <CardTitle>Baseline Assessment</CardTitle>
              <CardDescription>Answer these questions to establish your compliance baseline</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {baselineQuestions.map((question: any) => (
                <div key={question.id} className="space-y-2">
                  <Label>{question.question}</Label>
                  <Select
                    value={assessmentAnswers[question.id] || ''}
                    onValueChange={(value) =>
                      setAssessmentAnswers({ ...assessmentAnswers, [question.id]: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="partial">Partially</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleSubmitAssessment} disabled={submitBaselineAssessmentMutation.isPending}>
                  {submitBaselineAssessmentMutation.isPending ? 'Processing...' : 'Continue'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 5: Team Invitation */}
        {currentStep === 5 && (
          <>
            <CardHeader>
              <CardTitle>Invite Your Team</CardTitle>
              <CardDescription>Add team members to collaborate on compliance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
                <Select
                  value={newMember.role}
                  onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="compliance_officer">Compliance Officer</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addTeamMember}>Add Member</Button>
              </div>
              
              {teamMembers.length > 0 && (
                <div className="space-y-2">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <span className="font-medium">{member.email}</span>
                        <Badge variant="outline" className="ml-2">{member.role}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep(4)}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleInviteTeam} disabled={inviteTeamMutation.isPending}>
                  {inviteTeamMutation.isPending ? 'Completing...' : 'Complete Setup'}
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
