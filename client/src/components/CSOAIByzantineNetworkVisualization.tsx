import React, { useMemo, useState, useEffect } from 'react';

interface NetworkNode {
  id: string;
  name: string;
  category: 'council' | 'watchdog' | 'certification' | 'learning' | 'pdca';
  x: number;
  y: number;
  color: string;
  connections: string[];
}

interface DataParticle {
  id: number;
  from: string;
  to: string;
  progress: number;
  speed: number;
}

const CATEGORY_COLORS = {
  council: '#8B5CF6',      // Purple - Byzantine Council
  watchdog: '#EF4444',     // Red - Public Watchdog
  certification: '#10B981', // Green - CEASAI
  learning: '#3B82F6',     // Blue - CSOAI Learn
  pdca: '#F59E0B'          // Amber - SOAI-PDCA
};

const CATEGORY_LABELS = {
  council: 'Byzantine Council',
  watchdog: 'Public Watchdog',
  certification: 'CEASAI Certification',
  learning: 'CSOAI Learn',
  pdca: 'SOAI-PDCA Cycle'
};

export const CSOAIByzantineNetworkVisualization: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [particles, setParticles] = useState<DataParticle[]>([]);
  const [consensusCount, setConsensusCount] = useState(0);

  // Generate 33 Byzantine Council members in a circular arrangement
  const councilNodes = useMemo(() => {
    const nodes: NetworkNode[] = [];
    const centerX = 400;
    const centerY = 300;
    const radius = 180;

    for (let i = 0; i < 33; i++) {
      const angle = (i / 33) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      nodes.push({
        id: `council-${i}`,
        name: `Agent ${i + 1}`,
        category: 'council',
        x,
        y,
        color: CATEGORY_COLORS.council,
        connections: []
      });
    }
    return nodes;
  }, []);

  // Generate feature nodes around the council
  const featureNodes = useMemo(() => {
    const centerX = 400;
    const centerY = 300;
    const outerRadius = 280;
    
    const features: { name: string; category: keyof typeof CATEGORY_COLORS; angle: number }[] = [
      { name: 'Public Watchdog', category: 'watchdog', angle: -Math.PI / 2 },
      { name: 'CEASAI Certification', category: 'certification', angle: Math.PI / 6 },
      { name: 'CSOAI Learn', category: 'learning', angle: 5 * Math.PI / 6 },
      { name: 'SOAI-PDCA', category: 'pdca', angle: Math.PI / 2 }
    ];

    return features.map((f, i) => ({
      id: `feature-${i}`,
      name: f.name,
      category: f.category,
      x: centerX + outerRadius * Math.cos(f.angle),
      y: centerY + outerRadius * Math.sin(f.angle),
      color: CATEGORY_COLORS[f.category],
      connections: councilNodes.slice(0, 5).map(n => n.id)
    }));
  }, [councilNodes]);

  // Animate particles flowing between nodes
  useEffect(() => {
    const interval = setInterval(() => {
      // Create new particles
      if (Math.random() > 0.7) {
        const fromNode = featureNodes[Math.floor(Math.random() * featureNodes.length)];
        const toNode = councilNodes[Math.floor(Math.random() * councilNodes.length)];
        
        setParticles(prev => [
          ...prev.slice(-20), // Keep only last 20 particles
          {
            id: Date.now(),
            from: fromNode.id,
            to: toNode.id,
            progress: 0,
            speed: 0.02 + Math.random() * 0.02
          }
        ]);
      }

      // Update particle positions
      setParticles(prev => 
        prev
          .map(p => ({ ...p, progress: p.progress + p.speed }))
          .filter(p => p.progress < 1)
      );

      // Increment consensus count occasionally
      if (Math.random() > 0.95) {
        setConsensusCount(prev => prev + 1);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [councilNodes, featureNodes]);

  // Get particle position
  const getParticlePosition = (particle: DataParticle) => {
    const fromNode = [...councilNodes, ...featureNodes].find(n => n.id === particle.from);
    const toNode = [...councilNodes, ...featureNodes].find(n => n.id === particle.to);
    
    if (!fromNode || !toNode) return { x: 0, y: 0 };
    
    return {
      x: fromNode.x + (toNode.x - fromNode.x) * particle.progress,
      y: fromNode.y + (toNode.y - fromNode.y) * particle.progress
    };
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          33-Agent Byzantine Council
        </h2>
        <p className="text-muted-foreground text-sm">
          Real-time consensus network for AI safety governance
        </p>
      </div>

      {/* SVG Visualization */}
      <svg 
        viewBox="0 0 800 600" 
        className="w-full h-auto bg-gradient-to-br from-background to-muted/30 rounded-xl border border-border"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path 
              d="M 40 0 L 0 0 0 40" 
              fill="none" 
              stroke="currentColor" 
              strokeOpacity="0.05" 
              strokeWidth="1"
            />
          </pattern>
          
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Connection lines from features to council */}
        {featureNodes.map(feature => 
          councilNodes.slice(0, 11).map((council, i) => (
            <line
              key={`${feature.id}-${council.id}`}
              x1={feature.x}
              y1={feature.y}
              x2={council.x}
              y2={council.y}
              stroke={feature.color}
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          ))
        )}

        {/* Council member connections (inner ring) */}
        {councilNodes.map((node, i) => {
          const nextNode = councilNodes[(i + 1) % 33];
          return (
            <line
              key={`ring-${i}`}
              x1={node.x}
              y1={node.y}
              x2={nextNode.x}
              y2={nextNode.y}
              stroke={CATEGORY_COLORS.council}
              strokeOpacity={0.3}
              strokeWidth={1}
            />
          );
        })}

        {/* Data particles */}
        {particles.map(particle => {
          const pos = getParticlePosition(particle);
          const fromNode = [...councilNodes, ...featureNodes].find(n => n.id === particle.from);
          return (
            <circle
              key={particle.id}
              cx={pos.x}
              cy={pos.y}
              r={3}
              fill={fromNode?.color || '#fff'}
              filter="url(#glow)"
            >
              <animate
                attributeName="opacity"
                values="1;0.5;1"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </circle>
          );
        })}

        {/* Council nodes */}
        {councilNodes.map((node, i) => (
          <g 
            key={node.id}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={hoveredNode === node.id ? 10 : 6}
              fill={node.color}
              opacity={hoveredNode === node.id ? 1 : 0.7}
              filter={hoveredNode === node.id ? "url(#glow)" : undefined}
              className="transition-all duration-200"
            />
            {hoveredNode === node.id && (
              <text
                x={node.x}
                y={node.y - 15}
                textAnchor="middle"
                fill="currentColor"
                fontSize="12"
                className="font-medium"
              >
                {node.name}
              </text>
            )}
          </g>
        ))}

        {/* Feature nodes */}
        {featureNodes.map(node => (
          <g 
            key={node.id}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={hoveredNode === node.id ? 24 : 20}
              fill={node.color}
              opacity={hoveredNode === node.id ? 1 : 0.8}
              filter="url(#glow)"
              className="transition-all duration-200"
            />
            <text
              x={node.x}
              y={node.y + 4}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="bold"
            >
              {node.name.split(' ')[0]}
            </text>
            {hoveredNode === node.id && (
              <text
                x={node.x}
                y={node.y + 45}
                textAnchor="middle"
                fill="currentColor"
                fontSize="12"
                className="font-medium"
              >
                {node.name}
              </text>
            )}
          </g>
        ))}

        {/* Center label */}
        <text
          x="400"
          y="295"
          textAnchor="middle"
          fill="currentColor"
          fontSize="14"
          fontWeight="bold"
          opacity="0.7"
        >
          CSOAI
        </text>
        <text
          x="400"
          y="312"
          textAnchor="middle"
          fill="currentColor"
          fontSize="10"
          opacity="0.5"
        >
          Byzantine Consensus
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] }}
            />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 mt-4 text-center">
        <div>
          <div className="text-2xl font-bold text-foreground">{consensusCount}</div>
          <div className="text-xs text-muted-foreground">Consensus Reached</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">33</div>
          <div className="text-xs text-muted-foreground">Council Agents</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground">{particles.length}</div>
          <div className="text-xs text-muted-foreground">Active Signals</div>
        </div>
      </div>
    </div>
  );
};

export default CSOAIByzantineNetworkVisualization;
