import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  Scale, 
  Eye, 
  FileCheck, 
  Users, 
  Building2, 
  Globe, 
  AlertTriangle,
  Gavel,
  BookOpen,
  Award,
  Briefcase
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import HowItWorksInfographic from "@/components/HowItWorksInfographic";

const HOWITWORKS_HOWTO_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How CSOAI ensures AI safety",
  description:
    "How the CSOAI regulatory body delivers AI safety: register an AI system, run a compliance assessment, get reviewed by the 33-Agent Byzantine Council, earn Watchdog certification, and improve continuously with SOAI-PDCA.",
  totalTime: "PT10M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Register AI System", text: "Add your AI system and classify its risk level in minutes." },
    { "@type": "HowToStep", position: 2, name: "Run Compliance Assessment", text: "Auto-assess against the EU AI Act, NIST AI RMF, ISO 42001 and TC260." },
    { "@type": "HowToStep", position: 3, name: "33-Agent Council Reviews", text: "A Byzantine-fault-tolerant council of 33 agents from 12 providers votes on the verdict." },
    { "@type": "HowToStep", position: 4, name: "Get Watchdog Certification", text: "Receive a verifiable certification and a public transparency record." },
    { "@type": "HowToStep", position: 5, name: "Continuous PDCA", text: "Plan-Do-Check-Act keeps your system compliant as regulations evolve." },
  ],
};

const HOWITWORKS_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Is CSOAI a government agency?", acceptedAnswer: { "@type": "Answer", text: "No. CSOAI is operated by CEASAI Limited, an independent UK company. We work with governments but are not part of any government. Our independence ensures impartiality." } },
    { "@type": "Question", name: "How is CSOAI different from AI companies?", acceptedAnswer: { "@type": "Answer", text: "AI companies build AI. We regulate it. We have no financial ties to OpenAI, Google, Microsoft, or any AI vendor. Our only incentive is public safety—not selling AI products." } },
    { "@type": "Question", name: "What authority does CSOAI have?", acceptedAnswer: { "@type": "Answer", text: "We are a standards body, similar to ISO or BSI. We develop standards, certify professionals, and provide compliance infrastructure. Governments and enterprises adopt our frameworks voluntarily—or as required by regulations like the EU AI Act." } },
    { "@type": "Question", name: "Why should I trust CSOAI?", acceptedAnswer: { "@type": "Answer", text: "Our 33-Agent Council uses 12 different AI providers—no single vendor can manipulate outcomes. Every decision is public. Our analysts are certified professionals. And we have no commercial incentive to favor any AI company." } },
  ],
};

const HOWITWORKS_BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://csoai.org/" },
    { "@type": "ListItem", position: 2, name: "How It Works", item: "https://csoai.org/how-it-works" },
  ],
};

