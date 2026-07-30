import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, TrendingUp, Shield } from "lucide-react";
import { Link } from "wouter";

export default function ISO17065() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white border-b-2 border-blue-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl font-bold text-blue-600 mb-4">ISO 17065</div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              International Accreditation Standard
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              CSOAI is ISO 17065 certified, making our training and audits recognized globally as credible third-party verification.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Request Audit
              </Button>
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is ISO 17065 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">What is ISO 17065?</h2>
            
            <p className="text-xl text-gray-700 mb-6">
              ISO 17065 is the international standard for bodies certifying products, processes, and services. It's the framework that legitimizes accreditation bodies worldwide.
            </p>

            <div className="bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">When CSOAI achieves ISO 17065 certification, it means:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">CSOAI's training and certification process meets international standards</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">CSOAI's audits are recognized globally as credible third-party verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">CSOAI can issue certifications that regulators accept as proof of compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">Enterprises can cite CSOAI certification in regulatory filings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why ISO 17065 Matters */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Why ISO 17065 Matters</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* For Regulators */}
              <Card className="p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Regulators</h3>
                <p className="text-gray-700 mb-4">
                  Regulators can trust CSOAI's certifications because they're verified against international standards.
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>✓ No need to audit CSOAI's processes</li>
                  <li>✓ ISO 17065 certification proves competence</li>
                  <li>✓ Can rely on CSOAI audits for enforcement</li>
                  <li>✓ Reduces regulatory burden</li>
                </ul>
              </Card>

              {/* For Enterprises */}
              <Card className="p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Enterprises</h3>
                <p className="text-gray-700 mb-4">
                  Enterprises can cite CSOAI ISO 17065 certification in regulatory filings.
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>✓ Proves audits meet international standards</li>
                  <li>✓ Strengthens regulatory compliance claims</li>
                  <li>✓ Demonstrates due diligence</li>
                  <li>✓ Reduces compliance risk</li>
                </ul>
              </Card>

              {/* For CSOAI */}
              <Card className="p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For CSOAI</h3>
                <p className="text-gray-700 mb-4">
                  ISO 17065 certification is the foundation for all other regulatory recognitions.
                </p>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>✓ Foundation for EU Notified Body</li>
                  <li>✓ Basis for NIST recognition</li>
                  <li>✓ Gateway to TC260 alignment</li>
                  <li>✓ First step to global standard</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ISO 17065 Requirements */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">ISO 17065 Requirements</h2>

            <div className="space-y-8">
              {/* Requirement 1: Competence */}
              <Card className="p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">1. Competence</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  CSOAI must demonstrate that trainers and examiners have documented expertise in AI safety, compliance frameworks, and audit methodologies.
                </p>
                <div className="bg-emerald-50 dark:bg-emerald-950 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">What We Do:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Maintain detailed trainer qualification profiles</li>
                    <li>✓ Document credentials, experience, and continuing education</li>
                    <li>✓ Require annual competency assessments</li>
                    <li>✓ Maintain training records for all analysts</li>
                  </ul>
                </div>
              </Card>

              {/* Requirement 2: Impartiality */}
              <Card className="p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">2. Impartiality</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  CSOAI must prove that decisions are made independently, without bias or conflicts of interest.
                </p>
                <div className="bg-emerald-50 dark:bg-emerald-950 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">What We Do:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Use 33-Agent Byzantine consensus for all audit decisions</li>
                    <li>✓ Publish all voting records publicly</li>
                    <li>✓ Demonstrate that no single agent or provider can override the group</li>
                    <li>✓ Maintain independence from AI vendors</li>
                  </ul>
                </div>
              </Card>

              {/* Requirement 3: Consistency */}
              <Card className="p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">3. Consistency</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  CSOAI must show that all analysts follow identical evaluation criteria.
                </p>
                <div className="bg-emerald-50 dark:bg-emerald-950 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">What We Do:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Document our audit methodology in detail</li>
                    <li>✓ Provide audit samples showing consistent scoring</li>
                    <li>✓ Conduct regular quality assurance reviews</li>
                    <li>✓ Maintain audit templates and checklists</li>
                  </ul>
                </div>
              </Card>

              {/* Requirement 4: Confidentiality */}
              <Card className="p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">4. Confidentiality</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  CSOAI must protect client data while maintaining transparency.
                </p>
                <div className="bg-emerald-50 dark:bg-emerald-950 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">What We Do:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Encrypt all client data at rest and in transit</li>
                    <li>✓ Anonymize data for the Watchdog hub</li>
                    <li>✓ Maintain separate databases for confidential and public data</li>
                    <li>✓ Comply with GDPR, CCPA, and other privacy regulations</li>
                  </ul>
                </div>
              </Card>

              {/* Requirement 5: Traceability */}
              <Card className="p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-gray-900">5. Traceability</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Every certification decision must be documented and traceable.
                </p>
                <div className="bg-emerald-50 dark:bg-emerald-950 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">What We Do:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Maintain complete audit trails</li>
                    <li>✓ Keep voting records for all decisions</li>
                    <li>✓ Enable regulators to verify decisions</li>
                    <li>✓ Provide detailed audit reports</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Implementation Timeline</h2>

            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q1 2025</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Documentation</h3>
                  <p className="text-gray-700">
                    Compile all required documentation including quality procedures, trainer qualifications, audit methodologies, and confidentiality policies.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q2 2025</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Internal Audit</h3>
                  <p className="text-gray-700">
                    Conduct internal audit to verify compliance with ISO 17065 requirements. Address any gaps identified.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q3 2025</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">External Assessment</h3>
                  <p className="text-gray-700">
                    Independent auditor conducts external assessment of CSOAI's compliance with ISO 17065.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q4 2025</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Certification</h3>
                  <p className="text-gray-700">
                    ISO 17065 certification awarded. CSOAI becomes formally recognized accreditation body.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <Card className="p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-xl font-bold text-gray-900 mb-3">What's the cost of ISO 17065 certification?</h3>
                <p className="text-gray-700">
                  Approximately $50,000-75,000 including consultant fees, documentation, and external assessment. This is a one-time cost.
                </p>
              </Card>

              <Card className="p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-xl font-bold text-gray-900 mb-3">How long does ISO 17065 certification take?</h3>
                <p className="text-gray-700">
                  Approximately 12 months from documentation to final certification. This includes internal audit, external assessment, and certification approval.
                </p>
              </Card>

              <Card className="p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Is ISO 17065 certification mandatory?</h3>
                <p className="text-gray-700">
                  No, but it's the foundation for all other regulatory recognitions. Without ISO 17065, CSOAI cannot pursue EU Notified Body, NIST, or TC260 recognition.
                </p>
              </Card>

              <Card className="p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-xl font-bold text-gray-900 mb-3">How often must CSOAI be re-audited?</h3>
                <p className="text-gray-700">
                  ISO 17065 certification requires annual surveillance audits and full re-certification every 3 years. This ensures ongoing compliance.
                </p>
              </Card>

              <Card className="p-8 border-2 border-emerald-200 dark:border-emerald-800">
                <h3 className="text-xl font-bold text-gray-900 mb-3">What happens if CSOAI fails the audit?</h3>
                <p className="text-gray-700">
                  Non-conformances must be addressed within a specified timeframe. Major non-conformances could delay certification. CSOAI would need to remediate and re-audit.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600 dark:bg-emerald-700 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Verify Your Compliance?</h2>
            <p className="text-lg text-blue-100 mb-8">
              Request an audit from CSOAI and get your AI systems certified by an internationally recognized accreditation body.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Request Audit
              </Button>
              <Link href="/regulatory-authority">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                  Back to Regulatory Authority
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
