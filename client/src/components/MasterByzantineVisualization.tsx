import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Users, Eye, BookOpen, Building2, Cpu, Database, Globe, FileCheck, Zap, Brain, Scale, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

// The 33 TC 260 Byzantine Council Members with their exact names and specializations
const TC260_COUNCIL_MEMBERS = [
  // AI Safety & Ethics Specialists (8 members)
  { id: 1, name: 'Ethics Guardian', role: 'AI Ethics Specialist', provider: 'Anthropic Claude', focus: 'Ethical AI alignment and value preservation' },
  { id: 2, name: 'Bias Detector', role: 'Fairness Analyst', provider: 'OpenAI GPT-4', focus: 'Algorithmic bias detection and mitigation' },
  { id: 3, name: 'Safety Sentinel', role: 'Safety Engineer', provider: 'Google Gemini', focus: 'AI safety protocols and guardrails' },
  { id: 4, name: 'Rights Advocate', role: 'Human Rights Expert', provider: 'Mistral', focus: 'Human rights impact assessment' },
  { id: 5, name: 'Transparency Agent', role: 'Explainability Expert', provider: 'Cohere', focus: 'AI decision transparency and explainability' },
  { id: 6, name: 'Accountability Auditor', role: 'Compliance Auditor', provider: 'Meta Llama', focus: 'Accountability and audit trails' },
  { id: 7, name: 'Privacy Protector', role: 'Privacy Specialist', provider: 'Anthropic Claude', focus: 'Data privacy and protection' },
  { id: 8, name: 'Consent Validator', role: 'Consent Expert', provider: 'OpenAI GPT-4', focus: 'Informed consent and user autonomy' },
  
  // Regulatory & Compliance Experts (8 members)
  { id: 9, name: 'EU AI Act Analyst', role: 'EU Regulation Expert', provider: 'Google Gemini', focus: 'EU AI Act compliance and interpretation' },
  { id: 10, name: 'NIST RMF Specialist', role: 'US Standards Expert', provider: 'Mistral', focus: 'NIST AI Risk Management Framework' },
  { id: 11, name: 'TC260 Interpreter', role: 'China Standards Expert', provider: 'Cohere', focus: 'China TC260 AI governance standards' },
  { id: 12, name: 'ISO 42001 Auditor', role: 'ISO Compliance Expert', provider: 'Meta Llama', focus: 'ISO 42001 AI management systems' },
  { id: 13, name: 'GDPR Guardian', role: 'Data Protection Expert', provider: 'Anthropic Claude', focus: 'GDPR and data protection compliance' },
  { id: 14, name: 'Sector Regulator', role: 'Industry Specialist', provider: 'OpenAI GPT-4', focus: 'Sector-specific AI regulations' },
  { id: 15, name: 'Cross-Border Analyst', role: 'International Law Expert', provider: 'Google Gemini', focus: 'Cross-jurisdictional compliance' },
  { id: 16, name: 'Standards Harmonizer', role: 'Standards Expert', provider: 'Mistral', focus: 'Global standards harmonization' },
  
  // Technical Security Experts (8 members)
  { id: 17, name: 'Adversarial Defender', role: 'Security Researcher', provider: 'Cohere', focus: 'Adversarial attack detection and defense' },
  { id: 18, name: 'Model Validator', role: 'ML Engineer', provider: 'Meta Llama', focus: 'Model validation and verification' },
  { id: 19, name: 'Robustness Tester', role: 'QA Specialist', provider: 'Anthropic Claude', focus: 'AI system robustness testing' },
  { id: 20, name: 'Drift Monitor', role: 'MLOps Engineer', provider: 'OpenAI GPT-4', focus: 'Model drift and performance monitoring' },
  { id: 21, name: 'Supply Chain Auditor', role: 'Supply Chain Expert', provider: 'Google Gemini', focus: 'AI supply chain security' },
  { id: 22, name: 'Vulnerability Hunter', role: 'Penetration Tester', provider: 'Mistral', focus: 'AI vulnerability assessment' },
  { id: 23, name: 'Cryptography Expert', role: 'Security Architect', provider: 'Cohere', focus: 'Cryptographic protections for AI' },
  { id: 24, name: 'Infrastructure Guardian', role: 'DevSecOps Engineer', provider: 'Meta Llama', focus: 'AI infrastructure security' },
  
  // Domain & Impact Specialists (9 members)
  { id: 25, name: 'Healthcare Analyst', role: 'Medical AI Expert', provider: 'Anthropic Claude', focus: 'Healthcare AI safety and efficacy' },
  { id: 26, name: 'Finance Watchdog', role: 'FinTech Specialist', provider: 'OpenAI GPT-4', focus: 'Financial AI risk assessment' },
  { id: 27, name: 'Education Evaluator', role: 'EdTech Expert', provider: 'Google Gemini', focus: 'Educational AI impact assessment' },
  { id: 28, name: 'Legal Advisor', role: 'AI Law Specialist', provider: 'Mistral', focus: 'Legal implications of AI decisions' },
  { id: 29, name: 'Environmental Assessor', role: 'Sustainability Expert', provider: 'Cohere', focus: 'Environmental impact of AI systems' },
  { id: 30, name: 'Labor Impact Analyst', role: 'Workforce Expert', provider: 'Meta Llama', focus: 'AI impact on employment and labor' },
  { id: 31, name: 'Accessibility Champion', role: 'Inclusion Specialist', provider: 'Anthropic Claude', focus: 'AI accessibility and inclusion' },
  { id: 32, name: 'Public Interest Guardian', role: 'Civil Society Rep', provider: 'OpenAI GPT-4', focus: 'Public interest and societal impact' },
  { id: 33, name: 'Future Risk Analyst', role: 'Long-term Safety Expert', provider: 'Google Gemini', focus: 'Long-term AI risk assessment' },
];

