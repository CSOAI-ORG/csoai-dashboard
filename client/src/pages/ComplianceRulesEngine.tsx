import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface ComplianceRule {
  id: number;
  jurisdiction: string;
  framework: string;
  ruleCode: string;
  title: string;
  description?: string;
  requirement: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  applicableToRiskLevel: string;
  version: number;
  isActive: boolean;
}

// Mock data for demonstration
const mockRules: ComplianceRule[] = [
  {
    id: 1,
    jurisdiction: 'EU',
    framework: 'EU AI Act',
    ruleCode: 'EUAI-001',
    title: 'Prohibited AI Practices',
    description: 'Prohibition of certain AI practices that violate fundamental rights',
    requirement: 'Organizations must not deploy AI systems that use subliminal techniques or exploit vulnerabilities',
    severity: 'critical',
    category: 'Fundamental Rights',
    applicableToRiskLevel: 'prohibited',
    version: 1,
    isActive: true,
  },
  {
    id: 2,
    jurisdiction: 'EU',
    framework: 'EU AI Act',
    ruleCode: 'EUAI-002',
    title: 'High-Risk AI Systems',
    description: 'Requirements for high-risk AI systems',
    requirement: 'High-risk AI systems must undergo conformity assessment before deployment',
    severity: 'critical',
    category: 'Risk Assessment',
    applicableToRiskLevel: 'high',
    version: 1,
    isActive: true,
  },
  {
    id: 3,
    jurisdiction: 'US',
    framework: 'NIST RMF',
    ruleCode: 'NIST-001',
    title: 'Risk Assessment',
    description: 'Conduct comprehensive AI risk assessment',
    requirement: 'Organizations must conduct risk assessments for AI systems before deployment',
    severity: 'critical',
    category: 'Risk Management',
    applicableToRiskLevel: 'high',
    version: 1,
    isActive: true,
  },
  {
    id: 4,
    jurisdiction: 'China',
    framework: 'CAC AI Regulations',
    ruleCode: 'CHINA-001',
    title: 'Content Security',
    description: 'AI content security requirements',
    requirement: 'AI systems must not generate content that violates Chinese regulations',
    severity: 'critical',
    category: 'Content Control',
    applicableToRiskLevel: 'high',
    version: 1,
    isActive: true,
  },
  {
    id: 5,
    jurisdiction: 'UK',
    framework: 'UK AI Principles',
    ruleCode: 'UK-001',
    title: 'Transparency and Accountability',
    description: 'AI systems must be transparent and accountable',
    requirement: 'Organizations must be able to explain AI system decisions',
    severity: 'warning',
    category: 'Accountability',
    applicableToRiskLevel: 'medium',
    version: 1,
    isActive: true,
  },
];

export function ComplianceRulesEngine() {
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null);

  // Get unique jurisdictions and frameworks
  const jurisdictions = useMemo(() => {
    return ['all', ...new Set(mockRules.map((r) => r.jurisdiction))];
  }, []);

  const frameworks = useMemo(() => {
    return ['all', ...new Set(mockRules.map((r) => r.framework))];
  }, []);

  // Filter rules
  const filteredRules = useMemo(() => {
    return mockRules.filter((rule) => {
      const jurisdictionMatch = selectedJurisdiction === 'all' || rule.jurisdiction === selectedJurisdiction;
      const frameworkMatch = selectedFramework === 'all' || rule.framework === selectedFramework;
      const searchMatch =
        rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.ruleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.requirement.toLowerCase().includes(searchTerm.toLowerCase());

      return jurisdictionMatch && frameworkMatch && searchMatch;
    });
  }, [selectedJurisdiction, selectedFramework, searchTerm]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance Rules Engine</h1>
        <p className="text-gray-600 mt-2">
          Multi-region compliance rules for EU AI Act, NIST RMF, China regulations, and UK AI principles
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Jurisdiction</label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jurisdictions.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j === 'all' ? 'All Jurisdictions' : j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Framework</label>
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frameworks.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f === 'all' ? 'All Frameworks' : f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Rules ({filteredRules.length})</h2>
          </div>

          {filteredRules.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No rules found matching your filters
              </CardContent>
            </Card>
          ) : (
            filteredRules.map((rule) => (
              <Card
                key={rule.id}
                className={`cursor-pointer transition-all ${
                  selectedRule?.id === rule.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedRule(rule)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityIcon(rule.severity)}
                        <h3 className="font-bold text-lg">{rule.title}</h3>
                        <Badge variant="outline">{rule.ruleCode}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{rule.jurisdiction}</Badge>
                        <Badge variant="secondary">{rule.framework}</Badge>
                        <Badge variant="secondary">{rule.category}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-2">v{rule.version}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Rule Details */}
        <div>
          {selectedRule ? (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">{selectedRule.ruleCode}</CardTitle>
                <CardDescription>{selectedRule.framework}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Requirement</h4>
                  <p className="text-sm text-gray-700">{selectedRule.requirement}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Applicable Risk Level</h4>
                  <Badge variant="outline">{selectedRule.applicableToRiskLevel}</Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Category</h4>
                  <p className="text-sm text-gray-700">{selectedRule.category}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Severity</h4>
                  <Badge className={getSeverityColor(selectedRule.severity)}>
                    {selectedRule.severity.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Status</h4>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Active (v{selectedRule.version})</span>
                  </div>
                </div>

                <Button className="w-full mt-4">View Implementation Guide</Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                Select a rule to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{mockRules.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Critical Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {mockRules.filter((r) => r.severity === 'critical').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Jurisdictions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{jurisdictions.length - 1}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Frameworks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{frameworks.length - 1}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
