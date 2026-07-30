/**
 * Enterprise Dashboard
 * Comprehensive portal for enterprise customers showing AI systems, compliance, PDCA cycles, and analytics
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  Activity,
  FileText,
  BarChart3,
  Clock,
  Target,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Link } from 'wouter';

export default function EnterpriseDashboard() {
  // Fetch enterprise data
  const { data: aiSystems } = trpc.aiSystems.list.useQuery();
  const { data: stats } = trpc.dashboard.getStats.useQuery();
  // Calculate compliance metrics
  const totalSystems = aiSystems?.length || 0;
  const compliantSystems = aiSystems?.filter((s) => s.riskLevel === 'minimal' || s.riskLevel === 'limited').length || 0;
  const highRiskSystems = aiSystems?.filter((s) => s.riskLevel === 'high' || s.riskLevel === 'unacceptable').length || 0;
  const complianceRate = totalSystems > 0 ? Math.round((compliantSystems / totalSystems) * 100) : 0;

  // PDCA cycle metrics (mock data for now)
  const activeCycles = 3;
  const completedCycles = 7;
  const pdcaCycles: any[] = [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Enterprise Dashboard</h1>
              <p className="text-green-100 text-lg">
                Comprehensive AI Safety & Compliance Management
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/ai-systems">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Shield className="mr-2 h-4 w-4" />
                  Manage AI Systems
                </Button>
              </Link>
              <Link href="/pdca-cycles">
                <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                  <Activity className="mr-2 h-4 w-4" />
                  PDCA Cycles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                AI Systems
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalSystems}</div>
              <p className="text-sm text-gray-600 mt-1">
                {compliantSystems} compliant, {highRiskSystems} high-risk
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Compliance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{complianceRate}%</div>
              <p className="text-sm text-gray-600 mt-1">
                {complianceRate >= 80 ? 'Excellent' : complianceRate >= 60 ? 'Good' : 'Needs Improvement'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Active PDCA Cycles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{activeCycles}</div>
              <p className="text-sm text-gray-600 mt-1">
                {completedCycles} completed this quarter
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Open Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {stats?.watchdogReports || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Watchdog reports submitted
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* AI Systems Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                AI Systems Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiSystems && aiSystems.length > 0 ? (
                <div className="space-y-4">
                  {aiSystems.slice(0, 5).map((system) => (
                    <div
                      key={system.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{system.name}</h4>
                        <p className="text-sm text-gray-600">{system.systemType}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            system.riskLevel === 'minimal' || system.riskLevel === 'limited'
                              ? 'default'
                              : system.riskLevel === 'high' || system.riskLevel === 'unacceptable'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {system.riskLevel}
                        </Badge>
                        <Link href={`/ai-systems/${system.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {aiSystems.length > 5 && (
                    <Link href="/ai-systems">
                      <Button variant="outline" className="w-full">
                        View All {aiSystems.length} Systems
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No AI systems registered yet</p>
                  <Link href="/ai-systems">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Register First System
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* EU AI Act */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">EU AI Act</span>
                    <span className="text-sm font-semibold text-green-600">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">12/15 requirements met</p>
                </div>

                {/* NIST AI RMF */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">NIST AI RMF</span>
                    <span className="text-sm font-semibold text-emerald-600">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '78%' }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">18/23 controls implemented</p>
                </div>

                {/* TC260 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">TC260 GB/T 42459</span>
                    <span className="text-sm font-semibold text-purple-600">72%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '72%' }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">23/32 standards met</p>
                </div>

                {/* ISO 42001 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">ISO/IEC 42001</span>
                    <span className="text-sm font-semibold text-orange-600">68%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '68%' }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">15/22 clauses satisfied</p>
                </div>

                <Link href="/compliance">
                  <Button variant="outline" className="w-full mt-4">
                    View Detailed Compliance Report
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* PDCA Cycles Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600" />
                PDCA Cycles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pdcaCycles && pdcaCycles.length > 0 ? (
                <div className="space-y-4">
                  {pdcaCycles.slice(0, 4).map((cycle: any) => (
                    <div
                      key={cycle.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Cycle #{cycle.id}</h4>
                        <p className="text-sm text-gray-600">
                          Phase: <span className="font-medium">{cycle.currentPhase}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            cycle.status === 'completed'
                              ? 'default'
                              : cycle.status === 'in_progress'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {cycle.status}
                        </Badge>
                        <Link href={`/pdca-cycles/${cycle.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  <Link href="/pdca-cycles">
                    <Button variant="outline" className="w-full">
                      View All Cycles
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No PDCA cycles started yet</p>
                  <Link href="/pdca-cycles">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Start First Cycle
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Team Members</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <Users className="h-10 w-10 text-purple-200" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Compliance Officers</p>
                    <p className="text-xl font-bold text-green-700">5</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-gray-600">AI Safety Analysts</p>
                    <p className="text-xl font-bold text-emerald-700">7</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">This Month's Activity</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Assessments Completed</span>
                      <span className="font-semibold text-gray-900">24</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Incidents Reviewed</span>
                      <span className="font-semibold text-gray-900">18</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Reports Generated</span>
                      <span className="font-semibold text-gray-900">9</span>
                    </div>
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Link href="/ai-systems">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Register AI System
                </Button>
              </Link>
              <Link href="/compliance">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Run Assessment
                </Button>
              </Link>
              <Link href="/pdca-cycles">
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Start PDCA Cycle
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
