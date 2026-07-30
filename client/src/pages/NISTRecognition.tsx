import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, TrendingUp, Shield } from "lucide-react";
import { Link } from "wouter";

export default function NISTRecognition() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-white border-b-2 border-red-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-4">🇺🇸</div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              NIST Recognition
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              CSOAI is recognized by NIST as aligned with the AI Risk Management Framework, gaining US government credibility.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                Request NIST Audit
              </Button>
              <Button size="lg" variant="outline" className="border-red-600 text-red-600">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is NIST */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">What is NIST?</h2>
            
            <p className="text-xl text-gray-700 mb-6">
              NIST (National Institute of Standards and Technology) is the US government agency that develops standards and best practices. While NIST AI RMF is voluntary (not mandatory like EU AI Act), US government agencies and enterprises increasingly require NIST compliance.
            </p>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">NIST recognition means:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">CSOAI is listed as an official NIST-recognized auditing body</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">US government agencies can use CSOAI audits for procurement compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">US enterprises cite CSOAI audits in regulatory filings</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">CSOAI gains credibility with US regulators and enterprises</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NIST AI RMF */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">NIST AI Risk Management Framework</h2>

            <p className="text-xl text-gray-700 mb-8 text-center">
              The NIST AI RMF provides guidance for managing risks from AI systems. It's organized around four functions:
            </p>

            <div className="space-y-8">
              {/* GOVERN */}
              <Card className="p-8 border-2 border-red-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">1. GOVERN</h3>
                <p className="text-gray-700 mb-4">
                  Establish leadership and governance structures for AI risk management.
                </p>
                <div className="bg-red-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Questions:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Who is responsible for AI risk management?</li>
                    <li>• How are decisions made about AI system deployment?</li>
                    <li>• What processes ensure accountability?</li>
                    <li>• How are stakeholders involved in decisions?</li>
                  </ul>
                </div>
                <p className="text-gray-700"><strong>CSOAI's Role:</strong> Audit governance structures. Verify that organizations have clear leadership, defined processes, and stakeholder involvement.</p>
              </Card>

              {/* MAP */}
              <Card className="p-8 border-2 border-red-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">2. MAP</h3>
                <p className="text-gray-700 mb-4">
                  Identify and characterize AI risks.
                </p>
                <div className="bg-red-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Questions:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• What are the potential harms from this AI system?</li>
                    <li>• Who could be affected by failures?</li>
                    <li>• What are the failure modes?</li>
                    <li>• What's the likelihood and severity of each risk?</li>
                  </ul>
                </div>
                <p className="text-gray-700"><strong>CSOAI's Role:</strong> Help organizations identify risks. Categorize risks by severity. Prioritize high-impact risks.</p>
              </Card>

              {/* MEASURE */}
              <Card className="p-8 border-2 border-red-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">3. MEASURE</h3>
                <p className="text-gray-700 mb-4">
                  Assess and monitor AI risks.
                </p>
                <div className="bg-red-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Questions:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• How do we measure whether risks are occurring?</li>
                    <li>• What metrics indicate system performance?</li>
                    <li>• How do we detect failures?</li>
                    <li>• How do we monitor for drift or degradation?</li>
                  </ul>
                </div>
                <p className="text-gray-700"><strong>CSOAI's Role:</strong> Define measurement approaches. Establish monitoring systems. Track performance metrics.</p>
              </Card>

              {/* MANAGE */}
              <Card className="p-8 border-2 border-red-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">4. MANAGE</h3>
                <p className="text-gray-700 mb-4">
                  Mitigate identified risks.
                </p>
                <div className="bg-red-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Questions:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• What actions reduce identified risks?</li>
                    <li>• How do we implement mitigations?</li>
                    <li>• How do we verify that mitigations work?</li>
                    <li>• What's the residual risk after mitigation?</li>
                  </ul>
                </div>
                <p className="text-gray-700"><strong>CSOAI's Role:</strong> Recommend mitigations. Verify implementation. Assess residual risk.</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trustworthy AI */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">NIST Trustworthy AI Characteristics</h2>

            <p className="text-xl text-gray-700 mb-8 text-center">
              NIST defines six characteristics of trustworthy AI:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-2 border-red-200">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Accountable</h4>
                <p className="text-gray-700 text-sm mb-3">Clear responsibility for decisions and outcomes</p>
                <p className="text-gray-600 text-xs"><strong>CSOAI:</strong> Verify governance and documentation</p>
              </Card>

              <Card className="p-6 border-2 border-red-200">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Transparent</h4>
                <p className="text-gray-700 text-sm mb-3">Users understand how AI makes decisions</p>
                <p className="text-gray-600 text-xs"><strong>CSOAI:</strong> Check explainability and documentation</p>
              </Card>

              <Card className="p-6 border-2 border-red-200">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Explainable</h4>
                <p className="text-gray-700 text-sm mb-3">Decisions can be explained in human terms</p>
                <p className="text-gray-600 text-xs"><strong>CSOAI:</strong> Evaluate model interpretability</p>
              </Card>

              <Card className="p-6 border-2 border-red-200">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Fair & Impartial</h4>
                <p className="text-gray-700 text-sm mb-3">Decisions don't discriminate against protected groups</p>
                <p className="text-gray-600 text-xs"><strong>CSOAI:</strong> Test for bias and fairness</p>
              </Card>

              <Card className="p-6 border-2 border-red-200">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Resilient & Robust</h4>
                <p className="text-gray-700 text-sm mb-3">System performs reliably under stress</p>
                <p className="text-gray-600 text-xs"><strong>CSOAI:</strong> Test edge cases and failure modes</p>
              </Card>

              <Card className="p-6 border-2 border-red-200">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Privacy-Preserving</h4>
                <p className="text-gray-700 text-sm mb-3">User data is protected</p>
                <p className="text-gray-600 text-xs"><strong>CSOAI:</strong> Verify data protection measures</p>
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
                  <div className="w-24 h-24 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q1 2026</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">NIST Engagement</h3>
                  <p className="text-gray-700">Initiate discussions with NIST about recognition pathway.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q2 2026</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Documentation</h3>
                  <p className="text-gray-700">Prepare comprehensive documentation of CSOAI alignment with NIST RMF.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q3 2026</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pilot Program</h3>
                  <p className="text-gray-700">Conduct pilot audits using NIST RMF with US government agencies.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-red-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q4 2026</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Recognition</h3>
                  <p className="text-gray-700">NIST officially recognizes CSOAI as aligned with AI RMF.</p>
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
              <Card className="p-8 border-2 border-red-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Is NIST recognition mandatory?</h3>
                <p className="text-gray-700">
                  No, NIST RMF is voluntary. However, US government agencies increasingly require it for procurement, and enterprises use it for competitive advantage.
                </p>
              </Card>

              <Card className="p-8 border-2 border-red-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">How is NIST different from EU AI Act?</h3>
                <p className="text-gray-700">
                  EU AI Act is mandatory and legally binding. NIST is voluntary guidance. However, both focus on risk management and trustworthy AI.
                </p>
              </Card>

              <Card className="p-8 border-2 border-red-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Can I use CSOAI for both EU and NIST compliance?</h3>
                <p className="text-gray-700">
                  Yes. CSOAI audits cover both EU AI Act requirements and NIST RMF alignment, providing comprehensive compliance.
                </p>
              </Card>

              <Card className="p-8 border-2 border-red-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">What's the cost of NIST audit?</h3>
                <p className="text-gray-700">
                  Similar to EU audits: €5,000-€50,000 depending on system complexity. NIST audits can often be combined with EU audits for efficiency.
                </p>
              </Card>

              <Card className="p-8 border-2 border-red-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">How often do I need NIST re-audit?</h3>
                <p className="text-gray-700">
                  Annual surveillance audits recommended. Full re-certification every 2-3 years or when system changes significantly.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-600 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready for NIST RMF Compliance?</h2>
            <p className="text-lg text-red-100 mb-8">
              Request an audit from CSOAI and align your AI systems with NIST best practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100">
                Request NIST Audit
              </Button>
              <Link href="/regulatory-authority">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-red-700">
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