export default function HowItWorks() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 py-24">
          <div className="container max-w-4xl space-y-4">
            <Skeleton className="h-8 w-32 bg-emerald-200/50" />
            <Skeleton className="h-16 w-full bg-emerald-200/50" />
            <Skeleton className="h-16 w-3/4 bg-emerald-200/50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>How CSOAI Works — AI Safety Oversight in 5 Steps</title>
        <meta name="description" content="See how CSOAI keeps AI safe: register a system, run a compliance assessment, get a 33-Agent Council review, earn certification, improve continuously. Start free." />
        <link rel="canonical" href="https://csoai.org/how-it-works" />
        <meta property="og:title" content="How CSOAI Works — AI Safety Oversight in 5 Steps" />
        <meta property="og:description" content="Register, assess, get reviewed by the 33-Agent Council, certify, and improve with SOAI-PDCA. The independent AI safety regulator explained." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://csoai.org/how-it-works" />
        <script type="application/ld+json">{JSON.stringify(HOWITWORKS_HOWTO_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(HOWITWORKS_FAQ_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(HOWITWORKS_BREADCRUMB_SCHEMA)}</script>
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 py-24">
          <div className="container max-w-4xl">
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
              Independent Regulatory Body
            </Badge>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              How CSOAI Ensures AI Safety
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl">
              CSOAI is an independent regulatory body dedicated to ensuring AI systems are safe, compliant, and accountable. We provide the oversight infrastructure that governments, enterprises, and the public need to trust AI.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container max-w-5xl py-20">

          {/* Visual journey infographic */}
          <div className="mb-20">
            <HowItWorksInfographic />
          </div>

          {/* What is CSOAI Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What is CSOAI?
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600 mb-8">
              <p className="text-lg leading-relaxed">
                <strong>CSOAI (Council for the Safety of AI)</strong> is operated by CEASAI Limited (Company Number: [PENDING]), a UK-registered company, as an independent standards body. We are not a software company or a consulting firm—we are a <strong>regulatory body</strong> that provides the infrastructure for AI safety oversight.
              </p>
              <p className="text-lg leading-relaxed mt-4">
                Just as the FAA ensures aviation safety and the FDA ensures drug safety, CSOAI ensures AI safety. We develop standards, certify professionals, monitor compliance, and provide transparent oversight of AI systems across industries.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 border-2 border-emerald-100 hover:border-emerald-300 transition-colors">
                <Scale className="h-10 w-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Independent</h3>
                <p className="text-gray-600">
                  No ties to OpenAI, Google, Microsoft, or any AI vendor. Our only incentive is public safety.
                </p>
              </Card>
              
              <Card className="p-6 border-2 border-emerald-100 hover:border-emerald-300 transition-colors">
                <Gavel className="h-10 w-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Regulatory</h3>
                <p className="text-gray-600">
                  We set standards, enforce compliance, and hold AI systems accountable to safety requirements.
                </p>
              </Card>
              
              <Card className="p-6 border-2 border-emerald-100 hover:border-emerald-300 transition-colors">
                <Globe className="h-10 w-10 text-emerald-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Global</h3>
                <p className="text-gray-600">
                  Aligned with EU AI Act, NIST AI RMF, ISO 42001, and TC260—covering all major jurisdictions.
                </p>
              </Card>
            </div>
          </div>

          {/* How We Ensure AI Safety */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              How We Ensure AI Safety
            </h2>
            
            <div className="space-y-12">
              {/* Pillar 1: Oversight */}
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">1. Transparent Oversight</h3>
                  <p className="text-gray-600 mb-4">
                    Every AI system needs human oversight. Our <strong>33-Agent Byzantine Council</strong> uses 12 different AI providers plus human analysts to review AI systems. No single vendor can manipulate outcomes. Every decision is public and auditable.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">Multi-vendor AI review</Badge>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">Human analyst oversight</Badge>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">Public voting records</Badge>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Compliance */}
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center">
                  <FileCheck className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">2. Compliance Framework</h3>
                  <p className="text-gray-600 mb-4">
                    We provide the <strong>SOAI-PDCA methodology</strong>—a continuous improvement cycle for AI governance. Plan, Do, Check, Act. This ensures AI systems don't just pass a one-time audit but maintain safety over time.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">EU AI Act compliance</Badge>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">NIST AI RMF alignment</Badge>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">ISO 42001 certification</Badge>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Incident Reporting */}
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">3. Public Incident Database</h3>
                  <p className="text-gray-600 mb-4">
                    Our <strong>Watchdog program</strong> maintains a transparent database of AI safety incidents. Anyone can report concerns. Certified analysts investigate. The public can see what's happening with AI systems in real-time.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">Anonymous reporting</Badge>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">Expert investigation</Badge>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">Public transparency</Badge>
                  </div>
                </div>
              </div>

              {/* Pillar 4: Certification */}
              <div className="flex gap-8 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">4. Professional Certification</h3>
                  <p className="text-gray-600 mb-4">
                    We train and certify <strong>AI Safety Analysts</strong> through CEASAI (Certified Expert in AI Safety). These professionals provide the human oversight that AI systems require. Without certified analysts, there's no one qualified to monitor AI.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">ISO 17024 aligned</Badge>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">Rigorous examination</Badge>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">Continuing education</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Who We Serve */}
          <div className="mb-20 bg-gray-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Who We Serve
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <Building2 className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Governments</h3>
                  <p className="text-gray-600">
                    We provide the compliance infrastructure governments need to enforce AI regulations like the EU AI Act. Our SOAI-PDCA framework is ready-to-deploy for regulators.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Briefcase className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprises</h3>
                  <p className="text-gray-600">
                    Companies using AI need compliance. We provide multi-framework compliance monitoring, certified analyst access, and audit-ready documentation.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Users className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">The Public</h3>
                  <p className="text-gray-600">
                    Anyone can report AI safety concerns through our Watchdog program. Our incident database is public. Transparency protects everyone.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <BookOpen className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Professionals</h3>
                  <p className="text-gray-600">
                    We train and certify AI Safety Analysts—creating a new profession that provides the human oversight AI systems require.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* The Certification Path */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Become a Certified AI Safety Analyst
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Want to be part of the solution? Get certified and join the workforce ensuring AI safety.
            </p>
            
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="p-6 text-center border-2 border-emerald-100">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl">1</div>
                <h3 className="font-bold text-gray-900 mb-2">Sign Up</h3>
                <p className="text-sm text-gray-600">Create your free account in 2 minutes</p>
              </Card>
              
              <Card className="p-6 text-center border-2 border-emerald-100">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl">2</div>
                <h3 className="font-bold text-gray-900 mb-2">Train</h3>
                <p className="text-sm text-gray-600">Complete our comprehensive training (4-6 hours)</p>
              </Card>
              
              <Card className="p-6 text-center border-2 border-emerald-100">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl">3</div>
                <h3 className="font-bold text-gray-900 mb-2">Certify</h3>
                <p className="text-sm text-gray-600">Pass the 50-question exam (70% to pass)</p>
              </Card>
              
              <Card className="p-6 text-center border-2 border-emerald-100">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 font-bold text-xl">4</div>
                <h3 className="font-bold text-gray-900 mb-2">Work</h3>
                <p className="text-sm text-gray-600">Start your AI Safety Analyst work remotely</p>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <Card className="p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Is CSOAI a government agency?</h3>
                <p className="text-gray-600">No. CSOAI is operated by CEASAI Limited, an independent UK company. We work with governments but are not part of any government. Our independence ensures impartiality.</p>
              </Card>
              
              <Card className="p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">How is CSOAI different from AI companies?</h3>
                <p className="text-gray-600">AI companies build AI. We regulate it. We have no financial ties to OpenAI, Google, Microsoft, or any AI vendor. Our only incentive is public safety—not selling AI products.</p>
              </Card>
              
              <Card className="p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">What authority does CSOAI have?</h3>
                <p className="text-gray-600">We are a standards body, similar to ISO or BSI. We develop standards, certify professionals, and provide compliance infrastructure. Governments and enterprises adopt our frameworks voluntarily—or as required by regulations like the EU AI Act.</p>
              </Card>
              
              <Card className="p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">Why should I trust CSOAI?</h3>
                <p className="text-gray-600">Our 33-Agent Council uses 12 different AI providers—no single vendor can manipulate outcomes. Every decision is public. Our analysts are certified professionals. And we have no commercial incentive to favor any AI company.</p>
              </Card>
            </div>
          </div>

          {/* Learn More — internal links */}
          <div className="mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Learn More</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/docs">
                <Card className="p-5 border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer h-full">
                  <h3 className="font-bold text-gray-900 mb-1">Technical Documentation</h3>
                  <p className="text-sm text-gray-600">Architecture, APIs and integration guides for the 33-Agent Council and SOAI-PDCA.</p>
                </Card>
              </Link>
              <Link href="/knowledge-base">
                <Card className="p-5 border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer h-full">
                  <h3 className="font-bold text-gray-900 mb-1">Knowledge Base</h3>
                  <p className="text-sm text-gray-600">Real AI safety incidents, lessons learned and framework mappings.</p>
                </Card>
              </Link>
              <Link href="/faq">
                <Card className="p-5 border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer h-full">
                  <h3 className="font-bold text-gray-900 mb-1">Frequently Asked Questions</h3>
                  <p className="text-sm text-gray-600">Pricing, certification, exams and how the platform works.</p>
                </Card>
              </Link>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Involved?</h2>
            <p className="text-lg mb-8 text-emerald-50 max-w-2xl mx-auto">
              Whether you're an enterprise needing compliance, a professional seeking certification, or a citizen concerned about AI safety—CSOAI is here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
                  Get Certified
                </Button>
              </Link>
              <Link href="/enterprise">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-emerald-500">
                  Enterprise Solutions
                </Button>
              </Link>
              <Link href="/watchdog">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-emerald-500">
                  Report an Incident
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
