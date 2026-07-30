import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Users, Target, Lightbulb } from "lucide-react";

export default function PredictiveAnalytics() {
  const [selectedThreshold, setSelectedThreshold] = useState(40);

  const { data: myPrediction, isLoading: myPredictionLoading } = trpc.predictiveAnalytics.getPrediction.useQuery({});
  const { data: atRiskStudents, isLoading: atRiskLoading } = trpc.predictiveAnalytics.getAtRiskStudents.useQuery({
    threshold: selectedThreshold,
  });
  const { data: statistics, isLoading: statsLoading } = trpc.predictiveAnalytics.getStatistics.useQuery();

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskBadgeVariant = (riskLevel: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (riskLevel) {
      case 'low':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'high':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const riskDistributionData = statistics
    ? [
        { name: 'Low Risk', value: statistics.riskDistribution.low, color: '#10b981' },
        { name: 'Medium Risk', value: statistics.riskDistribution.medium, color: '#f59e0b' },
        { name: 'High Risk', value: statistics.riskDistribution.high, color: '#ef4444' },
      ]
    : [];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Predictive Analytics</h1>
          <p className="text-muted-foreground mt-2">
            ML-based predictions for student success and completion likelihood
          </p>
        </div>
        <Brain className="h-12 w-12 text-primary" />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="my-prediction">My Prediction</TabsTrigger>
          <TabsTrigger value="at-risk">At-Risk Students</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground">Enrolled students analyzed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Success Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.avgSuccessProbability || 0}%</div>
                <p className="text-xs text-muted-foreground">Predicted success probability</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Likelihood</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.avgCompletionLikelihood || 0}%</div>
                <p className="text-xs text-muted-foreground">Average completion rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Students</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.riskDistribution.high || 0}</div>
                <p className="text-xs text-muted-foreground">Need immediate intervention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>Student risk levels across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {riskDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prediction Model Features</CardTitle>
                <CardDescription>Key factors influencing success predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress Rate</span>
                      <span className="text-sm text-muted-foreground">30% weight</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Engagement Score</span>
                      <span className="text-sm text-muted-foreground">25% weight</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Test Performance</span>
                      <span className="text-sm text-muted-foreground">25% weight</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Activity Consistency</span>
                      <span className="text-sm text-muted-foreground">15% weight</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Enrollment Age</span>
                      <span className="text-sm text-muted-foreground">5% weight</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Prediction Tab */}
        <TabsContent value="my-prediction" className="space-y-6">
          {myPredictionLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </CardContent>
            </Card>
          ) : myPrediction ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Probability</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{myPrediction.successProbability}%</div>
                    <Progress value={myPrediction.successProbability} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion Likelihood</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{myPrediction.completionLikelihood}%</div>
                    <Progress value={myPrediction.completionLikelihood} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <Badge variant={getRiskBadgeVariant(myPrediction.riskLevel)} className="text-lg px-4 py-1">
                      {myPrediction.riskLevel.toUpperCase()}
                    </Badge>
                    {myPrediction.predictedCompletionDate && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Est. completion: {new Date(myPrediction.predictedCompletionDate).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Personalized Recommendations
                  </CardTitle>
                  <CardDescription>Actions to improve your success rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {myPrediction.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">{index + 1}</span>
                          </div>
                        </div>
                        <p className="text-sm flex-1">{rec}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Learning Metrics</CardTitle>
                  <CardDescription>Detailed breakdown of prediction features</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress Rate</span>
                        <span className="text-sm font-bold">{myPrediction.features.progressRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={myPrediction.features.progressRate} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Engagement Score</span>
                        <span className="text-sm font-bold">{myPrediction.features.engagementScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={myPrediction.features.engagementScore} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Test Performance</span>
                        <span className="text-sm font-bold">{myPrediction.features.testPerformance.toFixed(1)}%</span>
                      </div>
                      <Progress value={myPrediction.features.testPerformance} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Activity Consistency</span>
                        <span className="text-sm font-bold">{myPrediction.features.activityConsistency.toFixed(1)}%</span>
                      </div>
                      <Progress value={myPrediction.features.activityConsistency} className="h-2" />
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Days Since Enrollment</span>
                        <span className="text-sm font-bold">{myPrediction.features.enrollmentAge} days</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Prediction Available</h3>
                  <p className="text-sm text-muted-foreground">
                    Enroll in a course to get personalized success predictions
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* At-Risk Students Tab */}
        <TabsContent value="at-risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>At-Risk Students</CardTitle>
              <CardDescription>
                Students who may need intervention or additional support
              </CardDescription>
              <div className="flex items-center gap-4 mt-4">
                <label className="text-sm font-medium">Risk Threshold:</label>
                <select
                  value={selectedThreshold}
                  onChange={(e) => setSelectedThreshold(Number(e.target.value))}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value={30}>30% (Very High Risk)</option>
                  <option value={40}>40% (High Risk)</option>
                  <option value={50}>50% (Medium Risk)</option>
                  <option value={60}>60% (Low Risk)</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {atRiskLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : atRiskStudents && atRiskStudents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Success Probability</TableHead>
                      <TableHead>Completion Likelihood</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Top Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {atRiskStudents.map((student) => (
                      <TableRow key={student.userId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.userName}</div>
                            <div className="text-xs text-muted-foreground">{student.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={student.successProbability} className="w-20 h-2" />
                            <span className="text-sm font-medium">{student.successProbability}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={student.completionLikelihood} className="w-20 h-2" />
                            <span className="text-sm font-medium">{student.completionLikelihood}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRiskBadgeVariant(student.riskLevel)}>
                            {student.riskLevel.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm truncate">{student.recommendations[0]}</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No At-Risk Students</h3>
                    <p className="text-sm text-muted-foreground">
                      All students are performing well above the threshold
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
