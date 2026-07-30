import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  BookOpen, 
  Target,
  Calendar,
  Flame,
  Trophy,
  Star,
  ChevronRight
} from 'lucide-react';
import { Link } from 'wouter';

export default function ProgressDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  
  // Fetch data
  const { data: streak } = trpc.streaksBadges.getMyStreak.useQuery();
  const { data: badges } = trpc.streaksBadges.getMyBadges.useQuery();
  const { data: activityHistory } = trpc.streaksBadges.getActivityHistory.useQuery({ 
    days: timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90 
  });
  const { data: enrollments } = trpc.courses.getMyEnrollments.useQuery();

  // Calculate statistics - cast enrollments to array for type safety
  const enrollmentsList = Array.isArray(enrollments) ? enrollments : [];
  const totalCourses = enrollmentsList.length;
  const completedCourses = enrollmentsList.filter((e: any) => e.status === 'completed').length;
  const inProgressCourses = enrollmentsList.filter((e: any) => e.status === 'in_progress').length;
  const completionRate = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

  // Calculate total time spent
  const totalMinutes = enrollmentsList.reduce((sum: number, e: any) => sum + ((e.timeSpentMinutes as number) || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);

  // Calculate weekly trend
  const weeklyData = activityHistory?.slice(0, 7).reverse() || [];
  const weeklyMinutes = weeklyData.reduce((sum: number, day: any) => sum + (day.minutesSpent || 0), 0);
  const weeklyHours = Math.round(weeklyMinutes / 60 * 10) / 10;

  // Badge statistics
  const totalBadges = badges?.length || 0;
  const badgePoints = badges?.reduce((sum, b) => sum + (b.points || 0), 0) || 0;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Learning Progress</h1>
        <p className="text-muted-foreground">
          Track your learning journey, achievements, and growth
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Current Streak */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Flame className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{streak?.currentStreak || 0}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Longest: {streak?.longestStreak || 0} days
          </div>
        </Card>

        {/* Total Time */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{totalHours}</div>
              <div className="text-sm text-muted-foreground">Hours Learned</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            This week: {weeklyHours}h
          </div>
        </Card>

        {/* Courses Completed */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{completedCourses}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {inProgressCourses} in progress
          </div>
        </Card>

        {/* Badges Earned */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{totalBadges}</div>
              <div className="text-sm text-muted-foreground">Badges</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {badgePoints} points
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Completion Rate */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Course Completion Rate</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCourses} of {totalCourses} courses completed
                </p>
              </div>
              <div className="text-3xl font-bold text-primary">{completionRate}%</div>
            </div>
            <Progress value={completionRate} className="h-3" />
          </Card>

          {/* Weekly Activity Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Weekly Activity</h3>
              <div className="flex gap-2">
                <Button 
                  variant={timeRange === 'week' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTimeRange('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={timeRange === 'month' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setTimeRange('month')}
                >
                  Month
                </Button>
              </div>
            </div>
            
            {/* Simple bar chart */}
            <div className="space-y-3">
              {weeklyData.map((day, index) => {
                const hours = Math.round((day.minutesSpent || 0) / 60 * 10) / 10;
                const maxHours = Math.max(...weeklyData.map(d => (d.minutesSpent || 0) / 60), 1);
                const percentage = (hours / maxHours) * 100;
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-16 text-sm text-muted-foreground">
                      {new Date(day.activityDate).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="flex-1">
                      <div className="h-8 bg-primary/20 rounded-md overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-md transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-16 text-sm font-medium text-right">
                      {hours}h
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Courses */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Courses</h3>
              <Link href="/my-courses">
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {enrollmentsList.slice(0, 5).map((enrollment: any) => (
                <Link key={enrollment.id} href={`/courses/${enrollment.courseId}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="font-medium">{enrollment.courseTitle}</div>
                      <div className="text-sm text-muted-foreground">
                        {enrollment.progress}% complete • {Math.round(((enrollment.timeSpentMinutes as number) || 0) / 60)}h spent
                      </div>
                    </div>
                    <Progress value={enrollment.progress || 0} className="w-24 h-2" />
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Earned Badges</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges && badges.length > 0 ? (
                badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <div className="text-sm font-semibold text-center">{badge.name}</div>
                    <div className="text-xs text-muted-foreground text-center mt-1">
                      {badge.description}
                    </div>
                    <div className="text-xs text-primary font-medium mt-2">
                      +{badge.points} points
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No badges earned yet. Keep learning to unlock achievements!</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Activity History Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Activity History</h3>
            <div className="space-y-2">
              {activityHistory && activityHistory.length > 0 ? (
                activityHistory.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {new Date(activity.activityDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {activity.coursesAccessed} courses • {activity.modulesCompleted} modules completed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {Math.round((activity.minutesSpent || 0) / 60 * 10) / 10}h
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.minutesSpent} min
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No activity recorded yet. Start learning to track your progress!</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
