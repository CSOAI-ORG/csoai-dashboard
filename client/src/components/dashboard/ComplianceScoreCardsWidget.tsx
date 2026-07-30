/**
 * Compliance Score Cards Widget
 * Real-time compliance metrics for each AI system
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export interface ComplianceScoreCard {
  systemId: number;
  systemName: string;
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  certificationLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  lastUpdated: Date;
  riskLevel: 'minimal' | 'limited' | 'high';
}

interface ComplianceScoreCardsWidgetProps {
  refreshInterval?: number; // milliseconds
  onCardClick?: (systemId: number) => void;
}

export const ComplianceScoreCardsWidget: React.FC<ComplianceScoreCardsWidgetProps> = ({
  refreshInterval = 30000,
  onCardClick,
}) => {
  const [scoreCards, setScoreCards] = useState<ComplianceScoreCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch compliance score cards
  const fetchScoreCards = async () => {
    try {
      setLoading(true);
      // Mock data - in production, would call tRPC endpoint
      const mockCards: ComplianceScoreCard[] = [
        {
          systemId: 1,
          systemName: 'AI Chatbot v2.1',
          overallScore: 85,
          trend: 'up',
          trendPercentage: 5,
          certificationLevel: 'gold',
          lastUpdated: new Date(),
          riskLevel: 'limited',
        },
        {
          systemId: 2,
          systemName: 'Recommendation Engine',
          overallScore: 72,
          trend: 'down',
          trendPercentage: -3,
          certificationLevel: 'silver',
          lastUpdated: new Date(),
          riskLevel: 'limited',
        },
        {
          systemId: 3,
          systemName: 'Fraud Detection Model',
          overallScore: 92,
          trend: 'up',
          trendPercentage: 2,
          certificationLevel: 'platinum',
          lastUpdated: new Date(),
          riskLevel: 'minimal',
        },
      ];
      setScoreCards(mockCards);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch compliance score cards:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up auto-refresh
  useEffect(() => {
    fetchScoreCards();
    const interval = setInterval(fetchScoreCards, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getCertificationColor = (level: string) => {
    const colors: Record<string, string> = {
      platinum: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
      gold: 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white',
      silver: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
      bronze: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white',
    };
    return colors[level] || colors.bronze;
  };

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      minimal: 'text-green-600 bg-green-50',
      limited: 'text-yellow-600 bg-yellow-50',
      high: 'text-red-600 bg-red-50',
    };
    return colors[level] || colors.limited;
  };

  const getTrendIcon = (trend: string, percentage: number) => {
    if (trend === 'up') {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (trend === 'down') {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Header with refresh info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Compliance Score Cards</h2>
          <p className="text-sm text-muted-foreground">
            Real-time compliance metrics for all AI systems
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchScoreCards}
            disabled={loading}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scoreCards.map((card) => (
          <Card
            key={card.systemId}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onCardClick?.(card.systemId)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{card.systemName}</CardTitle>
                  <CardDescription>System ID: {card.systemId}</CardDescription>
                </div>
                <Badge className={getCertificationColor(card.certificationLevel)}>
                  {card.certificationLevel.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Score Display */}
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Compliance Score</span>
                  <span className={`text-3xl font-bold ${getScoreColor(card.overallScore)}`}>
                    {card.overallScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      card.overallScore >= 90
                        ? 'bg-green-600'
                        : card.overallScore >= 70
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                    }`}
                    style={{ width: `${card.overallScore}%` }}
                  />
                </div>
              </div>

              {/* Trend */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Trend</span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(card.trend, card.trendPercentage)}
                  <span
                    className={`text-sm font-medium ${
                      card.trend === 'up'
                        ? 'text-green-600'
                        : card.trend === 'down'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {card.trend === 'up' ? '+' : ''}
                    {card.trendPercentage}%
                  </span>
                </div>
              </div>

              {/* Risk Level */}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Risk Level</span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(card.riskLevel)}`}>
                  {card.riskLevel === 'minimal' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                  {card.riskLevel === 'high' && <AlertTriangle className="w-4 h-4 inline mr-1" />}
                  {card.riskLevel.charAt(0).toUpperCase() + card.riskLevel.slice(1)}
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Last assessed: {card.lastUpdated.toLocaleDateString()} at{' '}
                {card.lastUpdated.toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {!loading && scoreCards.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No compliance score cards available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
