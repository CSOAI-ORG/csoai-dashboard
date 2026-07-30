import { Star, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { PinnedTab } from '@/hooks/usePinnedTabs';

interface PinnedFavoritesWidgetProps {
  pinnedTabs: PinnedTab[];
  onNavigate: (tabId: string) => void;
  onUnpin: (tabId: string) => void;
}

export function PinnedFavoritesWidget({ 
  pinnedTabs, 
  onNavigate, 
  onUnpin 
}: PinnedFavoritesWidgetProps) {
  if (pinnedTabs.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
          Pinned Favorites
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {pinnedTabs.map((tab) => (
          <div
            key={tab.id}
            className="flex items-center justify-between gap-2 p-2 rounded-md bg-background/50 hover:bg-background transition-colors group"
          >
            <button
              onClick={() => onNavigate(tab.id)}
              className="flex-1 text-left text-sm font-medium hover:text-primary transition-colors"
            >
              {tab.label}
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUnpin(tab.id)}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Unpin {tab.label}</span>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
