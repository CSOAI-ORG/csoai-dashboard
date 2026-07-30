import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, Users, DollarSign, Award, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function CohortAnalysis() {
  const [groupBy, setGroupBy] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [selectedCohorts, setSelectedCohorts] = useState<string[]>([]);

  const { data: cohorts, isLoading: cohortsLoading } = trpc.cohortAnalysis.getCohorts.useQuery({ groupBy });
  const { data: trends, isLoading: trendsLoading } = trpc.cohortAnalysis.getCohortTrends.useQuery({ groupBy });
  const { data: comparison, isLoading: comparisonLoading } = trpc.cohortAnalysis.getCohortComparison.useQuery(
    { cohortPeriods: selectedCohorts, groupBy },
    { enabled: selectedCohorts.length > 0 }
  );

  const handleCohortSelect = (cohortPeriod: string) => {
    setSelectedCohorts((prev) => {
      if (prev.includes(cohortPeriod)) {
        return prev.filter((c) => c !== cohortPeriod);
      } else {
        return [...prev, cohortPeriod];
      }
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cohort Analysis</h1>
          <p className="text-muted-foreground mt-2">
            Compare student performance across different enrollment periods
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Group by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cohorts</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cohorts?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Active enrollment periods</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cohorts?.reduce((sum, c) => sum + c.totalStudents, 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">Across all cohorts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Completion Rate</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cohorts && cohorts.length > 0
                    ? (
                        cohorts.reduce((sum, c) => sum + parseFloat(c.completionRate), 0) / cohorts.length
                      ).toFixed(1)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">Average across cohorts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${((cohorts?.reduce((sum, c) => sum + c.totalRevenue, 0) || 0) / 100).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">From all enrollments</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cohort Performance Overview</CardTitle>
              <CardDescription>
                Click on cohorts to select them for detailed comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cohortsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Select</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Students</TableHead>
                      <TableHead className="text-right">Enrollments</TableHead>
                      <TableHead className="text-right">Completion Rate</TableHead>
                      <TableHead className="text-right">Avg Progress</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Avg/Student</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cohorts?.map((cohort) => (
                      <TableRow
                        key={cohort.cohortPeriod}
                        className={selectedCohorts.includes(cohort.cohortPeriod) ? "bg-muted/50" : ""}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedCohorts.includes(cohort.cohortPeriod)}
                            onChange={() => handleCohortSelect(cohort.cohortPeriod)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{cohort.cohortPeriod}</TableCell>
                        <TableCell className="text-right">{cohort.totalStudents}</TableCell>
                        <TableCell className="text-right">{cohort.totalEnrollments}</TableCell>
                        <TableCell className="text-right">{cohort.completionRate}%</TableCell>
                        <TableCell className="text-right">{cohort.avgProgress.toFixed(1)}%</TableCell>
                        <TableCell className="text-right">${(cohort.totalRevenue / 100).toFixed(2)}</TableCell>
                        <TableCell className="text-right">${cohort.avgRevenuePerStudent}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Growth Trends</CardTitle>
              <CardDescription>Track new student enrollments over time</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohortPeriod" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="newStudents" stroke="#8884d8" name="New Students" />
                    <Line type="monotone" dataKey="newEnrollments" stroke="#82ca9d" name="New Enrollments" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Growth Trends</CardTitle>
              <CardDescription>Track revenue generation over time</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cohortPeriod" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${(value / 100).toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Growth Rates</CardTitle>
              <CardDescription>Period-over-period growth metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">New Students</TableHead>
                      <TableHead className="text-right">Student Growth</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Revenue Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trends?.map((trend) => {
                      const studentGrowth = parseFloat(trend.studentGrowthRate);
                      const revenueGrowth = parseFloat(trend.revenueGrowthRate);
                      return (
                        <TableRow key={trend.cohortPeriod}>
                          <TableCell className="font-medium">{trend.cohortPeriod}</TableCell>
                          <TableCell className="text-right">{trend.newStudents}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {studentGrowth > 0 ? (
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                              ) : studentGrowth < 0 ? (
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                              ) : null}
                              <span className={studentGrowth > 0 ? "text-green-500" : studentGrowth < 0 ? "text-red-500" : ""}>
                                {trend.studentGrowthRate}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">${(trend.revenue / 100).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {revenueGrowth > 0 ? (
                                <ArrowUpRight className="h-4 w-4 text-green-500" />
                              ) : revenueGrowth < 0 ? (
                                <ArrowDownRight className="h-4 w-4 text-red-500" />
                              ) : null}
                              <span className={revenueGrowth > 0 ? "text-green-500" : revenueGrowth < 0 ? "text-red-500" : ""}>
                                {trend.revenueGrowthRate}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          {selectedCohorts.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select Cohorts to Compare</h3>
                  <p className="text-sm text-muted-foreground">
                    Go to the Overview tab and select cohorts to see detailed comparisons
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Cohort Performance Comparison</CardTitle>
                  <CardDescription>
                    Comparing {selectedCohorts.length} selected cohort{selectedCohorts.length > 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {comparisonLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={comparison}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="cohortPeriod" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="totalStudents" fill="#8884d8" name="Students" />
                        <Bar dataKey="completedEnrollments" fill="#82ca9d" name="Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detailed Metrics Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  {comparisonLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cohort</TableHead>
                          <TableHead className="text-right">Students</TableHead>
                          <TableHead className="text-right">Completion Rate</TableHead>
                          <TableHead className="text-right">Avg Progress</TableHead>
                          <TableHead className="text-right">Test Pass Rate</TableHead>
                          <TableHead className="text-right">Avg Test Score</TableHead>
                          <TableHead className="text-right">Revenue/Student</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {comparison?.map((cohort) => (
                          <TableRow key={cohort.cohortPeriod}>
                            <TableCell className="font-medium">{cohort.cohortPeriod}</TableCell>
                            <TableCell className="text-right">{cohort.totalStudents}</TableCell>
                            <TableCell className="text-right">{cohort.completionRate}%</TableCell>
                            <TableCell className="text-right">{cohort.avgProgress}%</TableCell>
                            <TableCell className="text-right">{cohort.testPassRate}%</TableCell>
                            <TableCell className="text-right">{cohort.avgTestScore}%</TableCell>
                            <TableCell className="text-right">${cohort.avgRevenuePerStudent}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
