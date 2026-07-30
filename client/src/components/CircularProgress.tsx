/**
 * CircularProgress Component
 * Displays progress in a circular format with percentage
 */

import { cn } from '@/lib/utils';

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
}

export function CircularProgress({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'stroke-green-500';
    if (progress >= 70) return 'stroke-emerald-500';
    if (progress >= 40) return 'stroke-blue-500';
    return 'stroke-primary';
  };

  const getTextColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600 dark:text-green-400';
    if (progress >= 70) return 'text-emerald-600 dark:text-emerald-400';
    if (progress >= 40) return 'text-blue-600 dark:text-blue-400';
    return 'text-primary';
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-muted fill-none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('fill-none transition-all duration-500 ease-in-out', getProgressColor(progress))}
        />
      </svg>
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-2xl font-bold', getTextColor(progress))}>
            {progress}%
          </span>
        </div>
      )}
    </div>
  );
}
