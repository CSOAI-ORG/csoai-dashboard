/**
 * Optimized Metric Card Component with React.memo
 * Prevents unnecessary re-renders when parent component updates
 */

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: string;
  bgColor: string;
  description: string;
}

const MetricCardComponent = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  bgColor,
  description,
}: MetricCardProps) => {
  const changeColor =
    changeType === 'positive'
      ? 'text-emerald-600'
      : changeType === 'negative'
        ? 'text-red-600'
        : 'text-gray-600';

  const ChangeIcon =
    changeType === 'positive' ? ArrowUpRight : changeType === 'negative' ? ArrowDownRight : null;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <div className={`${bgColor} p-2 rounded-lg`}>
          <Icon className={`${color} h-4 w-4`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="flex items-center gap-1 mt-2">
          {ChangeIcon && <ChangeIcon className={`${changeColor} h-4 w-4`} />}
          <p className={`text-xs ${changeColor}`}>{change}</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      </CardContent>
    </Card>
  );
};

export const MetricCard = memo(MetricCardComponent);
MetricCard.displayName = 'MetricCard';
