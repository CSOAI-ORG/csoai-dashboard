/**
 * Help Tooltip Component
 * Enterprise Launch Requirement: Phase 2 - User Interface Improvements
 * Provides clear labels and tooltips for complex features
 */

import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HelpTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function HelpTooltip({ content, side = 'top', className = '' }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors ${className}`}
            aria-label="Help information"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Info Badge with Tooltip
 * For inline help text with more context
 */
interface InfoBadgeProps {
  label: string;
  description: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function InfoBadge({ label, description, side = 'top' }: InfoBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium cursor-help">
            {label}
            <HelpCircle className="h-3 w-3" />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-sm">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
