/**
 * CSOAI Certification Page - Professional Redesign
 * Clear exam details, certification benefits, and career outcomes
 */

import { Link } from "wouter";
import { Award, CheckCircle, Clock, FileText, TrendingUp, Shield, Users, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CertificationV2() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-emerald-50 to-white dark:from-slate-900 dark:to-slate-800 text-gray-900 dark:text-white py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
              <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Industry-Recognized Certification</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              CSOAI Watchdog Analyst Certification
            </h1>
            
            <p className="text-xl text-gray-800 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Earn your official AI Safety Analyst certification and join the global network of professionals monitoring AI systems for compliance. Recognized by enterprises and governments worldwide.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/certification/exam">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-lg font-semibold">
                  Take Certification Exam
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/training">
                <Button size="lg" variant="outline" className="border-2 border-emerald-500 text-gray-900 dark:text-white hover:bg-emerald-500/10 px-8 py-6 text-lg font-semibold">
                  Complete Training First
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-emerald-500/10 backdrop-blur-sm rounded-lg p-4 border border-emerald-500/20">
                <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">50 Questions</div>
                <div className="text-gray-700 dark:text-gray-300">Comprehensive Assessment</div>
              </div>
              <div className="bg-emerald-500/10 backdrop-blur-sm rounded-lg p-4 border border-emerald-500/20">
                <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">70% Pass</div>
                <div className="text-gray-700 dark:text-gray-300">Passing Score Required</div>
              </div>
              <div className="bg-emerald-500/10 backdrop-blur-sm rounded-lg p-4 border border-emerald-500/20">
                <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">90 Minutes</div>
                <div className="text-gray-700 dark:text-gray-300">Exam Duration</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Get Certified */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Get Certified?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              CSOAI certification demonstrates expertise in AI safety frameworks and opens doors to high-paying remote work
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Remote Work</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Review AI systems for compliance. Work remotely from anywhere, set your own hours, and get paid per report reviewed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Industry Recognition</h3>
                  <p className="text-gray-600 leading-relaxed">
                    CSOAI certification is recognized by enterprises and governments as proof of expertise in EU AI Act, NIST AI RMF, and ISO 42001 frameworks.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Future-Proof Career</h3>
                  <p className="text-gray-600 leading-relaxed">
                    AI Safety Analyst is projected to become one of the top 10 jobs by 2045. Get certified now and position yourself at the forefront of this growing field.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Join Global Network</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Become part of the worldwide community of AI Safety Analysts protecting humanity from AI risks. Access exclusive job opportunities and professional development.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Verifiable Credentials</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Digital certificate with unique verification ID, shareable on LinkedIn and resumes. Employers can instantly verify your certification status.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Prerequisites Required</h3>
                  <p className="text-gray-600 leading-relaxed">
                    No coding experience or technical degree needed. If you can think critically and complete our training, you can become certified.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exam Details */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Exam Details
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about the CSOAI Watchdog Analyst certification exam
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Exam Format</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Total Questions</span>
                  <span className="font-semibold text-gray-900">50 multiple-choice</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-900">90 minutes</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Passing Score</span>
                  <span className="font-semibold text-gray-900">70% (35/50 correct)</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Retake Policy</span>
                  <span className="font-semibold text-gray-900">Unlimited attempts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Certificate Validity</span>
                  <span className="font-semibold text-gray-900">1 year (renewable)</span>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Topics Covered</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">AI Safety Fundamentals (20%)</div>
                    <div className="text-sm text-gray-600">History, risks, and regulatory landscape</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">EU AI Act (25%)</div>
                    <div className="text-sm text-gray-600">Risk categories, compliance, penalties</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">NIST AI RMF (25%)</div>
                    <div className="text-sm text-gray-600">Four core functions and application</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">AI Bias & Fairness (15%)</div>
                    <div className="text-sm text-gray-600">Types of bias, detection, evaluation</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900">Analyst Decision-Making (15%)</div>
                    <div className="text-sm text-gray-600">Framework, reporting, Council system</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-8 bg-emerald-50 border-emerald-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Important Exam Rules</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>You must complete all training modules before taking the exam</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>Ensure stable internet connection—you cannot pause once started</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>All 50 questions must be answered to submit the exam</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>Results are provided immediately after submission</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>If you don't pass, you can retake the exam after 24 hours</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Sample Questions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Sample Questions
            </h2>
            <p className="text-xl text-gray-600">
              Get a preview of the types of questions you'll encounter on the exam
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-8">
              <div className="mb-4">
                <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">EU AI Act</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Which of the following AI systems would be classified as "high-risk" under the EU AI Act?
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">A) An AI-powered spam filter for email</div>
                <div className="p-4 bg-gray-50 rounded-lg">B) A recommendation system for music playlists</div>
                <div className="p-4 bg-green-50 border-2 border-green-600 rounded-lg font-semibold">C) An AI system used for credit scoring decisions ✓</div>
                <div className="p-4 bg-gray-50 rounded-lg">D) A chatbot for customer service inquiries</div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="mb-4">
                <span className="text-sm font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">NIST AI RMF</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                What are the four core functions of the NIST AI Risk Management Framework?
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">A) Plan, Do, Check, Act</div>
                <div className="p-4 bg-green-50 border-2 border-green-600 rounded-lg font-semibold">B) Govern, Map, Measure, Manage ✓</div>
                <div className="p-4 bg-gray-50 rounded-lg">C) Identify, Protect, Detect, Respond</div>
                <div className="p-4 bg-gray-50 rounded-lg">D) Assess, Design, Implement, Monitor</div>
              </div>
            </Card>

            <Card className="p-8">
              <div className="mb-4">
                <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">AI Bias</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Which type of bias occurs when training data does not represent the population the AI will serve?
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">A) Algorithmic bias</div>
                <div className="p-4 bg-green-50 border-2 border-green-600 rounded-lg font-semibold">B) Data bias ✓</div>
                <div className="p-4 bg-gray-50 rounded-lg">C) Deployment bias</div>
                <div className="p-4 bg-gray-50 rounded-lg">D) Confirmation bias</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Career Outcomes */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Career Outcomes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              What certified analysts are achieving
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">Certified</div>
              <div className="text-gray-600 mb-4">AI Safety Analyst</div>
              <p className="text-sm text-gray-500">Review AI systems for compliance with EU AI Act, NIST AI RMF, and ISO 42001 frameworks</p>
            </Card>

            <Card className="p-8 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600 mb-4">Remote Work</div>
              <p className="text-sm text-gray-500">All positions are fully remote—work from anywhere in the world</p>
            </Card>

            <Card className="p-8 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">Flexible</div>
              <div className="text-gray-600 mb-4">Schedule</div>
              <p className="text-sm text-gray-500">Set your own hours, work part-time or full-time based on your availability</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Certified?
          </h2>
          <p className="text-xl text-green-50 mb-12 max-w-2xl mx-auto">
            Complete your training, pass the exam, and start your career as an AI Safety Analyst today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/certification/exam">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                Take Certification Exam
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/training">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold">
                Review Training Modules
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
