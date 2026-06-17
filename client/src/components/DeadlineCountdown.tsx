import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

interface DeadlineCountdownProps {
  /** Target deadline. Defaults to EU AI Act Article 50 (2 Aug 2026). */
  deadline?: string | Date;
  /** Human label for the deadline. */
  label?: string;
  /** Compact single-line variant for headers / dashboards. */
  variant?: 'full' | 'compact';
  className?: string;
}

const DEFAULT_DEADLINE = '2026-08-02T00:00:00';
const DEFAULT_LABEL = 'EU AI Act Article 50';

function computeRemaining(target: number): TimeRemaining {
  const diff = target - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
}

/**
 * Live ticking countdown to a regulatory deadline. Dome aesthetic (emerald,
 * dark-friendly). Reusable across dashboard home and compliance roadmap.
 */
export function DeadlineCountdown({
  deadline = DEFAULT_DEADLINE,
  label = DEFAULT_LABEL,
  variant = 'full',
  className = '',
}: DeadlineCountdownProps) {
  const target = new Date(deadline).getTime();
  const [time, setTime] = useState<TimeRemaining>(() => computeRemaining(target));

  useEffect(() => {
    setTime(computeRemaining(target));
    const timer = setInterval(() => setTime(computeRemaining(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const targetLabel = new Date(deadline).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const ariaLabel = time.expired
    ? `${label} deadline (${targetLabel}) has passed`
    : `${time.days} days, ${time.hours} hours, ${time.minutes} minutes and ${time.seconds} seconds remaining until ${label} on ${targetLabel}`;

  if (variant === 'compact') {
    return (
      <div
        data-testid="deadline-countdown-compact"
        role="timer"
        aria-live="off"
        aria-label={ariaLabel}
        className={`inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-sm ${className}`}
      >
        <Clock className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
        {time.expired ? (
          <span className="font-semibold text-emerald-300">
            {label} now in force
          </span>
        ) : (
          <span className="text-emerald-100">
            <span className="font-bold text-emerald-300 tabular-nums">{time.days}d</span>{' '}
            <span className="tabular-nums">
              {pad(time.hours)}:{pad(time.minutes)}:{pad(time.seconds)}
            </span>{' '}
            <span className="text-emerald-200/80">to {label}</span>
          </span>
        )}
      </div>
    );
  }

  const units: Array<{ value: number; suffix: string; label: string; testid: string }> = [
    { value: time.days, suffix: '', label: 'Days', testid: 'days' },
    { value: time.hours, suffix: '', label: 'Hours', testid: 'hours' },
    { value: time.minutes, suffix: '', label: 'Minutes', testid: 'minutes' },
    { value: time.seconds, suffix: '', label: 'Seconds', testid: 'seconds' },
  ];

  return (
    <div
      data-testid="deadline-countdown"
      role="timer"
      aria-live="off"
      aria-label={ariaLabel}
      className={`rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 to-slate-900/40 p-4 ${className}`}
    >
      <div className="mb-3 flex items-center gap-2 text-emerald-300">
        <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide">
          {time.expired ? `${label} — now in force` : `Time to ${label} (${targetLabel})`}
        </span>
      </div>
      {time.expired ? (
        <p className="text-2xl font-bold text-emerald-300">Deadline reached</p>
      ) : (
        <div className="flex items-start justify-center gap-2 md:gap-3">
          {units.map((unit, i) => (
            <div key={unit.testid} className="flex items-start gap-2 md:gap-3">
              <div className="flex flex-col items-center" data-testid={`countdown-${unit.testid}`}>
                <div className="rounded-lg bg-slate-800/80 px-2.5 py-2 shadow-sm ring-1 ring-emerald-500/20">
                  <span className="block text-2xl font-bold tabular-nums text-emerald-300 md:text-3xl">
                    {pad(unit.value)}
                  </span>
                </div>
                <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-100/70 md:text-xs">
                  {unit.label}
                </span>
              </div>
              {i < units.length - 1 && (
                <span className="mt-1.5 text-2xl font-bold text-emerald-400/40 md:text-3xl" aria-hidden="true">
                  :
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DeadlineCountdown;
