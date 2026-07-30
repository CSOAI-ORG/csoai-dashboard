/**
 * Optimized Compliance Framework Card Component with React.memo
 * Prevents unnecessary re-renders and improves performance
 */

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface ComplianceFrameworkCardProps {
  name: string;
  score: number;
  status: 'compliant' | 'in-progress' | 'non-compliant';
  deadline?: string;
  articlesCount: number;
  assessmentCount?: number;
  lastAssessment?: string;
}

const ComplianceFrameworkCardComponent = ({
  name,
  score,
  status,
  deadline,
  articlesCount,
  assessmentCount = 0,
  lastAssessment,
}: ComplianceFrameworkCardProps) => {
  const statusConfig = {
    compliant: {
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      label: 'Compliant',
    },
    'in-progress': {
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      label: 'In Progress',
    },
    'non-compliant': {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Non-Compliant',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const scoreColor =
    score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';

  return (
    <Card className={`${config.bgColor} border-2 border-gray-200 hover:shadow-md transition-shadow duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{name}</CardTitle>
          <div className="flex items-center gap-2">
            <StatusIcon className={`${config.color} h-5 w-5`} />
            <Badge variant="outline" className="text-xs">
              {config.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Compliance Score</span>
            <span className={`text-2xl font-bold ${scoreColor}`}>{score}%</span>
          </div>
          <Progress value={score} className="h-2" />
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-gray-600">Articles</p>
            <p className="font-semibold text-gray-900">{articlesCount}</p>
          </div>
          <div>
            <p className="text-gray-600">Assessments</p>
            <p className="font-semibold text-gray-900">{assessmentCount}</p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-2 border-t border-gray-200 space-y-1 text-xs text-gray-600">
          {deadline && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Deadline: {deadline}</span>
            </div>
          )}
          {lastAssessment && (
            <div>
              <span>Last assessed: {lastAssessment}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const ComplianceFrameworkCard = memo(ComplianceFrameworkCardComponent);
ComplianceFrameworkCard.displayName = 'ComplianceFrameworkCard';
