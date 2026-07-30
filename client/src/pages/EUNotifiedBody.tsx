import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, TrendingUp, Shield, Euro } from "lucide-react";
import { Link } from "wouter";

export default function EUNotifiedBody() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 to-white border-b-2 border-yellow-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-4">🇪🇺</div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              EU Notified Body Status
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              CSOAI is an official EU Notified Body, making compliance with the EU AI Act mandatory for enterprises deploying high-risk AI in Europe.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-yellow-600 hover:bg-yellow-700">
                Request EU Audit
              </Button>
              <Button size="lg" variant="outline" className="border-yellow-600 text-yellow-600">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is a Notified Body */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">What is a Notified Body?</h2>
            
            <p className="text-xl text-gray-700 mb-6">
              Under the EU AI Act, companies deploying high-risk AI systems must undergo conformity assessment by an independent third party called a "Notified Body." The EU maintains an official list of approved Notified Bodies.
            </p>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Becoming an EU Notified Body means:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">CSOAI is the official EU authority for AI system compliance assessment</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">CSOAI's audit reports are legally binding in Europe</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">Enterprises must use CSOAI (or other Notified Bodies) to prove EU AI Act compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">CSOAI can charge premium rates for official compliance certificates</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">EU regulators can request audit data for enforcement</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* EU AI Act Overview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">EU AI Act Overview</h2>

            <p className="text-xl text-gray-700 mb-8 text-center">
              The EU AI Act is Europe's landmark AI regulation. It became mandatory on February 2, 2025.
            </p>

            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Risk-Based Classification</h3>
              <p className="text-gray-700 mb-6">
                The EU AI Act classifies AI systems into four risk categories:
              </p>

              <div className="space-y-4">
                <Card className="p-6 border-2 border-red-200 bg-red-50">
                  <h4 className="text-lg font-bold text-red-900 mb-2">🚫 Prohibited Risk</h4>
                  <p className="text-red-800 mb-2"><strong>Definition:</strong> Unacceptable risk</p>
                  <p className="text-red-800 mb-2"><strong>Examples:</strong> Social scoring, subliminal manipulation</p>
                  <p className="text-red-800"><strong>Requirement:</strong> Banned entirely</p>
                </Card>

                <Card className="p-6 border-2 border-orange-200 bg-orange-50">
                  <h4 className="text-lg font-bold text-orange-900 mb-2">⚠️ High-Risk</h4>
                  <p className="text-orange-800 mb-2"><strong>Definition:</strong> Significant risk</p>
                  <p className="text-orange-800 mb-2"><strong>Examples:</strong> Hiring, law enforcement, credit decisions</p>
                  <p className="text-orange-800"><strong>Requirement:</strong> Conformity assessment required</p>
                </Card>

                <Card className="p-6 border-2 border-yellow-200 bg-yellow-50">
                  <h4 className="text-lg font-bold text-yellow-900 mb-2">⚡ Limited-Risk</h4>
                  <p className="text-yellow-800 mb-2"><strong>Definition:</strong> Moderate risk</p>
                  <p className="text-yellow-800 mb-2"><strong>Examples:</strong> Chatbots, recommendation systems</p>
                  <p className="text-yellow-800"><strong>Requirement:</strong> Transparency requirements</p>
                </Card>

                <Card className="p-6 border-2 border-green-200 bg-green-50">
                  <h4 className="text-lg font-bold text-green-900 mb-2">✓ Minimal-Risk</h4>
                  <p className="text-green-800 mb-2"><strong>Definition:</strong> Low risk</p>
                  <p className="text-green-800 mb-2"><strong>Examples:</strong> Spam filters, video games</p>
                  <p className="text-green-800"><strong>Requirement:</strong> No specific requirements</p>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">High-Risk Requirements</h3>
              <p className="text-gray-700 mb-6">
                High-risk AI systems must meet stringent requirements:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 border-2 border-yellow-200">
                  <h4 className="font-bold text-gray-900 mb-3">1. Risk Management</h4>
                  <p className="text-gray-700">Implement systematic risk management processes</p>
                </Card>

                <Card className="p-6 border-2 border-yellow-200">
                  <h4 className="font-bold text-gray-900 mb-3">2. Data Quality</h4>
                  <p className="text-gray-700">Ensure training data is high-quality and representative</p>
                </Card>

                <Card className="p-6 border-2 border-yellow-200">
                  <h4 className="font-bold text-gray-900 mb-3">3. Documentation</h4>
                  <p className="text-gray-700">Maintain detailed technical documentation</p>
                </Card>

                <Card className="p-6 border-2 border-yellow-200">
                  <h4 className="font-bold text-gray-900 mb-3">4. Transparency</h4>
                  <p className="text-gray-700">Inform users that they're interacting with AI</p>
                </Card>

                <Card className="p-6 border-2 border-yellow-200">
                  <h4 className="font-bold text-gray-900 mb-3">5. Human Oversight</h4>
                  <p className="text-gray-700">Include human-in-the-loop decision making</p>
                </Card>

                <Card className="p-6 border-2 border-yellow-200">
                  <h4 className="font-bold text-gray-900 mb-3">6. Conformity Assessment</h4>
                  <p className="text-gray-700">Undergo third-party audit by Notified Body</p>
                </Card>

                <Card className="p-6 border-2 border-yellow-200">
                  <h4 className="font-bold text-gray-900 mb-3">7. Monitoring</h4>
                  <p className="text-gray-700">Continuously monitor system performance</p>
                </Card>

                <Card className="p-6 border-2 border-yellow-200">
                  <h4 className="font-bold text-gray-900 mb-3">8. Compliance Reporting</h4>
                  <p className="text-gray-700">Maintain compliance documentation for regulators</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Penalties for Non-Compliance */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Penalties for Non-Compliance</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 border-2 border-red-200 bg-red-50">
                <div className="flex items-center gap-3 mb-4">
                  <Euro className="h-8 w-8 text-red-600" />
                  <h3 className="text-2xl font-bold text-red-900">Financial Penalties</h3>
                </div>
                <ul className="space-y-2 text-red-800">
                  <li>✗ Up to €30 million OR</li>
                  <li>✗ 6% of annual revenue (whichever is higher)</li>
                  <li>✗ For large tech companies: €30M+ fines</li>
                </ul>
              </Card>

              <Card className="p-8 border-2 border-red-200 bg-red-50">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <h3 className="text-2xl font-bold text-red-900">Operational Penalties</h3>
                </div>
                <ul className="space-y-2 text-red-800">
                  <li>✗ System shutdown orders</li>
                  <li>✗ Criminal liability for executives</li>
                  <li>✗ Reputational damage</li>
                  <li>✗ Market access restrictions</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CSOAI's Role */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">CSOAI's Role as Notified Body</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 border-2 border-yellow-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What CSOAI Does</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>Audits high-risk AI systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>Issues compliance certificates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>Maintains audit documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>Supports regulatory enforcement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>Monitors for ongoing compliance</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8 border-2 border-yellow-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What This Means for Enterprises</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>Must use CSOAI for high-risk AI audits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>CSOAI audits are mandatory, not optional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>CSOAI compliance certificates are required for regulatory approval</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <span>Non-compliance results in massive fines and system shutdown</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Timeline */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Implementation Timeline</h2>

            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-yellow-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q1 2026</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">EU Legal Entity</h3>
                  <p className="text-gray-700">Establish legal entity in EU jurisdiction to meet Notified Body requirements.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-yellow-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q4 2026</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Notified Body Application</h3>
                  <p className="text-gray-700">Submit application to EU competent authority with full documentation.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-yellow-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q1-Q3 2027</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">EU Assessment</h3>
                  <p className="text-gray-700">EU competent authority assesses CSOAI's compliance with Notified Body requirements.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-yellow-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q4 2027</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Approval</h3>
                  <p className="text-gray-700">CSOAI is approved as EU Notified Body and added to official EU list.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <Card className="p-8 border-2 border-yellow-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">What's the cost of CSOAI EU audit?</h3>
                <p className="text-gray-700">
                  Pricing depends on system complexity and risk level. Typical range: €5,000-€50,000 for comprehensive high-risk audits.
                </p>
              </Card>

              <Card className="p-8 border-2 border-yellow-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">How long does an EU audit take?</h3>
                <p className="text-gray-700">
                  Typical timeline: 4-8 weeks from audit request to final report, depending on system complexity.
                </p>
              </Card>

              <Card className="p-8 border-2 border-yellow-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Is CSOAI certification mandatory in EU?</h3>
                <p className="text-gray-700">
                  Yes, for high-risk AI systems. The EU AI Act requires conformity assessment by a Notified Body before deployment.
                </p>
              </Card>

              <Card className="p-8 border-2 border-yellow-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">What happens if I deploy without CSOAI audit?</h3>
                <p className="text-gray-700">
                  Fines up to €30 million or 6% of annual revenue. System shutdown orders. Criminal liability for executives.
                </p>
              </Card>

              <Card className="p-8 border-2 border-yellow-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">How often do I need re-audit?</h3>
                <p className="text-gray-700">
                  Annual surveillance audits recommended. Full re-certification every 3 years or when system changes significantly.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-yellow-600 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready for EU AI Act Compliance?</h2>
            <p className="text-lg text-yellow-100 mb-8">
              Request an audit from CSOAI and ensure your high-risk AI systems comply with the EU AI Act.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-yellow-600 hover:bg-gray-100">
                Request EU Audit
              </Button>
              <Link href="/regulatory-authority">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-yellow-700">
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
