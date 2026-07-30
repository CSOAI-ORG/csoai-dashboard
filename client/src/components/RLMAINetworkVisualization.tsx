import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Government Regulators & Legislation
const governmentRegulators = [
  { name: 'EU AI Act', country: 'EU', flag: '🇪🇺', type: 'legislation', color: '#3b82f6' },
  { name: 'UK AISI', country: 'UK', flag: '🇬🇧', type: 'institute', color: '#ef4444' },
  { name: 'US NIST RMF', country: 'US', flag: '🇺🇸', type: 'framework', color: '#f59e0b' },
  { name: 'China TC260', country: 'CN', flag: '🇨🇳', type: 'standard', color: '#ef4444' },
  { name: 'Canada AIDA', country: 'CA', flag: '🇨🇦', type: 'legislation', color: '#dc2626' },
  { name: 'Australia AI Ethics', country: 'AU', flag: '🇦🇺', type: 'framework', color: '#16a34a' },
  { name: 'Singapore IMDA', country: 'SG', flag: '🇸🇬', type: 'governance', color: '#dc2626' },
  { name: 'Japan METI', country: 'JP', flag: '🇯🇵', type: 'strategy', color: '#dc2626' },
  { name: 'South Korea AI Act', country: 'KR', flag: '🇰🇷', type: 'legislation', color: '#3b82f6' },
  { name: 'Brazil AI Bill', country: 'BR', flag: '🇧🇷', type: 'legislation', color: '#16a34a' },
  { name: 'India NITI Aayog', country: 'IN', flag: '🇮🇳', type: 'framework', color: '#f97316' },
  { name: 'ISO/IEC 42001', country: 'Intl', flag: '🌐', type: 'standard', color: '#8b5cf6' },
];

// 13 AI Safety Companies
const safetyCompanies = [
  { name: 'CSOAI', fullName: 'CSOAI.org', description: 'Council of AIs Platform' },
  { name: 'CEASAI', fullName: 'CEASAI.org', description: 'AI Safety Certification' },
  { name: 'CouncilOf', fullName: 'CouncilOf.ai', description: 'Multi-Agent Governance' },
  { name: 'SafetyOf', fullName: 'SafetyOf.ai', description: 'Safety Assessment' },
  { name: 'BiasDetection', fullName: 'BiasDetectionOf.ai', description: 'Bias Analysis' },
  { name: 'Transparency', fullName: 'TransparencyOf.ai', description: 'AI Transparency' },
  { name: 'AGISafe', fullName: 'AGISafe.ai', description: 'AGI Safety Research' },
  { name: 'ASISecurity', fullName: 'ASISecurity.ai', description: 'AI Security' },
  { name: 'DataPrivacy', fullName: 'DataPrivacyOf.ai', description: 'Privacy Protection' },
  { name: 'SuicideStop', fullName: 'SuicideStop.ai', description: 'Mental Health AI Safety' },
  { name: 'EthicalGov', fullName: 'EthicalGovernanceOf.ai', description: 'Ethical Governance' },
  { name: 'LoopFactory', fullName: 'LoopFactory.ai', description: 'PDCA Automation' },
  { name: 'ProofOf', fullName: 'ProofOf.ai', description: 'Verification Systems' },
];

// 33 Byzantine Council AI Agents (expanded AI providers)
const aiProviders = [
  'OpenAI', 'Anthropic', 'Google DeepMind', 'Meta AI', 'Mistral', 'Cohere', 
  'xAI', 'Inflection', 'Stability AI', 'Hugging Face', 'AI21 Labs', 'Aleph Alpha',
  'Baidu', 'Alibaba', 'Tencent', 'ByteDance', 'SenseTime', 'Megvii',
  'Amazon Bedrock', 'Microsoft Azure', 'IBM Watson', 'Oracle AI', 'SAP AI',
  'Nvidia NeMo', 'AMD MI', 'Intel Gaudi', 'Cerebras', 'Graphcore', 'SambaNova',
  'Groq', 'Together AI', 'Replicate', 'Perplexity'
];

