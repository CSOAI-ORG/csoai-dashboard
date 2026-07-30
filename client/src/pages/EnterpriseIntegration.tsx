import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Zap, TrendingUp, Shield, CheckCircle2, ArrowRight } from "lucide-react";

export default function EnterpriseIntegration() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 to-white border-b-2 border-emerald-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Enterprise Integration APIs
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Integrate CSOAI compliance into your CI/CD pipeline. Real-time compliance monitoring for your AI systems.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Get API Keys
              </Button>
              <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              Why Integrate with CSOAI?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 border-2 border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-8 w-8 text-emerald-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Continuous Compliance</h3>
                </div>
                <p className="text-gray-700">
                  Monitor compliance in real-time. Get notified immediately when requirements change. Update your systems automatically.
                </p>
              </Card>

              <Card className="p-8 border-2 border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-8 w-8 text-emerald-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Regulatory Confidence</h3>
                </div>
                <p className="text-gray-700">
                  Prove compliance to regulators with real-time audit trails. Demonstrate that your systems meet all requirements.
                </p>
              </Card>

              <Card className="p-8 border-2 border-emerald-200">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                  <h3 className="text-2xl font-bold text-gray-900">Reduce Risk</h3>
                </div>
                <p className="text-gray-700">
                  Catch compliance issues before they become problems. Avoid fines, system shutdowns, and reputational damage.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Methods */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              Integration Methods
            </h2>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="rest">REST API</TabsTrigger>
                <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                <TabsTrigger value="sdk">SDKs</TabsTrigger>
              </TabsList>

              {/* REST API Tab */}
              <TabsContent value="rest" className="space-y-6">
                <Card className="p-8 border-2 border-emerald-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">REST API Integration</h3>
                  
                  <div className="space-y-6">
                    {/* Endpoint 1 */}
                    <div className="border-b border-gray-200 pb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Get Compliance Status</h4>
                      <p className="text-gray-700 mb-4">Check the current compliance score for your AI system.</p>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                        <div className="text-emerald-400">GET</div>
                        <div>/api/v1/compliance/status/{'{'} system_id {'}'}</div>
                        <div className="mt-3 text-gray-400">
                          {`Response:
{
  "systemId": "sys_12345",
  "complianceScore": 92,
  "status": "compliant",
  "lastAudit": "2025-01-15T10:30:00Z",
  "nextAuditDue": "2025-04-15T10:30:00Z",
  "frameworks": {
    "euAiAct": 95,
    "nistRmf": 88,
    "iso42001": 90,
    "tc260": 92
  }
}`}
                        </div>
                      </div>
                    </div>

                    {/* Endpoint 2 */}
                    <div className="border-b border-gray-200 pb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Get Active Requirements</h4>
                      <p className="text-gray-700 mb-4">Retrieve all active compliance requirements.</p>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                        <div className="text-emerald-400">GET</div>
                        <div>/api/v1/requirements/active</div>
                        <div className="mt-3 text-gray-400">
                          {`Response:
{
  "requirements": [
    {
      "id": "req_001",
      "framework": "EU AI Act",
      "requirement": "Human-in-the-loop override capability",
      "priority": "high",
      "effectiveDate": "2025-03-01"
    },
    {
      "id": "req_002",
      "framework": "NIST RMF",
      "requirement": "Risk management documentation",
      "priority": "medium",
      "effectiveDate": "2025-01-01"
    }
  ]
}`}
                        </div>
                      </div>
                    </div>

                    {/* Endpoint 3 */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Request New Audit</h4>
                      <p className="text-gray-700 mb-4">Trigger a new compliance audit for your system.</p>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <div className="text-emerald-400">POST</div>
                        <div>/api/v1/audits/request</div>
                        <div className="mt-3 text-gray-400">
                          {`Request:
{
  "systemId": "sys_12345",
  "reason": "System update",
  "priority": "high"
}

Response:
{
  "auditId": "audit_67890",
  "status": "scheduled",
  "estimatedCompletion": "2025-02-01T00:00:00Z",
  "analyst": "Assigned analyst will be notified"
}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Webhooks Tab */}
              <TabsContent value="webhooks" className="space-y-6">
                <Card className="p-8 border-2 border-emerald-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Webhook Integration</h3>
                  
                  <p className="text-gray-700 mb-6">
                    Subscribe to real-time compliance events. Get notified immediately when requirements change or compliance status updates.
                  </p>

                  <div className="space-y-6">
                    {/* Webhook 1 */}
                    <div className="border-b border-gray-200 pb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Compliance Requirement Updated</h4>
                      <p className="text-gray-700 mb-4">Triggered when a new compliance requirement is issued.</p>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <div className="text-emerald-400">Event: compliance.requirement.updated</div>
                        <div className="mt-3 text-gray-400">
                          {`{
  "eventId": "evt_12345",
  "timestamp": "2025-02-01T10:30:00Z",
  "requirement": {
    "id": "req_003",
    "framework": "EU AI Act",
    "requirement": "Bias testing required quarterly",
    "priority": "high",
    "effectiveDate": "2025-03-01"
  },
  "affectedSystems": 247
}`}
                        </div>
                      </div>
                    </div>

                    {/* Webhook 2 */}
                    <div className="border-b border-gray-200 pb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Compliance Score Changed</h4>
                      <p className="text-gray-700 mb-4">Triggered when your system's compliance score changes.</p>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <div className="text-emerald-400">Event: compliance.score.changed</div>
                        <div className="mt-3 text-gray-400">
                          {`{
  "eventId": "evt_12346",
  "timestamp": "2025-02-01T11:45:00Z",
  "systemId": "sys_12345",
  "previousScore": 88,
  "newScore": 92,
  "reason": "Audit completed - all requirements met",
  "frameworks": {
    "euAiAct": 95,
    "nistRmf": 88,
    "iso42001": 90,
    "tc260": 92
  }
}`}
                        </div>
                      </div>
                    </div>

                    {/* Webhook 3 */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Audit Required</h4>
                      <p className="text-gray-700 mb-4">Triggered when a re-audit is required due to requirement changes.</p>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <div className="text-emerald-400">Event: audit.required</div>
                        <div className="mt-3 text-gray-400">
                          {`{
  "eventId": "evt_12347",
  "timestamp": "2025-02-01T12:00:00Z",
  "systemId": "sys_12345",
  "reason": "New compliance requirement: Human-in-the-loop override",
  "dueDate": "2025-03-01T00:00:00Z",
  "priority": "high"
}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Subscribe to Webhooks</h4>
                    <p className="text-gray-700 text-sm mb-4">
                      Configure your webhook endpoint to receive real-time compliance events.
                    </p>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Configure Webhooks
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* SDKs Tab */}
              <TabsContent value="sdk" className="space-y-6">
                <Card className="p-8 border-2 border-emerald-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Official SDKs</h3>
                  
                  <p className="text-gray-700 mb-6">
                    Use official SDKs to integrate CSOAI compliance into your applications. Available for all major programming languages.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Python SDK */}
                    <Card className="p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Python SDK</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                        <div className="text-gray-400">
                          {`pip install csoai-sdk

from csoai import CSoaiClient

client = CSoaiClient(api_key="your_api_key")

# Get compliance status
status = client.compliance.get_status("sys_12345")
print(f"Compliance: {status.score}%")

# Subscribe to webhooks
client.webhooks.subscribe(
  event="compliance.score.changed",
  url="https://your-app.com/webhook"
)`}
                        </div>
                      </div>
                      <Button variant="outline" className="w-full border-emerald-600 text-emerald-600">
                        View Python Docs
                      </Button>
                    </Card>

                    {/* JavaScript SDK */}
                    <Card className="p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">JavaScript SDK</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                        <div className="text-gray-400">
                          {`npm install @csoai/sdk

import { CSoaiClient } from "@csoai/sdk";

const client = new CSoaiClient({
  apiKey: "your_api_key"
});

// Get compliance status
const status = await client.compliance
  .getStatus("sys_12345");
console.log(\`Compliance: \${status.score}%\`);`}
                        </div>
                      </div>
                      <Button variant="outline" className="w-full border-emerald-600 text-emerald-600">
                        View JavaScript Docs
                      </Button>
                    </Card>

                    {/* Go SDK */}
                    <Card className="p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Go SDK</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                        <div className="text-gray-400">
                          {`go get github.com/csoai/sdk-go

import "github.com/csoai/sdk-go"

client := csoai.NewClient("your_api_key")

status, err := client.Compliance.
  GetStatus("sys_12345")
if err != nil {
  log.Fatal(err)
}`}
                        </div>
                      </div>
                      <Button variant="outline" className="w-full border-emerald-600 text-emerald-600">
                        View Go Docs
                      </Button>
                    </Card>

                    {/* Java SDK */}
                    <Card className="p-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Java SDK</h4>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-4">
                        <div className="text-gray-400">
                          {`// Maven
<dependency>
  <groupId>com.csoai</groupId>
  <artifactId>sdk-java</artifactId>
  <version>1.0.0</version>
</dependency>

CSoaiClient client = new CSoaiClient
  .Builder("your_api_key")
  .build();

ComplianceStatus status = client
  .compliance()
  .getStatus("sys_12345");`}
                        </div>
                      </div>
                      <Button variant="outline" className="w-full border-emerald-600 text-emerald-600">
                        View Java Docs
                      </Button>
                    </Card>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* CI/CD Integration */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              CI/CD Pipeline Integration
            </h2>

            <Card className="p-8 border-2 border-emerald-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Automated Compliance Checking</h3>
              
              <p className="text-gray-700 mb-6">
                Integrate CSOAI compliance checks into your deployment pipeline. Block non-compliant deployments automatically.
              </p>

              <div className="space-y-6">
                {/* GitHub Actions */}
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">GitHub Actions</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="text-gray-400">
                      {`name: Compliance Check

on: [push, pull_request]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check CSOAI Compliance
        uses: csoai/compliance-action@v1
        with:
          api-key: \${{ secrets.CSOAI_API_KEY }}
          system-id: sys_12345
      - name: Block if Non-Compliant
        if: failure()
        run: exit 1`}
                    </div>
                  </div>
                </div>

                {/* GitLab CI */}
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">GitLab CI/CD</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="text-gray-400">
                      {`compliance_check:
  stage: test
  image: csoai/compliance-checker:latest
  script:
    - csoai-check --system-id sys_12345
    - csoai-check --framework eu-ai-act
    - csoai-check --framework nist-rmf
  only:
    - merge_requests
  allow_failure: false`}
                    </div>
                  </div>
                </div>

                {/* Jenkins */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Jenkins Pipeline</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div className="text-gray-400">
                      {`pipeline {
  agent any
  stages {
    stage('Compliance Check') {
      steps {
        sh '''
          pip install csoai-sdk
          python -c "
            from csoai import CSoaiClient
            client = CSoaiClient('$CSOAI_API_KEY')
            status = client.compliance.get_status('sys_12345')
            if status.score < 90:
              exit(1)
          "
        '''
      }
    }
  }
}`}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Monitoring & Analytics */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
              Monitoring & Analytics
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 border-2 border-emerald-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Dashboard</h3>
                <p className="text-gray-700 mb-4">
                  Monitor compliance scores and trends in real-time. Get alerts when compliance changes.
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Real-time compliance scoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Historical trend analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Framework-specific breakdowns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Audit history and reports</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8 border-2 border-emerald-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Custom Alerts</h3>
                <p className="text-gray-700 mb-4">
                  Set up custom alerts for compliance changes and enforcement actions.
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Score drop alerts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>New requirement alerts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Enforcement action alerts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Email, Slack, webhook notifications</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Integrate?</h2>
            <p className="text-lg text-emerald-100 mb-8">
              Get your API keys and start integrating CSOAI compliance into your systems today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
                Get API Keys
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-emerald-700">
                View Full Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
