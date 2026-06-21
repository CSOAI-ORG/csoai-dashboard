import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  GraduationCap,
  Award,
  Calendar,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const { data: cohortsData } = trpc.cohorts.list.useQuery({});
  const cohorts = cohortsData?.items;
  const { data: studentsData, refetch: refetchStudents } = trpc.students.list.useQuery({});
  const students = studentsData?.items;
  const { data: analyticsData, refetch: refetchAnalytics } = trpc.studentAnalytics.getAnalyticsSummary.useQuery({});

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchStudents();
      refetchAnalytics();
      setLastUpdated(new Date());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetchStudents, refetchAnalytics]);

  const handleManualRefresh = () => {
    refetchStudents();
    refetchAnalytics();
    setLastUpdated(new Date());
  };

  // Mock data for demonstration (replace with real API data)
  const enrollmentTrend = [
    { month: 'Jan', students: 45, active: 42 },
    { month: 'Feb', students: 52, active: 48 },
    { month: 'Mar', students: 68, active: 63 },
    { month: 'Apr', students: 71, active: 67 },
    { month: 'May', students: 89, active: 84 },
    { month: 'Jun', students: 95, active: 90 },
  ];

  const courseCompletion = [
    { name: 'Completed', value: 245 },
    { name: 'In Progress', value: 128 },
    { name: 'Not Started', value: 42 },
  ];

  const emailCampaignData = [
    { campaign: 'Welcome Series', sent: 450, opened: 342, clicked: 128 },
    { campaign: 'Course Reminder', sent: 380, opened: 298, clicked: 156 },
    { campaign: 'Certification', sent: 290, opened: 245, clicked: 189 },
    { campaign: 'Newsletter', sent: 520, opened: 384, clicked: 92 },
  ];

  const cohortPerformance = [
    { cohort: 'Spring 2024', avgScore: 85, completion: 92 },
    { cohort: 'Summer 2024', avgScore: 88, completion: 87 },
    { cohort: 'Fall 2024', avgScore: 82, completion: 78 },
    { cohort: 'Winter 2025', avgScore: 90, completion: 95 },
  ];

  const engagementTrend = [
    { week: 'Week 1', logins: 420, lessons: 380, forums: 156 },
    { week: 'Week 2', logins: 445, lessons: 412, forums: 178 },
    { week: 'Week 3', logins: 398, lessons: 356, forums: 142 },
    { week: 'Week 4', logins: 512, lessons: 478, forums: 201 },
  ];

  const handleExportReport = () => {
    // Implement export functionality
    console.log('Exporting analytics report...');
  };

  return (
    <div className="container mx-auto py-8 px-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into student performance, engagement, and email campaigns
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-sm cursor-pointer">
                Auto-refresh (30s)
              </Label>
            </div>
            <Button variant="outline" size="sm" onClick={handleManualRefresh}>
              <Activity className="w-4 h-4 mr-2" />
              Refresh Now
            </Button>
            <Button onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cohorts</SelectItem>
                  {cohorts?.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id.toString()}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students?.length || 0}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76.3%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-600">+4.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.9%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-red-600" />
              <span className="text-red-600">-2.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-600">+18.7%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="enrollment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="enrollment">
            <Activity className="w-4 h-4 mr-2" />
            Enrollment
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email Campaigns
          </TabsTrigger>
          <TabsTrigger value="cohorts">
            <Users className="w-4 h-4 mr-2" />
            Cohort Performance
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <BarChart3 className="w-4 h-4 mr-2" />
            Engagement
          </TabsTrigger>
        </TabsList>

        {/* Enrollment Tab */}
        <TabsContent value="enrollment" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Enrollment Trend</CardTitle>
                <CardDescription>Student enrollment over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={enrollmentTrend}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="students"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorStudents)"
                    />
                    <Area
                      type="monotone"
                      dataKey="active"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorActive)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Completion Status</CardTitle>
                <CardDescription>Distribution of student progress</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={courseCompletion}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {courseCompletion.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Campaigns Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaign Performance</CardTitle>
              <CardDescription>Sent, opened, and clicked metrics by campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={emailCampaignData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="campaign" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#10b981" />
                  <Bar dataKey="opened" fill="#3b82f6" />
                  <Bar dataKey="clicked" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Emails Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,640</div>
                <p className="text-xs text-muted-foreground mt-1">Across all campaigns</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Average Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">76.3%</div>
                <p className="text-xs text-muted-foreground mt-1">Industry avg: 21.5%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Average Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">34.1%</div>
                <p className="text-xs text-muted-foreground mt-1">Industry avg: 2.6%</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cohort Performance Tab */}
        <TabsContent value="cohorts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Performance Comparison</CardTitle>
              <CardDescription>Average scores and completion rates by cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={cohortPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="cohort" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#10b981" name="Avg Score (%)" />
                  <Bar dataKey="completion" fill="#3b82f6" name="Completion Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {cohortPerformance.map((cohort, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{cohort.cohort}</CardTitle>
                    <Badge variant={cohort.completion >= 90 ? 'default' : 'secondary'}>
                      {cohort.completion}% Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Average Score</span>
                      <span className="font-semibold">{cohort.avgScore}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all"
                        style={{ width: `${cohort.avgScore}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Engagement Trends</CardTitle>
              <CardDescription>Logins, lesson completions, and forum activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={engagementTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="logins" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="lessons" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="forums" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">342</div>
                <p className="text-xs text-muted-foreground mt-1">68% of total students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Avg. Session Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24m</div>
                <p className="text-xs text-muted-foreground mt-1">+3m from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Forum Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">677</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
