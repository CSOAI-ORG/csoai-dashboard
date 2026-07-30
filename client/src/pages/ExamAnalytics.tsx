/**
 * Exam Analytics Dashboard
 * Admin page showing comprehensive exam statistics and metrics
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  AlertCircle,
  Download,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

export default function ExamAnalytics() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  // Fetch analytics data
  const { data: analytics, isLoading } = trpc.certification.getExamAnalytics.useQuery({
    dateRange,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = analytics || {
    totalAttempts: 0,
    passRate: 0,
    averageScore: 0,
    averageCompletionTime: 0,
    mostMissedQuestions: [],
    scoreDistribution: [],
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Exam Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights into exam performance and trends
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date Range Filter */}
            <div className="flex gap-2">
              {[
                { value: "7d", label: "7 Days" },
                { value: "30d", label: "30 Days" },
                { value: "90d", label: "90 Days" },
                { value: "all", label: "All Time" },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant={dateRange === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange(option.value as any)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Attempts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.totalAttempts}</div>
                  <Users className="h-8 w-8 text-muted-foreground/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pass Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.passRate.toFixed(1)}%</div>
                  <Target className="h-8 w-8 text-green-500/50" />
                </div>
                <Progress value={stats.passRate} className="mt-2" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.averageScore.toFixed(1)}%</div>
                  <TrendingUp className="h-8 w-8 text-blue-500/50" />
                </div>
                <Progress value={stats.averageScore} className="mt-2" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Completion Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">
                    {Math.round(stats.averageCompletionTime)}m
                  </div>
                  <Clock className="h-8 w-8 text-purple-500/50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Score Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Score Distribution
              </CardTitle>
              <CardDescription>
                Distribution of exam scores across all attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.scoreDistribution.map((bucket: any, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {bucket.range} ({bucket.count} attempts)
                      </span>
                      <span className="text-muted-foreground">
                        {bucket.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={bucket.percentage} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Most Missed Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Most Missed Questions
              </CardTitle>
              <CardDescription>
                Questions with the highest miss rates (need review or clarification)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.mostMissedQuestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No data available yet. Complete some exams to see analytics.
                  </p>
                ) : (
                  stats.mostMissedQuestions.map((question: any, index: number) => (
                    <div
                      key={question.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <Badge variant={
                              question.difficulty === "easy" ? "secondary" :
                              question.difficulty === "medium" ? "default" : "destructive"
                            }>
                              {question.difficulty}
                            </Badge>

                          </div>
                          <p className="text-sm font-medium leading-relaxed">
                            {question.questionText}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {question.missRate.toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            miss rate
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{question.totalAttempts} attempts</span>
                        <span>{question.incorrectCount} incorrect answers</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
