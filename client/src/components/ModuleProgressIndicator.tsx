/**
 * Module Progress Indicator Component
 * Enterprise Launch Requirement: Phase 3 - Certification Training Modules
 * Shows progress tracking and estimated completion time for training modules
 */

import { CheckCircle2, Circle, Clock, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Module {
  id: number;
  title: string;
  completed: boolean;
  estimatedMinutes: number;
}

interface ModuleProgressIndicatorProps {
  modules: Module[];
  currentModuleId?: number;
  className?: string;
}

export function ModuleProgressIndicator({ 
  modules, 
  currentModuleId,
  className = '' 
}: ModuleProgressIndicatorProps) {
  const completedCount = modules.filter(m => m.completed).length;
  const totalCount = modules.length;
  const progressPercentage = (completedCount / totalCount) * 100;
  const totalMinutes = modules.reduce((sum, m) => sum + m.estimatedMinutes, 0);
  const completedMinutes = modules
    .filter(m => m.completed)
    .reduce((sum, m) => sum + m.estimatedMinutes, 0);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">Overall Progress</h3>
            <p className="text-sm text-gray-600">
              {completedCount} of {totalCount} modules completed
            </p>
          </div>
          <Badge variant="secondary" className="text-lg font-bold">
            {Math.round(progressPercentage)}%
          </Badge>
        </div>
        <Progress value={progressPercentage} className="h-3 mb-2" />
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatTime(completedMinutes)} / {formatTime(totalMinutes)}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{formatTime(totalMinutes - completedMinutes)} remaining</span>
          </div>
        </div>
      </div>

      {/* Module List */}
      <div className="space-y-2">
        {modules.map((module, index) => {
          const isCurrent = module.id === currentModuleId;
          const isCompleted = module.completed;
          
          return (
            <div
              key={module.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isCurrent
                  ? 'border-emerald-300 bg-emerald-50'
                  : isCompleted
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                ) : (
                  <Circle className={`h-6 w-6 ${isCurrent ? 'text-emerald-600' : 'text-gray-400'}`} />
                )}
              </div>

              {/* Module Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">
                    Module {index + 1}
                  </span>
                  {isCurrent && (
                    <Badge variant="default" className="text-xs bg-emerald-600">
                      In Progress
                    </Badge>
                  )}
                </div>
                <h4 className={`font-medium truncate ${
                  isCurrent ? 'text-emerald-900' : 'text-gray-900'
                }`}>
                  {module.title}
                </h4>
              </div>

              {/* Time Estimate */}
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(module.estimatedMinutes)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Compact version for sidebars
 */
export function CompactModuleProgress({ 
  completedCount, 
  totalCount 
}: { 
  completedCount: number; 
  totalCount: number; 
}) {
  const percentage = (completedCount / totalCount) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Course Progress</span>
        <span className="font-semibold text-gray-900">
          {completedCount}/{totalCount}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-gray-500">
        {Math.round(percentage)}% complete
      </p>
    </div>
  );
}
