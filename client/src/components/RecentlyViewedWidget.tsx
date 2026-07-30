import { Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { RecentlyViewedItem } from '@/hooks/useRecentlyViewed';

interface RecentlyViewedWidgetProps {
  items: RecentlyViewedItem[];
  onTabClick: (tabId: string) => void;
  currentTab?: string;
}

export function RecentlyViewedWidget({ items, onTabClick, currentTab }: RecentlyViewedWidgetProps) {
  // Filter out current tab from recently viewed
  const filteredItems = items.filter((item) => item.id !== currentTab);

  if (filteredItems.length === 0) {
    return null;
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recently Viewed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => onTabClick(item.id)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent hover:border-accent-foreground/20 transition-all group"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium text-sm">{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No recently viewed tabs yet</p>
            <p className="text-xs mt-1">Your navigation history will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
