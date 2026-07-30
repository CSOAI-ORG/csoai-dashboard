import React, { useEffect, useRef } from 'react';

interface Node {
  id: string;
  label: string;
  angle: number;
  radius: number;
  color: string;
  type: 'council' | 'legislation' | 'feature' | 'analyst' | 'pipeline' | 'center';
  specialization?: string;
}

interface AnimatedParticle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export const GovernanceEcosystemVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const particlesRef = useRef<AnimatedParticle[]>([]);

  // Define all nodes for each ring
  const centerNode: Node = {
    id: 'csoai',
    label: 'CSOAI',
    angle: 0,
    radius: 0,
    color: '#3b82f6',
    type: 'center'
  };

  // Ring 1: Human Councils with their legislations
  const ring1Nodes: Node[] = [
    {
      id: 'eu-council',
      label: 'European Union',
      angle: 0,
      radius: 120,
      color: '#f59e0b',
      type: 'council'
    },
    {
      id: 'us-council',
      label: 'United States',
      angle: 120,
      radius: 120,
      color: '#ef4444',
      type: 'council'
    },
    {
      id: 'asia-council',
      label: 'Asia-Pacific',
      angle: 240,
      radius: 120,
      color: '#8b5cf6',
      type: 'council'
    }
  ];

  // Ring 1B: Legislations
  const legislationNodes: Node[] = [
    {
      id: 'euai-act',
      label: 'EU AI Act',
      angle: -30,
      radius: 140,
      color: '#fbbf24',
      type: 'legislation'
    },
    {
      id: 'nist',
      label: 'NIST AI RMF',
      angle: 30,
      radius: 140,
      color: '#f87171',
      type: 'legislation'
    },
    {
      id: 'tc260',
      label: 'TC260',
      angle: 90,
      radius: 140,
      color: '#a78bfa',
      type: 'legislation'
    },
    {
      id: 'uk-ai-bill',
      label: 'UK AI Bill',
      angle: 150,
      radius: 140,
      color: '#fb923c',
      type: 'legislation'
    },
    {
      id: 'canada-ai',
      label: 'Canada AI Act',
      angle: 210,
      radius: 140,
      color: '#f472b6',
      type: 'legislation'
    },
    {
      id: 'australia-ai',
      label: 'Australia AI Governance',
      angle: 270,
      radius: 140,
      color: '#a855f7',
      type: 'legislation'
    }
  ];

  // Ring 2: Governance Features
  const ring2Nodes: Node[] = [
    {
      id: 'pdca-plan',
      label: 'Plan',
      angle: 0,
      radius: 200,
      color: '#06b6d4',
      type: 'feature'
    },
    {
      id: 'pdca-do',
      label: 'Do',
      angle: 90,
      radius: 200,
      color: '#06b6d4',
      type: 'feature'
    },
    {
      id: 'pdca-check',
      label: 'Check',
      angle: 180,
      radius: 200,
      color: '#06b6d4',
      type: 'feature'
    },
    {
      id: 'pdca-act',
      label: 'Act',
      angle: 270,
      radius: 200,
      color: '#06b6d4',
      type: 'feature'
    },
    {
      id: 'watchdog',
      label: 'Public Watchdog',
      angle: 45,
      radius: 220,
      color: '#ec4899',
      type: 'feature'
    },
    {
      id: 'incident-reporting',
      label: 'Incident Reporting',
      angle: 135,
      radius: 220,
      color: '#ec4899',
      type: 'feature'
    },
    {
      id: 'transparency',
      label: 'Transparency',
      angle: 225,
      radius: 220,
      color: '#ec4899',
      type: 'feature'
    },
    {
      id: 'accountability',
      label: 'Accountability',
      angle: 315,
      radius: 220,
      color: '#ec4899',
      type: 'feature'
    }
  ];

  // Ring 3: AI Analysts with specializations
  const ring3Nodes: Node[] = [
    {
      id: 'analyst-euai-1',
      label: 'EUAI Analyst',
      angle: 0,
      radius: 300,
      color: '#fbbf24',
      type: 'analyst',
      specialization: 'EU AI Act'
    },
    {
      id: 'analyst-euai-2',
      label: 'EUAI Analyst',
      angle: 30,
      radius: 300,
      color: '#fbbf24',
      type: 'analyst',
      specialization: 'EU AI Act'
    },
    {
      id: 'analyst-nist-1',
      label: 'NIST Analyst',
      angle: 60,
      radius: 300,
      color: '#f87171',
      type: 'analyst',
      specialization: 'NIST AI RMF'
    },
    {
      id: 'analyst-nist-2',
      label: 'NIST Analyst',
      angle: 90,
      radius: 300,
      color: '#f87171',
      type: 'analyst',
      specialization: 'NIST AI RMF'
    },
    {
      id: 'analyst-tc260-1',
      label: 'TC260 Analyst',
      angle: 120,
      radius: 300,
      color: '#a78bfa',
      type: 'analyst',
      specialization: 'TC260'
    },
    {
      id: 'analyst-tc260-2',
      label: 'TC260 Analyst',
      angle: 150,
      radius: 300,
      color: '#a78bfa',
      type: 'analyst',
      specialization: 'TC260'
    },
    {
      id: 'analyst-uk-1',
      label: 'UK Analyst',
      angle: 180,
      radius: 300,
      color: '#fb923c',
      type: 'analyst',
      specialization: 'UK AI Bill'
    },
    {
      id: 'analyst-uk-2',
      label: 'UK Analyst',
      angle: 210,
      radius: 300,
      color: '#fb923c',
      type: 'analyst',
      specialization: 'UK AI Bill'
    },
    {
      id: 'analyst-canada-1',
      label: 'Canada Analyst',
      angle: 240,
      radius: 300,
      color: '#f472b6',
      type: 'analyst',
      specialization: 'Canada AI Act'
    },
    {
      id: 'analyst-canada-2',
      label: 'Canada Analyst',
      angle: 270,
      radius: 300,
      color: '#f472b6',
      type: 'analyst',
      specialization: 'Canada AI Act'
    },
    {
      id: 'analyst-australia-1',
      label: 'Australia Analyst',
      angle: 300,
      radius: 300,
      color: '#a855f7',
      type: 'analyst',
      specialization: 'Australia AI Governance'
    },
    {
      id: 'analyst-australia-2',
      label: 'Australia Analyst',
      angle: 330,
      radius: 300,
      color: '#a855f7',
      type: 'analyst',
      specialization: 'Australia AI Governance'
    }
  ];

  // Ring 4: CSOAI Pipelines
  const ring4Nodes: Node[] = [
    {
      id: 'pipeline-byzantine',
      label: 'Byzantine Council',
      angle: 0,
      radius: 380,
      color: '#3b82f6',
      type: 'pipeline'
    },
    {
      id: 'pipeline-training',
      label: 'Training Pipeline',
      angle: 60,
      radius: 380,
      color: '#10b981',
      type: 'pipeline'
    },
    {
      id: 'pipeline-dashboard',
      label: 'Dashboard Pipeline',
      angle: 120,
      radius: 380,
      color: '#8b5cf6',
      type: 'pipeline'
    },
    {
      id: 'pipeline-compliance',
      label: 'Compliance Pipeline',
      angle: 180,
      radius: 380,
      color: '#f59e0b',
      type: 'pipeline'
    },
    {
      id: 'pipeline-analysis',
      label: 'Analysis Pipeline',
      angle: 240,
      radius: 380,
      color: '#ec4899',
      type: 'pipeline'
    },
    {
      id: 'pipeline-opensource',
      label: 'Open Source',
      angle: 300,
      radius: 380,
      color: '#06b6d4',
      type: 'pipeline'
    }
  ];

  const allNodes = [centerNode, ...ring1Nodes, ...legislationNodes, ...ring2Nodes, ...ring3Nodes, ...ring4Nodes];

  // Convert angle and radius to canvas coordinates
  const getCoordinates = (angle: number, radius: number, centerX: number, centerY: number) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians)
    };
  };

  // Create animated particles flowing between nodes
  const createParticleFlow = (fromX: number, fromY: number, toX: number, toY: number, color: string) => {
    const particle: AnimatedParticle = {
      x: fromX,
      y: fromY,
      targetX: toX,
      targetY: toY,
      vx: (toX - fromX) * 0.02,
      vy: (toY - fromY) * 0.02,
      life: 1,
      maxLife: 1,
      color: color
    };
    particlesRef.current.push(particle);
  };

  // Update particles
  const updateParticles = () => {
    particlesRef.current = particlesRef.current.filter(p => {
      p.life -= 0.01;
      p.x += p.vx;
      p.y += p.vy;
      return p.life > 0;
    });
  };

  // Draw particles
  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current.forEach(particle => {
      ctx.fillStyle = particle.color + Math.floor(particle.life * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Draw connecting lines with animation
  const drawConnections = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.15)';
    ctx.lineWidth = 1;

    // Connect center to ring 1
    ring1Nodes.forEach(node => {
      const coords = getCoordinates(node.angle, node.radius, centerX, centerY);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    });

    // Connect ring 1 to legislations with animated pulses
    legislationNodes.forEach((legNode, idx) => {
      const legCoords = getCoordinates(legNode.angle, legNode.radius, centerX, centerY);
      const nearestCouncil = ring1Nodes[Math.floor(legNode.angle / 120) % 3];
      const councilCoords = getCoordinates(nearestCouncil.angle, nearestCouncil.radius, centerX, centerY);
      
      ctx.strokeStyle = `rgba(${hexToRgb(legNode.color).join(',')}, 0.25)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(councilCoords.x, councilCoords.y);
      ctx.lineTo(legCoords.x, legCoords.y);
      ctx.stroke();

      // Create particle flows every 100ms
      if (time % 100 < 16) {
        createParticleFlow(councilCoords.x, councilCoords.y, legCoords.x, legCoords.y, legNode.color);
      }
    });

    // Connect ring 1 to ring 2 (PDCA)
    ring2Nodes.forEach((node, idx) => {
      const coords = getCoordinates(node.angle, node.radius, centerX, centerY);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    });

    // Connect ring 2 to ring 3 (analysts) with flowing particles
    ring3Nodes.forEach((analyst, idx) => {
      const analystCoords = getCoordinates(analyst.angle, analyst.radius, centerX, centerY);
      const nearestFeature = ring2Nodes[Math.floor(analyst.angle / 45) % ring2Nodes.length];
      const featureCoords = getCoordinates(nearestFeature.angle, nearestFeature.radius, centerX, centerY);
      
      ctx.strokeStyle = `rgba(${hexToRgb(analyst.color).join(',')}, 0.15)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(featureCoords.x, featureCoords.y);
      ctx.lineTo(analystCoords.x, analystCoords.y);
      ctx.stroke();

      // Create particle flows for analyst interactions
      if (time % 150 < 16) {
        createParticleFlow(featureCoords.x, featureCoords.y, analystCoords.x, analystCoords.y, analyst.color);
      }
    });

    // Connect ring 3 to ring 4 (pipelines) with animated flows
    ring4Nodes.forEach((pipeline, idx) => {
      const pipelineCoords = getCoordinates(pipeline.angle, pipeline.radius, centerX, centerY);
      ctx.strokeStyle = `rgba(${hexToRgb(pipeline.color).join(',')}, 0.15)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(pipelineCoords.x, pipelineCoords.y);
      ctx.stroke();

      // Create particle flows from center to pipelines
      if (time % 200 < 16) {
        createParticleFlow(centerX, centerY, pipelineCoords.x, pipelineCoords.y, pipeline.color);
      }
    });

    // Draw animated pulse lines from center
    const pulseAlpha = Math.sin(time * 0.003) * 0.3 + 0.3;
    ctx.strokeStyle = `rgba(59, 130, 246, ${pulseAlpha})`;
    ctx.lineWidth = 2;

    ring1Nodes.forEach((node) => {
      const coords = getCoordinates(node.angle, node.radius, centerX, centerY);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    });
  };

  // Draw nodes with enhanced visuals
  const drawNodes = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    allNodes.forEach((node, idx) => {
      const coords = getCoordinates(node.angle, node.radius, centerX, centerY);
      
      const nodeSize = node.type === 'center' ? 20 : node.type === 'pipeline' ? 12 : node.type === 'analyst' ? 8 : 10;
      
      // Draw outer glow with pulsing effect
      const glowAlpha = Math.sin(time * 0.002 + idx) * 0.2 + 0.3;
      ctx.fillStyle = `${node.color}${Math.floor(glowAlpha * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, nodeSize + 6, 0, Math.PI * 2);
      ctx.fill();

      // Draw node circle
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, nodeSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw node glow
      ctx.strokeStyle = `${node.color}60`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, nodeSize, 0, Math.PI * 2);
      ctx.stroke();

      // Draw inner highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(coords.x - nodeSize / 3, coords.y - nodeSize / 3, nodeSize / 3, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Draw labels
  const drawLabels = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number) => {
    ctx.font = '11px sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Only draw labels for important nodes
    [centerNode, ...ring1Nodes, ...legislationNodes, ...ring2Nodes, ...ring4Nodes].forEach(node => {
      const coords = getCoordinates(node.angle, node.radius, centerX, centerY);
      
      // Draw label background
      const textWidth = ctx.measureText(node.label).width;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(coords.x - textWidth / 2 - 4, coords.y - 8, textWidth + 8, 16);
      
      // Draw label text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fillText(node.label, coords.x, coords.y);
    });
  };

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = (timestamp: number) => {
      timeRef.current = timestamp;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw background grid
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let r = 50; r < 400; r += 50) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Update and draw particles
      updateParticles();
      drawParticles(ctx);

      // Draw connections and nodes
      drawConnections(ctx, centerX, centerY, timestamp);
      drawNodes(ctx, centerX, centerY, timestamp);
      drawLabels(ctx, centerX, centerY);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden border border-slate-700">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ display: 'block' }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-4 border border-slate-700 text-xs text-slate-300 space-y-2">
        <div className="font-semibold text-slate-100 mb-2">Governance Ecosystem</div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span>CSOAI Center & Pipelines</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
          <span>Human Councils & Legislations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          <span>PDCA Cycle & Governance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
          <span>AI Analysts (Specialized)</span>
        </div>
      </div>
    </div>
  );
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
}
