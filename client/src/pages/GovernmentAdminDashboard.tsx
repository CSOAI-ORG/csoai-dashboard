import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Shield,
  Clock,
  Eye,
  Download,
  Send
} from "lucide-react";

interface ComplianceRequirement {
  id: string;
  framework: string;
  requirement: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  effectiveDate: Date;
  version: number;
  adoptionRate: number;
}

interface EnforcementAction {
  id: string;
  systemId: string;
  companyName: string;
  reason: string;
  severity: "critical" | "high" | "medium" | "low";
  action: string;
  status: "open" | "in_progress" | "resolved" | "appealed";
  issuedDate: Date;
  dueDate: Date;
}

interface GovernmentMetrics {
  totalSystems: number;
  compliantSystems: number;
  nonCompliantSystems: number;
  complianceRate: number;
  activeRequirements: number;
  openEnforcements: number;
  enterprisesAdopted: number;
}

export default function GovernmentAdminDashboard() {
  const [requirements] = useState<ComplianceRequirement[]>([
    {
      id: "req_001",
      framework: "EU AI Act",
      requirement: "Risk Assessment Required",
      description: "All high-risk AI systems must undergo comprehensive risk assessment",
      priority: "critical",
      effectiveDate: new Date("2024-01-01"),
      version: 1,
      adoptionRate: 92
    },
    {
      id: "req_002",
      framework: "NIST RMF",
      requirement: "Continuous Monitoring",
      description: "Implement continuous monitoring of AI systems for compliance",
      priority: "high",
      effectiveDate: new Date("2024-02-01"),
      version: 1,
      adoptionRate: 78
    },
    {
      id: "req_003",
      framework: "ISO 42001",
      requirement: "Documentation Standards",
      description: "Maintain comprehensive documentation of AI systems and processes",
      priority: "medium",
      effectiveDate: new Date("2024-03-01"),
      version: 1,
      adoptionRate: 65
    }
  ]);

  const [enforcements] = useState<EnforcementAction[]>([
    {
      id: "enf_001",
      systemId: "sys_001",
      companyName: "TechCorp AI",
      reason: "Non-compliance with EU AI Act risk assessment requirements",
      severity: "critical",
      action: "Suspend operations until compliance achieved",
      status: "open",
      issuedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: "enf_002",
      systemId: "sys_002",
      companyName: "DataFlow Systems",
      reason: "Missing continuous monitoring implementation",
      severity: "high",
      action: "Issue corrective action notice",
      status: "in_progress",
      issuedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000)
    },
    {
      id: "enf_003",
      systemId: "sys_003",
      companyName: "SafeAI Inc",
      reason: "Incomplete documentation",
      severity: "medium",
      action: "Request documentation update",
      status: "resolved",
      issuedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [metrics] = useState<GovernmentMetrics>({
    totalSystems: 1247,
    compliantSystems: 1098,
    nonCompliantSystems: 149,
    complianceRate: 88,
    activeRequirements: 23,
    openEnforcements: 12,
    enterprisesAdopted: 847
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "appealed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="py-12 bg-white border-b-2 border-emerald-200">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-emerald-600" />
                <h1 className="text-4xl font-bold text-gray-900">Government Admin Portal</h1>
              </div>
              <div className="flex gap-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Requirement
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
            <p className="text-lg text-gray-700">
              Manage compliance requirements, track enterprise adoption, and monitor enforcement actions.
            </p>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Compliance Overview</h2>

            <div className="grid md:grid-cols-4 gap-4">
              {/* Total Systems */}
              <Card className="p-6 border-2 border-emerald-200 bg-emerald-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-600">Total AI Systems</p>
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-emerald-600">{metrics.totalSystems}</p>
                <p className="text-xs text-gray-600 mt-2">Under monitoring</p>
              </Card>

              {/* Compliance Rate */}
              <Card className="p-6 border-2 border-green-200 bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-600">Compliance Rate</p>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">{metrics.complianceRate}%</p>
                <p className="text-xs text-gray-600 mt-2">
                  {metrics.compliantSystems} compliant systems
                </p>
              </Card>

              {/* Active Requirements */}
              <Card className="p-6 border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-600">Active Requirements</p>
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600">{metrics.activeRequirements}</p>
                <p className="text-xs text-gray-600 mt-2">Across all frameworks</p>
              </Card>

              {/* Open Enforcements */}
              <Card className="p-6 border-2 border-red-200 bg-red-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-600">Open Enforcements</p>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600">{metrics.openEnforcements}</p>
                <p className="text-xs text-gray-600 mt-2">Requiring action</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Requirements */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Compliance Requirements</h2>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Requirement
              </Button>
            </div>

            <div className="space-y-4">
              {requirements.map(req => (
                <Card key={req.id} className="p-6 border-2 border-gray-200 hover:border-emerald-200 transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{req.requirement}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getPriorityColor(req.priority)}`}>
                          {req.priority.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3">{req.description}</p>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Framework</p>
                          <p className="font-semibold text-gray-900">{req.framework}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Effective Date</p>
                          <p className="font-semibold text-gray-900">{req.effectiveDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Version</p>
                          <p className="font-semibold text-gray-900">v{req.version}</p>
                        </div>
                      </div>

                      {/* Adoption Rate */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-gray-600">Enterprise Adoption</p>
                          <p className="text-sm font-semibold text-emerald-600">{req.adoptionRate}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-600 h-2 rounded-full"
                            style={{ width: `${req.adoptionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enforcement Actions */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Enforcement Actions</h2>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Issue Action
              </Button>
            </div>

            <div className="space-y-4">
              {enforcements.map(enf => (
                <Card key={enf.id} className="p-6 border-2 border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{enf.companyName}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(enf.status)}`}>
                          {enf.status.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3">{enf.reason}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Severity</p>
                          <p className={`font-semibold ${getPriorityColor(enf.severity)}`}>
                            {enf.severity.toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Action</p>
                          <p className="font-semibold text-gray-900">{enf.action}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Issued</p>
                          <p className="font-semibold text-gray-900">{enf.issuedDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Due Date</p>
                          <p className="font-semibold text-gray-900">{enf.dueDate.toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Days Remaining */}
                      {enf.status !== "resolved" && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-600 font-semibold">
                            {Math.ceil((enf.dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days remaining
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Adoption */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Enterprise Adoption Tracking</h2>

            <Card className="p-6 border-2 border-emerald-200">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <p className="text-sm font-semibold text-gray-600">Enterprises Adopted</p>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">{metrics.enterprisesAdopted}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {Math.round((metrics.enterprisesAdopted / 1000) * 100)}% of target
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-semibold text-gray-600">Full Compliance</p>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {Math.round((metrics.compliantSystems / metrics.totalSystems) * 100)}%
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Of all monitored systems</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-semibold text-gray-600">Growth Rate</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">+12.5%</p>
                  <p className="text-xs text-gray-600 mt-1">Month-over-month</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-4 w-4 mr-2" />
                  Broadcast Compliance Update to All Enterprises
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