// Pipeline categories with their nodes
const PIPELINE_CATEGORIES = {
  governments: {
    label: 'Governments',
    color: '#3B82F6',
    icon: Building2,
    nodes: [
      { id: 'gov-eu', name: 'European Union', desc: 'EU AI Act enforcement and compliance monitoring' },
      { id: 'gov-us', name: 'United States', desc: 'NIST AI RMF implementation and federal AI governance' },
      { id: 'gov-uk', name: 'United Kingdom', desc: 'UK AI Safety Institute and regulatory framework' },
      { id: 'gov-cn', name: 'China', desc: 'TC260 standards and AI governance regulations' },
      { id: 'gov-au', name: 'Australia', desc: 'Australian AI Ethics Framework implementation' },
      { id: 'gov-ca', name: 'Canada', desc: 'Canadian AI governance and AIDA compliance' },
    ]
  },
  aiCompanies: {
    label: 'AI Companies',
    color: '#8B5CF6',
    icon: Cpu,
    nodes: [
      { id: 'ai-openai', name: 'OpenAI', desc: 'GPT models safety assessment and alignment' },
      { id: 'ai-anthropic', name: 'Anthropic', desc: 'Claude models constitutional AI evaluation' },
      { id: 'ai-google', name: 'Google DeepMind', desc: 'Gemini and AI research safety protocols' },
      { id: 'ai-meta', name: 'Meta AI', desc: 'Llama models open-source safety standards' },
      { id: 'ai-microsoft', name: 'Microsoft', desc: 'Azure AI and Copilot safety compliance' },
      { id: 'ai-mistral', name: 'Mistral AI', desc: 'European AI model safety certification' },
    ]
  },
  dataSources: {
    label: 'Data Sources',
    color: '#10B981',
    icon: Database,
    nodes: [
      { id: 'data-incidents', name: 'Incident Reports', desc: 'Real-time AI incident tracking and analysis' },
      { id: 'data-compliance', name: 'Compliance Data', desc: 'Framework compliance status and assessments' },
      { id: 'data-research', name: 'Research Papers', desc: 'Academic AI safety research integration' },
      { id: 'data-news', name: 'News & Media', desc: 'AI-related news monitoring and analysis' },
      { id: 'data-audits', name: 'Audit Reports', desc: 'Third-party AI system audit results' },
      { id: 'data-feedback', name: 'User Feedback', desc: 'Public feedback on AI system behavior' },
    ]
  },
  publicWatchdog: {
    label: 'Public Watchdog',
    color: '#EF4444',
    icon: Eye,
    nodes: [
      { id: 'watch-reports', name: 'Report Submission', desc: 'Public AI incident and concern reporting' },
      { id: 'watch-analysis', name: 'Pattern Analysis', desc: 'AI safety pattern detection and trends' },
      { id: 'watch-alerts', name: 'Alert System', desc: 'Real-time AI safety alerts and notifications' },
      { id: 'watch-transparency', name: 'Transparency Dashboard', desc: 'Public AI safety metrics and statistics' },
    ]
  },
  ceasaiTraining: {
    label: 'CEASAI Training',
    color: '#F59E0B',
    icon: BookOpen,
    nodes: [
      { id: 'train-courses', name: 'Training Courses', desc: '8-week AI safety analyst certification program' },
      { id: 'train-exams', name: 'Certification Exams', desc: '50-question competency assessment' },
      { id: 'train-analysts', name: 'Certified Analysts', desc: 'Trained AI safety professionals network' },
      { id: 'train-jobs', name: 'Job Marketplace', desc: 'AI safety analyst employment opportunities' },
    ]
  },
  soaiPdca: {
    label: 'SOAI-PDCA',
    color: '#EC4899',
    icon: FileCheck,
    nodes: [
      { id: 'pdca-plan', name: 'Plan Phase', desc: 'AI risk identification and compliance gap analysis' },
      { id: 'pdca-do', name: 'Do Phase', desc: 'Safety control implementation and deployment' },
      { id: 'pdca-check', name: 'Check Phase', desc: 'Effectiveness measurement and monitoring' },
      { id: 'pdca-act', name: 'Act Phase', desc: 'Continuous improvement and adjustment' },
    ]
  }
};

