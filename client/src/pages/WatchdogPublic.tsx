/**
 * Public Watchdog Hub
 * Global AI problem reporting and transparency dashboard
 * Anyone can report AI issues - no login required
 * All reports are public by default
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Globe,
  TrendingUp,
  Filter,
  Search,
  Send,
  Eye,
  MapPin,
  Calendar,
  Tag,
  Shield,
  Users,
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/Breadcrumb";

// Mock data for reports
const mockReports = [
  {
    id: 1,
    title: "ChatGPT hallucinating medical advice",
    description: "AI provided incorrect medical diagnosis that could harm patients",
    severity: "critical",
    aiSystem: "ChatGPT-4",
    reporter: "Anonymous",
    region: "United States",
    date: "2025-12-26",
    views: 1243,
    status: "verified",
    category: "Healthcare",
  },
  {
    id: 2,
    title: "Facial recognition bias in hiring",
    description: "AI system showing racial bias in resume screening",
    severity: "high",
    aiSystem: "HireBot Pro",
    reporter: "Anonymous",
    region: "Europe",
    date: "2025-12-25",
    views: 856,
    status: "investigating",
    category: "Employment",
  },
  {
    id: 3,
    title: "Autonomous vehicle near-miss",
    description: "Self-driving car failed to detect pedestrian in low light",
    severity: "critical",
    aiSystem: "Tesla FSD v12",
    reporter: "Anonymous",
    region: "United States",
    date: "2025-12-24",
    views: 2156,
    status: "verified",
    category: "Transportation",
  },
  {
    id: 4,
    title: "Financial AI recommending risky investments",
    description: "Robo-advisor algorithm recommending unsuitable investments for retirees",
    severity: "high",
    aiSystem: "WealthBot",
    reporter: "Anonymous",
    region: "Asia",
    date: "2025-12-23",
    views: 654,
    status: "verified",
    category: "Finance",
  },
  {
    id: 5,
    title: "Content moderation AI censoring legitimate speech",
    description: "Social media AI incorrectly flagging political discourse as hate speech",
    severity: "medium",
    aiSystem: "ContentGuard",
    reporter: "Anonymous",
    region: "Global",
    date: "2025-12-22",
    views: 1089,
    status: "investigating",
    category: "Content Moderation",
  },
];

export default function WatchdogPublic() {
  const [reports, setReports] = useState(mockReports);
  const [filteredReports, setFilteredReports] = useState(mockReports);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showReportForm, setShowReportForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    aiSystem: "",
    severity: "medium",
    category: "Other",
    region: "",
  });

  // Filter and search reports
  useEffect(() => {
    let filtered = reports;

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.aiSystem.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((report) => report.severity === severityFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((report) => report.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }

    // Sort
    if (sortBy === "recent") {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === "views") {
      filtered.sort((a, b) => b.views - a.views);
    } else if (sortBy === "critical") {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      filtered.sort(
        (a, b) => severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]
      );
    }

    setFilteredReports(filtered);
  }, [searchQuery, severityFilter, categoryFilter, statusFilter, sortBy, reports]);

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.aiSystem) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newReport = {
      id: reports.length + 1,
      ...formData,
      reporter: "Anonymous",
      date: new Date().toISOString().split("T")[0],
      views: 0,
      status: "pending",
    };

    setReports([newReport, ...reports]);
    setFormData({
      title: "",
      description: "",
      aiSystem: "",
      severity: "medium",
      category: "Other",
      region: "",
    });
    setShowReportForm(false);
    toast.success("Report submitted! Thank you for helping keep AI safe.");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "investigating":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const stats = [
    { label: "Total Reports", value: reports.length, icon: AlertTriangle },
    { label: "Critical Issues", value: reports.filter((r) => r.severity === "critical").length, icon: Shield },
    { label: "Verified", value: reports.filter((r) => r.status === "verified").length, icon: CheckCircle },
    { label: "Global Reach", value: "150+", icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-emerald-50/20">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-16">
        <div className="container max-w-6xl">
          <Breadcrumb items={[{ label: "Watchdog", href: "/watchdog" }]} />
          
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-8 w-8 text-emerald-400" />
              <h1 className="text-4xl font-bold">Global AI Watchdog</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl">
              Transparent, crowdsourced AI safety reporting. Report problems. Learn from others. Protect humanity.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container max-w-6xl py-12">
        <div className="grid md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold text-emerald-600">{stat.value}</p>
                    </div>
                    <Icon className="h-8 w-8 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Report Form CTA */}
      <div className="container max-w-6xl pb-12">
        {!showReportForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-8 text-white text-center"
          >
            <h2 className="text-2xl font-bold mb-3">Found an AI Safety Issue?</h2>
            <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
              Report it anonymously. Your report helps the global community understand AI risks and improve safety.
            </p>
            <Button
              onClick={() => setShowReportForm(true)}
              size="lg"
              className="bg-white text-emerald-700 hover:bg-gray-100"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit a Report
            </Button>
          </motion.div>
        ) : (
          <Card className="border-2 border-emerald-200">
            <CardHeader>
              <CardTitle>Submit AI Safety Report</CardTitle>
              <CardDescription>Help us understand AI risks. All reports are anonymous and public.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitReport} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Report Title *</label>
                  <Input
                    placeholder="Brief summary of the issue"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Textarea
                    placeholder="Detailed description of what happened"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={5}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">AI System Name *</label>
                    <Input
                      placeholder="e.g., ChatGPT-4, Claude, Gemini"
                      value={formData.aiSystem}
                      onChange={(e) => setFormData({ ...formData, aiSystem: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Severity</label>
                    <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Employment">Employment</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Transportation">Transportation</SelectItem>
                        <SelectItem value="Content Moderation">Content Moderation</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Region</label>
                    <Input
                      placeholder="e.g., United States, Europe, Asia"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Report
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReportForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="container max-w-6xl pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="grid md:grid-cols-4 gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
                <SelectItem value="critical">Most Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Employment">Employment</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Content Moderation">Content Moderation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="container max-w-6xl pb-16">
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card className="p-12 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No reports match your filters. Try adjusting your search.</p>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold">{report.title}</h3>
                          <Badge className={getSeverityColor(report.severity)}>
                            {report.severity.toUpperCase()}
                          </Badge>
                          {getStatusIcon(report.status) && (
                            <div className="flex items-center gap-1">
                              {getStatusIcon(report.status)}
                              <span className="text-xs text-gray-600 capitalize">{report.status}</span>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-700 mb-4">{report.description}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4" />
                            <span className="font-medium">{report.aiSystem}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            <span>{report.category}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{report.region}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{report.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{report.views.toLocaleString()} views</span>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-emerald-50 border-t">
        <div className="container max-w-6xl py-12 text-center">
          <h2 className="text-2xl font-bold mb-3">Help Build a Safer AI Future</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Every report helps. Every insight matters. Together, we're creating transparency and accountability in AI.
          </p>
          <div className="flex gap-3 justify-center">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Send className="h-4 w-4 mr-2" />
              Report an Issue
            </Button>
            <Button variant="outline">Learn More About CSOAI</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
