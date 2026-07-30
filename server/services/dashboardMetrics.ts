/**
 * Dashboard Metrics Service
 * Real-time compliance score cards, webhook delivery metrics, and onboarding analytics
 */

export interface ComplianceScoreCard {
  systemId: number;
  systemName: string;
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  lastUpdated: Date | string;
  riskLevel: 'minimal' | 'limited' | 'high';
}

export interface WebhookMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number; // milliseconds
  successRate: number; // percentage
  lastDeliveryTime: Date | string | null;
}

export interface OnboardingFunnelAnalytics {
  totalStarted: number;
  completedStep1: number;
  completedStep2: number;
  completedStep3: number;
  completedStep4: number;
  completedStep5: number;
  conversionRates: {
    step1to2: number;
    step2to3: number;
    step3to4: number;
    step4to5: number;
    overall: number;
  };
  averageTimePerStep: Record<number, number>; // minutes
  dropoffPoints: Array<{ step: number; dropoffCount: number }>;
}

export interface ComplianceTrendData {
  date: Date | string;
  score: number;
  systemId: number;
}

export interface ExecutiveDashboard {
  complianceScoreCards: ComplianceScoreCard[];
  webhookMetrics: WebhookMetrics;
  onboardingAnalytics: OnboardingFunnelAnalytics;
  complianceTrends: ComplianceTrendData[];
  riskSummary: {
    highRiskSystems: number;
    limitedRiskSystems: number;
    minimalRiskSystems: number;
  };
  actionItems: Array<{
    id: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    dueDate: Date | string;
    systemId?: number;
  }>;
}

/**
 * Dashboard Metrics Service
 */
export class DashboardMetricsService {
  /**
   * Calculate compliance score card for a system
   */
  static calculateComplianceScoreCard(
    systemId: number,
    systemName: string,
    currentScore: number,
    previousScore: number,
    certificationLevel: string
  ): ComplianceScoreCard {
    const trend = currentScore > previousScore ? 'up' : currentScore < previousScore ? 'down' : 'stable';
    const trendPercentage = previousScore === 0 ? 0 : ((currentScore - previousScore) / previousScore) * 100;

    const riskLevel =
      currentScore >= 90 ? 'minimal' : currentScore >= 70 ? 'limited' : 'high';

    return {
      systemId,
      systemName,
      overallScore: currentScore,
      trend,
      trendPercentage: Math.abs(trendPercentage),
      certificationLevel: certificationLevel as any,
      lastUpdated: new Date().toISOString(),
      riskLevel,
    };
  }

  /**
   * Calculate webhook delivery metrics
   */
  static calculateWebhookMetrics(
    totalSubscriptions: number,
    activeSubscriptions: number,
    deliveries: Array<{
      status: 'delivered' | 'failed' | 'retrying';
      deliveryTime?: number;
      createdAt: Date | string;
    }>
  ): WebhookMetrics {
    const successfulDeliveries = deliveries.filter((d: any) => d.status === 'delivered').length;
    const failedDeliveries = deliveries.filter((d: any) => d.status === 'failed').length;
    const totalDeliveries = deliveries.length;

    const deliveryTimes = deliveries
      .filter((d: any) => d.deliveryTime)
      .map((d: any) => d.deliveryTime || 0);
    const averageDeliveryTime =
      deliveryTimes.length > 0
        ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
        : 0;

    const successRate =
      totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

    const lastDelivery = deliveries.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return {
      totalSubscriptions,
      activeSubscriptions,
      totalDeliveries,
      successfulDeliveries,
      failedDeliveries,
      averageDeliveryTime,
      successRate,
      lastDeliveryTime: lastDelivery?.createdAt || null,
    };
  }

  /**
   * Calculate onboarding funnel analytics
   */
  static calculateOnboardingAnalytics(
    sessions: Array<{
      id: string;
      currentStep: number;
      completedSteps: number[];
      createdAt: Date | string;
      updatedAt: Date | string;
    }>
  ): OnboardingFunnelAnalytics {
    const totalStarted = sessions.length;
    const completedStep1 = sessions.filter((s: any) => s.completedSteps.includes(1)).length;
    const completedStep2 = sessions.filter((s: any) => s.completedSteps.includes(2)).length;
    const completedStep3 = sessions.filter((s: any) => s.completedSteps.includes(3)).length;
    const completedStep4 = sessions.filter((s: any) => s.completedSteps.includes(4)).length;
    const completedStep5 = sessions.filter((s: any) => s.completedSteps.includes(5)).length;

    const conversionRates = {
      step1to2: completedStep1 > 0 ? (completedStep2 / completedStep1) * 100 : 0,
      step2to3: completedStep2 > 0 ? (completedStep3 / completedStep2) * 100 : 0,
      step3to4: completedStep3 > 0 ? (completedStep4 / completedStep3) * 100 : 0,
      step4to5: completedStep4 > 0 ? (completedStep5 / completedStep4) * 100 : 0,
      overall: totalStarted > 0 ? (completedStep5 / totalStarted) * 100 : 0,
    };

    // Calculate average time per step
    const averageTimePerStep: Record<number, number> = {};
    for (let step = 1; step <= 5; step++) {
      const sessionsAtStep = sessions.filter((s: any) => s.completedSteps.includes(step));
      if (sessionsAtStep.length > 0) {
        const totalTime = sessionsAtStep.reduce((sum: number, s: any) => {
          return sum + (new Date(s.updatedAt).getTime() - new Date(s.createdAt).getTime());
        }, 0);
        averageTimePerStep[step] = Math.round(totalTime / sessionsAtStep.length / 60000); // Convert to minutes
      }
    }

    // Calculate dropoff points
    const dropoffPoints = [
      { step: 1, dropoffCount: totalStarted - completedStep1 },
      { step: 2, dropoffCount: completedStep1 - completedStep2 },
      { step: 3, dropoffCount: completedStep2 - completedStep3 },
      { step: 4, dropoffCount: completedStep3 - completedStep4 },
      { step: 5, dropoffCount: completedStep4 - completedStep5 },
    ].filter((d: any) => d.dropoffCount > 0);

    return {
      totalStarted,
      completedStep1,
      completedStep2,
      completedStep3,
      completedStep4,
      completedStep5,
      conversionRates,
      averageTimePerStep,
      dropoffPoints,
    };
  }

