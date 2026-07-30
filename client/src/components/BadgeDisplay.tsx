import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface Badge {
  id: number;
  name: string | null;
  description: string | null;
  icon: string | null;
  color: string | null;
  points: number | null;
  earnedAt: string | null;
}

interface BadgeDisplayProps {
  badges: Badge[];
  maxDisplay?: number;
  showEmpty?: boolean;
}

export function BadgeDisplay({ badges, maxDisplay, showEmpty = true }: BadgeDisplayProps) {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;

  if (badges.length === 0 && !showEmpty) {
    return null;
  }

  if (badges.length === 0 && showEmpty) {
    return (
      <Card className="p-6 text-center">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
        <p className="text-muted-foreground">No badges earned yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Keep learning to unlock achievements!
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {displayBadges.map((badge) => (
        <div
          key={badge.id}
          className="flex flex-col items-center p-3 rounded-lg border bg-card hover:shadow-lg transition-all hover:scale-105 cursor-default"
          title={badge.description || ''}
        >
          <div className="text-3xl mb-2">{badge.icon}</div>
          <div className="text-xs font-semibold text-center line-clamp-2">
            {badge.name}
          </div>
          {badge.points && badge.points > 0 && (
            <div className="text-xs text-primary font-medium mt-1">
              +{badge.points}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
