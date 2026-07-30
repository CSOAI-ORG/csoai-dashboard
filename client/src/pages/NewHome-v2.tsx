/**
 * CSOAI Homepage - Complete Professional Redesign
 * Clear value proposition, human-quality content, professional layout
 */

import { Link } from "wouter";
import { Shield, CheckCircle, ArrowRight, Users, Building2, Globe2, TrendingUp, Award, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AnimatedParticles from "@/components/AnimatedParticles";
import PlatformTour from "@/components/PlatformTour";

export default function NewHomeV2() {
  return (
    <>
      <PlatformTour />
      <div className="min-h-screen bg-white">
        
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-emerald-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: "url(/hero-epic.png)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-emerald-50/70 to-white/80 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/95" />
          <AnimatedParticles />
          
          <div className="relative z-10 container mx-auto px-6 py-20 text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Leading AI Safety Certification Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              The Global Standard for<br />
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                AI Safety Certification
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
              We train, certify, and employ AI Safety Analysts who monitor artificial intelligence systems for compliance and safety—protecting humanity while creating careers.
            </p>
            
            <p className="text-lg text-gray-700 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
              As AI transforms every industry, the demand for safety oversight is exploding. Join the profession projected to become one of the top 10 jobs by 2045.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/training">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all">
                  Start Free Training
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-2 border-emerald-500 text-gray-900 dark:text-white hover:bg-emerald-500/10 px-8 py-6 text-lg font-semibold rounded-lg">
                  Learn More
                </Button>
              </Link>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">100% Free</div>
                <div className="text-gray-700 dark:text-gray-400">Training & Certification</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">3 Frameworks</div>
                <div className="text-gray-700 dark:text-gray-400">EU AI Act · NIST · ISO 42001</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">100% Remote</div>
                <div className="text-gray-700 dark:text-gray-400">Work From Anywhere</div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do - Clear Value Proposition */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                What is CSOAI?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                CSOAI is the world's first comprehensive AI safety platform connecting three critical needs: training safety professionals, ensuring AI compliance, and protecting the public.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="p-8 border-2 hover:border-green-500 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Users className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Individuals</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Free training on EU AI Act, NIST, and ISO standards. Get certified, find remote work, and monitor AI systems for safety and compliance.
                </p>
                <Link href="/training">
                  <a className="text-green-600 font-semibold hover:text-green-700 flex items-center">
                    Start Training <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Link>
              </Card>

              <Card className="p-8 border-2 hover:border-green-500 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Building2 className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Enterprises</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Register AI systems, get automated compliance assessments, and demonstrate transparency. Avoid EU AI Act fines up to €35M and build customer trust.
                </p>
                <Link href="/enterprise">
                  <a className="text-green-600 font-semibold hover:text-green-700 flex items-center">
                    Explore Solutions <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Link>
              </Card>

              <Card className="p-8 border-2 hover:border-green-500 hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <Globe2 className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">For Society</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Public incident reporting, transparent AI Council decisions, and real-time compliance monitoring. Hold AI systems accountable to protect humanity.
                </p>
                <Link href="/watchdog">
                  <a className="text-green-600 font-semibold hover:text-green-700 flex items-center">
                    Report Incident <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works - Simple 3-Step Process */}
        <section className="py-24 bg-gray-50">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Three simple steps to start your career as an AI Safety Analyst
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Train for Free</h3>
                <p className="text-gray-600 leading-relaxed">
                  Complete comprehensive courses on AI safety frameworks including EU AI Act, NIST AI RMF, and ISO 42001. Learn at your own pace, 100% online.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Certified</h3>
                <p className="text-gray-600 leading-relaxed">
                  Pass industry-standard certification exams to become an official CSOAI Watchdog Analyst. Your credential is recognized globally by enterprises and governments.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                  3
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Reviewing</h3>
                <p className="text-gray-600 leading-relaxed">
                  Browse available positions, apply with your certification, and start monitoring AI systems. Work remotely and set your own hours.
                </p>
              </div>
            </div>

            <div className="text-center mt-16">
              <Link href="/training">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg font-semibold rounded-lg">
                  Begin Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why CSOAI - Differentiation */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why CSOAI?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The only platform combining human expertise with Byzantine fault-tolerant AI consensus
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">33-Agent Byzantine Consensus</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Every safety decision requires 23 of 33 AI agents (across GPT-4, Claude, Gemini) to agree. No single provider can manipulate outcomes. Human analysts provide final oversight.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-8">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Transparency</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Every AI system, every incident, every Council decision is publicly visible. Real-time compliance scores, voting records, and analyst reviews build trust through openness.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Continuous Improvement</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our SOAI-PDCA framework ensures AI systems get safer over time through Plan-Do-Check-Act cycles. Not one-time audits, but ongoing enhancement.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Industry-Recognized Certification</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Our training covers EU AI Act, NIST AI RMF, and ISO 42001—the three major global frameworks. Certification demonstrates expertise enterprises and governments trust.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-8">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Growing Job Market</h3>
                    <p className="text-gray-600 leading-relaxed">
                      AI Safety Analyst is projected to become a top 10 profession by 2045. Get ahead now with free training and start earning immediately after certification.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Independent & Unbiased</h3>
                    <p className="text-gray-600 leading-relaxed">
                      No financial ties to OpenAI, Anthropic, Google, Microsoft, or Meta. Our only incentive is public safety and workforce development.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-gradient-to-br from-green-600 to-emerald-700">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Start Your AI Safety Career?
            </h2>
            <p className="text-xl text-green-50 mb-12 max-w-2xl mx-auto">
              Join the global movement protecting humanity from AI risks. Free training, recognized certification, and immediate earning potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/training">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-lg shadow-lg">
                  Start Free Training
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/jobs">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold rounded-lg">
                  Browse Jobs
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