  /**
   * Generate compliance trend data
   */
  static generateComplianceTrends(
    historicalScores: Array<{
      systemId: number;
      score: number;
      timestamp: Date | string;
    }>
  ): ComplianceTrendData[] {
    return historicalScores.map((record) => ({
      date: record.timestamp,
      score: record.score,
      systemId: record.systemId,
    }));
  }

  /**
   * Calculate risk summary
   */
  static calculateRiskSummary(
    systems: Array<{
      id: number;
      complianceScore: number;
    }>
  ): { highRiskSystems: number; limitedRiskSystems: number; minimalRiskSystems: number } {
    return {
      highRiskSystems: systems.filter((s: any) => s.complianceScore < 70).length,
      limitedRiskSystems: systems.filter((s: any) => s.complianceScore >= 70 && s.complianceScore < 90).length,
      minimalRiskSystems: systems.filter((s: any) => s.complianceScore >= 90).length,
    };
  }

  /**
   * Generate action items based on compliance status
   */
  static generateActionItems(
    systems: Array<{
      id: number;
      name: string;
      complianceScore: number;
      lastAssessmentDate: Date | string;
    }>,
    webhookMetrics: WebhookMetrics,
    onboardingAnalytics: OnboardingFunnelAnalytics
  ): Array<{
    id: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    dueDate: Date | string;
    systemId?: number;
  }> {
    const items: Array<{
      id: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      title: string;
      description: string;
      dueDate: Date | string;
      systemId?: number;
    }> = [];

    // Add action items for high-risk systems
    systems
      .filter((s: any) => s.complianceScore < 70)
      .forEach((system) => {
        items.push({
          id: `action-${system.id}-compliance`,
          priority: 'critical',
          title: `Improve compliance for ${system.name}`,
          description: `System has compliance score of ${system.complianceScore}%. Target: 70%+`,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          systemId: system.id,
        });
      });

    // Add action item for webhook failures
    if (webhookMetrics.successRate < 95) {
      items.push({
        id: 'action-webhook-reliability',
        priority: 'high',
        title: 'Improve webhook delivery reliability',
        description: `Current success rate: ${webhookMetrics.successRate.toFixed(2)}%. Target: 99%+`,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      });
    }

    // Add action item for onboarding dropoff
    if (onboardingAnalytics.conversionRates.overall < 50) {
      items.push({
        id: 'action-onboarding-conversion',
        priority: 'high',
        title: 'Optimize onboarding funnel',
        description: `Current completion rate: ${onboardingAnalytics.conversionRates.overall.toFixed(2)}%. Highest dropoff at step ${onboardingAnalytics.dropoffPoints[0]?.step}`,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
      });
    }

    // Add action item for stale assessments
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    systems
      .filter((s: any) => s.lastAssessmentDate < thirtyDaysAgo)
      .forEach((system) => {
        items.push({
          id: `action-${system.id}-assessment`,
          priority: 'medium',
          title: `Re-assess ${system.name}`,
          description: `Last assessment was over 30 days ago. Schedule new assessment.`,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          systemId: system.id,
        });
      });

    return items;
  }

  /**
   * Build complete executive dashboard
   */
  static buildExecutiveDashboard(
    complianceScoreCards: ComplianceScoreCard[],
    webhookMetrics: WebhookMetrics,
    onboardingAnalytics: OnboardingFunnelAnalytics,
    complianceTrends: ComplianceTrendData[],
    systems: Array<{ id: number; name: string; complianceScore: number; lastAssessmentDate: Date }>
  ): ExecutiveDashboard {
    const riskSummary = this.calculateRiskSummary(systems);
    const actionItems = this.generateActionItems(systems, webhookMetrics, onboardingAnalytics);

    return {
      complianceScoreCards,
      webhookMetrics,
      onboardingAnalytics,
      complianceTrends,
      riskSummary,
      actionItems,
    };
  }
}
