import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  CheckCircle2,
  Clock,
  Users,
  Activity,
  Award
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ForumAnalyticsProps {
  courseId?: number;
}

export function ForumAnalytics({ courseId }: ForumAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all');

  // Calculate date range
  const getDateRange = () => {
    if (timeRange === 'all') return {};
    
    const endDate = new Date();
    const startDate = new Date();
    
    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (timeRange === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  };

  const { data: analytics, isLoading } = trpc.forums.getForumAnalytics.useQuery({
    courseId,
    ...getDateRange(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No analytics data available</p>
      </Card>
    );
  }

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
    return `${Math.round(minutes / 1440)} days`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Forum Analytics</h2>
          <p className="text-muted-foreground">Track engagement and community activity</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            Last 7 Days
          </Button>
          <Button
            variant={timeRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Last 30 Days
          </Button>
          <Button
            variant={timeRange === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('all')}
          >
            All Time
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{analytics.totalThreads}</p>
            <p className="text-sm text-muted-foreground">Total Threads</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{analytics.activeThreads}</p>
            <p className="text-sm text-muted-foreground">Active Threads</p>
            <p className="text-xs text-muted-foreground">
              {analytics.totalThreads > 0 
                ? `${Math.round((analytics.activeThreads / analytics.totalThreads) * 100)}% engagement`
                : 'No data'}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{analytics.solvedThreads}</p>
            <p className="text-sm text-muted-foreground">Solved Questions</p>
            <p className="text-xs text-muted-foreground">
              {analytics.solutionRate.toFixed(1)}% solution rate
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">
              {formatResponseTime(analytics.avgResponseTimeMinutes)}
            </p>
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
          </div>
        </Card>
      </div>

      {/* Top Contributors */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Top Contributors</h3>
        </div>
        <div className="space-y-3">
          {analytics.topContributors && analytics.topContributors.length > 0 ? (
            analytics.topContributors.map((contributor, index) => (
              <div 
                key={contributor.userId} 
                className="flex items-center justify-between p-3 bg-accent/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{contributor.userName || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">
                      {contributor.postCount} {contributor.postCount === 1 ? 'post' : 'posts'}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No contributors yet
            </p>
          )}
        </div>
      </Card>

      {/* Most Active Threads */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Most Active Threads</h3>
        </div>
        <div className="space-y-3">
          {analytics.mostActiveThreads && analytics.mostActiveThreads.length > 0 ? (
            analytics.mostActiveThreads.map((thread) => (
              <div 
                key={thread.id} 
                className="p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{thread.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {thread.replyCount} replies
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {thread.viewCount} views
                      </span>
                      <span>
                        by {thread.author?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No active threads yet
            </p>
          )}
        </div>
      </Card>

      {/* Engagement Summary */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Community Health</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{analytics.totalPosts}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Engagement Rate</p>
                <p className="text-2xl font-bold">
                  {analytics.totalThreads > 0 
                    ? `${Math.round((analytics.activeThreads / analytics.totalThreads) * 100)}%`
                    : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
