import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakIndicatorProps {
  currentStreak: number;
  longestStreak?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function StreakIndicator({ 
  currentStreak, 
  longestStreak,
  size = 'md',
  showLabel = true,
  className 
}: StreakIndicatorProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const getStreakColor = (streak: number) => {
    if (streak === 0) return 'text-gray-400';
    if (streak < 3) return 'text-orange-400';
    if (streak < 7) return 'text-orange-500';
    if (streak < 14) return 'text-orange-600';
    if (streak < 30) return 'text-red-500';
    return 'text-red-600';
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/20',
        sizeClasses[size]
      )}>
        <Flame className={cn(iconSizes[size], getStreakColor(currentStreak))} />
        <span className={cn('font-bold', getStreakColor(currentStreak))}>
          {currentStreak}
        </span>
        {showLabel && (
          <span className="text-muted-foreground text-xs">
            {currentStreak === 1 ? 'day' : 'days'}
          </span>
        )}
      </div>
      {longestStreak !== undefined && longestStreak > currentStreak && (
        <span className="text-xs text-muted-foreground">
          Best: {longestStreak}
        </span>
      )}
    </div>
  );
}
