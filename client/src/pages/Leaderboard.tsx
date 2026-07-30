import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Flame, 
  Clock, 
  Award, 
  BookOpen,
  Medal,
  Crown,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

type Category = 'streak' | 'hours' | 'badges' | 'courses';
type Period = 'weekly' | 'monthly' | 'all_time';

const categoryConfig = {
  streak: {
    icon: Flame,
    label: 'Streak',
    unit: 'days',
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
  },
  hours: {
    icon: Clock,
    label: 'Hours Studied',
    unit: 'hours',
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
  },
  badges: {
    icon: Award,
    label: 'Badges Earned',
    unit: 'badges',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
  },
  courses: {
    icon: BookOpen,
    label: 'Courses Completed',
    unit: 'courses',
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
  },
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
  return null;
};

const getRankBadge = (rank: number) => {
  if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
  if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
  if (rank === 3) return 'bg-gradient-to-r from-amber-500 to-orange-600 text-white';
  return 'bg-muted text-muted-foreground';
};

export default function Leaderboard() {
  const [category, setCategory] = useState<Category>('streak');
  const [period, setPeriod] = useState<Period>('all_time');
  const { user } = useAuth();

  const { data: leaderboard, isLoading } = trpc.leaderboard.getLeaderboard.useQuery({
    category,
    period,
    limit: 50,
  });

  const { data: myRanks } = trpc.leaderboard.getMyRanks.useQuery(undefined, {
    enabled: !!user,
  });

  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
        </div>
        <p className="text-muted-foreground">
          See how you rank against other learners in the community
        </p>
      </div>

      {/* My Rankings Summary */}
      {user && myRanks && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {(Object.keys(categoryConfig) as Category[]).map((cat) => {
            const catConfig = categoryConfig[cat];
            const CatIcon = catConfig.icon;
            const rankData = myRanks[cat];
            
            return (
              <Card 
                key={cat}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md",
                  category === cat && "ring-2 ring-primary"
                )}
                onClick={() => setCategory(cat)}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", catConfig.bgColor)}>
                    <CatIcon className={cn("w-5 h-5", catConfig.color)} />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{catConfig.label}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold">#{rankData.rank}</span>
                      <span className="text-sm text-muted-foreground">
                        ({rankData.score} {catConfig.unit})
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={(v) => setCategory(v as Category)} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="streak" className="gap-2">
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">Streaks</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Hours</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Courses</span>
            </TabsTrigger>
          </TabsList>

          {/* Period Filter */}
          <div className="flex gap-2">
            <Button
              variant={period === 'weekly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('weekly')}
            >
              This Week
            </Button>
            <Button
              variant={period === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('monthly')}
            >
              This Month
            </Button>
            <Button
              variant={period === 'all_time' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('all_time')}
            >
              All Time
            </Button>
          </div>
        </div>

        {/* Leaderboard Content */}
        <Card className="overflow-hidden">
          {/* Header */}
          <div className={cn("p-6 border-b", config.bgColor)}>
            <div className="flex items-center gap-3">
              <Icon className={cn("w-8 h-8", config.color)} />
              <div>
                <h2 className="text-xl font-bold">{config.label} Leaderboard</h2>
                <p className="text-sm text-muted-foreground">
                  {period === 'weekly' ? 'This Week' : period === 'monthly' ? 'This Month' : 'All Time'} Rankings
                </p>
              </div>
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="divide-y">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
              </div>
            ) : leaderboard?.entries && leaderboard.entries.length > 0 ? (
              leaderboard.entries.map((entry, index) => {
                const isCurrentUser = user?.id === entry.userId;
                
                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-4 p-4 transition-colors",
                      isCurrentUser && "bg-primary/5",
                      index < 3 && "bg-gradient-to-r from-transparent to-transparent"
                    )}
                  >
                    {/* Rank */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                      getRankBadge(entry.rank)
                    )}>
                      {getRankIcon(entry.rank) || entry.rank}
                    </div>

                    {/* User Info */}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.avatarUrl || undefined} />
                      <AvatarFallback>
                        {entry.userName?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium truncate",
                          isCurrentUser && "text-primary"
                        )}>
                          {entry.userName}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className={cn("text-xl font-bold", config.color)}>
                        {entry.score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {config.unit}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
                <p className="text-muted-foreground">No rankings available yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start learning to appear on the leaderboard!
                </p>
              </div>
            )}
          </div>
        </Card>
      </Tabs>
    </div>
  );
}
