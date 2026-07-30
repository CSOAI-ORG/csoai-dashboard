/**
 * Live Vote Simulation Component
 * Animated demonstration of 33-agent council reaching consensus
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Users,
  Shield,
  Scale,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type VoteType = "approve" | "reject" | "escalate" | "pending";
type AgentType = "guardian" | "arbiter" | "scribe";

interface SimulatedAgent {
  id: number;
  name: string;
  type: AgentType;
  provider: string;
  vote: VoteType;
  confidence: number;
  votedAt: number | null;
}

interface LiveVoteSimulationProps {
  onComplete?: (result: "approved" | "rejected" | "escalated") => void;
  autoStart?: boolean;
  subject?: string;
}

const providers = ["OpenAI", "Anthropic", "Google", "Kimi", "DeepSeek"];

const agentTypeConfig = {
  guardian: { icon: Shield, color: "text-emerald-500", bgColor: "bg-emerald-500" },
  arbiter: { icon: Scale, color: "text-purple-500", bgColor: "bg-purple-500" },
  scribe: { icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500" },
};

export function LiveVoteSimulation({ 
  onComplete, 
  autoStart = false,
  subject = "AI Safety Compliance Assessment Demo"
}: LiveVoteSimulationProps) {
  const [agents, setAgents] = useState<SimulatedAgent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<"approved" | "rejected" | "escalated" | null>(null);
  const [voteCounts, setVoteCounts] = useState({ approve: 0, reject: 0, escalate: 0, pending: 33 });
  const [currentVotingAgent, setCurrentVotingAgent] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Initialize agents
  useEffect(() => {
    const initialAgents: SimulatedAgent[] = [];
    let id = 1;
    
    // 11 Guardian agents
    for (let i = 0; i < 11; i++) {
      initialAgents.push({
        id: id++,
        name: `Guardian-${String(i + 1).padStart(2, '0')}`,
        type: "guardian",
        provider: providers[i % providers.length],
        vote: "pending",
        confidence: 0,
        votedAt: null,
      });
    }
    
    // 11 Arbiter agents
    for (let i = 0; i < 11; i++) {
      initialAgents.push({
        id: id++,
        name: `Arbiter-${String(i + 1).padStart(2, '0')}`,
        type: "arbiter",
        provider: providers[i % providers.length],
        vote: "pending",
        confidence: 0,
        votedAt: null,
      });
    }
    
    // 11 Scribe agents
    for (let i = 0; i < 11; i++) {
      initialAgents.push({
        id: id++,
        name: `Scribe-${String(i + 1).padStart(2, '0')}`,
        type: "scribe",
        provider: providers[i % providers.length],
        vote: "pending",
        confidence: 0,
        votedAt: null,
      });
    }
    
    setAgents(initialAgents);
  }, []);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && agents.length > 0 && !isRunning && !isComplete) {
      startSimulation();
    }
  }, [autoStart, agents.length]);

  // Update vote counts
  useEffect(() => {
    const counts = agents.reduce(
      (acc, agent) => {
        if (agent.vote === "pending") acc.pending++;
        else if (agent.vote === "approve") acc.approve++;
        else if (agent.vote === "reject") acc.reject++;
        else if (agent.vote === "escalate") acc.escalate++;
        return acc;
      },
      { approve: 0, reject: 0, escalate: 0, pending: 0 }
    );
    setVoteCounts(counts);

    // Check for consensus (22/33 = 67%)
    if (counts.approve >= 22 && !isComplete) {
      setIsComplete(true);
      setIsRunning(false);
      setResult("approved");
      onComplete?.("approved");
    } else if (counts.reject >= 22 && !isComplete) {
      setIsComplete(true);
      setIsRunning(false);
      setResult("rejected");
      onComplete?.("rejected");
    } else if (counts.pending === 0 && !isComplete) {
      // All voted but no consensus - escalate
      setIsComplete(true);
      setIsRunning(false);
      setResult("escalated");
      onComplete?.("escalated");
    }
  }, [agents, isComplete, onComplete]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 100);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Voting simulation
  useEffect(() => {
    if (!isRunning || isComplete) return;

    const pendingAgents = agents.filter(a => a.vote === "pending");
    if (pendingAgents.length === 0) return;

    const voteInterval = setInterval(() => {
      setAgents(prev => {
        const pending = prev.filter(a => a.vote === "pending");
        if (pending.length === 0) return prev;

        // Pick random agent to vote
        const agentToVote = pending[Math.floor(Math.random() * pending.length)];
        setCurrentVotingAgent(agentToVote.id);

        // Weighted voting (biased towards approval for demo)
        const rand = Math.random();
        let newVote: VoteType;
        if (rand < 0.72) newVote = "approve";
        else if (rand < 0.92) newVote = "reject";
        else newVote = "escalate";

        const confidence = 0.75 + Math.random() * 0.25;

        return prev.map(a => 
          a.id === agentToVote.id 
            ? { ...a, vote: newVote, confidence, votedAt: Date.now() }
            : a
        );
      });
    }, 150 + Math.random() * 200); // Random interval for realistic feel

    return () => clearInterval(voteInterval);
  }, [isRunning, isComplete, agents]);

  const startSimulation = useCallback(() => {
    setIsRunning(true);
    setIsComplete(false);
    setResult(null);
    setElapsedTime(0);
  }, []);

  const pauseSimulation = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    setIsComplete(false);
    setResult(null);
    setElapsedTime(0);
    setCurrentVotingAgent(null);
    setAgents(prev => prev.map(a => ({ ...a, vote: "pending", confidence: 0, votedAt: null })));
  }, []);

  const getAgentColor = (vote: VoteType) => {
    switch (vote) {
      case "approve": return "bg-emerald-500";
      case "reject": return "bg-red-500";
      case "escalate": return "bg-amber-500";
      default: return "bg-muted";
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}s`;
  };

  const totalVoted = voteCounts.approve + voteCounts.reject + voteCounts.escalate;
  const progressPercent = (totalVoted / 33) * 100;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Live Vote Simulation
            </h3>
            <p className="text-sm text-muted-foreground">{subject}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isRunning && !isComplete && (
              <Button onClick={startSimulation} className="gap-2">
                <Play className="h-4 w-4" />
                Trigger Demo Vote
              </Button>
            )}
            {isRunning && (
              <Button onClick={pauseSimulation} variant="outline" className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}
            {(isComplete || (!isRunning && totalVoted > 0)) && (
              <Button onClick={resetSimulation} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Voting Progress</span>
            <span className="font-medium">{totalVoted}/33 agents voted</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Consensus threshold: 22 votes (67%)</span>
            <span>Time: {formatTime(elapsedTime)}</span>
          </div>
        </div>

        {/* Vote Counts */}
        <div className="grid grid-cols-3 gap-3">
          <div className={cn(
            "p-3 rounded-lg text-center transition-all",
            voteCounts.approve >= 22 ? "bg-emerald-500/20 ring-2 ring-emerald-500" : "bg-emerald-500/10"
          )}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-2xl font-bold text-emerald-600">{voteCounts.approve}</span>
            </div>
            <p className="text-xs text-muted-foreground">Approve</p>
          </div>
          <div className={cn(
            "p-3 rounded-lg text-center transition-all",
            voteCounts.reject >= 22 ? "bg-red-500/20 ring-2 ring-red-500" : "bg-red-500/10"
          )}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-red-600">{voteCounts.reject}</span>
            </div>
            <p className="text-xs text-muted-foreground">Reject</p>
          </div>
          <div className={cn(
            "p-3 rounded-lg text-center transition-all",
            "bg-amber-500/10"
          )}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-2xl font-bold text-amber-600">{voteCounts.escalate}</span>
            </div>
            <p className="text-xs text-muted-foreground">Escalate</p>
          </div>
        </div>

        {/* Agent Grid Visualization */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            33-Agent Council
          </div>
          
          {/* Agent type sections */}
          {(["guardian", "arbiter", "scribe"] as AgentType[]).map(type => {
            const config = agentTypeConfig[type];
            const Icon = config.icon;
            const typeAgents = agents.filter(a => a.type === type);
            
            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className={cn("h-3 w-3", config.color)} />
                  <span className="capitalize">{type}s</span>
                  <span>({typeAgents.filter(a => a.vote !== "pending").length}/11)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {typeAgents.map(agent => (
                    <motion.div
                      key={agent.id}
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-all",
                        getAgentColor(agent.vote),
                        agent.vote === "pending" ? "text-muted-foreground" : "text-white",
                        currentVotingAgent === agent.id && "ring-2 ring-primary ring-offset-2"
                      )}
                      initial={false}
                      animate={{
                        scale: agent.votedAt && Date.now() - agent.votedAt < 500 ? [1, 1.3, 1] : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      title={`${agent.name} (${agent.provider}): ${agent.vote}`}
                    >
                      {agent.id}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Result Banner */}
        <AnimatePresence>
          {isComplete && result && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={cn(
                "p-4 rounded-xl text-center",
                result === "approved" && "bg-emerald-500/20 border border-emerald-500/30",
                result === "rejected" && "bg-red-500/20 border border-red-500/30",
                result === "escalated" && "bg-amber-500/20 border border-amber-500/30"
              )}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {result === "approved" && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                {result === "rejected" && <XCircle className="h-6 w-6 text-red-500" />}
                {result === "escalated" && <AlertTriangle className="h-6 w-6 text-amber-500" />}
                <span className="text-lg font-bold">
                  {result === "approved" && "Consensus Reached: APPROVED"}
                  {result === "rejected" && "Consensus Reached: REJECTED"}
                  {result === "escalated" && "No Consensus: ESCALATED TO HUMAN REVIEW"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {result === "approved" && `${voteCounts.approve} agents approved (${Math.round(voteCounts.approve/33*100)}% consensus)`}
                {result === "rejected" && `${voteCounts.reject} agents rejected (${Math.round(voteCounts.reject/33*100)}% consensus)`}
                {result === "escalated" && "Insufficient consensus - case requires human analyst review"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Completed in {formatTime(elapsedTime)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Approve</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Reject</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Escalate</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default LiveVoteSimulation;