const byzantineAgents = Array.from({ length: 33 }, (_, i) => ({
  id: i + 1,
  name: `Agent ${i + 1}`,
  provider: aiProviders[i % aiProviders.length],
  status: 'active',
}));

// 100 Human AI Analysts
const humanAnalysts = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  region: ['EU', 'US', 'UK', 'APAC', 'LATAM', 'MEA'][i % 6],
  specialty: ['EU AI Act', 'NIST RMF', 'ISO 42001', 'TC260', 'Ethics', 'Incident Response'][i % 6],
}));

interface DataFlow {
  id: number;
  type: 'company' | 'agent' | 'analyst' | 'regulator';
  fromIndex: number;
  progress: number;
}

export function RLMAINetworkVisualization() {
  const [dailyDecisions, setDailyDecisions] = useState(12847);
  const [activeCompanies, setActiveCompanies] = useState<Set<number>>(new Set());
  const [activeAgents, setActiveAgents] = useState<Set<number>>(new Set());
  const [activeAnalysts, setActiveAnalysts] = useState<Set<number>>(new Set());
  const [activeRegulators, setActiveRegulators] = useState<Set<number>>(new Set());
  const [dataFlows, setDataFlows] = useState<DataFlow[]>([]);
  const [hoveredItem, setHoveredItem] = useState<{ type: string; index: number } | null>(null);
  const flowIdRef = useRef(0);

  // Increment daily decisions counter
  useEffect(() => {
    const interval = setInterval(() => {
      setDailyDecisions(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Randomly activate nodes to show activity
  useEffect(() => {
    const interval = setInterval(() => {
      // Activate random regulator (feeding in)
      const regulatorIndex = Math.floor(Math.random() * governmentRegulators.length);
      setActiveRegulators(prev => {
        const newSet = new Set(prev);
        newSet.add(regulatorIndex);
        return newSet;
      });
      
      const regulatorFlow: DataFlow = {
        id: flowIdRef.current++,
        type: 'regulator',
        fromIndex: regulatorIndex,
        progress: 0,
      };
      setDataFlows(prev => [...prev, regulatorFlow]);
      
      setTimeout(() => {
        setActiveRegulators(prev => {
          const newSet = new Set(prev);
          newSet.delete(regulatorIndex);
          return newSet;
        });
        setDataFlows(prev => prev.filter(f => f.id !== regulatorFlow.id));
      }, 2000);
      
      // Activate random company
      const companyIndex = Math.floor(Math.random() * safetyCompanies.length);
      setActiveCompanies(prev => {
        const newSet = new Set(prev);
        newSet.add(companyIndex);
        return newSet;
      });
      
      // Activate random agents (3-5 at a time)
      const numAgents = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < numAgents; i++) {
        const agentIndex = Math.floor(Math.random() * byzantineAgents.length);
        setActiveAgents(prev => {
          const newSet = new Set(prev);
          newSet.add(agentIndex);
          return newSet;
        });
        
        const agentFlow: DataFlow = {
          id: flowIdRef.current++,
          type: 'agent',
          fromIndex: agentIndex,
          progress: 0,
        };
        setDataFlows(prev => [...prev, agentFlow]);
        
        setTimeout(() => {
          setActiveAgents(prev => {
            const newSet = new Set(prev);
            newSet.delete(agentIndex);
            return newSet;
          });
          setDataFlows(prev => prev.filter(f => f.id !== agentFlow.id));
        }, 1500);
      }
      
      // Activate random analysts (2-4 at a time)
      const numAnalysts = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < numAnalysts; i++) {
        const analystIndex = Math.floor(Math.random() * humanAnalysts.length);
        setActiveAnalysts(prev => {
          const newSet = new Set(prev);
          newSet.add(analystIndex);
          return newSet;
        });
        
        setTimeout(() => {
          setActiveAnalysts(prev => {
            const newSet = new Set(prev);
            newSet.delete(analystIndex);
            return newSet;
          });
        }, 2000);
      }
      
      const companyFlow: DataFlow = {
        id: flowIdRef.current++,
        type: 'company',
        fromIndex: companyIndex,
        progress: 0,
      };
      setDataFlows(prev => [...prev, companyFlow]);
      
      setTimeout(() => {
        setActiveCompanies(prev => {
          const newSet = new Set(prev);
          newSet.delete(companyIndex);
          return newSet;
        });
        setDataFlows(prev => prev.filter(f => f.id !== companyFlow.id));
      }, 1500);
    }, 350);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate positions
  const getPosition = (index: number, total: number, radius: number, offsetAngle: number = 0) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2 + offsetAngle;
    return {
      x: 350 + Math.cos(angle) * radius,
      y: 350 + Math.sin(angle) * radius,
    };
  };

  return (
    <div className="relative w-full py-16 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
      
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-300 text-sm font-medium">Global AI Safety Ecosystem</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-blue-400 to-emerald-400">
              12 Regulators. 13 Companies. 33 AI Agents. 100 Analysts.
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto">
            Real-time collaboration between global regulators, AI safety organizations, 
            Byzantine Council AI agents, and certified human analysts.
          </p>
        </div>

        {/* Main Network Visualization */}
        <div className="relative mx-auto aspect-square max-w-4xl">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 700">
            {/* Glow filter */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="strongGlow">
                <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="ultraGlow">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              {/* Animated gradient for data streams */}
              <linearGradient id="dataStreamBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0">
                  <animate attributeName="offset" values="0;1" dur="1.5s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="1">
                  <animate attributeName="offset" values="0.5;1.5" dur="1.5s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0">
                  <animate attributeName="offset" values="1;2" dur="1.5s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
              <linearGradient id="dataStreamPurple" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0">
                  <animate attributeName="offset" values="0;1" dur="1.2s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#c084fc" stopOpacity="1">
                  <animate attributeName="offset" values="0.5;1.5" dur="1.2s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0">
                  <animate attributeName="offset" values="1;2" dur="1.2s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
              <linearGradient id="dataStreamGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0">
                  <animate attributeName="offset" values="0;1" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="1">
                  <animate attributeName="offset" values="0.5;1.5" dur="2s" repeatCount="indefinite" />
                </stop>
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0">
                  <animate attributeName="offset" values="1;2" dur="2s" repeatCount="indefinite" />
                </stop>
              </linearGradient>
              <radialGradient id="pulseGradient">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
            </defs>
            
            {/* Animated circular pulse rings */}
            {[1, 2, 3].map((ring) => (
              <circle
                key={`pulse-ring-${ring}`}
                cx="350"
                cy="350"
                r="60"
                fill="none"
                stroke="url(#pulseGradient)"
                strokeWidth="2"
                opacity="0"
              >
                <animate
                  attributeName="r"
                  values="60;180"
                  dur="3s"
                  begin={`${ring * 1}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.6;0"
                  dur="3s"
                  begin={`${ring * 1}s`}
                  repeatCount="indefinite"
                />
              </circle>
            ))}
            
            {/* Animated data stream paths - Outer ring */}
            {governmentRegulators.map((reg, index) => {
              const pos = getPosition(index, governmentRegulators.length, 310);
              const midX = (pos.x + 350) / 2;
              const midY = (pos.y + 350) / 2;
              const offset = 30;
              const controlX = midX + (index % 2 === 0 ? offset : -offset);
              const controlY = midY + (index % 2 === 0 ? -offset : offset);
              return (
                <g key={`stream-reg-${index}`}>
                  <path
                    d={`M ${pos.x} ${pos.y} Q ${controlX} ${controlY} 350 350`}
                    fill="none"
                    stroke={`${reg.color}20`}
                    strokeWidth="3"
                    strokeDasharray="8,4"
                  />
                  {/* Animated particle along path */}
                  <circle r="4" fill={reg.color} filter="url(#strongGlow)">
                    <animateMotion
                      dur={`${2 + (index % 3) * 0.5}s`}
                      repeatCount="indefinite"
                      path={`M ${pos.x - 350} ${pos.y - 350} Q ${controlX - 350} ${controlY - 350} 0 0`}
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0"
                      dur={`${2 + (index % 3) * 0.5}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
            
            {/* Animated data stream paths - Company ring */}
            {safetyCompanies.map((_, index) => {
              const pos = getPosition(index, safetyCompanies.length, 220);
              return (
                <g key={`stream-company-${index}`}>
                  {/* Animated particle */}
                  <circle r="3" fill="#60a5fa" filter="url(#glow)">
                    <animateMotion
                      dur={`${1.5 + (index % 4) * 0.3}s`}
                      repeatCount="indefinite"
                      path={`M ${pos.x - 350} ${pos.y - 350} L 0 0`}
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0"
                      dur={`${1.5 + (index % 4) * 0.3}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
            
            {/* Animated data stream paths - Agent ring */}
            {byzantineAgents.slice(0, 16).map((_, index) => {
              const pos = getPosition(index, byzantineAgents.length, 140);
              return (
                <g key={`stream-agent-${index}`}>
                  {/* Animated particle */}
                  <circle r="2" fill="#a855f7" filter="url(#glow)">
                    <animateMotion
                      dur={`${1 + (index % 5) * 0.2}s`}
                      repeatCount="indefinite"
                      path={`M ${pos.x - 350} ${pos.y - 350} L 0 0`}
                    />
                    <animate
                      attributeName="opacity"
                      values="0;1;1;0"
                      dur={`${1 + (index % 5) * 0.2}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            })}
            
            {/* Connection lines from regulators (outermost) */}
            {governmentRegulators.map((reg, index) => {
              const pos = getPosition(index, governmentRegulators.length, 310);
              return (
                <line
                  key={`reg-line-${index}`}
                  x1={350}
                  y1={350}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={`${reg.color}30`}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            })}
            
            {/* Connection lines from companies */}
            {safetyCompanies.map((_, index) => {
              const pos = getPosition(index, safetyCompanies.length, 220);
              return (
                <line
                  key={`company-line-${index}`}
                  x1={350}
                  y1={350}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="rgba(59, 130, 246, 0.15)"
                  strokeWidth="1"
                />
              );
            })}
            
            {/* Connection lines from agents */}
            {byzantineAgents.map((_, index) => {
              const pos = getPosition(index, byzantineAgents.length, 140);
              return (
                <line
                  key={`agent-line-${index}`}
                  x1={350}
                  y1={350}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="rgba(168, 85, 247, 0.1)"
                  strokeWidth="0.5"
                />
              );
            })}
            
            {/* Animated data flows */}
            {dataFlows.map((flow) => {
              if (flow.type === 'regulator') {
                const reg = governmentRegulators[flow.fromIndex];
                const pos = getPosition(flow.fromIndex, governmentRegulators.length, 310);
                return (
                  <motion.circle
                    key={flow.id}
                    r="6"
                    fill={reg.color}
                    filter="url(#strongGlow)"
                    initial={{ cx: pos.x, cy: pos.y, opacity: 1 }}
                    animate={{ cx: 350, cy: 350, opacity: 0 }}
                    transition={{ duration: 1.8, ease: "easeInOut" }}
                  />
                );
              } else if (flow.type === 'company') {
                const pos = getPosition(flow.fromIndex, safetyCompanies.length, 220);
                return (
                  <motion.circle
                    key={flow.id}
                    r="5"
                    fill="#60a5fa"
                    filter="url(#glow)"
                    initial={{ cx: pos.x, cy: pos.y, opacity: 1 }}
                    animate={{ cx: 350, cy: 350, opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                );
              } else if (flow.type === 'agent') {
                const pos = getPosition(flow.fromIndex, byzantineAgents.length, 140);
                return (
                  <motion.circle
                    key={flow.id}
                    r="3"
                    fill="#a855f7"
                    filter="url(#glow)"
                    initial={{ cx: pos.x, cy: pos.y, opacity: 1 }}
                    animate={{ cx: 350, cy: 350, opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                );
              }
              return null;
            })}
          </svg>

          {/* Central Hub */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
            animate={{
              boxShadow: [
                '0 0 30px rgba(59, 130, 246, 0.3)',
                '0 0 80px rgba(59, 130, 246, 0.5)',
                '0 0 30px rgba(59, 130, 246, 0.3)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-amber-500 via-blue-600 to-emerald-600 border-4 border-blue-400 flex flex-col items-center justify-center">
              <span className="text-white font-bold text-2xl">CSOAI</span>
              <span className="text-blue-200 text-xs mt-1">Global Safety Hub</span>
              <span className="text-blue-100 text-[10px] mt-0.5">{dailyDecisions.toLocaleString()}+ daily</span>
            </div>
          </motion.div>

          {/* Government Regulators (Outermost Ring) */}
          {governmentRegulators.map((reg, index) => {
            const pos = getPosition(index, governmentRegulators.length, 310);
            const leftPercent = (pos.x / 700) * 100;
            const topPercent = (pos.y / 700) * 100;
            const isActive = activeRegulators.has(index);
            const isHovered = hoveredItem?.type === 'regulator' && hoveredItem.index === index;
            
            return (
              <motion.div
                key={`reg-${index}`}
                className="absolute z-10"
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredItem({ type: 'regulator', index })}
                onMouseLeave={() => setHoveredItem(null)}
                animate={{
                  scale: isActive ? 1.25 : isHovered ? 1.15 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`
                    relative px-2 py-1.5 rounded-lg border-2 backdrop-blur-sm cursor-pointer
                    transition-all duration-300 bg-slate-800/80
                    ${isActive ? 'shadow-lg' : ''}
                    ${isHovered ? 'shadow-xl' : ''}
                  `}
                  style={{ 
                    borderColor: isActive ? reg.color : `${reg.color}60`,
                    boxShadow: isActive ? `0 0 20px ${reg.color}50` : 'none'
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{reg.flag}</span>
                    <span className="text-[10px] font-medium whitespace-nowrap text-white">
                      {reg.name}
                    </span>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-lg border-2"
                      style={{ borderColor: reg.color }}
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  )}
                </div>
                
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 whitespace-nowrap"
                    >
                      <span className="text-white text-xs font-medium">{reg.name}</span>
                      <span className="block text-slate-400 text-[10px]">{reg.type} • {reg.country}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* 13 AI Safety Companies (Middle Ring) */}
          {safetyCompanies.map((company, index) => {
            const pos = getPosition(index, safetyCompanies.length, 220);
            const leftPercent = (pos.x / 700) * 100;
            const topPercent = (pos.y / 700) * 100;
            const isActive = activeCompanies.has(index);
            const isHovered = hoveredItem?.type === 'company' && hoveredItem.index === index;
            
            return (
              <motion.div
                key={company.name}
                className="absolute z-15"
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredItem({ type: 'company', index })}
                onMouseLeave={() => setHoveredItem(null)}
                animate={{
                  scale: isActive ? 1.2 : isHovered ? 1.15 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`
                    relative px-2 py-1.5 rounded-full border-2 backdrop-blur-sm cursor-pointer
                    transition-all duration-300
                    bg-blue-500/20 border-blue-400
                    ${isActive ? 'shadow-lg shadow-blue-500/50' : ''}
                    ${isHovered ? 'shadow-xl' : ''}
                  `}
                >
                  <span className="text-[10px] font-medium whitespace-nowrap text-blue-300">
                    {company.name}
                  </span>
                  
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-blue-400"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  )}
                </div>
                
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-slate-800 border border-blue-500/30 rounded-lg shadow-xl z-50 whitespace-nowrap"
                    >
                      <span className="text-white text-xs font-medium">{company.fullName}</span>
                      <span className="block text-slate-400 text-[10px]">{company.description}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* 33 Byzantine Council AI Agents (Inner Ring) */}
          {byzantineAgents.map((agent, index) => {
            const pos = getPosition(index, byzantineAgents.length, 140);
            const leftPercent = (pos.x / 700) * 100;
            const topPercent = (pos.y / 700) * 100;
            const isActive = activeAgents.has(index);
            const isHovered = hoveredItem?.type === 'agent' && hoveredItem.index === index;
            
            return (
              <motion.div
                key={`agent-${agent.id}`}
                className="absolute z-20"
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredItem({ type: 'agent', index })}
                onMouseLeave={() => setHoveredItem(null)}
                animate={{
                  scale: isActive ? 1.5 : isHovered ? 1.3 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`
                    w-3.5 h-3.5 rounded-full cursor-pointer transition-all duration-300
                    ${isActive 
                      ? 'bg-purple-400 shadow-lg shadow-purple-500/50' 
                      : 'bg-purple-500/40 hover:bg-purple-400/60'}
                  `}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-purple-400"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  )}
                </div>
                
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl z-50 whitespace-nowrap"
                    >
                      <span className="text-purple-300 text-xs font-bold">{agent.name}</span>
                      <span className="block text-slate-400 text-[10px]">{agent.provider}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-amber-500 to-red-500" />
            <span className="text-slate-400 text-sm">12 Government Regulators</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-slate-400 text-sm">13 AI Safety Companies</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-400" />
            <span className="text-slate-400 text-sm">33 Byzantine AI Agents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-slate-400 text-sm">100 Human Analysts</span>
          </div>
        </div>
        
        {/* Human Analysts Grid */}
        <div className="mt-12">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">Human AI Analysts Network</h3>
            <p className="text-slate-400 text-sm">100 certified analysts providing human oversight across 6 global regions</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-1 max-w-4xl mx-auto">
            {humanAnalysts.map((analyst, index) => {
              const isActive = activeAnalysts.has(index);
              const regionColors: Record<string, string> = {
                'EU': 'bg-blue-500',
                'US': 'bg-red-500',
                'UK': 'bg-purple-500',
                'APAC': 'bg-yellow-500',
                'LATAM': 'bg-green-500',
                'MEA': 'bg-orange-500',
              };
              
              return (
                <motion.div
                  key={`analyst-${analyst.id}`}
                  className={`
                    w-3 h-3 rounded-full cursor-pointer transition-all duration-300
                    ${regionColors[analyst.region]}
                    ${isActive ? 'opacity-100 scale-150 shadow-lg' : 'opacity-40 hover:opacity-70'}
                  `}
                  animate={{
                    scale: isActive ? 1.5 : 1,
                    opacity: isActive ? 1 : 0.4,
                  }}
                  transition={{ duration: 0.2 }}
                  title={`Analyst #${analyst.id} - ${analyst.region} - ${analyst.specialty}`}
                />
              );
            })}
          </div>
          
          {/* Region Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {['EU', 'US', 'UK', 'APAC', 'LATAM', 'MEA'].map((region) => {
              const regionColors: Record<string, string> = {
                'EU': 'bg-blue-500',
                'US': 'bg-red-500',
                'UK': 'bg-purple-500',
                'APAC': 'bg-yellow-500',
                'LATAM': 'bg-green-500',
                'MEA': 'bg-orange-500',
              };
              const regionNames: Record<string, string> = {
                'EU': 'Europe',
                'US': 'United States',
                'UK': 'United Kingdom',
                'APAC': 'Asia-Pacific',
                'LATAM': 'Latin America',
                'MEA': 'Middle East & Africa',
              };
              const count = humanAnalysts.filter(a => a.region === region).length;
              
              return (
                <div key={region} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${regionColors[region]}`} />
                  <span className="text-slate-400 text-xs">{regionNames[region]} ({count})</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Live Stats */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white font-semibold">{dailyDecisions.toLocaleString()}</span>
            <span className="text-slate-400 text-sm">decisions today</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-white font-semibold">12</span>
            <span className="text-slate-400 text-sm">regulatory feeds</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-white font-semibold">23/33</span>
            <span className="text-slate-400 text-sm">consensus required</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-slate-400 text-sm">Live network</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RLMAINetworkVisualization;
