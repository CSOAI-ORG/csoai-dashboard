import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Shield, Award, Target, Lock } from 'lucide-react';

export interface FrameworkProgress {
  name: string;
  /** 0–100 compliance score for this framework. */
  score: number;
}

interface ComplianceGamificationProps {
  /** Overall compliance score 0–100. */
  overallScore: number;
  /** Per-framework scores; a framework is "conquered" at >= conqueredThreshold. */
  frameworks?: FrameworkProgress[];
  /** Consecutive days of compliance activity. Null/undefined => empty state. */
  streakDays?: number | null;
  /** Score at which a framework counts as conquered. */
  conqueredThreshold?: number;
  className?: string;
}

interface Level {
  name: string;
  min: number;
  icon: typeof Shield;
  color: string;
}

const LEVELS: Level[] = [
  { name: 'Bronze', min: 0, icon: Shield, color: 'text-amber-600' },
  { name: 'Silver', min: 50, icon: Shield, color: 'text-slate-400' },
  { name: 'Gold', min: 75, icon: Award, color: 'text-yellow-500' },
  { name: 'Platinum', min: 90, icon: Trophy, color: 'text-emerald-500' },
];

function getLevel(score: number): { current: Level; next: Level | null } {
  let currentIndex = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (score >= LEVELS[i].min) currentIndex = i;
  }
  return {
    current: LEVELS[currentIndex],
    next: LEVELS[currentIndex + 1] ?? null,
  };
}

/**
 * Lightweight, client-side compliance gamification: progress toward the next
 * milestone level, "Frameworks Conquered" badge tiles, and a streak/level
 * indicator. Uses data passed in from existing compliance queries — never
 * fabricates numbers; renders a sensible empty state when data is absent.
 */
export function ComplianceGamification({
  overallScore,
  frameworks = [],
  streakDays = null,
  conqueredThreshold = 80,
  className = '',
}: ComplianceGamificationProps) {
  const safeScore = Math.max(0, Math.min(100, Math.round(overallScore || 0)));
  const { current, next } = getLevel(safeScore);
  const CurrentIcon = current.icon;

  const conquered = frameworks.filter((f) => (f.score ?? 0) >= conqueredThreshold);
  const milestoneTarget = next ? next.min : 100;
  const milestoneLabel = next ? `${next.name} (${next.min}%)` : 'Platinum maxed';

  return (
    <Card className={`bg-card border-border overflow-hidden ${className}`}>
      <CardHeader className="pb-3 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5">
        <CardTitle className="text-lg font-display font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          Compliance Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        {/* Level + streak row */}
        <div className="flex flex-wrap items-center gap-4">
          <div
            className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2"
            aria-label={`Current compliance level: ${current.name}`}
          >
            <CurrentIcon className={`h-5 w-5 ${current.color}`} aria-hidden="true" />
            <div>
              <p className="text-xs text-muted-foreground leading-none">Level</p>
              <p className="text-sm font-bold leading-tight">{current.name}</p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 px-3 py-2"
            aria-label={
              streakDays && streakDays > 0
                ? `${streakDays} day compliance streak`
                : 'No active compliance streak yet'
            }
          >
            <Flame
              className={`h-5 w-5 ${streakDays && streakDays > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}
              aria-hidden="true"
            />
            <div>
              <p className="text-xs text-muted-foreground leading-none">Streak</p>
              <p className="text-sm font-bold leading-tight">
                {streakDays && streakDays > 0 ? `${streakDays} day${streakDays === 1 ? '' : 's'}` : 'Start today'}
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 px-3 py-2"
            aria-label={`${conquered.length} of ${frameworks.length} frameworks conquered`}
          >
            <Award className="h-5 w-5 text-yellow-500" aria-hidden="true" />
            <div>
              <p className="text-xs text-muted-foreground leading-none">Conquered</p>
              <p className="text-sm font-bold leading-tight">
                {conquered.length}/{frameworks.length || '—'} frameworks
              </p>
            </div>
          </div>
        </div>

        {/* Milestone progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Target className="h-3.5 w-3.5" aria-hidden="true" />
              Progress to next milestone
            </span>
            <span className="font-medium text-emerald-600">
              {safeScore}% → {milestoneLabel}
            </span>
          </div>
          <Progress
            value={milestoneTarget > 0 ? Math.min(100, (safeScore / milestoneTarget) * 100) : 100}
            className="h-2"
            aria-label={`Compliance progress: ${safeScore} percent toward ${milestoneLabel}`}
          />
        </div>

        {/* Frameworks Conquered badge tiles */}
        <div>
          <p className="text-sm font-semibold mb-2">Frameworks Conquered</p>
          {frameworks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No frameworks tracked yet — run an assessment to start earning badges.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {frameworks.map((fw) => {
                const isConquered = (fw.score ?? 0) >= conqueredThreshold;
                return (
                  <div
                    key={fw.name}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                      isConquered
                        ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
                        : 'border-border bg-muted/40'
                    }`}
                    aria-label={`${fw.name}: ${Math.round(fw.score ?? 0)}% ${isConquered ? 'conquered' : 'in progress'}`}
                  >
                    {isConquered ? (
                      <Shield className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{fw.name}</p>
                      <Badge
                        variant={isConquered ? 'default' : 'secondary'}
                        className={isConquered ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}
                      >
                        {Math.round(fw.score ?? 0)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ComplianceGamification;
