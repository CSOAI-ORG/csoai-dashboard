/**
 * Optimized PDCA Phase Card Component with React.memo
 * Prevents unnecessary re-renders and improves performance
 */

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface PDCAPhaseCardProps {
  phase: 'plan' | 'do' | 'check' | 'act';
  title: string;
  description: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'pending';
  dueDate?: string;
  itemsCompleted?: number;
  totalItems?: number;
}

const PDCAPhaseCardComponent = ({
  phase,
  title,
  description,
  progress,
  status,
  dueDate,
  itemsCompleted = 0,
  totalItems = 0,
}: PDCAPhaseCardProps) => {
  const phaseColors = {
    plan: 'bg-blue-50 border-blue-200',
    do: 'bg-amber-50 border-amber-200',
    check: 'bg-purple-50 border-purple-200',
    act: 'bg-emerald-50 border-emerald-200',
  };

  const statusConfig = {
    completed: { icon: CheckCircle2, color: 'text-emerald-600', label: 'Completed' },
    'in-progress': { icon: Clock, color: 'text-amber-600', label: 'In Progress' },
    pending: { icon: AlertCircle, color: 'text-gray-400', label: 'Pending' },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <Card className={`${phaseColors[phase]} border-2 hover:shadow-md transition-shadow duration-200`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg capitalize">{title}</CardTitle>
            <StatusIcon className={`${statusConfig[status].color} h-5 w-5`} />
          </div>
          <Badge variant="outline" className="text-xs">
            {itemsCompleted}/{totalItems}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-700">Progress</span>
            <span className="text-xs font-bold text-gray-900">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        {dueDate && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="h-3 w-3" />
            <span>Due: {dueDate}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const PDCAPhaseCard = memo(PDCAPhaseCardComponent);
PDCAPhaseCard.displayName = 'PDCAPhaseCard';
