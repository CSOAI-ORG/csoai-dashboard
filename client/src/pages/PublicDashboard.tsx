import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Users,
  FileText,
  TrendingUp,
  Globe,
  Building2,
  Scale,
  Eye,
  BarChart3,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Link } from "wouter";

export default function PublicDashboard() {
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  
  // Fetch public statistics
  const { data: councilStats } = trpc.council.getStats.useQuery();
  const { data: recentReports } = trpc.watchdog.list.useQuery();
  const { data: recentSessions } = trpc.council.list.useQuery();
  
  // Calculate watchdog stats from reports
  const watchdogStats = {
    total: recentReports?.length || 0,
    verified: recentReports?.filter(r => r.status === "resolved").length || 0,
  };

  // Calculate aggregate stats
  const totalIncidents = watchdogStats?.total || 0;
  const resolvedIncidents = watchdogStats?.verified || 0;
  const councilSessions = councilStats?.totalSessions || 0;
  const consensusRate = councilStats?.totalSessions 
    ? Math.round((councilStats.consensusReached / councilStats.totalSessions) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">CSOAI</h1>
                  <p className="text-xs text-zinc-400">Public Transparency Dashboard</p>
                </div>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/report">
                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Incident
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            <Globe className="w-3 h-3 mr-1" />
            Real-Time AI Safety Monitoring
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Global AI Safety <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Transparency</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            Track AI safety incidents, compliance assessments, and council decisions in real-time. 
            CSOAI provides unprecedented transparency into AI governance worldwide.
          </p>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">Total Incidents Reported</p>
                    <p className="text-3xl font-bold text-white">{totalIncidents.toLocaleString()}</p>
                    <p className="text-xs text-emerald-400 mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      Community-powered monitoring
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">Verified & Resolved</p>
                    <p className="text-3xl font-bold text-white">{resolvedIncidents.toLocaleString()}</p>
                    <p className="text-xs text-emerald-400 mt-1">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      {totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0}% resolution rate
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">Council Sessions</p>
                    <p className="text-3xl font-bold text-white">{councilSessions.toLocaleString()}</p>
                    <p className="text-xs text-cyan-400 mt-1">
                      <Users className="w-3 h-3 inline mr-1" />
                      33-Agent AI Council
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">Consensus Rate</p>
                    <p className="text-3xl font-bold text-white">{consensusRate}%</p>
                    <p className="text-xs text-purple-400 mt-1">
                      <Scale className="w-3 h-3 inline mr-1" />
                      2/3 majority threshold
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Scale className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <Tabs defaultValue="incidents" className="space-y-6">
            <TabsList className="bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="incidents" className="data-[state=active]:bg-zinc-800">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Recent Incidents
              </TabsTrigger>
              <TabsTrigger value="council" className="data-[state=active]:bg-zinc-800">
                <Users className="w-4 h-4 mr-2" />
                Council Decisions
              </TabsTrigger>
              <TabsTrigger value="frameworks" className="data-[state=active]:bg-zinc-800">
                <FileText className="w-4 h-4 mr-2" />
                Compliance Frameworks
              </TabsTrigger>
            </TabsList>

            {/* Recent Incidents Tab */}
            <TabsContent value="incidents" className="space-y-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-amber-400" />
                    Public Incident Feed
                  </CardTitle>
                  <CardDescription>
                    Real-time feed of AI safety incidents reported by the community
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentReports && recentReports.length > 0 ? (
                      recentReports.map((report) => (
                        <div
                          key={report.id}
                          className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  variant="outline"
                                  className={
                                    report.severity === "critical"
                                      ? "border-red-500/50 text-red-400"
                                      : report.severity === "high"
                                      ? "border-orange-500/50 text-orange-400"
                                      : report.severity === "medium"
                                      ? "border-amber-500/50 text-amber-400"
                                      : "border-zinc-500/50 text-zinc-400"
                                  }
                                >
                                  {report.severity}
                                </Badge>
                                <Badge variant="outline" className="border-zinc-600 text-zinc-400">
                                  {report.incidentType}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={
                                    report.status === "resolved"
                                      ? "border-emerald-500/50 text-emerald-400"
                                      : report.status === "investigating"
                                      ? "border-cyan-500/50 text-cyan-400"
                                      : "border-zinc-500/50 text-zinc-400"
                                  }
                                >
                                  {report.status}
                                </Badge>
                              </div>
                              <h4 className="font-medium text-white mb-1">{report.title}</h4>
                              <p className="text-sm text-zinc-400 line-clamp-2">
                                {report.description}
                              </p>
                              {report.aiSystemName && (
                                <p className="text-xs text-zinc-500 mt-2">
                                  <Building2 className="w-3 h-3 inline mr-1" />
                                  {report.aiSystemName}
                                  {report.companyName && ` by ${report.companyName}`}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-xs text-zinc-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {new Date(report.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-zinc-500">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No incidents reported yet</p>
                        <Link href="/report">
                          <Button variant="link" className="text-emerald-400 mt-2">
                            Be the first to report an incident
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Council Decisions Tab */}
            <TabsContent value="council" className="space-y-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    33-Agent Council Decisions
                  </CardTitle>
                  <CardDescription>
                    Transparent record of AI safety decisions made by the multi-agent council
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSessions && recentSessions.length > 0 ? (
                      recentSessions.slice(0, 5).map((session) => (
                        <div
                          key={session.id}
                          className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge
                                  className={
                                    session.finalDecision === "approved"
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : session.finalDecision === "rejected"
                                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  }
                                >
                                  {session.finalDecision || "Pending"}
                                </Badge>
                                <Badge variant="outline" className="border-zinc-600 text-zinc-400">
                                  {session.subjectType?.replace("_", " ")}
                                </Badge>
                              </div>
                              <h4 className="font-medium text-white mb-1">{session.subjectTitle}</h4>
                              <p className="text-sm text-zinc-400 line-clamp-2">
                                {session.subjectDescription}
                              </p>
                              {session.totalVotes && session.totalVotes > 0 && (
                                <div className="mt-3 flex items-center gap-4 text-xs">
                                  <span className="text-emerald-400">
                                    <CheckCircle2 className="w-3 h-3 inline mr-1" />
                                    {session.approveVotes} approve
                                  </span>
                                  <span className="text-red-400">
                                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                                    {session.rejectVotes} reject
                                  </span>
                                  <span className="text-amber-400">
                                    <Scale className="w-3 h-3 inline mr-1" />
                                    {session.escalateVotes} escalate
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-zinc-500 mb-2">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {new Date(session.createdAt).toLocaleDateString()}
                              </div>
                              {session.status === "consensus_reached" && (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                  Consensus
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-zinc-500">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No council sessions yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compliance Frameworks Tab */}
            <TabsContent value="frameworks" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* EU AI Act */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Scale className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">EU AI Act</CardTitle>
                        <CardDescription>European Union</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-400 mb-4">
                      Comprehensive AI regulation establishing risk-based requirements for AI systems in the EU market.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-zinc-400">
                        <span>Risk Categories</span>
                        <span className="text-white">4 levels</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Requirements</span>
                        <span className="text-white">10 controls</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Effective</span>
                        <span className="text-white">2024-2027</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4 border-zinc-700 text-zinc-300">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Requirements
                    </Button>
                  </CardContent>
                </Card>

                {/* NIST AI RMF */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">NIST AI RMF</CardTitle>
                        <CardDescription>United States</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-400 mb-4">
                      Risk management framework providing guidelines for trustworthy AI development and deployment.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-zinc-400">
                        <span>Core Functions</span>
                        <span className="text-white">4 pillars</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Requirements</span>
                        <span className="text-white">10 controls</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Version</span>
                        <span className="text-white">1.0 (2023)</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4 border-zinc-700 text-zinc-300">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Requirements
                    </Button>
                  </CardContent>
                </Card>

                {/* TC260 */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">TC260</CardTitle>
                        <CardDescription>China</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-400 mb-4">
                      Basic safety requirements for generative AI services including content safety and model security.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-zinc-400">
                        <span>Categories</span>
                        <span className="text-white">6 areas</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Requirements</span>
                        <span className="text-white">10 controls</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Version</span>
                        <span className="text-white">2024</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4 border-zinc-700 text-zinc-300">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Requirements
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-br from-emerald-900/20 to-cyan-900/20 border-emerald-500/20">
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Join the AI Safety Movement
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
                Whether you're an AI company seeking compliance, a regulator monitoring the industry, 
                or a concerned citizen, CSOAI provides the tools and transparency you need.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/report">
                  <Button size="lg" variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Report an Incident
                  </Button>
                </Link>
                <Link href="/apply">
                  <Button size="lg" variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
                    <Users className="w-5 h-5 mr-2" />
                    Become an Analyst
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-cyan-600">
                    <Building2 className="w-5 h-5 mr-2" />
                    Enterprise Access
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-zinc-400">CSOAI - Council of AIs</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <Link href="/api-docs">
                <span className="hover:text-zinc-300 cursor-pointer">API Documentation</span>
              </Link>
              <Link href="/privacy">
                <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
              </Link>
              <Link href="/terms">
                <span className="hover:text-zinc-300 cursor-pointer">Terms of Service</span>
              </Link>
            </div>
            <p className="text-sm text-zinc-500">
              © 2024 CSOAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
