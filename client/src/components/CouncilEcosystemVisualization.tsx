/**
 * Enhanced Council Ecosystem Visualization
 * Features:
 * - Animated data flow particles between council members and CSO AI
 * - Interactive tooltips with specialty and vote status
 * - Filtering controls by category (Ethics, Regulatory, Technical, Domain)
 * - 300+ Human Council visualization
 * - Public Watchdog section
 * - Government & Legislation entities
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  ArrowRight, Shield, Users, Eye, BookOpen, Building2, Cpu, Database, Globe, 
  FileCheck, Zap, Brain, Scale, Lock, AlertTriangle, CheckCircle, Filter,
  Landmark, Gavel, FileText, UserCheck, Radio, Megaphone
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

// Council member categories
type CouncilCategory = 'ethics' | 'regulatory' | 'technical' | 'domain';

interface CouncilMember {
  id: number;
  name: string;
  role: string;
  provider: string;
  focus: string;
  category: CouncilCategory;
}

// The 33 TC 260 Byzantine Council Members with their exact names and specializations
const TC260_COUNCIL_MEMBERS: CouncilMember[] = [
  // AI Safety & Ethics Specialists (8 members) - Ethics Category
  { id: 1, name: 'Ethics Guardian', role: 'AI Ethics Specialist', provider: 'Anthropic Claude', focus: 'Ethical AI alignment and value preservation', category: 'ethics' },
  { id: 2, name: 'Bias Detector', role: 'Fairness Analyst', provider: 'OpenAI GPT-4', focus: 'Algorithmic bias detection and mitigation', category: 'ethics' },
  { id: 3, name: 'Safety Sentinel', role: 'Safety Engineer', provider: 'Google Gemini', focus: 'AI safety protocols and guardrails', category: 'ethics' },
  { id: 4, name: 'Rights Advocate', role: 'Human Rights Expert', provider: 'Mistral', focus: 'Human rights impact assessment', category: 'ethics' },
  { id: 5, name: 'Transparency Agent', role: 'Explainability Expert', provider: 'Cohere', focus: 'AI decision transparency and explainability', category: 'ethics' },
  { id: 6, name: 'Accountability Auditor', role: 'Compliance Auditor', provider: 'Meta Llama', focus: 'Accountability and audit trails', category: 'ethics' },
  { id: 7, name: 'Privacy Protector', role: 'Privacy Specialist', provider: 'Anthropic Claude', focus: 'Data privacy and protection', category: 'ethics' },
  { id: 8, name: 'Consent Validator', role: 'Consent Expert', provider: 'OpenAI GPT-4', focus: 'Informed consent and user autonomy', category: 'ethics' },
  
  // Regulatory & Compliance Experts (8 members) - Regulatory Category
  { id: 9, name: 'EU AI Act Analyst', role: 'EU Regulation Expert', provider: 'Google Gemini', focus: 'EU AI Act compliance and interpretation', category: 'regulatory' },
  { id: 10, name: 'NIST RMF Specialist', role: 'US Standards Expert', provider: 'Mistral', focus: 'NIST AI Risk Management Framework', category: 'regulatory' },
  { id: 11, name: 'TC260 Interpreter', role: 'China Standards Expert', provider: 'Cohere', focus: 'China TC260 AI governance standards', category: 'regulatory' },
  { id: 12, name: 'ISO 42001 Auditor', role: 'ISO Compliance Expert', provider: 'Meta Llama', focus: 'ISO 42001 AI management systems', category: 'regulatory' },
  { id: 13, name: 'GDPR Guardian', role: 'Data Protection Expert', provider: 'Anthropic Claude', focus: 'GDPR and data protection compliance', category: 'regulatory' },
  { id: 14, name: 'Sector Regulator', role: 'Industry Specialist', provider: 'OpenAI GPT-4', focus: 'Sector-specific AI regulations', category: 'regulatory' },
  { id: 15, name: 'Cross-Border Analyst', role: 'International Law Expert', provider: 'Google Gemini', focus: 'Cross-jurisdictional compliance', category: 'regulatory' },
  { id: 16, name: 'Standards Harmonizer', role: 'Standards Expert', provider: 'Mistral', focus: 'Global standards harmonization', category: 'regulatory' },
  
  // Technical Security Experts (8 members) - Technical Category
  { id: 17, name: 'Adversarial Defender', role: 'Security Researcher', provider: 'Cohere', focus: 'Adversarial attack detection and defense', category: 'technical' },
  { id: 18, name: 'Model Validator', role: 'ML Engineer', provider: 'Meta Llama', focus: 'Model validation and verification', category: 'technical' },
  { id: 19, name: 'Robustness Tester', role: 'QA Specialist', provider: 'Anthropic Claude', focus: 'AI system robustness testing', category: 'technical' },
  { id: 20, name: 'Drift Monitor', role: 'MLOps Engineer', provider: 'OpenAI GPT-4', focus: 'Model drift and performance monitoring', category: 'technical' },
  { id: 21, name: 'Supply Chain Auditor', role: 'Supply Chain Expert', provider: 'Google Gemini', focus: 'AI supply chain security', category: 'technical' },
  { id: 22, name: 'Vulnerability Hunter', role: 'Penetration Tester', provider: 'Mistral', focus: 'AI vulnerability assessment', category: 'technical' },
  { id: 23, name: 'Cryptography Expert', role: 'Security Architect', provider: 'Cohere', focus: 'Cryptographic protections for AI', category: 'technical' },
  { id: 24, name: 'Infrastructure Guardian', role: 'DevSecOps Engineer', provider: 'Meta Llama', focus: 'AI infrastructure security', category: 'technical' },
  
  // Domain & Impact Specialists (9 members) - Domain Category
  { id: 25, name: 'Healthcare Analyst', role: 'Medical AI Expert', provider: 'Anthropic Claude', focus: 'Healthcare AI safety and efficacy', category: 'domain' },
  { id: 26, name: 'Finance Watchdog', role: 'FinTech Specialist', provider: 'OpenAI GPT-4', focus: 'Financial AI risk assessment', category: 'domain' },
  { id: 27, name: 'Education Evaluator', role: 'EdTech Expert', provider: 'Google Gemini', focus: 'Educational AI impact assessment', category: 'domain' },
  { id: 28, name: 'Legal Advisor', role: 'AI Law Specialist', provider: 'Mistral', focus: 'Legal implications of AI decisions', category: 'domain' },
  { id: 29, name: 'Environmental Assessor', role: 'Sustainability Expert', provider: 'Cohere', focus: 'Environmental impact of AI systems', category: 'domain' },
  { id: 30, name: 'Labor Impact Analyst', role: 'Workforce Expert', provider: 'Meta Llama', focus: 'AI impact on employment and labor', category: 'domain' },
  { id: 31, name: 'Accessibility Champion', role: 'Inclusion Specialist', provider: 'Anthropic Claude', focus: 'AI accessibility and inclusion', category: 'domain' },
  { id: 32, name: 'Public Interest Guardian', role: 'Civil Society Rep', provider: 'OpenAI GPT-4', focus: 'Public interest and societal impact', category: 'domain' },
  { id: 33, name: 'Future Risk Analyst', role: 'Long-term Safety Expert', provider: 'Google Gemini', focus: 'Long-term AI risk assessment', category: 'domain' },
];

// Category colors and metadata
const CATEGORY_META: Record<CouncilCategory, { color: string; label: string; icon: React.ElementType }> = {
  ethics: { color: '#10B981', label: 'Ethics & Safety', icon: Shield },
  regulatory: { color: '#3B82F6', label: 'Regulatory', icon: Scale },
  technical: { color: '#8B5CF6', label: 'Technical', icon: Cpu },
  domain: { color: '#F59E0B', label: 'Domain', icon: Globe },
};

// Government & Legislation entities
const GOVERNMENT_ENTITIES = [
  { id: 'gov-eu', name: 'European Union', desc: 'EU AI Act enforcement', icon: Building2, color: '#3B82F6' },
  { id: 'gov-us', name: 'United States', desc: 'NIST AI RMF', icon: Landmark, color: '#EF4444' },
  { id: 'gov-uk', name: 'United Kingdom', desc: 'UK AI Safety Institute', icon: Building2, color: '#6366F1' },
  { id: 'gov-cn', name: 'China', desc: 'TC260 Standards', icon: Building2, color: '#F59E0B' },
  { id: 'gov-un', name: 'United Nations', desc: 'Global AI Governance', icon: Globe, color: '#22D3EE' },
];

const LEGISLATION_BODIES = [
  { id: 'leg-euact', name: 'EU AI Act', desc: 'Comprehensive AI regulation', icon: Gavel, color: '#3B82F6' },
  { id: 'leg-nist', name: 'NIST RMF', desc: 'Risk Management Framework', icon: FileText, color: '#10B981' },
  { id: 'leg-iso', name: 'ISO 42001', desc: 'AI Management Systems', icon: FileCheck, color: '#8B5CF6' },
  { id: 'leg-gdpr', name: 'GDPR', desc: 'Data Protection', icon: Lock, color: '#EC4899' },
];

// Generate 300+ Human Council members
const generateHumanCouncil = () => {
  const roles = [
    'AI Ethics Researcher', 'Data Scientist', 'Policy Analyst', 'Software Engineer',
    'Privacy Advocate', 'Security Expert', 'Legal Counsel', 'Industry Expert',
    'Academic Researcher', 'Civil Society Rep', 'Consumer Advocate', 'Healthcare Professional',
    'Financial Analyst', 'Environmental Scientist', 'Labor Rights Expert', 'Accessibility Specialist'
  ];
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Africa', 'Middle East'];
  
  return Array.from({ length: 312 }, (_, i) => ({
    id: `human-${i + 1}`,
    name: `Analyst ${String(i + 1).padStart(3, '0')}`,
    role: roles[i % roles.length],
    region: regions[i % regions.length],
    certified: Math.random() > 0.3,
    activeReviews: Math.floor(Math.random() * 5),
  }));
};

const HUMAN_COUNCIL = generateHumanCouncil();

interface DataParticle {
  id: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  progress: number;
  color: string;
  type: 'vote' | 'data' | 'alert';
}

interface NodeInfo {
  type: 'council' | 'pipeline' | 'cso' | 'government' | 'legislation' | 'human';
  data: any;
}

interface CouncilEcosystemVisualizationProps {
  showLearnMore?: boolean;
  compact?: boolean;
}

export const CouncilEcosystemVisualization: React.FC<CouncilEcosystemVisualizationProps> = ({ 
  showLearnMore = true,
  compact = false
}) => {
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [particles, setParticles] = useState<DataParticle[]>([]);
  const [councilVotes, setCouncilVotes] = useState<Record<number, 'approve' | 'reject' | 'pending'>>({});
  const [activeFilters, setActiveFilters] = useState<Set<CouncilCategory>>(new Set(['ethics', 'regulatory', 'technical', 'domain']));
  const [showHumanCouncil, setShowHumanCouncil] = useState(false);
  
  // Fetch real council voting data
  const { data: votingStats } = trpc.council.getStats.useQuery(undefined, {
    refetchInterval: 5000,
  });

  // Calculate positions
  const centerX = 500;
  const centerY = 400;
  const councilRadius = 180;
  const governmentRadius = 320;
  const legislationRadius = 360;
  const humanCouncilRadius = 420;

  // Filter council members based on active filters
  const filteredMembers = useMemo(() => {
    return TC260_COUNCIL_MEMBERS.filter(m => activeFilters.has(m.category));
  }, [activeFilters]);

  // Council member positions in a circle
  const councilPositions = useMemo(() => {
    return filteredMembers.map((member, i) => {
      const angle = (i / filteredMembers.length) * 2 * Math.PI - Math.PI / 2;
      return {
        ...member,
        x: centerX + councilRadius * Math.cos(angle),
        y: centerY + councilRadius * Math.sin(angle),
        angle
      };
    });
  }, [filteredMembers]);

  // Government positions
  const governmentPositions = useMemo(() => {
    return GOVERNMENT_ENTITIES.map((gov, i) => {
      const angle = (i / GOVERNMENT_ENTITIES.length) * Math.PI - Math.PI / 2;
      return {
        ...gov,
        x: centerX + governmentRadius * Math.cos(angle),
        y: centerY + governmentRadius * Math.sin(angle) * 0.6 - 80,
      };
    });
  }, []);

  // Legislation positions
  const legislationPositions = useMemo(() => {
    return LEGISLATION_BODIES.map((leg, i) => {
      const angle = (i / LEGISLATION_BODIES.length) * Math.PI + Math.PI / 2;
      return {
        ...leg,
        x: centerX + legislationRadius * Math.cos(angle),
        y: centerY + legislationRadius * Math.sin(angle) * 0.6 + 80,
      };
    });
  }, []);

  // Human council ring positions (showing subset)
  const humanCouncilPositions = useMemo(() => {
    const displayCount = 48; // Show 48 representative nodes
    return HUMAN_COUNCIL.slice(0, displayCount).map((human, i) => {
      const angle = (i / displayCount) * 2 * Math.PI - Math.PI / 2;
      return {
        ...human,
        x: centerX + humanCouncilRadius * Math.cos(angle),
        y: centerY + humanCouncilRadius * Math.sin(angle),
      };
    });
  }, []);

  // Simulate council voting
  useEffect(() => {
    const interval = setInterval(() => {
      setCouncilVotes(prev => {
        const newVotes = { ...prev };
        const randomMember = Math.floor(Math.random() * 33) + 1;
        const voteTypes: ('approve' | 'reject' | 'pending')[] = ['approve', 'reject', 'pending'];
        const weights = [0.6, 0.2, 0.2]; // 60% approve, 20% reject, 20% pending
        const rand = Math.random();
        let cumulative = 0;
        for (let i = 0; i < weights.length; i++) {
          cumulative += weights[i];
          if (rand < cumulative) {
            newVotes[randomMember] = voteTypes[i];
            break;
          }
        }
        return newVotes;
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Animate data particles - enhanced with more particle types
  useEffect(() => {
    const interval = setInterval(() => {
      // Particles from council to CSO AI (votes)
      if (Math.random() > 0.5 && councilPositions.length > 0) {
        const fromMember = councilPositions[Math.floor(Math.random() * councilPositions.length)];
        const voteStatus = councilVotes[fromMember.id] || 'pending';
        const color = voteStatus === 'approve' ? '#10B981' : voteStatus === 'reject' ? '#EF4444' : '#8B5CF6';
        
        setParticles(prev => [
          ...prev.slice(-40),
          {
            id: Date.now() + Math.random(),
            from: { x: fromMember.x, y: fromMember.y },
            to: { x: centerX, y: centerY },
            progress: 0,
            color,
            type: 'vote'
          }
        ]);
      }

      // Particles from government to council (data)
      if (Math.random() > 0.7 && governmentPositions.length > 0 && councilPositions.length > 0) {
        const fromGov = governmentPositions[Math.floor(Math.random() * governmentPositions.length)];
        const toMember = councilPositions[Math.floor(Math.random() * councilPositions.length)];
        
        setParticles(prev => [
          ...prev.slice(-40),
          {
            id: Date.now() + Math.random(),
            from: { x: fromGov.x, y: fromGov.y },
            to: { x: toMember.x, y: toMember.y },
            progress: 0,
            color: fromGov.color,
            type: 'data'
          }
        ]);
      }

      // Particles from CSO AI to human council (alerts)
      if (Math.random() > 0.85 && showHumanCouncil && humanCouncilPositions.length > 0) {
        const toHuman = humanCouncilPositions[Math.floor(Math.random() * humanCouncilPositions.length)];
        
        setParticles(prev => [
          ...prev.slice(-40),
          {
            id: Date.now() + Math.random(),
            from: { x: centerX, y: centerY },
            to: { x: toHuman.x, y: toHuman.y },
            progress: 0,
            color: '#EF4444',
            type: 'alert'
          }
        ]);
      }

      // Update particle positions
      setParticles(prev => 
        prev
          .map(p => ({ ...p, progress: p.progress + 0.025 }))
          .filter(p => p.progress < 1)
      );
    }, 50);

    return () => clearInterval(interval);
  }, [councilPositions, governmentPositions, humanCouncilPositions, councilVotes, showHumanCouncil]);

  const getVoteColor = (memberId: number) => {
    const vote = councilVotes[memberId];
    if (vote === 'approve') return '#10B981';
    if (vote === 'reject') return '#EF4444';
    return '#8B5CF6';
  };

  const handleNodeClick = useCallback((type: NodeInfo['type'], data: any) => {
    setSelectedNode({ type, data });
  }, []);

  const toggleFilter = (category: CouncilCategory) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(category)) {
        if (newFilters.size > 1) {
          newFilters.delete(category);
        }
      } else {
        newFilters.add(category);
      }
      return newFilters;
    });
  };

  // Calculate stats
  const approveCount = Object.values(councilVotes).filter(v => v === 'approve').length;
  const rejectCount = Object.values(councilVotes).filter(v => v === 'reject').length;
  const pendingCount = 33 - approveCount - rejectCount;
  const certifiedHumans = HUMAN_COUNCIL.filter(h => h.certified).length;

  return (
    <TooltipProvider delayDuration={100}>
      <div className="relative w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            TC 260 Byzantine Consensus Ecosystem
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            AI Safety Governance Network
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time visualization of our distributed AI safety governance network with 33 AI agents, 
            {certifiedHumans}+ certified human analysts, and global regulatory integration.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <div className="flex items-center gap-2 mr-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by:</span>
          </div>
          {(Object.entries(CATEGORY_META) as [CouncilCategory, typeof CATEGORY_META[CouncilCategory]][]).map(([key, meta]) => {
            const Icon = meta.icon;
            const isActive = activeFilters.has(key);
            return (
              <Button
                key={key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(key)}
                className="gap-2"
                style={{
                  backgroundColor: isActive ? meta.color : undefined,
                  borderColor: meta.color,
                  color: isActive ? 'white' : meta.color,
                }}
              >
                <Icon className="w-3 h-3" />
                {meta.label}
                <span className="text-xs opacity-80">
                  ({TC260_COUNCIL_MEMBERS.filter(m => m.category === key).length})
                </span>
              </Button>
            );
          })}
          <div className="border-l border-border mx-2" />
          <Button
            variant={showHumanCouncil ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHumanCouncil(!showHumanCouncil)}
            className="gap-2"
          >
            <Users className="w-3 h-3" />
            Human Council
            <span className="text-xs opacity-80">({HUMAN_COUNCIL.length}+)</span>
          </Button>
        </div>

        {/* Main Visualization */}
        <div className="relative bg-white dark:bg-gray-950 rounded-2xl border border-border overflow-hidden">
          <svg 
            viewBox="0 0 1000 800" 
            className="w-full h-auto"
            style={{ minHeight: compact ? '500px' : '650px' }}
          >
            {/* Background pattern */}
            <defs>
              <pattern id="ecosystemGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path 
                  d="M 50 0 L 0 0 0 50" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeOpacity="0.03" 
                  strokeWidth="1"
                />
              </pattern>
              <radialGradient id="ecosystemCenterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </radialGradient>
              <filter id="ecosystemNodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              {/* Particle trail effect */}
              <filter id="particleGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#ecosystemGrid)" />
            
            {/* Center glow */}
            <circle cx={centerX} cy={centerY} r="150" fill="url(#ecosystemCenterGlow)" />

            {/* Human Council outer ring (if enabled) */}
            {showHumanCouncil && (
              <>
                {/* Ring indicator */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={humanCouncilRadius}
                  fill="none"
                  stroke="#EF4444"
                  strokeOpacity={0.1}
                  strokeWidth={30}
                  strokeDasharray="4 4"
                />
                <text
                  x={centerX}
                  y={centerY - humanCouncilRadius - 15}
                  textAnchor="middle"
                  fill="#EF4444"
                  fontSize="11"
                  fontWeight="600"
                  opacity="0.8"
                >
                  300+ Human Council (Public Watchdog)
                </text>
                
                {/* Human council nodes */}
                {humanCouncilPositions.map((human, i) => (
                  <Tooltip key={human.id}>
                    <TooltipTrigger asChild>
                      <g
                        onClick={() => handleNodeClick('human', human)}
                        onMouseEnter={() => setHoveredNode(human.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle
                          cx={human.x}
                          cy={human.y}
                          r={hoveredNode === human.id ? 8 : 5}
                          fill={human.certified ? '#10B981' : '#6B7280'}
                          opacity={hoveredNode === human.id ? 1 : 0.7}
                          className="transition-all duration-200"
                        />
                        {human.activeReviews > 0 && (
                          <circle
                            cx={human.x + 4}
                            cy={human.y - 4}
                            r={3}
                            fill="#EF4444"
                          />
                        )}
                      </g>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-1">
                        <div className="font-semibold">{human.name}</div>
                        <div className="text-xs text-muted-foreground">{human.role}</div>
                        <div className="text-xs">{human.region}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {human.certified ? (
                            <Badge variant="default" className="text-xs bg-green-500">Certified</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">In Training</Badge>
                          )}
                          {human.activeReviews > 0 && (
                            <Badge variant="destructive" className="text-xs">{human.activeReviews} Active Reviews</Badge>
                          )}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </>
            )}

            {/* Government entities */}
            {governmentPositions.map(gov => {
              const Icon = gov.icon;
              return (
                <Tooltip key={gov.id}>
                  <TooltipTrigger asChild>
                    <g
                      onClick={() => handleNodeClick('government', gov)}
                      onMouseEnter={() => setHoveredNode(gov.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Connection line to center */}
                      <line
                        x1={gov.x}
                        y1={gov.y}
                        x2={centerX}
                        y2={centerY}
                        stroke={gov.color}
                        strokeOpacity={hoveredNode === gov.id ? 0.4 : 0.1}
                        strokeWidth={2}
                        strokeDasharray="4 2"
                      />
                      <circle
                        cx={gov.x}
                        cy={gov.y}
                        r={hoveredNode === gov.id ? 22 : 18}
                        fill={gov.color}
                        opacity={hoveredNode === gov.id ? 1 : 0.8}
                        filter={hoveredNode === gov.id ? "url(#ecosystemNodeGlow)" : undefined}
                        className="transition-all duration-200"
                      />
                      <foreignObject x={gov.x - 8} y={gov.y - 8} width={16} height={16}>
                        <div className="flex items-center justify-center w-full h-full">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                      </foreignObject>
                      <text
                        x={gov.x}
                        y={gov.y + 32}
                        textAnchor="middle"
                        fill="currentColor"
                        fontSize="9"
                        fontWeight="500"
                      >
                        {gov.name}
                      </text>
                    </g>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="space-y-1">
                      <div className="font-semibold">{gov.name}</div>
                      <div className="text-xs text-muted-foreground">{gov.desc}</div>
                      <Badge variant="outline" className="text-xs">Government</Badge>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Legislation bodies */}
            {legislationPositions.map(leg => (
              <Tooltip key={leg.id}>
                <TooltipTrigger asChild>
                  <g
                    onClick={() => handleNodeClick('legislation', leg)}
                    onMouseEnter={() => setHoveredNode(leg.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Connection line to center */}
                    <line
                      x1={leg.x}
                      y1={leg.y}
                      x2={centerX}
                      y2={centerY}
                      stroke={leg.color}
                      strokeOpacity={hoveredNode === leg.id ? 0.4 : 0.1}
                      strokeWidth={2}
                      strokeDasharray="4 2"
                    />
                    <rect
                      x={leg.x - 16}
                      y={leg.y - 16}
                      width={32}
                      height={32}
                      rx={6}
                      fill={leg.color}
                      opacity={hoveredNode === leg.id ? 1 : 0.8}
                      filter={hoveredNode === leg.id ? "url(#ecosystemNodeGlow)" : undefined}
                      className="transition-all duration-200"
                    />
                    <foreignObject x={leg.x - 8} y={leg.y - 8} width={16} height={16}>
                      <div className="flex items-center justify-center w-full h-full">
                        <Gavel className="w-4 h-4 text-white" />
                      </div>
                    </foreignObject>
                    <text
                      x={leg.x}
                      y={leg.y + 28}
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="9"
                      fontWeight="500"
                    >
                      {leg.name}
                    </text>
                  </g>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="space-y-1">
                    <div className="font-semibold">{leg.name}</div>
                    <div className="text-xs text-muted-foreground">{leg.desc}</div>
                    <Badge variant="outline" className="text-xs">Legislation</Badge>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Council member interconnections */}
            {councilPositions.map((member, i) => {
              const nextMember = councilPositions[(i + 1) % councilPositions.length];
              return (
                <line
                  key={`connection-${member.id}`}
                  x1={member.x}
                  y1={member.y}
                  x2={nextMember.x}
                  y2={nextMember.y}
                  stroke={CATEGORY_META[member.category].color}
                  strokeOpacity={0.3}
                  strokeWidth={1}
                />
              );
            })}

            {/* Lines from council to center (CSO AI) */}
            {councilPositions.map(member => (
              <line
                key={`center-${member.id}`}
                x1={member.x}
                y1={member.y}
                x2={centerX}
                y2={centerY}
                stroke={getVoteColor(member.id)}
                strokeOpacity={0.15}
                strokeWidth={1}
              />
            ))}

            {/* Data particles with trails */}
            {particles.map(particle => {
              const x = particle.from.x + (particle.to.x - particle.from.x) * particle.progress;
              const y = particle.from.y + (particle.to.y - particle.from.y) * particle.progress;
              const size = particle.type === 'alert' ? 5 : particle.type === 'vote' ? 4 : 3;
              return (
                <g key={particle.id}>
                  {/* Trail */}
                  <line
                    x1={particle.from.x + (particle.to.x - particle.from.x) * Math.max(0, particle.progress - 0.1)}
                    y1={particle.from.y + (particle.to.y - particle.from.y) * Math.max(0, particle.progress - 0.1)}
                    x2={x}
                    y2={y}
                    stroke={particle.color}
                    strokeWidth={2}
                    strokeOpacity={0.3}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={size}
                    fill={particle.color}
                    opacity={1 - particle.progress * 0.5}
                    filter="url(#particleGlow)"
                  />
                </g>
              );
            })}

            {/* Council member nodes */}
            {councilPositions.map((member) => (
              <Tooltip key={member.id}>
                <TooltipTrigger asChild>
                  <g
                    onClick={() => handleNodeClick('council', member)}
                    onMouseEnter={() => setHoveredNode(`council-${member.id}`)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Pulsing ring for voting members */}
                    {councilVotes[member.id] && councilVotes[member.id] !== 'pending' && (
                      <circle
                        cx={member.x}
                        cy={member.y}
                        r={14}
                        fill="none"
                        stroke={getVoteColor(member.id)}
                        strokeWidth={2}
                        opacity={0.5}
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={member.x}
                      cy={member.y}
                      r={hoveredNode === `council-${member.id}` ? 14 : 10}
                      fill={getVoteColor(member.id)}
                      opacity={hoveredNode === `council-${member.id}` ? 1 : 0.85}
                      filter={hoveredNode === `council-${member.id}` ? "url(#ecosystemNodeGlow)" : undefined}
                      className="transition-all duration-200"
                    />
                    {/* Category indicator ring */}
                    <circle
                      cx={member.x}
                      cy={member.y}
                      r={hoveredNode === `council-${member.id}` ? 16 : 12}
                      fill="none"
                      stroke={CATEGORY_META[member.category].color}
                      strokeWidth={2}
                      opacity={0.6}
                    />
                    {/* Agent number */}
                    <text
                      x={member.x}
                      y={member.y + 3}
                      textAnchor="middle"
                      fill="white"
                      fontSize="7"
                      fontWeight="bold"
                    >
                      {member.id}
                    </text>
                  </g>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: CATEGORY_META[member.category].color }}
                      />
                      <span className="font-semibold">{member.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                    <div className="text-xs">{member.focus}</div>
                    <div className="flex items-center gap-2 pt-1 border-t border-border">
                      <span className="text-xs text-muted-foreground">Provider:</span>
                      <Badge variant="outline" className="text-xs">{member.provider}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Vote:</span>
                      <Badge 
                        variant={councilVotes[member.id] === 'approve' ? 'default' : councilVotes[member.id] === 'reject' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {councilVotes[member.id] === 'approve' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {councilVotes[member.id] === 'reject' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {councilVotes[member.id] || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}

            {/* Central CSO AI node */}
            <Tooltip>
              <TooltipTrigger asChild>
                <g
                  onClick={() => handleNodeClick('cso', { name: 'CSO AI', role: 'Central Safety Officer AI' })}
                  onMouseEnter={() => setHoveredNode('cso-ai')}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={hoveredNode === 'cso-ai' ? 55 : 50}
                    fill="#8B5CF6"
                    opacity={0.9}
                    filter="url(#ecosystemNodeGlow)"
                    className="transition-all duration-200"
                  />
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={40}
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeOpacity="0.3"
                  />
                  <text
                    x={centerX}
                    y={centerY - 8}
                    textAnchor="middle"
                    fill="white"
                    fontSize="16"
                    fontWeight="bold"
                  >
                    CSO AI
                  </text>
                  <text
                    x={centerX}
                    y={centerY + 10}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    opacity="0.8"
                  >
                    Central Safety
                  </text>
                  <text
                    x={centerX}
                    y={centerY + 22}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    opacity="0.8"
                  >
                    Officer
                  </text>
                </g>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="space-y-2">
                  <div className="font-semibold">Central Safety Officer AI</div>
                  <div className="text-xs text-muted-foreground">
                    Coordinates all 33 Byzantine Council members and aggregates votes
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="bg-green-500/20 rounded p-1">
                      <div className="text-sm font-bold text-green-600">{approveCount}</div>
                      <div className="text-xs text-muted-foreground">Approve</div>
                    </div>
                    <div className="bg-red-500/20 rounded p-1">
                      <div className="text-sm font-bold text-red-600">{rejectCount}</div>
                      <div className="text-xs text-muted-foreground">Reject</div>
                    </div>
                    <div className="bg-purple-500/20 rounded p-1">
                      <div className="text-sm font-bold text-purple-600">{pendingCount}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </svg>

          {/* Floating stats overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-3 md:gap-6">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-border">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-lg font-bold text-green-600">{approveCount}</span>
                <span className="text-xs text-muted-foreground">Approve</span>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-lg font-bold text-red-600">{rejectCount}</span>
                <span className="text-xs text-muted-foreground">Reject</span>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-border">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-500" />
                <span className="text-lg font-bold text-purple-600">{particles.length}</span>
                <span className="text-xs text-muted-foreground">Active Signals</span>
              </div>
            </div>
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-border">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-lg font-bold text-blue-600">{votingStats?.totalSessions || 0}</span>
                <span className="text-xs text-muted-foreground">Sessions</span>
              </div>
            </div>
            {showHumanCouncil && (
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-border">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-red-500" />
                  <span className="text-lg font-bold text-red-600">{certifiedHumans}</span>
                  <span className="text-xs text-muted-foreground">Watchdogs</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {(Object.entries(CATEGORY_META) as [CouncilCategory, typeof CATEGORY_META[CouncilCategory]][]).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: meta.color, opacity: activeFilters.has(key) ? 1 : 0.3 }}
              />
              <span className="text-xs text-muted-foreground">{meta.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">Government</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span className="text-xs text-muted-foreground">Legislation</span>
          </div>
          {showHumanCouncil && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Human Watchdog</span>
            </div>
          )}
        </div>

        {/* Learn More Button */}
        {showLearnMore && (
          <div className="mt-8 text-center">
            <Link href="/byzantine-consensus">
              <Button size="lg" className="gap-2">
                Learn More About Byzantine Consensus
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedNode?.type === 'council' && <Users className="w-5 h-5 text-purple-500" />}
                {selectedNode?.type === 'government' && <Building2 className="w-5 h-5 text-blue-500" />}
                {selectedNode?.type === 'legislation' && <Gavel className="w-5 h-5 text-purple-500" />}
                {selectedNode?.type === 'human' && <UserCheck className="w-5 h-5 text-green-500" />}
                {selectedNode?.type === 'cso' && <Brain className="w-5 h-5 text-purple-500" />}
                {selectedNode?.data?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedNode?.type === 'council' && selectedNode?.data?.role}
                {selectedNode?.type === 'government' && 'Government Entity'}
                {selectedNode?.type === 'legislation' && 'Regulatory Framework'}
                {selectedNode?.type === 'human' && selectedNode?.data?.role}
                {selectedNode?.type === 'cso' && 'Central Coordination Node'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedNode?.type === 'council' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">AI Provider</div>
                      <div className="font-medium">{selectedNode.data.provider}</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Category</div>
                      <Badge style={{ backgroundColor: CATEGORY_META[selectedNode.data.category as CouncilCategory].color }}>
                        {CATEGORY_META[selectedNode.data.category as CouncilCategory].label}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">Focus Area</div>
                    <div className="text-sm">{selectedNode.data.focus}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={councilVotes[selectedNode.data.id] === 'approve' ? 'default' : councilVotes[selectedNode.data.id] === 'reject' ? 'destructive' : 'secondary'}>
                      {councilVotes[selectedNode.data.id] || 'Pending'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Current Vote Status</span>
                  </div>
                </>
              )}
              
              {selectedNode?.type === 'government' && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm">{selectedNode.data.desc}</div>
                </div>
              )}
              
              {selectedNode?.type === 'legislation' && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm">{selectedNode.data.desc}</div>
                </div>
              )}

              {selectedNode?.type === 'human' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Region</div>
                      <div className="font-medium">{selectedNode.data.region}</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">Status</div>
                      {selectedNode.data.certified ? (
                        <Badge className="bg-green-500">Certified Analyst</Badge>
                      ) : (
                        <Badge variant="secondary">In Training</Badge>
                      )}
                    </div>
                  </div>
                  {selectedNode.data.activeReviews > 0 && (
                    <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium">{selectedNode.data.activeReviews} Active Reviews</span>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {selectedNode?.type === 'cso' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    The Central Safety Officer AI coordinates all 33 Byzantine Council members, 
                    aggregating their votes and reaching consensus on AI safety decisions.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-500/10 rounded-lg p-2">
                      <div className="text-lg font-bold text-green-600">{approveCount}</div>
                      <div className="text-xs text-muted-foreground">Approve</div>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-2">
                      <div className="text-lg font-bold text-red-600">{rejectCount}</div>
                      <div className="text-xs text-muted-foreground">Reject</div>
                    </div>
                    <div className="bg-purple-500/10 rounded-lg p-2">
                      <div className="text-lg font-bold text-purple-600">{pendingCount}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default CouncilEcosystemVisualization;
