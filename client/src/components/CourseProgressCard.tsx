/**
 * CourseProgressCard Component
 * Displays course progress with percentage, time spent, and visual indicators
 */

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseProgressCardProps {
  progress: number;
  timeSpentMinutes?: number;
  estimatedHours?: number;
  className?: string;
  showDetailed?: boolean;
}

export function CourseProgressCard({
  progress,
  timeSpentMinutes = 0,
  estimatedHours = 0,
  className,
  showDetailed = false,
}: CourseProgressCardProps) {
  const timeSpentHours = Math.floor(timeSpentMinutes / 60);
  const timeSpentMins = timeSpentMinutes % 60;
  const estimatedMinutes = estimatedHours * 60;
  const timeRemaining = Math.max(0, estimatedMinutes - timeSpentMinutes);
  const timeRemainingHours = Math.floor(timeRemaining / 60);
  const timeRemainingMins = timeRemaining % 60;

  const formatTime = (hours: number, minutes: number) => {
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600 dark:text-green-400';
    if (progress >= 70) return 'text-emerald-600 dark:text-emerald-400';
    if (progress >= 40) return 'text-blue-600 dark:text-blue-400';
    return 'text-muted-foreground';
  };

  const getProgressBgColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 70) return 'bg-emerald-500';
    if (progress >= 40) return 'bg-blue-500';
    return 'bg-primary';
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {progress >= 100 ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingUp className="w-5 h-5 text-primary" />
            )}
            <span className="font-semibold text-lg">
              {progress >= 100 ? 'Completed!' : 'In Progress'}
            </span>
          </div>
          <span className={cn('text-3xl font-bold', getProgressColor(progress))}>
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="h-3"
            indicatorClassName={getProgressBgColor(progress)}
          />
          {showDetailed && (
            <p className="text-xs text-muted-foreground text-right">
              {progress >= 100 ? 'All modules completed' : `${100 - progress}% remaining`}
            </p>
          )}
        </div>

        {/* Time Stats */}
        {showDetailed && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Time Spent */}
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Time Spent</p>
                <p className="text-lg font-bold text-primary">
                  {formatTime(timeSpentHours, timeSpentMins)}
                </p>
              </div>
            </div>

            {/* Time Remaining */}
            {progress < 100 && estimatedHours > 0 && (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Est. Remaining</p>
                  <p className="text-lg font-bold text-muted-foreground">
                    {formatTime(timeRemainingHours, timeRemainingMins)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completion Message */}
        {progress >= 100 && showDetailed && (
          <div className="pt-2 border-t">
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              🎉 Congratulations! You've completed this course.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
