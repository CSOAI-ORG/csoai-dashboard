/**
 * CSOAI Training Page - Professional Redesign
 * Clear course benefits, learning outcomes, and compelling content
 */

import { Link } from "wouter";
import { BookOpen, Clock, CheckCircle, Award, TrendingUp, Shield, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FAQ, trainingFAQs } from "@/components/FAQ";

export default function TrainingV2() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-emerald-50 to-white dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-white py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
              <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">100% Free Training</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Become an AI Safety Analyst
            </h1>
            
            <p className="text-xl text-gray-800 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Master the three major global AI safety frameworks—EU AI Act, NIST AI RMF, and ISO 42001. Get certified and start monitoring AI systems for compliance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/courses?filter=free">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-semibold">
                  Start Free Training
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/certification">
                <Button size="lg" variant="outline" className="border-2 border-emerald-500 text-gray-900 dark:text-white hover:bg-emerald-500/10 px-8 py-6 text-lg font-semibold">
                  View Certification
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-emerald-500/10 backdrop-blur-sm rounded-lg p-4 border border-emerald-500/20">
                <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">5 Modules</div>
                <div className="text-gray-700 dark:text-gray-300">Comprehensive Curriculum</div>
              </div>
              <div className="bg-emerald-500/10 backdrop-blur-sm rounded-lg p-4 border border-emerald-500/20">
                <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">~4 Hours</div>
                <div className="text-gray-700 dark:text-gray-300">Total Learning Time</div>
              </div>
              <div className="bg-emerald-500/10 backdrop-blur-sm rounded-lg p-4 border border-emerald-500/20">
                <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">Self-Paced</div>
                <div className="text-gray-700 dark:text-gray-300">Learn Anytime, Anywhere</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Training */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why This Training Matters
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI Safety Analyst is projected to become one of the top 10 jobs by 2045. Get ahead now with industry-recognized training.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-2 hover:border-emerald-500 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">High Demand</h3>
              <p className="text-gray-600 leading-relaxed">
                As AI proliferates globally, governments and enterprises need certified analysts to ensure compliance. The EU AI Act alone creates massive demand for safety professionals.
              </p>
            </Card>

            <Card className="p-8 border-2 hover:border-emerald-500 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Industry Standards</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn the three major frameworks recognized worldwide: EU AI Act for Europe, NIST AI RMF for the US, and ISO 42001 for international organizations.
              </p>
            </Card>

            <Card className="p-8 border-2 hover:border-emerald-500 hover:shadow-lg transition-all">
              <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Reviewing</h3>
              <p className="text-gray-600 leading-relaxed">
                After certification, start reviewing AI systems. Work remotely, set your own hours, and contribute to global AI safety.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Training Modules */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Training Curriculum
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Five comprehensive modules covering AI safety fundamentals, global frameworks, and practical analyst skills
            </p>
          </div>

          <div className="space-y-6">
            {/* Module 1 */}
            <Card className="p-8 hover:shadow-lg transition-all">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Introduction to AI Safety</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">30 minutes</span>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Understand why AI safety matters, the risks of unregulated AI systems, and the global regulatory landscape. Learn about major AI incidents, the need for oversight, and how Watchdog Analysts protect humanity.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">What You'll Learn:</div>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>The history of AI safety concerns and major incidents</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Why governments and enterprises need AI safety oversight</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>The role of Watchdog Analysts in protecting the public</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Module 2 */}
            <Card className="p-8 hover:shadow-lg transition-all">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Understanding the EU AI Act</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">45 minutes</span>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Master the EU's comprehensive AI regulation, including risk categories (unacceptable, high, limited, minimal), compliance requirements, and penalties up to €35M. Learn how to assess AI systems against EU standards.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">What You'll Learn:</div>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>The four risk categories and how to classify AI systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Compliance obligations for high-risk AI systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Documentation requirements and transparency obligations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Module 3 */}
            <Card className="p-8 hover:shadow-lg transition-all">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">NIST AI Risk Management Framework</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">40 minutes</span>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Learn the US National Institute of Standards and Technology's AI RMF, including the four core functions: Govern, Map, Measure, and Manage. Understand how to apply this framework to real-world AI systems.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">What You'll Learn:</div>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>The four core functions and how they work together</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Risk assessment methodologies for AI systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Practical application of NIST AI RMF in enterprise settings</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Module 4 */}
            <Card className="p-8 hover:shadow-lg transition-all">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold">
                  4
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Identifying AI Bias and Fairness Issues</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">50 minutes</span>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Recognize different types of AI bias (data bias, algorithmic bias, deployment bias) and learn to evaluate fairness across demographic groups. Understand how bias leads to discrimination and how to detect it.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">What You'll Learn:</div>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Types of AI bias and their real-world impact</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Fairness metrics and how to evaluate them</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Case studies of biased AI systems and their consequences</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Module 5 */}
            <Card className="p-8 hover:shadow-lg transition-all">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-2xl font-bold">
                  5
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">Making Decisions as a Watchdog Analyst</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">45 minutes</span>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Learn the decision-making framework for reviewing AI safety cases. Practice with real scenarios, understand how to write clear reports, and prepare for working with the 33-Agent Council system.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="font-semibold text-gray-900 mb-2">What You'll Learn:</div>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>The Watchdog Analyst decision-making framework</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>How to write clear, actionable safety reports</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Working with the 33-Agent Byzantine consensus system</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ 
        title="Training FAQ"
        subtitle="Common questions about our AI safety training program"
        items={trainingFAQs}
        className="bg-gray-50"
      />

      {/* Next Steps */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Training?
          </h2>
          <p className="text-xl text-green-50 mb-12 max-w-2xl mx-auto">
            Complete all five modules, pass the certification exam, and start earning as an AI Safety Analyst. Your journey begins now.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                Begin Module 1
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/certification">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold">
                Learn About Certification
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
