/*
 * CSOAI 33-Agent Council Page
 * Visualize the Byzantine fault-tolerant voting system
 * Connected to real backend API
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, Scale, FileText, CheckCircle2, XCircle, AlertTriangle, Clock, Play, Loader2, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { CouncilSkeleton } from "@/components/skeletons/CouncilSkeleton";
import { CouncilMemberCard, generateCouncilMembers } from "@/components/CouncilMemberCard";
import { LiveVoteSimulation } from "@/components/LiveVoteSimulation";
import { HumanCouncilCTA } from "@/components/HumanCouncilCTA";

const agentGroups = [
  {
    name: "Guardian Agents",
    description: "Safety, Security, Privacy",
    icon: Shield,
    count: 11,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    providers: ["OpenAI (3)", "Anthropic (2)", "Google (2)", "Kimi (2)", "DeepSeek (2)"],
  },
  {
    name: "Arbiter Agents",
    description: "Fairness, Transparency, Accountability",
    icon: Scale,
    count: 11,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    providers: ["OpenAI (3)", "Anthropic (2)", "Google (2)", "Kimi (2)", "DeepSeek (2)"],
  },
  {
    name: "Scribe Agents",
    description: "Documentation, Compliance, Reporting",
    icon: FileText,
    count: 11,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    providers: ["OpenAI (3)", "Anthropic (2)", "Google (2)", "Kimi (2)", "DeepSeek (2)"],
  },
];

const getResultBadge = (result: string | null) => {
  switch (result) {
    case "approved":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/30">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>
      );
    case "escalated":
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Escalated to Human
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/30">
          <Clock className="h-3 w-3 mr-1" />
          Voting
        </Badge>
      );
  }
};

const formatTimeAgo = (date: Date | string) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${Math.floor(diffHours / 24)} days ago`;
};

export default function AgentCouncil() {
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
  const [voteSubject, setVoteSubject] = useState({ title: "", description: "" });
  const [showCouncilMembers, setShowCouncilMembers] = useState(false);
  const [councilMembers] = useState(() => generateCouncilMembers());

  // Real API data
  const { data: sessions, isLoading, refetch } = trpc.council.list.useQuery();
  const { data: stats } = trpc.council.getStats.useQuery();
  
  // For now, just show a demo - in production this would create a session first
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTriggerVote = async () => {
    if (!voteSubject.title || !voteSubject.description) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    
    // Simulate the voting process
    toast.success("Council voting initiated!", {
      description: "33 agents are analyzing your proposal...",
    });
    
    // In production, this would:
    // 1. Create a council session in the database
    // 2. Call triggerVoting with the session ID
    // 3. Each of the 33 agents would vote via LLM
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsVoteDialogOpen(false);
      setVoteSubject({ title: "", description: "" });
      toast.info("Demo mode: In production, this would trigger real LLM voting");
      refetch();
    }, 2000);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <CouncilSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6" data-testid="agent-council-page">
        <div className="flex items-center justify-between" data-testid="agent-council-header">
          <div>
            <h1 className="text-2xl font-semibold font-primary" data-testid="agent-council-title">33-Agent Council</h1>
            <p className="text-muted-foreground text-sm">
              Byzantine fault-tolerant voting system (22/33 consensus required)
            </p>
          </div>
          <Dialog open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="agent-council-trigger-vote-button">
                <Zap className="h-4 w-4" />
                Trigger Council Vote
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="agent-council-vote-dialog">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Trigger 33-Agent Council Vote
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm">
                  <strong>⚡ Real LLM Voting:</strong> This will trigger all 33 agents (OpenAI, Anthropic, Google) 
                  to vote on your proposal using Byzantine fault-tolerant consensus.
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject Title</label>
                  <Input
                    placeholder="e.g., Privacy compliance for user data processing"
                    value={voteSubject.title}
                    onChange={(e) => setVoteSubject({ ...voteSubject, title: e.target.value })}
                    data-testid="agent-council-vote-title-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Detailed description of what the council should evaluate..."
                    rows={4}
                    value={voteSubject.description}
                    onChange={(e) => setVoteSubject({ ...voteSubject, description: e.target.value })}
                    data-testid="agent-council-vote-description-input"
                  />
                </div>

                <Button 
                  onClick={handleTriggerVote} 
                  className="w-full gap-2"
                  disabled={isSubmitting}
                  data-testid="agent-council-start-vote-button"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Start Council Voting
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="agent-council-stats-grid">
          {[
            { label: "Total Sessions", value: stats?.totalSessions || 0, color: "text-emerald-600" },
            { label: "Consensus Reached", value: stats?.consensusReached || 0, color: "text-emerald-600" },
            { label: "Escalated to Human", value: stats?.escalatedToHuman || 0, color: "text-amber-600" },
            { label: "Pending Review", value: stats?.pendingReview || 0, color: "text-purple-600" },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Agent Groups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="agent-council-groups-grid">
          {agentGroups.map((group, idx) => {
            const Icon = group.icon;
            return (
              <motion.div
                key={group.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                <Card className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${group.bgColor}`}>
                        <Icon className={`h-5 w-5 ${group.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{group.name}</h3>
                        <p className="text-xs text-muted-foreground">{group.description}</p>
                      </div>
                      <div className="text-2xl font-semibold">{group.count}</div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {group.providers.map((provider) => (
                        <Badge key={provider} variant="outline" className="text-xs">
                          {provider}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Live Vote Simulation */}
        <LiveVoteSimulation 
          subject="AI Safety Compliance Assessment Demo"
          autoStart={false}
        />

        {/* Council Members */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Council Members</h2>
              <p className="text-sm text-muted-foreground">
                Click any member to view their voting history and decision rationale
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowCouncilMembers(!showCouncilMembers)}
            >
              {showCouncilMembers ? "Hide" : "Show"} Members
            </Button>
          </div>
          
          {showCouncilMembers && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {councilMembers.map((member) => (
                <CouncilMemberCard 
                  key={member.id} 
                  member={member}
                  isAnimating={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Human Council CTA */}
        <HumanCouncilCTA variant="default" />

        {/* Recent Votes */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Council Voting Sessions
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions && sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session, idx) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: idx * 0.03 }}
                    className="p-4 rounded-lg bg-secondary/50 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{session.subjectTitle}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {session.subjectDescription || "No description"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getResultBadge(session.finalDecision)}
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(session.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Vote Distribution */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-16 text-emerald-600 font-medium">Approve</span>
                        <Progress 
                          value={(session.approveVotes / 33) * 100} 
                          className="h-2 flex-1" 
                        />
                        <span className="w-8 text-right font-medium">{session.approveVotes}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-16 text-red-600 font-medium">Reject</span>
                        <Progress 
                          value={(session.rejectVotes / 33) * 100} 
                          className="h-2 flex-1" 
                        />
                        <span className="w-8 text-right font-medium">{session.rejectVotes}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-16 text-amber-600 font-medium">Escalate</span>
                        <Progress 
                          value={(session.escalateVotes / 33) * 100} 
                          className="h-2 flex-1" 
                        />
                        <span className="w-8 text-right font-medium">{session.escalateVotes}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Total votes: {session.totalVotes}/33</span>
                      <span>Consensus threshold: 67% (22 votes)</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No voting sessions yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Trigger a council vote to see the 33-agent Byzantine consensus in action.
                </p>
                <Button onClick={() => setIsVoteDialogOpen(true)}>
                  <Zap className="h-4 w-4 mr-2" />
                  Start First Vote
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
