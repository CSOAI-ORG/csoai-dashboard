/**
 * Council Member Card Component
 * Click-to-expand card showing agent details, voting history, and decision rationale
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Scale, 
  FileText, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Brain,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type AgentType = "guardian" | "arbiter" | "scribe";
type VoteType = "approve" | "reject" | "escalate";

interface VoteRecord {
  sessionId: string;
  sessionTitle: string;
  vote: VoteType;
  confidence: number;
  rationale: string;
  timestamp: Date;
}

interface CouncilMember {
  id: number;
  name: string;
  type: AgentType;
  provider: string;
  model: string;
  specialty: string;
  totalVotes: number;
  approvalRate: number;
  avgConfidence: number;
  recentVotes: VoteRecord[];
}

interface CouncilMemberCardProps {
  member: CouncilMember;
  isAnimating?: boolean;
  currentVote?: VoteType | null;
}

const agentTypeConfig = {
  guardian: {
    icon: Shield,
    label: "Guardian Agent",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    description: "Safety, Security, Privacy",
  },
  arbiter: {
    icon: Scale,
    label: "Arbiter Agent",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    description: "Fairness, Transparency, Accountability",
  },
  scribe: {
    icon: FileText,
    label: "Scribe Agent",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    description: "Documentation, Compliance, Reporting",
  },
};

const voteConfig = {
  approve: {
    icon: CheckCircle2,
    label: "Approved",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  reject: {
    icon: XCircle,
    label: "Rejected",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  escalate: {
    icon: AlertTriangle,
    label: "Escalated",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
};

export function CouncilMemberCard({ member, isAnimating, currentVote }: CouncilMemberCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = agentTypeConfig[member.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-300 hover:shadow-lg",
          config.borderColor,
          isExpanded && "ring-2 ring-primary/20",
          isAnimating && currentVote && "animate-pulse"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardContent className="p-4">
          {/* Header - Always visible */}
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-xl", config.bgColor)}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                {currentVote && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn("p-1 rounded-full", voteConfig[currentVote].bgColor)}
                  >
                    {(() => {
                      const VoteIcon = voteConfig[currentVote].icon;
                      return <VoteIcon className={cn("h-3 w-3", voteConfig[currentVote].color)} />;
                    })()}
                  </motion.div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{config.label}</p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal">
                {member.provider}
              </Badge>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-border space-y-4">
                  {/* Agent Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Brain className="h-3 w-3" /> Model
                      </p>
                      <p className="text-sm font-medium">{member.model}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Specialty
                      </p>
                      <p className="text-sm font-medium">{member.specialty}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <p className="text-lg font-bold text-foreground">{member.totalVotes}</p>
                      <p className="text-xs text-muted-foreground">Total Votes</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <p className="text-lg font-bold text-emerald-600">{member.approvalRate}%</p>
                      <p className="text-xs text-muted-foreground">Approval Rate</p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <p className="text-lg font-bold text-primary">{member.avgConfidence}%</p>
                      <p className="text-xs text-muted-foreground">Avg Confidence</p>
                    </div>
                  </div>

                  {/* Recent Voting History */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Recent Voting History
                    </h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {member.recentVotes.length > 0 ? (
                        member.recentVotes.map((vote, idx) => {
                          const voteInfo = voteConfig[vote.vote];
                          const VoteIcon = voteInfo.icon;
                          return (
                            <motion.div
                              key={vote.sessionId}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="p-3 rounded-lg bg-secondary/30 space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{vote.sessionTitle}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(vote.timestamp).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge className={cn("shrink-0", voteInfo.bgColor, voteInfo.color, "border-0")}>
                                  <VoteIcon className="h-3 w-3 mr-1" />
                                  {voteInfo.label}
                                </Badge>
                              </div>
                              
                              {/* Confidence bar */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-20">Confidence</span>
                                <Progress value={vote.confidence * 100} className="h-1.5 flex-1" />
                                <span className="text-xs font-medium w-10 text-right">
                                  {Math.round(vote.confidence * 100)}%
                                </span>
                              </div>

                              {/* Rationale */}
                              <p className="text-xs text-muted-foreground italic line-clamp-2">
                                "{vote.rationale}"
                              </p>
                            </motion.div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No voting history yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Generate sample council members data
export function generateCouncilMembers(): CouncilMember[] {
  const providers = [
    { name: "OpenAI", models: ["GPT-4o", "GPT-4 Turbo", "o1-preview"] },
    { name: "Anthropic", models: ["Claude 3.5 Sonnet", "Claude 3 Opus"] },
    { name: "Google", models: ["Gemini 2.0 Flash", "Gemini 1.5 Pro"] },
    { name: "Kimi", models: ["Moonshot v1", "Moonshot v1 Long"] },
    { name: "DeepSeek", models: ["DeepSeek V3", "DeepSeek Coder"] },
  ];

  const guardianSpecialties = [
    "Data Privacy Analysis",
    "Security Vulnerability Assessment",
    "User Safety Evaluation",
    "Privacy Compliance Check",
    "Security Protocol Review",
    "Safety Impact Analysis",
    "Privacy Risk Assessment",
    "Security Audit",
    "User Protection Analysis",
    "Data Security Review",
    "Privacy Standards Compliance",
  ];

  const arbiterSpecialties = [
    "Fairness Evaluation",
    "Transparency Assessment",
    "Accountability Review",
    "Bias Detection",
    "Ethical Compliance",
    "Fairness Audit",
    "Transparency Verification",
    "Accountability Analysis",
    "Equity Assessment",
    "Ethical Standards Review",
    "Impartiality Check",
  ];

  const scribeSpecialties = [
    "Documentation Review",
    "Compliance Reporting",
    "Regulatory Analysis",
    "Documentation Standards",
    "Compliance Verification",
    "Report Generation",
    "Regulatory Compliance",
    "Documentation Audit",
    "Compliance Assessment",
    "Regulatory Reporting",
    "Standards Documentation",
  ];

  const sampleRationales = {
    approve: [
      "The system demonstrates adequate safety measures and complies with established guidelines.",
      "Risk assessment indicates acceptable levels with proper mitigation strategies in place.",
      "Documentation is comprehensive and meets regulatory requirements.",
      "The implementation follows best practices for user data protection.",
      "Transparency measures are sufficient for the intended use case.",
    ],
    reject: [
      "Critical safety concerns identified that require immediate attention.",
      "Insufficient documentation for regulatory compliance verification.",
      "Bias detection algorithms flagged potential fairness issues.",
      "Security vulnerabilities exceed acceptable risk thresholds.",
      "Privacy controls do not meet minimum standards.",
    ],
    escalate: [
      "Edge case requires human judgment for proper evaluation.",
      "Conflicting regulatory requirements need expert interpretation.",
      "Novel use case not covered by existing guidelines.",
      "Borderline compliance status requires human oversight.",
      "Complex ethical considerations beyond automated assessment.",
    ],
  };

  const members: CouncilMember[] = [];
  let agentId = 1;

  // Generate 11 Guardian agents
  for (let i = 0; i < 11; i++) {
    const providerIdx = i % providers.length;
    const provider = providers[providerIdx];
    const modelIdx = i % provider.models.length;
    
    const totalVotes = 50 + Math.floor(Math.random() * 150);
    const approvalRate = 60 + Math.floor(Math.random() * 30);
    
    members.push({
      id: agentId++,
      name: `Guardian-${String(i + 1).padStart(2, '0')}`,
      type: "guardian",
      provider: provider.name,
      model: provider.models[modelIdx],
      specialty: guardianSpecialties[i],
      totalVotes,
      approvalRate,
      avgConfidence: 75 + Math.floor(Math.random() * 20),
      recentVotes: generateRecentVotes(sampleRationales),
    });
  }

  // Generate 11 Arbiter agents
  for (let i = 0; i < 11; i++) {
    const providerIdx = i % providers.length;
    const provider = providers[providerIdx];
    const modelIdx = i % provider.models.length;
    
    const totalVotes = 50 + Math.floor(Math.random() * 150);
    const approvalRate = 55 + Math.floor(Math.random() * 35);
    
    members.push({
      id: agentId++,
      name: `Arbiter-${String(i + 1).padStart(2, '0')}`,
      type: "arbiter",
      provider: provider.name,
      model: provider.models[modelIdx],
      specialty: arbiterSpecialties[i],
      totalVotes,
      approvalRate,
      avgConfidence: 70 + Math.floor(Math.random() * 25),
      recentVotes: generateRecentVotes(sampleRationales),
    });
  }

  // Generate 11 Scribe agents
  for (let i = 0; i < 11; i++) {
    const providerIdx = i % providers.length;
    const provider = providers[providerIdx];
    const modelIdx = i % provider.models.length;
    
    const totalVotes = 50 + Math.floor(Math.random() * 150);
    const approvalRate = 65 + Math.floor(Math.random() * 25);
    
    members.push({
      id: agentId++,
      name: `Scribe-${String(i + 1).padStart(2, '0')}`,
      type: "scribe",
      provider: provider.name,
      model: provider.models[modelIdx],
      specialty: scribeSpecialties[i],
      totalVotes,
      approvalRate,
      avgConfidence: 80 + Math.floor(Math.random() * 15),
      recentVotes: generateRecentVotes(sampleRationales),
    });
  }

  return members;
}

function generateRecentVotes(rationales: Record<string, string[]>): VoteRecord[] {
  const sessionTitles = [
    "Privacy compliance for user data processing",
    "Facial recognition deployment assessment",
    "Automated hiring system fairness review",
    "Healthcare AI diagnostic accuracy",
    "Financial risk model transparency",
    "Content moderation algorithm audit",
    "Autonomous vehicle safety evaluation",
    "Customer service chatbot compliance",
  ];

  const votes: VoteRecord[] = [];
  const numVotes = 3 + Math.floor(Math.random() * 3);

  for (let i = 0; i < numVotes; i++) {
    const voteTypes: VoteType[] = ["approve", "reject", "escalate"];
    const weights = [0.65, 0.25, 0.1];
    const rand = Math.random();
    let voteType: VoteType = "approve";
    let cumulative = 0;
    for (let j = 0; j < weights.length; j++) {
      cumulative += weights[j];
      if (rand < cumulative) {
        voteType = voteTypes[j];
        break;
      }
    }

    const rationaleList = rationales[voteType];
    const rationale = rationaleList[Math.floor(Math.random() * rationaleList.length)];

    votes.push({
      sessionId: `session-${Date.now()}-${i}`,
      sessionTitle: sessionTitles[Math.floor(Math.random() * sessionTitles.length)],
      vote: voteType,
      confidence: 0.7 + Math.random() * 0.3,
      rationale,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    });
  }

  return votes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export type { CouncilMember, VoteRecord, VoteType, AgentType };
