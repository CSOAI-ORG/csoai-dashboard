import { useState, useEffect } from 'react';
import { SovCard } from "@/components/SovCard";
import { MeasuredProof } from "@/components/MeasuredProof";
import { Helmet } from 'react-helmet-async';
import { IncidentReportForm } from '@/components/IncidentReportForm';
import { CouncilEcosystemVisualization } from '@/components/CouncilEcosystemVisualization';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SovereignConsole } from '@/components/SovereignConsole';
import {
  ChevronDown,
  Users,
  Shield,
  Zap,
  Eye,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Globe,
  Lock,
  Briefcase,
  Heart,
  ArrowRight,
} from 'lucide-react';

const HOME_FAQ = [
  {
    q: "What is CSOAI?",
    a: "CSOAI is an open-source AI safety governance framework that includes the Watchdog incident database, 33-Agent Byzantine Council for impartial decisions, and SOAI-PDCA continuous improvement methodology. It's free and available to everyone.",
  },
  {
    q: "What is CEASAI?",
    a: "CEASAI is a professional certification program built on top of CSOAI. It trains people to become AI Safety Analysts through an 8-week course, 50-question exam (70% pass rate), and employment opportunities on Watchdog and Council cases.",
  },
  {
    q: "How much does it cost?",
    a: "CSOAI is free (open-source). CEASAI training costs $99-$499 depending on the certification level. First 10,000 signups get the $499 course for free.",
  },
  {
    q: "What does a certified AI Safety Analyst do?",
    a: "Certified AI Safety Analysts work on real Watchdog reports and Council cases, reviewing AI systems for compliance and helping improve AI safety.",
  },
  {
    q: "Is CSOAI EU AI Act compliant?",
    a: "Yes. CSOAI is fully compliant with EU AI Act Article 14 (human oversight requirements). We ensure human experts oversee all critical AI decisions.",
  },
  {
    q: "How do I report AI problems?",
    a: "Visit the Watchdog Hub and submit a report. You can report anonymously. Your report will be reviewed by the 33-Agent Council and tracked through the SOAI-PDCA improvement cycle.",
  },
  {
    q: "What background do I need?",
    a: "You don't need a technical background. Our training covers everything from AI basics to compliance frameworks. We accept applications from developers, compliance professionals, researchers, and anyone passionate about AI safety.",
  },
  {
    q: "How long is the certification?",
    a: "The CEASAI program takes approximately 8 weeks to complete. This includes 5 weeks of self-paced training, 2 weeks of exam preparation, and the final exam. You can work at your own pace.",
  },
  {
    q: "What is the 33-Agent Council?",
    a: "The 33-Agent Council is a Byzantine consensus system that uses AI agents and human experts to make impartial decisions on AI safety incidents. It ensures no single entity controls outcomes and prevents bias.",
  },
  {
    q: "Can I use CSOAI for my enterprise?",
    a: "Yes! CSOAI is open-source and free. Enterprises can deploy it internally for compliance monitoring, incident tracking, and AI governance. We also offer enterprise support and custom integrations.",
  },
  {
    q: "How is my data protected?",
    a: "We use industry-standard encryption, secure authentication, and regular security audits. We comply with GDPR, CCPA, and other privacy regulations. We never sell your data to third parties.",
  },
  {
    q: "What happens after I pass the exam?",
    a: "After passing, you receive a digital certificate and can start accepting work on Watchdog cases and Council voting. You'll have access to the analyst dashboard right away.",
  },
];

const HOME_ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Council for the Safety of AI",
  alternateName: "CSOAI",
  url: "https://csoai.org",
  logo: "https://csoai.org/logo.png",
  description:
    "Global AI safety certification platform training and employing AI Safety Analysts to monitor artificial intelligence systems for compliance with EU AI Act, NIST AI RMF, and ISO 42001.",
  sameAs: [
    "https://twitter.com/CsoaiLimited",
    "https://www.linkedin.com/company/110448367",
    "https://github.com/CSOAI-ORG",
  ],
};

