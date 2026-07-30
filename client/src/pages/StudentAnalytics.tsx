import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  Award,
  Download,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

const FRAMEWORK_NAMES: Record<string, string> = {
  "eu-ai-act": "EU AI Act",
  "nist-ai-rmf": "NIST AI RMF",
  "tc260": "TC260",
  "iso-42001": "ISO 42001",
  "uk-ai-assurance": "UK AI Assurance",
  "singapore-feat": "Singapore FEAT",
  "japan-social-principles": "Japan Social Principles",
};

export default function StudentAnalytics() {
  const [frameworkFilter, setFrameworkFilter] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Fetch analytics data
  const { data: summary, isLoading: summaryLoading } = trpc.studentAnalytics.getAnalyticsSummary.useQuery({
    frameworkId: frameworkFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: completionData, isLoading: completionLoading } =
    trpc.studentAnalytics.getCompletionRates.useQuery({
      frameworkId: frameworkFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

  const { data: quizData, isLoading: quizLoading } = trpc.studentAnalytics.getQuizScores.useQuery({
    frameworkId: frameworkFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: timeData, isLoading: timeLoading } =
    trpc.studentAnalytics.getTimeToCompletion.useQuery({
      frameworkId: frameworkFilter,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

  const { data: recentActivity, isLoading: activityLoading } =
    trpc.studentAnalytics.getRecentActivity.useQuery({
      limit: 10,
      frameworkId: frameworkFilter,
    });

  const handleExport = () => {
    // Prepare CSV data
    const csvData = [
      ["Student Progress Analytics Report"],
      [""],
      ["Summary"],
      ["Total Enrolled", summary?.totalEnrolled || 0],
      ["Total Certificates", summary?.totalCertificates || 0],
      ["Avg Completion Rate", `${summary?.avgCompletionRate.toFixed(2)}%`],
      ["Avg Quiz Score", `${summary?.avgQuizScore.toFixed(2)}%`],
      [""],
      ["Completion Rates by Framework"],
      ["Framework", "Total Enrolled", "Total Completed", "Completion Rate"],
      ...(completionData?.byFramework.map((fw: any) => [
        FRAMEWORK_NAMES[fw.framework] || fw.framework,
        fw.totalEnrolled,
        fw.totalCompleted,
        `${fw.avgCompletionRate.toFixed(2)}%`,
      ]) || []),
      [""],
      ["Quiz Scores by Framework"],
      ["Framework", "Avg Score", "Total Attempts", "Pass Rate"],
      ...(quizData?.byFramework.map((fw: any) => [
        FRAMEWORK_NAMES[fw.framework] || fw.framework,
        `${fw.avgScore.toFixed(2)}%`,
        fw.totalAttempts,
        `${fw.passRate.toFixed(2)}%`,
      ]) || []),
    ];

    const csv = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLoading =
    summaryLoading || completionLoading || quizLoading || timeLoading || activityLoading;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Student Progress Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track completion rates, quiz scores, and time-to-completion metrics
          </p>
        </div>
        <Button onClick={handleExport} disabled={isLoading}>
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Framework</Label>
            <Select value={frameworkFilter || "all"} onValueChange={(v) => setFrameworkFilter(v === "all" ? undefined : v)}>
              <SelectTrigger>
                <SelectValue placeholder="All Frameworks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frameworks</SelectItem>
                {Object.entries(FRAMEWORK_NAMES).map(([key, name]) => (
                  <SelectItem key={key} value={key}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Enrolled</p>
              <p className="text-3xl font-bold mt-1">
                {isLoading ? "..." : summary?.totalEnrolled || 0}
              </p>
            </div>
            <Users className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Certificates Issued</p>
              <p className="text-3xl font-bold mt-1">
                {isLoading ? "..." : summary?.totalCertificates || 0}
              </p>
            </div>
            <Award className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Completion Rate</p>
              <p className="text-3xl font-bold mt-1">
                {isLoading ? "..." : `${summary?.avgCompletionRate.toFixed(1)}%`}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-orange-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Quiz Score</p>
              <p className="text-3xl font-bold mt-1">
                {isLoading ? "..." : `${summary?.avgQuizScore.toFixed(1)}%`}
              </p>
            </div>
            <BarChart3 className="w-10 h-10 text-purple-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Completion Rates Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Completion Rates by Framework
        </h2>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={completionData?.byFramework || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="framework"
                tickFormatter={(value) => FRAMEWORK_NAMES[value] || value}
              />
              <YAxis label={{ value: "Completion Rate (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                labelFormatter={(value) => FRAMEWORK_NAMES[value as string] || value}
                formatter={(value: any) => [`${value.toFixed(2)}%`, "Completion Rate"]}
              />
              <Legend />
              <Bar dataKey="avgCompletionRate" fill="#3b82f6" name="Completion Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Quiz Scores Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Average Quiz Scores by Framework
        </h2>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={quizData?.byFramework || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="framework"
                tickFormatter={(value) => FRAMEWORK_NAMES[value] || value}
              />
              <YAxis label={{ value: "Score (%)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                labelFormatter={(value) => FRAMEWORK_NAMES[value as string] || value}
                formatter={(value: any, name: string) => [
                  name === "avgScore" ? `${value.toFixed(2)}%` : `${value.toFixed(2)}%`,
                  name === "avgScore" ? "Avg Score" : "Pass Rate",
                ]}
              />
              <Legend />
              <Bar dataKey="avgScore" fill="#10b981" name="Avg Score (%)" />
              <Bar dataKey="passRate" fill="#f59e0b" name="Pass Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Time to Completion Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Average Time to Completion by Framework
        </h2>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={timeData?.byFramework || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="framework"
                tickFormatter={(value) => FRAMEWORK_NAMES[value] || value}
              />
              <YAxis label={{ value: "Hours", angle: -90, position: "insideLeft" }} />
              <Tooltip
                labelFormatter={(value) => FRAMEWORK_NAMES[value as string] || value}
                formatter={(value: any) => [`${value.toFixed(2)} hours`, "Avg Time"]}
              />
              <Legend />
              <Bar dataKey="avgHours" fill="#8b5cf6" name="Avg Hours to Complete" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading...</p>
          ) : recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((activity: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {activity.type === "completion" ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <Award className="w-5 h-5 text-blue-500" />
                  )}
                  <div>
                    <p className="font-medium">{activity.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.type === "completion"
                        ? `Completed ${activity.moduleName}`
                        : `Earned certificate ${activity.certificateNumber}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {FRAMEWORK_NAMES[activity.framework] || activity.framework}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No recent activity</p>
          )}
        </div>
      </Card>
    </div>
  );
}