interface NodeInfo {
  type: 'council' | 'pipeline' | 'cso';
  data: any;
}

interface MasterByzantineVisualizationProps {
  showLearnMore?: boolean;
}

export const MasterByzantineVisualization: React.FC<MasterByzantineVisualizationProps> = ({ 
  showLearnMore = true 
}) => {
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; from: { x: number; y: number }; to: { x: number; y: number }; progress: number; color: string }>>([]);
  const [councilVotes, setCouncilVotes] = useState<Record<number, 'approve' | 'reject' | 'pending'>>({});
  
  // Fetch real council voting data
  const { data: votingStats } = trpc.council.getStats.useQuery(undefined, {
    refetchInterval: 5000,
  });

  // Calculate positions for all nodes
  const centerX = 500;
  const centerY = 400;
  const councilRadius = 200;
  const pipelineRadius = 380;

  // Council member positions in a circle
  const councilPositions = useMemo(() => {
    return TC260_COUNCIL_MEMBERS.map((member, i) => {
      const angle = (i / 33) * 2 * Math.PI - Math.PI / 2;
      return {
        ...member,
        x: centerX + councilRadius * Math.cos(angle),
        y: centerY + councilRadius * Math.sin(angle),
        angle
      };
    });
  }, []);

  // Pipeline category positions around the outer ring
  const pipelinePositions = useMemo(() => {
    const categories = Object.entries(PIPELINE_CATEGORIES);
    return categories.map(([key, category], i) => {
      const baseAngle = (i / categories.length) * 2 * Math.PI - Math.PI / 2;
      const nodes = category.nodes.map((node, j) => {
        const nodeAngle = baseAngle + ((j - (category.nodes.length - 1) / 2) * 0.15);
        return {
          ...node,
          x: centerX + pipelineRadius * Math.cos(nodeAngle),
          y: centerY + pipelineRadius * Math.sin(nodeAngle),
          color: category.color,
          categoryKey: key
        };
      });
      return {
        key,
        ...category,
        nodes,
        centerAngle: baseAngle,
        labelX: centerX + (pipelineRadius + 60) * Math.cos(baseAngle),
        labelY: centerY + (pipelineRadius + 60) * Math.sin(baseAngle)
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
        newVotes[randomMember] = voteTypes[Math.floor(Math.random() * 3)];
        return newVotes;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Animate data particles
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        const allPipelineNodes = pipelinePositions.flatMap(p => p.nodes);
        const fromNode = allPipelineNodes[Math.floor(Math.random() * allPipelineNodes.length)];
        const toMember = councilPositions[Math.floor(Math.random() * councilPositions.length)];
        
        setParticles(prev => [
          ...prev.slice(-30),
          {
            id: Date.now() + Math.random(),
            from: { x: fromNode.x, y: fromNode.y },
            to: { x: toMember.x, y: toMember.y },
            progress: 0,
            color: fromNode.color
          }
        ]);
      }

      // Also add particles from council to CSO AI
      if (Math.random() > 0.8) {
        const fromMember = councilPositions[Math.floor(Math.random() * councilPositions.length)];
        setParticles(prev => [
          ...prev.slice(-30),
          {
            id: Date.now() + Math.random(),
            from: { x: fromMember.x, y: fromMember.y },
            to: { x: centerX, y: centerY },
            progress: 0,
            color: '#8B5CF6'
          }
        ]);
      }

      setParticles(prev => 
        prev
          .map(p => ({ ...p, progress: p.progress + 0.02 }))
          .filter(p => p.progress < 1)
      );
    }, 50);

    return () => clearInterval(interval);
  }, [councilPositions, pipelinePositions]);

  const getVoteColor = (memberId: number) => {
    const vote = councilVotes[memberId];
    if (vote === 'approve') return '#10B981';
    if (vote === 'reject') return '#EF4444';
    return '#8B5CF6';
  };

  const handleNodeClick = useCallback((type: 'council' | 'pipeline' | 'cso', data: any) => {
    setSelectedNode({ type, data });
  }, []);

  // Calculate stats
  const approveCount = Object.values(councilVotes).filter(v => v === 'approve').length;
  const rejectCount = Object.values(councilVotes).filter(v => v === 'reject').length;
  const pendingCount = 33 - approveCount - rejectCount;

  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <Badge variant="outline" className="mb-4 text-primary border-primary">
          TC 260 Byzantine Consensus Network
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          33-Agent Byzantine Council
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Real-time visualization of our distributed AI safety governance network. 
          Click on any node to learn more about its role in the ecosystem.
        </p>
      </div>

      {/* Main Visualization */}
      <div className="relative bg-white dark:bg-gray-950 rounded-2xl border border-border overflow-hidden">
        <svg 
          viewBox="0 0 1000 800" 
          className="w-full h-auto"
          style={{ minHeight: '600px' }}
        >
          {/* Background pattern */}
          <defs>
            <pattern id="masterGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path 
                d="M 50 0 L 0 0 0 50" 
                fill="none" 
                stroke="currentColor" 
                strokeOpacity="0.03" 
                strokeWidth="1"
              />
            </pattern>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </radialGradient>
            <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#masterGrid)" />
          
          {/* Center glow */}
          <circle cx={centerX} cy={centerY} r="150" fill="url(#centerGlow)" />

          {/* Connection lines from pipeline nodes to council members */}
          {pipelinePositions.flatMap(category => 
            category.nodes.map(node => 
              councilPositions.slice(0, 11).map((member, i) => (
                <line
                  key={`${node.id}-${member.id}`}
                  x1={node.x}
                  y1={node.y}
                  x2={member.x}
                  y2={member.y}
                  stroke={node.color}
                  strokeOpacity={hoveredNode === node.id ? 0.3 : 0.05}
                  strokeWidth={1}
                  className="transition-opacity duration-300"
                />
              ))
            )
          )}

          {/* Council member interconnections */}
          {councilPositions.map((member, i) => {
            const nextMember = councilPositions[(i + 1) % 33];
            const crossMember = councilPositions[(i + 11) % 33];
            return (
              <g key={`connections-${member.id}`}>
                <line
                  x1={member.x}
                  y1={member.y}
                  x2={nextMember.x}
                  y2={nextMember.y}
                  stroke="#8B5CF6"
                  strokeOpacity={0.2}
                  strokeWidth={1}
                />
                <line
                  x1={member.x}
                  y1={member.y}
                  x2={crossMember.x}
                  y2={crossMember.y}
                  stroke="#8B5CF6"
                  strokeOpacity={0.05}
                  strokeWidth={0.5}
                />
              </g>
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
              stroke="#8B5CF6"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          ))}

          {/* Data particles */}
          {particles.map(particle => {
            const x = particle.from.x + (particle.to.x - particle.from.x) * particle.progress;
            const y = particle.from.y + (particle.to.y - particle.from.y) * particle.progress;
            return (
              <circle
                key={particle.id}
                cx={x}
                cy={y}
                r={3}
                fill={particle.color}
                opacity={1 - particle.progress * 0.5}
                filter="url(#nodeGlow)"
              />
            );
          })}

          {/* Pipeline nodes */}
          {pipelinePositions.map(category => (
            <g key={category.key}>
              {/* Category label */}
              <text
                x={category.labelX}
                y={category.labelY}
                textAnchor="middle"
                fill={category.color}
                fontSize="11"
                fontWeight="600"
                opacity="0.8"
              >
                {category.label}
              </text>
              
              {category.nodes.map(node => (
                <g
                  key={node.id}
                  onClick={() => handleNodeClick('pipeline', { ...node, category: category.label })}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={hoveredNode === node.id ? 16 : 12}
                    fill={node.color}
                    opacity={hoveredNode === node.id ? 1 : 0.7}
                    filter={hoveredNode === node.id ? "url(#nodeGlow)" : undefined}
                    className="transition-all duration-200"
                  />
                  {hoveredNode === node.id && (
                    <text
                      x={node.x}
                      y={node.y - 22}
                      textAnchor="middle"
                      fill="currentColor"
                      fontSize="10"
                      fontWeight="500"
                      className="pointer-events-none"
                    >
                      {node.name}
                    </text>
                  )}
                </g>
              ))}
            </g>
          ))}

          {/* Council member nodes */}
          {councilPositions.map((member, i) => (
            <g
              key={member.id}
              onClick={() => handleNodeClick('council', member)}
              onMouseEnter={() => setHoveredNode(`council-${member.id}`)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={member.x}
                cy={member.y}
                r={hoveredNode === `council-${member.id}` ? 12 : 8}
                fill={getVoteColor(member.id)}
                opacity={hoveredNode === `council-${member.id}` ? 1 : 0.8}
                filter={hoveredNode === `council-${member.id}` ? "url(#nodeGlow)" : undefined}
                className="transition-all duration-200"
              />
              {/* Small indicator showing agent number */}
              <text
                x={member.x}
                y={member.y + 3}
                textAnchor="middle"
                fill="white"
                fontSize="6"
                fontWeight="bold"
              >
                {member.id}
              </text>
              {hoveredNode === `council-${member.id}` && (
                <>
                  <text
                    x={member.x}
                    y={member.y - 18}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="10"
                    fontWeight="600"
                    className="pointer-events-none"
                  >
                    {member.name}
                  </text>
                  <text
                    x={member.x}
                    y={member.y - 6}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="8"
                    opacity="0.7"
                    className="pointer-events-none"
                  >
                    {member.role}
                  </text>
                </>
              )}
            </g>
          ))}

          {/* Central CSO AI node */}
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
              filter="url(#nodeGlow)"
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
        </svg>

        {/* Floating stats overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-4 md:gap-8">
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
              <span className="text-lg font-bold text-purple-600">{pendingCount}</span>
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
          </div>
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-border">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-lg font-bold text-blue-600">{votingStats?.totalSessions || 0}</span>
              <span className="text-xs text-muted-foreground">Sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {Object.entries(PIPELINE_CATEGORIES).map(([key, category]) => (
          <div key={key} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="text-xs text-muted-foreground">{category.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-xs text-muted-foreground">Council Members</span>
        </div>
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
              {selectedNode?.type === 'pipeline' && <Database className="w-5 h-5 text-blue-500" />}
              {selectedNode?.type === 'cso' && <Brain className="w-5 h-5 text-purple-500" />}
              {selectedNode?.data?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedNode?.type === 'council' && selectedNode?.data?.role}
              {selectedNode?.type === 'pipeline' && selectedNode?.data?.category}
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
                    <div className="text-xs text-muted-foreground mb-1">Agent ID</div>
                    <div className="font-medium">TC260-{String(selectedNode.data.id).padStart(2, '0')}</div>
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
            
            {selectedNode?.type === 'pipeline' && (
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-sm">{selectedNode.data.desc}</div>
              </div>
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
  );
};

export default MasterByzantineVisualization;