const HOME_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOME_FAQ.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function HomepageMaster() {
  const [, setLocation] = useLocation();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'CSOAI: AI Safety Certification & Compliance Platform';
  }, []);

  // Intent-aware routing: send each audience to the page that matches their goal,
  // tagging the source so signup/analytics still attribute correctly.
  const INTENT_ROUTES: Record<string, string> = {
    enterprise: '/enterprise',
    government: '/government-portal',
    developer: '/mcp',
    watchdog: '/watchdog/report',
    pricing: '/pricing',
  };

  const handleCTA = (source: string) => {
    const dest = INTENT_ROUTES[source];
    if (dest) {
      setLocation(`${dest}?source=${encodeURIComponent(source)}`);
    } else {
      // analysts / individuals / learners → signup funnel
      setLocation(`/signup?source=${encodeURIComponent(source)}`);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <div className="w-full bg-white">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(HOME_ORG_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(HOME_FAQ_SCHEMA)}</script>
      </Helmet>
      {/* ============================================
          SECTION 1: HERO - FOUR SOLUTIONS
          ============================================ */}
      <section className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-3 sm:px-4 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto w-full">
          {/* Urgency Banner with Countdown */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-emerald-50 to-white border-2 border-emerald-300 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-center shadow-lg"
          >
            {/* Free Course Giveaway Announcement */}
            <p className="text-sm sm:text-base md:text-lg font-bold text-emerald-700 mb-3">
              🎁 First 10,000 signups get full training FREE (£1,999 value). Use code <strong>FOUNDING10K</strong> at checkout.
            </p>
            
            {/* The countdown that was here is gone, and deliberately. A clock is a claim about
                urgency; a working instrument is a demonstration. And since the Digital Omnibus
                (Reg (EU) 2026/1744, in force 27 July 2026) deferred the Annex III high-risk
                obligations to 2 Dec 2027 while leaving Article 50 on 2 Aug 2026, a single
                countdown to "the deadline" now points at the wrong one. */}
            <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 mb-3">
              <span className="text-emerald-800 font-bold">Article 50 applies 2 August 2026</span>{" "}
              — and we measured what a marking is actually worth: <strong>0 of 108 survived</strong>.
              Ask the instrument about your own system, free, in your browser.
            </p>
            <SovereignConsole />
            
            {/* Lead-magnet CTAs — free, ungated, the top of the funnel */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a href="/eu-ai-act-classifier">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base sm:text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Free EU AI Act Risk Check →
                </Button>
              </a>
              <a href="/opengridworks">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-base sm:text-lg px-8 py-6 rounded-xl"
                >
                  Explore the regulation map
                </Button>
              </a>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs text-gray-500">
              <button onClick={() => handleCTA('hero-free-course')} className="hover:text-emerald-700 underline-offset-2 hover:underline">Start free training</button>
              <a href="https://cal.com/csoai/august-audit" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-700 underline-offset-2 hover:underline">Book a free diagnostic</a>
            </div>
          </motion.div>

          {/* Main Headline — one dominant value prop */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              Make your AI{' '}
              <span className="text-emerald-600">EU&nbsp;AI&nbsp;Act compliant</span>
              <br className="hidden sm:block" />
              {' '}— with human oversight built in.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 font-medium mt-4 sm:mt-6 max-w-3xl mx-auto">
              CSOAI is the open platform that certifies AI Safety Analysts, monitors compliance, and gives every AI decision an impartial 33-Agent human-in-the-loop review.
            </p>
            <p className="text-sm sm:text-base text-red-600 font-semibold mt-3 sm:mt-4">EU AI Act enforcement begins Aug 2, 2026. Get audit-ready now.</p>
          </motion.div>

          {/* Ask SOV — the assistant sits ABOVE the proof: answer first, evidence second */}
          <div className="mx-auto mb-10 max-w-2xl">
            <SovCard />
          </div>

          {/* Measured proof — the credibility anchor, above the fold-ish */}
          <MeasuredProof />

          {/* Choose your path — instant orientation for first-time visitors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-10 sm:mb-12"
          >
            <p className="text-center text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Choose your path</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <button
                type="button"
                onClick={() => handleCTA('analyst')}
                className="group text-left bg-white border-2 border-emerald-200 hover:border-emerald-500 rounded-xl p-5 shadow-sm hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              >
                <Users className="w-7 h-7 text-emerald-600 mb-2" aria-hidden="true" />
                <p className="font-bold text-gray-900">Individuals</p>
                <p className="text-sm text-gray-600 mt-1">Get certified as an AI Safety Analyst.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 mt-3 group-hover:gap-2 transition-all">Start free training <ArrowRight className="w-4 h-4" aria-hidden="true" /></span>
              </button>
              <button
                type="button"
                onClick={() => handleCTA('enterprise')}
                className="group text-left bg-white border-2 border-blue-200 hover:border-blue-500 rounded-xl p-5 shadow-sm hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <Briefcase className="w-7 h-7 text-blue-600 mb-2" aria-hidden="true" />
                <p className="font-bold text-gray-900">Compliance teams</p>
                <p className="text-sm text-gray-600 mt-1">Multi-framework monitoring & audit-ready evidence for your AI.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 mt-3 group-hover:gap-2 transition-all">See enterprise <ArrowRight className="w-4 h-4" aria-hidden="true" /></span>
              </button>
              <button
                type="button"
                onClick={() => handleCTA('developer')}
                className="group text-left bg-white border-2 border-slate-200 hover:border-slate-500 rounded-xl p-5 shadow-sm hover:shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-600 focus-visible:ring-offset-2"
              >
                <Zap className="w-7 h-7 text-slate-700 mb-2" aria-hidden="true" />
                <p className="font-bold text-gray-900">Developers</p>
                <p className="text-sm text-gray-600 mt-1">Call the governance MCP fleet from any agent via one API.</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 mt-3 group-hover:gap-2 transition-all">Explore the MCP fleet <ArrowRight className="w-4 h-4" aria-hidden="true" /></span>
              </button>
            </div>
          </motion.div>

          {/* Security & Compliance Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-12"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700">Ed25519 Signed Attestations</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <Lock className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700">MIT Open Source</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700">GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
              <Eye className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-700">WCAG 2.1 AA</span>
            </div>
          </motion.div>

          {/* Critical Weaknesses - Bullet Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="bg-gradient-to-r from-red-50 to-pink-50 p-4 sm:p-6 md:p-8 rounded-lg sm:rounded-xl border-2 border-red-400 mb-8 sm:mb-12 shadow-md"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Zero AI Safety Solutions Until Now</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">•</span>
                <div>
                  <p className="font-semibold text-gray-900">No AI Safety Standards Body</p>
                  <p className="text-sm text-gray-700">→ NOW: CSOAI.org</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">•</span>
                <div>
                  <p className="font-semibold text-gray-900">No Government Platform</p>
                  <p className="text-sm text-gray-700">→ NOW: CSOAI-PDCA</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">•</span>
                <div>
                  <p className="font-semibold text-gray-900">No Public Incident Database</p>
                  <p className="text-sm text-gray-700">→ NOW: Public Watchdog</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">•</span>
                <div>
                  <p className="font-semibold text-gray-900">No Enterprise Compliance</p>
                  <p className="text-sm text-gray-700">→ NOW: Byzantine Council</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-red-600 font-bold text-xl">•</span>
                <div>
                  <p className="font-semibold text-gray-900">No AI Analyst Job Market</p>
                  <p className="text-sm text-gray-700">→ NOW: CEASAI.training</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Four Solutions Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Solution 1: AI Safety */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-xl border-2 border-emerald-300 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <Shield className="w-10 h-10 text-emerald-600 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">✓ AI Safety Oversight</h3>
                  <p className="text-gray-700 mb-3"><strong>The Problem:</strong> 50,000+ EU enterprises need AI oversight by Aug 2, 2026. Current tools don't work.</p>
                  <p className="text-emerald-700 font-semibold"><strong>Our Fix:</strong> 33-Agent Byzantine Council + Watchdog program = vendor-independent, impartial AI safety decisions</p>
                </div>
              </div>
            </motion.div>

            {/* Solution 2: AI Analyst Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-xl border-2 border-emerald-300 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <TrendingUp className="w-10 h-10 text-emerald-600 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">✓ A New Career Path</h3>
                  <p className="text-gray-700 mb-3"><strong>The Problem:</strong> AI is displacing workers, and there's a shortage of people qualified to keep AI systems safe and compliant.</p>
                  <p className="text-emerald-700 font-semibold"><strong>Our Fix:</strong> The CEASAI training program certifies AI Safety Analysts for remote, meaningful work reviewing AI systems for compliance.</p>
                </div>
              </div>
            </motion.div>

            {/* Solution 3: Government Compliance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-xl border-2 border-emerald-300 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <Globe className="w-10 h-10 text-emerald-600 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">✓ Government Ready</h3>
                  <p className="text-gray-700 mb-3"><strong>The Problem:</strong> EU AI Act enforcement starts Aug 2, 2026. Governments need compliance infrastructure.</p>
                  <p className="text-emerald-700 font-semibold"><strong>Our Fix:</strong> Government Portal + SOAI-PDCA framework = ready-to-deploy compliance monitoring for regulators</p>
                </div>
              </div>
            </motion.div>

            {/* Solution 4: Enterprise Compliance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-xl border-2 border-emerald-300 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <Briefcase className="w-10 h-10 text-emerald-600 flex-shrink-0" />
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">✓ Enterprise Compliance</h3>
                  <p className="text-gray-700 mb-3"><strong>The Problem:</strong> Enterprises spend €50K-500K/year on fragmented compliance tools. Still not compliant.</p>
                  <p className="text-emerald-700 font-semibold"><strong>Our Fix:</strong> Multi-framework compliance (EU AI Act, NIST, TC260, ISO 42001) from £499/month</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Key Facts Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-emerald-600 text-white rounded-xl p-8 mb-12 shadow-xl"
          >
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold mb-2">50,000</p>
                <p className="text-emerald-100">EU Enterprises need compliance by Aug 2</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">Aug 2</p>
                <p className="text-emerald-100">EU AI Act enforcement deadline (2026)</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">33</p>
                <p className="text-emerald-100">Agent Byzantine Council for impartial decisions</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">10-100x</p>
                <p className="text-emerald-100">Cheaper than competitors</p>
              </div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Button onClick={() => handleCTA('analyst')} size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold">
              Become an AI Safety Analyst
            </Button>
            <Button onClick={() => handleCTA('enterprise')} size="lg" variant="outline" className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg font-semibold">
              Enterprise Compliance Solution
            </Button>
            <Button onClick={() => handleCTA('government')} size="lg" variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold">
              Government Portal
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-center text-sm text-gray-600 mb-8"
          >
            Join 10,000+ early adopters • First 10,000 get free $499 course • EU AI Act enforcement: Aug 2, 2026 • No credit card required
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex justify-center"
          >
            <ChevronDown className="w-8 h-8 text-emerald-600 animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ============================================
          SECTION 2: FOUR PROBLEMS → FOUR SOLUTIONS
          ============================================ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Four Problems. One Ecosystem.</h2>
            <p className="text-xl text-gray-600">We're fixing AI safety by integrating public, AI companies, governments, and training certification.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem 1 */}
            <motion.div {...fadeInUp} className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-lg border border-red-200">
              <div className="flex items-start gap-4 mb-4">
                <Briefcase className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Problem 1: AI is Taking Jobs</h3>
                  <p className="text-gray-700 mb-4">AI automation is displacing workers, but AI safety requires human expertise.</p>
                  <div className="bg-white p-4 rounded border-l-4 border-red-600">
                    <p className="font-semibold text-gray-900 mb-2">Our Solution: A New AI Safety Analyst Career Path</p>
                    <p className="text-gray-600">Remote work • Meaningful careers protecting humanity</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Problem 2 */}
            <motion.div {...fadeInUp} className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-lg border border-orange-200">
              <div className="flex items-start gap-4 mb-4">
                <Shield className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Problem 2: AI Systems Lack Human Oversight</h3>
                  <p className="text-gray-700 mb-4">AI decisions affect millions of lives, but oversight is fragmented and ineffective.</p>
                  <div className="bg-white p-4 rounded border-l-4 border-orange-600">
                    <p className="font-semibold text-gray-900 mb-2">Our Solution: 33-Agent Byzantine Council</p>
                    <p className="text-gray-600">AI experts + human analysts • Impartial voting • Vendor-independent decisions</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Problem 3 */}
            <motion.div {...fadeInUp} className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-4 mb-4">
                <Zap className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Problem 3: AI Compliance is Fragmented</h3>
                  <p className="text-gray-700 mb-4">EU AI Act, NIST RMF, TC260, ISO 42001—companies struggle to stay compliant.</p>
                  <div className="bg-white p-4 rounded border-l-4 border-yellow-600">
                    <p className="font-semibold text-gray-900 mb-2">Our Solution: SOAI-PDCA Framework</p>
                    <p className="text-gray-600">Unified methodology • All frameworks • Always compliant • Continuous improvement</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Problem 4 */}
            <motion.div {...fadeInUp} className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg border border-blue-200">
              <div className="flex items-start gap-4 mb-4">
                <Eye className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Problem 4: AI Incidents Go Unreported</h3>
                  <p className="text-gray-700 mb-4">Safety issues hidden behind corporate NDAs. Public has no visibility into AI risks.</p>
                  <div className="bg-white p-4 rounded border-l-4 border-blue-600">
                    <p className="font-semibold text-gray-900 mb-2">Our Solution: The Watchdog Program</p>
                    <p className="text-gray-600">Transparent incident database • Public reporting • Real-time insights • Pattern detection</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 2.25: BYZANTINE COUNCIL VISUALIZATION
          ============================================ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp}>
            <CouncilEcosystemVisualization showLearnMore={true} />
          </motion.div>
        </div>
      </section>

      {/* ============================================
          SECTION 2.5: THE MARKET OPPORTUNITY
          ============================================ */}
      <section className="py-20 px-4 bg-emerald-600">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">The Regulatory Crisis.<br />The Career Opportunity.</h2>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">The EU AI Act compliance deadline is August 2, 2026. Enterprises across the EU must comply, and there's a shortage of professionals qualified to audit AI systems for safety and compliance. AI Safety Analyst is an emerging career path—and the way to help solve the regulatory crisis while protecting humanity.</p>
          </motion.div>



          <motion.div {...fadeInUp} className="bg-white bg-opacity-10 border-2 border-white rounded-lg p-10 mb-12">
            <h3 className="text-3xl font-bold text-emerald-600 mb-6 text-center">How CEASAI Solves the Crisis</h3>
            <p className="text-lg mb-8 max-w-4xl mx-auto text-center leading-relaxed" style={{ color: '#fd0808' }}>By training AI Safety Analysts through CEASAI ahead of the August 2026 deadline, we help enterprises meet the regulatory requirements, open up a new career path, and make AI fundamentally safer for everyone.</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-5 p-6 rounded-lg border border-white border-opacity-20 hover:bg-opacity-10 transition">
                <p className="text-emerald-600 font-bold text-lg mb-3">✓ Regulatory Compliance</p>
                <p className="text-gray-900 text-sm leading-relaxed">Enterprises get access to certified AI Safety Analysts who can audit their systems and ensure compliance before the Aug 2 deadline. No enterprise gets left behind.</p>
              </div>
              <div className="bg-white bg-opacity-5 p-6 rounded-lg border border-white border-opacity-20 hover:bg-opacity-10 transition">
                <p className="text-emerald-600 font-bold text-lg mb-3">✓ A New Career Path</p>
                <p className="text-gray-900 text-sm leading-relaxed">Remote career paths for developers, researchers, compliance professionals, and anyone passionate about AI safety. Meaningful work that protects humanity.</p>
              </div>
              <div className="bg-white bg-opacity-5 p-6 rounded-lg border border-white border-opacity-20 hover:bg-opacity-10 transition">
                <p className="text-emerald-600 font-bold text-lg mb-3">✓ AI Safety</p>
                <p className="text-gray-900 text-sm leading-relaxed">Every AI system gets human expert review. Bias detection. Ethical oversight. Real accountability. The 33-Agent Council ensures decisions are impartial. This is how we make AI safer for everyone.</p>
              </div>
            </div>
          </motion.div>

          <motion.div {...fadeInUp} className="text-center">
            <p className="text-gray-900 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">This isn't just a business opportunity. This is the solution to an impossible regulatory crisis. This is how we create meaningful careers. This is how we protect humanity as AI grows. The time to act is now.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => handleCTA('analyst')} className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 text-lg font-bold">
                Become an AI Safety Analyst
              </Button>
              <Button size="lg" onClick={() => handleCTA('enterprise')} variant="outline" className="border-white text-white hover:bg-white hover:bg-opacity-10 px-8 py-3 text-lg font-bold">
                Enterprise Solution
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          SECTION 3: THE ECOSYSTEM
          ============================================ */}
      <section className="py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The CSOAI Ecosystem: Four Solutions, One Purpose</h2>
            <p className="text-xl text-gray-600">How they work together to protect humanity and advance AI responsibly.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* CSOAI */}
            <motion.div {...fadeInUp} className="bg-white p-8 rounded-lg border-2 border-emerald-200 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-8 h-8 text-emerald-600" />
                <h3 className="text-2xl font-bold text-gray-900">CSOAI</h3>
              </div>
              <p className="text-sm text-emerald-600 font-semibold mb-4">The Public Safety Framework</p>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">What it is:</p>
                  <p className="text-gray-600">Open-source AI governance infrastructure for everyone</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">What it includes:</p>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>✓ Watchdog: Transparent incident reporting</li>
                    <li>✓ Council: 33-Agent Byzantine consensus</li>
                    <li>✓ PDCA: Continuous improvement cycle</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Who uses it:</p>
                  <p className="text-gray-600">Governments, companies, researchers, public</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Cost:</p>
                  <p className="text-emerald-600 font-bold">Free (open-source)</p>
                </div>
              </div>
            </motion.div>

            {/* CEASAI */}
            <motion.div {...fadeInUp} className="bg-white p-8 rounded-lg border-2 border-emerald-600 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
                <h3 className="text-2xl font-bold text-gray-900">CEASAI</h3>
              </div>
              <p className="text-sm text-emerald-600 font-semibold mb-4">The Training & Jobs Pipeline</p>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">What it is:</p>
                  <p className="text-gray-600">Professional certification program built on CSOAI</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">What it includes:</p>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li>✓ Train: 8-week professional certification</li>
                    <li>✓ Certify: 50-question exam, 70% pass rate</li>
                    <li>✓ Employ: Analyst jobs on Watchdog & Council</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Who uses it:</p>
                  <p className="text-gray-600">Individuals seeking AI safety careers</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Cost:</p>
                  <p className="text-emerald-600 font-bold">£499 - £1,999 (one-time or monthly)</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* SOAI-PDCA */}
          <motion.div {...fadeInUp} className="bg-white p-8 rounded-lg border-2 border-emerald-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-8 h-8 text-emerald-600" />
              <h3 className="text-2xl font-bold text-gray-900">SOAI-PDCA</h3>
            </div>
            <p className="text-sm text-emerald-600 font-semibold mb-4">The Continuous Improvement Methodology</p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">What it is:</p>
                  <p className="text-gray-600">Deming cycle adapted for AI governance. Ongoing, public, iterative safety improvements.</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">The Four Phases:</p>
                  <ul className="text-gray-600 space-y-1 ml-4">
                    <li><strong>Plan:</strong> Identify AI risks and compliance gaps</li>
                    <li><strong>Do:</strong> Implement safety controls</li>
                    <li><strong>Check:</strong> Measure effectiveness</li>
                    <li><strong>Act:</strong> Adjust and improve (loop continues)</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Who uses it:</p>
                  <p className="text-gray-600">Companies, regulators, analysts, governments</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Cost:</p>
                  <p className="text-emerald-600 font-bold">Integrated into CSOAI (free)</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Impact:</p>
                  <p className="text-gray-600">Ensures AI safety improves continuously over time</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* The Symbiosis */}
          <motion.div {...fadeInUp} className="mt-12 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-6">The Symbiosis: How It All Works Together</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-white text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                  <p>Public reports AI problems → Watchdog</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                  <p>Watchdog data → Council analyzes</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                  <p>Council decisions → PDCA cycle starts</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-white text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">4</div>
                  <p>PDCA improvements → Safer AI</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">5</div>
                  <p>Safer AI → More analyst jobs</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white text-emerald-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">∞</div>
                  <p>Better oversight → Safer AI (loop continues)</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          SECTION 4: WHY HUMAN OVERSIGHT
          ============================================ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Human Oversight is Critical as AI Grows</h2>
            <p className="text-xl text-gray-600">AI is powerful. But AI making decisions about AI is dangerous. We need human judgment.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Accountability */}
            <motion.div {...fadeInUp} className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg border border-blue-200">
              <AlertCircle className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accountability</h3>
              <p className="text-gray-700 mb-4">Someone must answer for AI decisions. AI can't be held legally responsible. Humans must oversee and approve critical decisions.</p>
              <p className="text-sm text-blue-600 font-semibold">CSOAI ensures human experts are always in the loop.</p>
            </motion.div>

            {/* Bias Detection */}
            <motion.div {...fadeInUp} className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-lg border border-purple-200">
              <Eye className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bias Detection</h3>
              <p className="text-gray-700 mb-4">AI systems inherit human biases. Diverse human experts spot patterns AI can't. The 33-Agent Council ensures no single perspective dominates.</p>
              <p className="text-sm text-purple-600 font-semibold">Multiple viewpoints catch what algorithms miss.</p>
            </motion.div>

            {/* Ethical Judgment */}
            <motion.div {...fadeInUp} className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-lg border border-pink-200">
              <Heart className="w-12 h-12 text-pink-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ethical Judgment</h3>
              <p className="text-gray-700 mb-4">Some decisions require human values. Healthcare, hiring, law enforcement need human judgment. Not all decisions can be automated.</p>
              <p className="text-sm text-pink-600 font-semibold">CSOAI ensures human experts guide critical decisions.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 5: FIRST-TO-MARKET
          ============================================ */}
      <section className="py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The Only Platform Solving All Four Problems</h2>
            <p className="text-xl text-gray-600">We're not just a tool. We're building the infrastructure for safe AI governance—and creating jobs while we do it.</p>
          </motion.div>

          <motion.div {...fadeInUp} className="bg-white rounded-lg border-2 border-emerald-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold">Solution</th>
                    <th className="px-6 py-4 text-center font-bold">CSOAI</th>
                    <th className="px-6 py-4 text-center font-bold">Competitors</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr className="hover:bg-emerald-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Jobs for AI Analysts</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><AlertCircle className="w-6 h-6 text-gray-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-emerald-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Human Oversight</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><AlertCircle className="w-6 h-6 text-gray-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-emerald-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Compliance Framework</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><AlertCircle className="w-6 h-6 text-gray-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-emerald-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Transparency</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><AlertCircle className="w-6 h-6 text-gray-400 mx-auto" /></td>
                  </tr>
                  <tr className="hover:bg-emerald-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Integrated Ecosystem</td>
                    <td className="px-6 py-4 text-center"><CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" /></td>
                    <td className="px-6 py-4 text-center"><AlertCircle className="w-6 h-6 text-gray-400 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          SECTION 6: AUDIENCE-SPECIFIC VALUE PROPS
          ============================================ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What's Your Role?</h2>
            <p className="text-xl text-gray-600">CSOAI works for everyone protecting AI safety.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Individuals */}
            <motion.div {...fadeInUp} className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 rounded-lg border-2 border-emerald-300">
              <Users className="w-10 h-10 text-emerald-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Worried About AI Safety?</h3>
              <p className="text-gray-700 mb-6">Get involved. Learn AI safety in 8 weeks. Get certified. Help protect humanity.</p>
              <div className="bg-white p-4 rounded mb-6 border-l-4 border-emerald-600">
                <p className="font-semibold text-gray-900 mb-2">First 10,000 signups get:</p>
                <ul className="text-gray-600 space-y-1">
                  <li>✓ Free $499 CEASAI course</li>
                  <li>✓ Early access to certification</li>
                  <li>✓ Founding member discount (50% off)</li>
                </ul>
              </div>
              <Button onClick={() => handleCTA('analyst')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Start Free Course</Button>
            </motion.div>

            {/* AI Companies */}
            <motion.div {...fadeInUp} className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg border-2 border-blue-300">
              <Briefcase className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Companies Stressed About EU AI Act?</h3>
              <p className="text-gray-700 mb-6">Get compliant today. We automatically track legislation updates. SOAI-PDCA ensures you're never behind. 33-Agent Council audits your systems.</p>
              <div className="bg-white p-4 rounded mb-6 border-l-4 border-blue-600">
                <p className="font-semibold text-gray-900 mb-2">We provide:</p>
                <ul className="text-gray-600 space-y-1">
                  <li>✓ Real-time compliance monitoring</li>
                  <li>✓ Automatic legislation tracking</li>
                  <li>✓ SOAI-PDCA implementation</li>
                  <li>✓ Transparent audit reports</li>
                </ul>
              </div>
              <Button onClick={() => handleCTA('enterprise')} className="w-full bg-blue-600 hover:bg-blue-700 text-white">Enterprise Compliance</Button>
            </motion.div>

            {/* Governments */}
            <motion.div {...fadeInUp} className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-lg border-2 border-purple-300">
              <Globe className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Governments Worried About AI Companies?</h3>
              <p className="text-gray-700 mb-6">We have the solution. Real-time monitoring. Automatic legislation tracking. Never behind. Transparent enforcement.</p>
              <div className="bg-white p-4 rounded mb-6 border-l-4 border-purple-600">
                <p className="font-semibold text-gray-900 mb-2">We provide:</p>
                <ul className="text-gray-600 space-y-1">
                  <li>✓ Real-time incident monitoring (Watchdog)</li>
                  <li>✓ Compliance tracking (SOAI-PDCA)</li>
                  <li>✓ Automatic legislation updates</li>
                  <li>✓ Enforcement action tracking</li>
                </ul>
              </div>
              <Button onClick={() => handleCTA('government')} className="w-full bg-purple-600 hover:bg-purple-700 text-white">Government Integration</Button>
            </motion.div>

            {/* Public */}
            <motion.div {...fadeInUp} className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-lg border-2 border-orange-300">
              <Eye className="w-10 h-10 text-orange-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Had Problems With AI?</h3>
              <p className="text-gray-700 mb-6">Report it publicly to our Watchdog Hub. See what's really happening with AI systems. Help identify patterns and risks. No NDAs. Full transparency.</p>
              <div className="bg-white p-4 rounded mb-6 border-l-4 border-orange-600">
                <p className="font-semibold text-gray-900 mb-2">Watchdog Hub includes:</p>
                <ul className="text-gray-600 space-y-1">
                  <li>✓ Anonymous reporting</li>
                  <li>✓ Public incident database</li>
                  <li>✓ Real-time statistics</li>
                  <li>✓ Council decisions visible</li>
                </ul>
              </div>
              <Button onClick={() => handleCTA('watchdog')} className="w-full bg-orange-600 hover:bg-orange-700 text-white">Report to Watchdog Hub</Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 7: FAQ
          ============================================ */}
      <section className="py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-4">
            {HOME_FAQ.map((faq, idx) => (
              <motion.div key={idx} {...fadeInUp} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-emerald-50 transition"
                >
                  <h3 className="font-semibold text-gray-900 text-left">{faq.q}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-emerald-600 transition transform ${expandedFAQ === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {expandedFAQ === idx && (
                  <div className="px-6 py-4 bg-emerald-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 7.5: INCIDENT REPORTING
          ============================================ */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Activity className="w-10 h-10 text-orange-500" />
              <h2 className="text-4xl font-bold text-gray-900">Platform Status & Incident Reporting</h2>
            </div>
            <p className="text-xl text-gray-600 mb-4">
              Experiencing issues with the platform? Help us maintain 99.9% uptime by reporting incidents.
            </p>
            <a href="/status" className="text-emerald-600 hover:underline font-semibold">
              View Live System Status →
            </a>
          </motion.div>

          <motion.div {...fadeInUp}>
            <IncidentReportForm />
          </motion.div>
        </div>
      </section>

      {/* ============================================
          SECTION 8: FINAL CTA
          ============================================ */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl font-bold mb-6">Ready to Protect Humanity & Build Your Career?</h2>
            <p className="text-xl mb-12 opacity-90">Join the AI safety movement. Get started today.</p>

            <div className="grid md:grid-cols-3 gap-6">
              <Button onClick={() => handleCTA('analyst')} size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                Get Free Course
              </Button>
              <Button onClick={() => handleCTA('enterprise')} size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                Enterprise Compliance
              </Button>
              <Button onClick={() => handleCTA('watchdog')} size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                Report AI Problem
              </Button>
            </div>

            <p className="text-sm mt-8 opacity-75">First 10,000 signups get free $499 course • EU AI Act enforcement: Aug 2, 2026 • Founding member discount: 50% off</p>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
