import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, TrendingUp, Shield } from "lucide-react";
import { Link } from "wouter";

export default function TC260Alignment() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-white border-b-2 border-orange-200">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-4">🇨🇳</div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              TC260 Alignment
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              CSOAI aligns with China's AI safety standards, enabling compliance for systems deployed in China.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                Request China Audit
              </Button>
              <Button size="lg" variant="outline" className="border-orange-600 text-orange-600">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* What is TC260 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">What is TC260?</h2>
            
            <p className="text-xl text-gray-700 mb-6">
              TC260 is China's standardization committee for information security. China's AI safety standards are increasingly mandatory for companies operating in China or serving Chinese users.
            </p>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">TC260 recognition means:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">CSOAI is recognized as compliant with Chinese AI safety standards</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">Chinese enterprises can use CSOAI audits for compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">CSOAI gains access to Chinese market</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-lg text-gray-700">CSOAI becomes truly global standard</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* China's AI Safety Requirements */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">China's AI Safety Requirements</h2>

            <p className="text-xl text-gray-700 mb-8 text-center">
              China's approach to AI safety emphasizes transparency, security, content safety, privacy, and fairness:
            </p>

            <div className="space-y-8">
              {/* Algorithm Transparency */}
              <Card className="p-8 border-2 border-orange-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Algorithm Transparency</h3>
                <p className="text-gray-700 mb-4">
                  Companies must disclose how their AI systems make decisions.
                </p>
                <div className="bg-orange-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Requirements:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Document algorithm design and training process</li>
                    <li>✓ Explain how the system makes decisions</li>
                    <li>✓ Disclose data sources and training data</li>
                    <li>✓ Provide technical specifications</li>
                  </ul>
                </div>
                <p className="text-gray-700"><strong>CSOAI's Role:</strong> Verify algorithm transparency. Ensure documentation is complete and accurate.</p>
              </Card>

              {/* Data Security */}
              <Card className="p-8 border-2 border-orange-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Data Security</h3>
                <p className="text-gray-700 mb-4">
                  Companies must protect user data from unauthorized access.
                </p>
                <div className="bg-orange-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Requirements:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Encrypt data at rest and in transit</li>
                    <li>✓ Implement access controls</li>
                    <li>✓ Maintain data retention policies</li>
                    <li>✓ Comply with data localization requirements</li>
                  </ul>
                </div>
                <p className="text-gray-700"><strong>CSOAI's Role:</strong> Audit data security measures. Verify encryption and access controls.</p>
              </Card>

              {/* Content Safety */}
              <Card className="p-8 border-2 border-orange-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Content Safety</h3>
                <p className="text-gray-700 mb-4">
                  AI systems must not generate harmful, illegal, or prohibited content.
                </p>
                <div className="bg-orange-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Requirements:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Implement content filtering</li>
                    <li>✓ Monitor for prohibited content</li>
                    <li>✓ Respond to government takedown requests</li>
                    <li>✓ Maintain content moderation logs</li>
                  </ul>
                </div>
                <p className="text-gray-700"><strong>CSOAI's Role:</strong> Test content safety measures. Verify filtering effectiveness.</p>
              </Card>

              {/* User Privacy */}
              <Card className="p-8 border-2 border-orange-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">4. User Privacy</h3>
                <p className="text-gray-700 mb-4">
                  Companies must protect user privacy and comply with privacy regulations.
                </p>
                <div className="bg-orange-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Requirements:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Obtain user consent for data collection</li>
                    <li>✓ Provide privacy policies</li>
                    <li>✓ Enable data deletion requests</li>
                    <li>✓ Minimize data collection</li>
                  </ul>
                </div>
                <p className="text-gray-700"><strong>CSOAI's Role:</strong> Verify privacy compliance. Audit consent mechanisms.</p>
              </Card>

              {/* Bias Prevention */}
              <Card className="p-8 border-2 border-orange-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">5. Bias Prevention</h3>
                <p className="text-gray-700 mb-4">
                  AI systems must not discriminate against protected groups.
                </p>
                <div className="bg-orange-50 p-6 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Requirements:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Test for bias in training data</li>
                    <li>✓ Monitor for discriminatory outcomes</li>
                    <li>✓ Implement fairness measures</li>
                    <li>✓ Document bias mitigation efforts</li>
                  </ul>
                </div>
                <p className="text-gray-700"><strong>CSOAI's Role:</strong> Conduct bias testing. Verify fairness measures.</p>
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
                  <div className="w-24 h-24 bg-orange-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q1 2027</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">China Strategy</h3>
                  <p className="text-gray-700">Develop comprehensive strategy for TC260 alignment and China market entry.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-orange-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q2 2027</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Documentation</h3>
                  <p className="text-gray-700">Prepare comprehensive documentation of CSOAI alignment with TC260 standards.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-orange-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q3 2027</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Partnerships</h3>
                  <p className="text-gray-700">Establish partnerships with Chinese regulators and enterprises.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-orange-600 text-white rounded-lg flex items-center justify-center font-bold text-center">
                    <span>Q4 2027</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Recognition</h3>
                  <p className="text-gray-700">CSOAI achieves TC260 recognition and begins serving Chinese market.</p>
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
              <Card className="p-8 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Is TC260 compliance mandatory in China?</h3>
                <p className="text-gray-700">
                  Yes, for AI systems deployed in China or serving Chinese users. TC260 standards are increasingly enforced by Chinese regulators.
                </p>
              </Card>

              <Card className="p-8 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">What's the cost of TC260 audit?</h3>
                <p className="text-gray-700">
                  Approximately ¥50,000-¥300,000 (USD $7,000-$42,000) depending on system complexity and data localization requirements.
                </p>
              </Card>

              <Card className="p-8 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Do I need separate audits for EU, US, and China?</h3>
                <p className="text-gray-700">
                  CSOAI can conduct combined audits covering all three frameworks. This is more efficient and cost-effective than separate audits.
                </p>
              </Card>

              <Card className="p-8 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">What about data localization in China?</h3>
                <p className="text-gray-700">
                  China requires data localization for personal information. CSOAI audits verify that companies comply with data residency requirements.
                </p>
              </Card>

              <Card className="p-8 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">How often do I need TC260 re-audit?</h3>
                <p className="text-gray-700">
                  Annual surveillance audits recommended. Full re-certification every 2-3 years or when system changes significantly.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready for China Market?</h2>
            <p className="text-lg text-orange-100 mb-8">
              Request an audit from CSOAI and ensure your AI systems comply with TC260 standards for the Chinese market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                Request China Audit
              </Button>
              <Link href="/regulatory-authority">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-orange-700">
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
