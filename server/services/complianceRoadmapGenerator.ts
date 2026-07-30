/**
 * Compliance Roadmap Generator Service
 * AI-powered analysis of compliance gaps and remediation planning
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ComplianceGap {
  requirementId: string;
  requirementName: string;
  framework: string;
  currentStatus: 'compliant' | 'partial' | 'non-compliant';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  evidence: string[];
}

export interface RemediationAction {
  id: string;
  title: string;
  description: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  estimatedHours: number;
  timeline: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  dependencies: string[];
  successCriteria: string[];
  resources: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ComplianceRoadmap {
  organizationId: string;
  generatedAt: Date | string;
  totalGaps: number;
  criticalGaps: number;
  estimatedTotalHours: number;
  estimatedTimelineMonths: number;
  phases: RemediationPhase[];
  aiAnalysis: string;
  recommendations: string[];
}

export interface RemediationPhase {
  phase: number;
  name: string;
  duration: string;
  actions: RemediationAction[];
  expectedOutcome: string;
  successMetrics: string[];
}

export class ComplianceRoadmapGenerator {
  private geminiClient: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.geminiClient = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generate AI-powered compliance roadmap
   */
  async generateRoadmap(
    organizationId: string,
    gaps: ComplianceGap[],
    currentResources: string[],
    targetTimeline: number
  ): Promise<ComplianceRoadmap> {
    // Prepare gap summary for AI analysis
    const gapSummary = this.formatGapsForAI(gaps);

    // Call Gemini API for AI-powered analysis
    const aiAnalysis = await this.analyzeGapsWithAI(gapSummary, currentResources, targetTimeline);

    // Generate remediation phases
    const phases = this.generateRemediationPhases(gaps, aiAnalysis);

    // Calculate metrics
    const criticalGaps = gaps.filter((g) => g.severity === 'critical').length;
    const totalHours = phases.reduce(
      (sum, phase) => sum + phase.actions.reduce((actionSum, action) => actionSum + action.estimatedHours, 0),
      0
    );

    return {
      organizationId,
      generatedAt: new Date().toISOString(),
      totalGaps: gaps.length,
      criticalGaps,
      estimatedTotalHours: totalHours,
      estimatedTimelineMonths: Math.ceil(totalHours / (40 * 4)), // Assuming 40 hours/week
      phases,
      aiAnalysis,
      recommendations: this.generateRecommendations(gaps, phases),
    };
  }

  /**
   * Format compliance gaps for AI analysis
   */
  private formatGapsForAI(gaps: ComplianceGap[]): string {
    const grouped = gaps.reduce(
      (acc, gap) => {
        if (!acc[gap.framework]) {
          acc[gap.framework] = [];
        }
        acc[gap.framework].push(gap);
        return acc;
      },
      {} as Record<string, ComplianceGap[]>
    );

    let summary = 'Compliance Gaps Analysis:\n\n';

    for (const [framework, frameworkGaps] of Object.entries(grouped)) {
      summary += `Framework: ${framework}\n`;
      summary += `Total gaps: ${frameworkGaps.length}\n`;
      summary += `Critical: ${frameworkGaps.filter((g) => g.severity === 'critical').length}\n`;
      summary += `High: ${frameworkGaps.filter((g) => g.severity === 'high').length}\n\n`;

      frameworkGaps.slice(0, 5).forEach((gap) => {
        summary += `- ${gap.requirementName} (${gap.severity}): ${gap.description}\n`;
      });
      summary += '\n';
    }

    return summary;
  }

  /**
   * Analyze gaps using Gemini AI
   */
  private async analyzeGapsWithAI(
    gapSummary: string,
    currentResources: string[],
    targetTimeline: number
  ): Promise<string> {
    try {
      const model = this.geminiClient.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are an expert AI compliance consultant. Analyze the following compliance gaps and provide strategic recommendations for remediation.

${gapSummary}

Current Resources Available:
${currentResources.map((r: any) => `- ${r}`).join('\n')}

Target Timeline: ${targetTimeline} months

Please provide:
1. Priority assessment of gaps
2. Recommended remediation sequence
3. Resource allocation strategy
4. Risk mitigation approach
5. Quick wins that can be implemented immediately
6. Long-term strategic recommendations

Focus on practical, actionable insights that can be implemented within the given timeline and resources.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Return fallback analysis if API fails
      return this.generateFallbackAnalysis(gapSummary);
    }
  }

  /**
   * Generate fallback analysis if AI is unavailable
   */
  private generateFallbackAnalysis(gapSummary: string): string {
    return `Compliance Remediation Strategy

Based on the identified gaps, the following approach is recommended:

1. **Immediate Actions (0-30 days)**
   - Address critical severity gaps first
   - Establish governance framework
   - Assign compliance ownership

2. **Short-term (1-3 months)**
   - Implement core controls
   - Develop compliance documentation
   - Conduct staff training

3. **Medium-term (3-6 months)**
   - Complete control implementation
   - Conduct internal assessments
   - Establish monitoring processes

4. **Long-term (6+ months)**
   - Continuous improvement
   - Regular audits and reviews
   - Stakeholder engagement

Key Success Factors:
- Executive sponsorship and commitment
- Adequate resource allocation
- Clear accountability and ownership
- Regular progress tracking
- Stakeholder communication`;
  }

  /**
   * Generate remediation phases
   */
  private generateRemediationPhases(gaps: ComplianceGap[], aiAnalysis: string): RemediationPhase[] {
    // Sort gaps by severity
    const sortedGaps = [...gaps].sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    // Phase 1: Critical gaps (0-30 days)
    const phase1Gaps = sortedGaps.filter((g) => g.severity === 'critical');
    const phase1Actions = phase1Gaps.map((gap) => this.createRemediationAction(gap, 1));

    // Phase 2: High priority gaps (1-3 months)
    const phase2Gaps = sortedGaps.filter((g) => g.severity === 'high');
    const phase2Actions = phase2Gaps.map((gap) => this.createRemediationAction(gap, 2));

    // Phase 3: Medium priority gaps (3-6 months)
    const phase3Gaps = sortedGaps.filter((g) => g.severity === 'medium');
    const phase3Actions = phase3Gaps.map((gap) => this.createRemediationAction(gap, 3));

    // Phase 4: Low priority gaps (6+ months)
    const phase4Gaps = sortedGaps.filter((g) => g.severity === 'low');
    const phase4Actions = phase4Gaps.map((gap) => this.createRemediationAction(gap, 4));

    return [
      {
        phase: 1,
        name: 'Critical Remediation',
        duration: '0-30 days',
        actions: phase1Actions,
        expectedOutcome: 'Address all critical compliance gaps',
        successMetrics: ['All critical gaps resolved', 'Executive sign-off obtained', 'Baseline assessment completed'],
      },
      {
        phase: 2,
        name: 'High Priority Implementation',
        duration: '1-3 months',
        actions: phase2Actions,
        expectedOutcome: 'Implement high-priority controls',
        successMetrics: ['High-priority controls deployed', 'Staff trained', 'Initial audit passed'],
      },
      {
        phase: 3,
        name: 'Medium Priority Enhancement',
        duration: '3-6 months',
        actions: phase3Actions,
        expectedOutcome: 'Enhance compliance posture',
        successMetrics: ['Medium-priority controls implemented', 'Monitoring established', 'Documentation complete'],
      },
      {
        phase: 4,
        name: 'Continuous Improvement',
        duration: '6+ months',
        actions: phase4Actions,
        expectedOutcome: 'Maintain and improve compliance',
        successMetrics: ['Low-priority items addressed', 'Continuous monitoring active', 'Regular reviews scheduled'],
      },
    ];
  }

  /**
   * Create remediation action from gap
   */
  private createRemediationAction(gap: ComplianceGap, phase: number): RemediationAction {
    const effortMap: Record<string, 'low' | 'medium' | 'high'> = {
      critical: 'high',
      high: 'high',
      medium: 'medium',
      low: 'low',
    };

    const hoursMap: Record<string, number> = {
      low: 20,
      medium: 60,
      high: 120,
    };

    const effort = effortMap[gap.severity];

    return {
      id: `action-${gap.requirementId}-${phase}`,
      title: `Remediate: ${gap.requirementName}`,
      description: gap.description,
      estimatedEffort: effort,
      estimatedHours: hoursMap[effort],
      timeline: this.getTimelineForPhase(phase),
      priority: gap.severity,
      owner: this.getOwnerForGap(gap),
      dependencies: [],
      successCriteria: [
        `${gap.requirementName} requirement met`,
        'Evidence documented',
        'Stakeholder approval obtained',
      ],
      resources: this.getResourcesForGap(gap),
      riskLevel: gap.severity === 'critical' ? 'high' : gap.severity === 'high' ? 'medium' : 'low',
    };
  }

  /**
   * Get timeline for phase
   */
  private getTimelineForPhase(phase: number): string {
    const timelines = ['0-30 days', '1-3 months', '3-6 months', '6+ months'];
    return timelines[phase - 1] || '6+ months';
  }

  /**
   * Get owner for gap
   */
  private getOwnerForGap(gap: ComplianceGap): string {
    const ownerMap: Record<string, string> = {
      'Data Protection': 'Data Protection Officer',
      'Transparency': 'Product Manager',
      'Human Oversight': 'Operations Manager',
      'Security': 'Security Officer',
      'Documentation': 'Compliance Officer',
    };

    for (const [key, owner] of Object.entries(ownerMap)) {
      if (gap.requirementName.includes(key)) {
        return owner;
      }
    }

    return 'Compliance Officer';
  }

  /**
   * Get resources for gap
   */
  private getResourcesForGap(gap: ComplianceGap): string[] {
    const resources: string[] = [];

    if (gap.requirementName.includes('Training')) {
      resources.push('Training materials', 'HR support');
    }
    if (gap.requirementName.includes('Documentation')) {
      resources.push('Technical writer', 'Legal review');
    }
    if (gap.requirementName.includes('Security')) {
      resources.push('Security consultant', 'Penetration testing');
    }
    if (gap.requirementName.includes('Audit')) {
      resources.push('External auditor', 'Audit tools');
    }

    if (resources.length === 0) {
      resources.push('Compliance team', 'Subject matter expert');
    }

    return resources;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(gaps: ComplianceGap[], phases: RemediationPhase[]): string[] {
    const recommendations: string[] = [];

    // Critical gap recommendations
    const criticalGaps = gaps.filter((g) => g.severity === 'critical');
    if (criticalGaps.length > 0) {
      recommendations.push(
        `Immediately address ${criticalGaps.length} critical gaps to reduce compliance risk exposure`
      );
    }

    // Resource recommendations
    const totalHours = phases.reduce(
      (sum, phase) => sum + phase.actions.reduce((actionSum, action) => actionSum + action.estimatedHours, 0),
      0
    );
    const requiredTeamSize = Math.ceil(totalHours / (40 * 4 * 6)); // 6-month timeline
    recommendations.push(`Allocate at least ${requiredTeamSize} dedicated compliance team members`);

    // Framework-specific recommendations
    const frameworks = [...new Set(gaps.map((g) => g.framework))];
    frameworks.forEach((framework) => {
      const frameworkGaps = gaps.filter((g) => g.framework === framework);
      recommendations.push(
        `Establish ${framework} compliance governance with clear ownership and accountability`
      );
    });

    // Process recommendations
    recommendations.push('Implement continuous compliance monitoring and automated controls');
    recommendations.push('Establish regular compliance review cycles (quarterly minimum)');
    recommendations.push('Create compliance dashboard for executive visibility');

    return recommendations;
  }

  /**
   * Get roadmap summary
   */
  getRoadmapSummary(roadmap: ComplianceRoadmap): string {
    return `
Compliance Roadmap Summary
==========================

Organization: ${roadmap.organizationId}
Generated: ${roadmap.generatedAt.toString()}

Overview:
- Total Compliance Gaps: ${roadmap.totalGaps}
- Critical Gaps: ${roadmap.criticalGaps}
- Estimated Effort: ${roadmap.estimatedTotalHours} hours
- Estimated Timeline: ${roadmap.estimatedTimelineMonths} months

Phases:
${roadmap.phases.map((phase) => `${phase.phase}. ${phase.name} (${phase.duration}): ${phase.actions.length} actions`).join('\n')}

Key Recommendations:
${roadmap.recommendations.map((rec) => `- ${rec}`).join('\n')}
    `;
  }
}
