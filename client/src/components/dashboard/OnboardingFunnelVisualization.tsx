/**
 * Onboarding Funnel Visualization Component
 * Real-time onboarding conversion analytics
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Clock } from 'lucide-react';

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
  averageTimePerStep: Record<number, number>;
  dropoffPoints: Array<{ step: number; dropoffCount: number }>;
}

interface OnboardingFunnelVisualizationProps {
  refreshInterval?: number;
}

const STEP_NAMES = [
  'Company Info',
  'Framework Selection',
  'AI Systems Mapping',
  'Compliance Baseline',
  'Team Setup',
];

export const OnboardingFunnelVisualization: React.FC<OnboardingFunnelVisualizationProps> = ({
  refreshInterval = 30000,
}) => {
  const [analytics, setAnalytics] = useState<OnboardingFunnelAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data - in production, would call tRPC endpoint
      const mockAnalytics: OnboardingFunnelAnalytics = {
        totalStarted: 100,
        completedStep1: 100,
        completedStep2: 80,
        completedStep3: 60,
        completedStep4: 40,
        completedStep5: 30,
        conversionRates: {
          step1to2: 80,
          step2to3: 75,
          step3to4: 66.67,
          step4to5: 75,
          overall: 30,
        },
        averageTimePerStep: {
          1: 5,
          2: 12,
          3: 18,
          4: 25,
          5: 20,
        },
        dropoffPoints: [
          { step: 1, dropoffCount: 0 },
          { step: 2, dropoffCount: 20 },
          { step: 3, dropoffCount: 20 },
          { step: 4, dropoffCount: 20 },
          { step: 5, dropoffCount: 10 },
        ],
      };
      setAnalytics(mockAnalytics);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch onboarding analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading && !analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Failed to load analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const steps = [
    { name: STEP_NAMES[0], completed: analytics.completedStep1 },
    { name: STEP_NAMES[1], completed: analytics.completedStep2 },
    { name: STEP_NAMES[2], completed: analytics.completedStep3 },
    { name: STEP_NAMES[3], completed: analytics.completedStep4 },
    { name: STEP_NAMES[4], completed: analytics.completedStep5 },
  ];

  const getConversionRate = (stepIndex: number): number => {
    const rates = [
      100,
      analytics.conversionRates.step1to2,
      analytics.conversionRates.step2to3,
      analytics.conversionRates.step3to4,
      analytics.conversionRates.step4to5,
    ];
    return rates[stepIndex] || 0;
  };

  const getDropoffColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDropoffBgColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-50';
    if (rate >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Onboarding Funnel</CardTitle>
            <CardDescription>Enterprise onboarding conversion analytics</CardDescription>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Conversion Rate */}
        <div className={`p-4 rounded-lg ${getDropoffBgColor(analytics.conversionRates.overall)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Overall Completion Rate</p>
              <p className={`text-3xl font-bold ${getDropoffColor(analytics.conversionRates.overall)}`}>
                {analytics.conversionRates.overall.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {analytics.completedStep5} of {analytics.totalStarted} organizations completed onboarding
              </p>
            </div>
          </div>
        </div>

        {/* Funnel Visualization */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const conversionRate = getConversionRate(index);
            const dropoff = analytics.dropoffPoints[index];

            return (
              <div key={index} className="space-y-2">
                {/* Step Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="font-medium">{step.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{step.completed}</p>
                      <p className="text-xs text-muted-foreground">completed</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getDropoffColor(conversionRate)}`}>
                        {conversionRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">conversion</p>
                    </div>
                  </div>
                </div>

                {/* Funnel Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      conversionRate >= 80
                        ? 'bg-green-600'
                        : conversionRate >= 60
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                    }`}
                    style={{ width: `${conversionRate}%` }}
                  />
                </div>

                {/* Dropoff Info */}
                {dropoff && dropoff.dropoffCount > 0 && (
                  <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{dropoff.dropoffCount} users dropped off at this step</span>
                  </div>
                )}

                {/* Average Time */}
                {analytics.averageTimePerStep[index + 1] && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Avg. time: {analytics.averageTimePerStep[index + 1]} minutes</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Insights */}
        <div className="pt-4 border-t space-y-3">
          <h3 className="font-semibold text-sm">Key Insights</h3>

          {/* Biggest Dropoff */}
          {analytics.dropoffPoints.length > 0 && (
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Highest Dropoff</p>
                  <p className="text-xs text-yellow-700">
                    Step {analytics.dropoffPoints[0]?.step}: {analytics.dropoffPoints[0]?.dropoffCount} users
                    dropped off
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Slowest Step */}
          {analytics.averageTimePerStep && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Slowest Step</p>
                  <p className="text-xs text-blue-700">
                    {STEP_NAMES[4]}: ~{analytics.averageTimePerStep[5]} minutes average
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-right pt-2 border-t">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};
