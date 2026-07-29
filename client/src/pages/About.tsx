import { Users, Target, Shield, Globe, Award, Building2, Heart, Zap, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function About() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate content loading (in real app, this would fetch data)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950 text-gray-900 dark:text-white py-24">
          <div className="container max-w-4xl space-y-4">
            <Skeleton className="h-8 w-32 bg-white/10" />
            <Skeleton className="h-16 w-full bg-white/10" />
            <Skeleton className="h-16 w-3/4 bg-white/10" />
            <Skeleton className="h-32 w-full bg-white/10" />
          </div>
        </div>
        <div className="container py-20">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-12 w-2/3 mx-auto" />
            <Skeleton className="h-24 w-full" />
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Who can become an AI Safety Analyst?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Anyone with critical thinking skills and attention to detail. You don't need a computer science degree or coding experience. Our training teaches you everything you need to know about AI safety frameworks, risk assessment, and compliance monitoring."
        }
      },
      {
        "@type": "Question",
        "name": "How long does certification take?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most students complete the training in 4-6 hours and pass the certification exam on their first attempt. The exam is 50 questions, 90 minutes, with a 70% passing threshold. You can retake it as many times as needed."
        }
      },
      {
        "@type": "Question",
        "name": "What do AI Safety Analysts actually do?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You review AI systems for compliance with safety frameworks (EU AI Act, NIST AI RMF, ISO 42001). This includes checking documentation, assessing risk levels, identifying bias, and writing safety reports. You work with our 33-Agent Council system to make final safety determinations."
        }
      },
      {
        "@type": "Question",
        "name": "Why should companies trust CSOAI?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Unlike single-vendor AI safety tools, CSOAI uses a 33-Agent Council with 12 different AI providers for unbiased assessments. Our Watchdog system is public by default, ensuring transparency. We're aligned with EU AI Act, NIST AI RMF, and ISO 42001—the three major global frameworks."
        }
      },
      {
        "@type": "Question",
        "name": "How is CSOAI different from other AI safety organizations?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most AI safety organizations focus on research or advocacy. CSOAI is the only platform that combines training, certification, job creation, and operational oversight. We're not just talking about AI safety—we're building the instrument that measures it, and the workforce trained to use it."
        }
      }
    ]
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Failed to Load Content</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      {/* Hero Section - Origin Story */}
      <div className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950 text-gray-900 dark:text-white py-24">
        <div className="container max-w-4xl">
          <Badge className="mb-6 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30">Our Story</Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight text-gray-900 dark:text-white">
            We're Building the Future of AI Safety—One Analyst at a Time
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            In 2024, as artificial intelligence began transforming every industry, a critical question emerged: 
            <span className="text-emerald-600 dark:text-emerald-300 font-semibold"> Who watches the watchmen?</span> Governments scrambled to regulate. 
            Companies rushed to comply. But one thing was missing: <span className="font-semibold">trained professionals who could actually monitor AI systems for safety.</span>
          </p>
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            That's when CSOAI was born—not as another AI company, but as <span className="text-emerald-600 dark:text-emerald-300 font-semibold">the solution to two problems at once</span>: 
            protecting humanity from AI risks while creating thousands of meaningful jobs for people displaced by automation.
          </p>
        </div>
      </div>

      {/* The Problem We're Solving */}
      <div className="container py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-red-50 text-red-600 border-red-200">The Problem</Badge>
            <h2 className="text-4xl font-bold mb-6">AI is Taking Jobs. We're Creating Them.</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              By 2030, AI will displace millions of workers. But it also creates a massive need for human oversight. 
              Every AI system needs monitoring. Every algorithm needs auditing. Every decision needs review.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="p-8 border-2 border-red-100 bg-red-50/50">
              <h3 className="text-2xl font-bold mb-4 text-red-900">Without CSOAI</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>AI systems deployed without proper safety review</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Companies struggle to find qualified compliance staff</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Workers displaced by AI with no clear career path</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span>Governments lack trained personnel for AI oversight</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 border-2 border-emerald-200 bg-emerald-50/50">
              <h3 className="text-2xl font-bold mb-4 text-emerald-900">With CSOAI</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>Every AI system monitored by certified analysts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>10,000+ trained professionals ready to hire</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>New career path for displaced workers</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <span>Global standard for AI safety governance</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Our Mission & Approach */}
      <div className="bg-gray-50 py-20">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-50 text-emerald-600 border-emerald-200">Our Mission</Badge>
            <h2 className="text-4xl font-bold mb-6">Protecting Humanity While Creating Careers</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              We're not just another certification body. We're building the infrastructure for a new profession: 
              <span className="font-semibold text-emerald-600"> AI Safety Analyst</span>—projected to become one of the top 10 jobs by 2045.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <div className="inline-flex p-4 bg-emerald-100 rounded-full mb-4">
                <Target className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Train</h3>
              <p className="text-gray-600">
                Comprehensive training on EU AI Act, NIST AI RMF, and ISO 42001 frameworks. No coding required.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="inline-flex p-4 bg-emerald-100 rounded-full mb-4">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Certify</h3>
              <p className="text-gray-600">
                Rigorous certification exam with 70% passing threshold. Recognized by enterprises and governments worldwide.
              </p>
            </Card>

            <Card className="p-8 text-center">
              <div className="inline-flex p-4 bg-emerald-100 rounded-full mb-4">
                <Zap className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Contribute</h3>
              <p className="text-gray-600">
                Review AI systems for safety and compliance. Work remotely, set your own hours, make an impact.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Why We're Different */}
      <div className="container py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-50 text-emerald-600 border-emerald-200">What Makes Us Different</Badge>
            <h2 className="text-4xl font-bold mb-6">We're Not Just Talking. We're Building.</h2>
          </div>

          <div className="space-y-8">
            <Card className="p-8 border-l-4 border-emerald-500">
              <h3 className="text-2xl font-bold mb-4">🤖 33-Agent Council: Democratic AI Oversight</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Unlike single-vendor AI systems that can be biased, our 33-Agent Council uses Byzantine consensus 
                across 12 different AI providers (OpenAI, Anthropic, Google, DeepSeek, and more). No single company 
                controls the outcome. It's democracy for AI safety decisions.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Why it matters:</strong> When a company's own AI reviews their AI, there's a conflict of interest. 
                Our multi-vendor approach ensures unbiased safety assessments.
              </p>
            </Card>

            <Card className="p-8 border-l-4 border-emerald-500">
              <h3 className="text-2xl font-bold mb-4">👁️ Watchdog: Public Transparency</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Every AI safety incident reported to CSOAI is public by default. No hiding failures. No sweeping 
                problems under the rug. Companies are held accountable, and the public can see exactly what's happening.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Why it matters:</strong> Transparency builds trust. When AI companies know their safety record is public, 
                they prioritize safety over speed.
              </p>
            </Card>

            <Card className="p-8 border-l-4 border-purple-500">
              <h3 className="text-2xl font-bold mb-4">🔄 SOAI-PDCA: Continuous Improvement</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We don't just measure once and forget. Our SOAI-PDCA framework (Safety Oversight AI + Plan-Do-Check-Act) 
                ensures continuous monitoring and improvement. AI systems are reviewed regularly, not just at launch.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Why it matters:</strong> AI systems evolve. A safe system today might be risky tomorrow. 
                Continuous oversight catches problems before they become disasters.
              </p>
            </Card>

            <Card className="p-8 border-l-4 border-orange-500">
              <h3 className="text-2xl font-bold mb-4">💼 Job Creation: Not Just Compliance</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Every other AI safety organization focuses on regulation. We focus on <strong>people</strong>. 
                We're training 10,000+ analysts in the next 2 years. These aren't just certifications—they're careers. 
                Real jobs. Real income. Real impact.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Why it matters:</strong> AI will displace millions of workers. We're creating a new profession 
                that turns AI's threat into opportunity.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Our Commitment */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white py-20">
        <div className="container max-w-4xl text-center">
          <Heart className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6">Our Commitment to You</h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            We're building CSOAI in public. Every decision, every framework update, every certification standard 
            is documented and transparent. We answer to the community, not shareholders. Our success is measured 
            by one metric: <span className="text-emerald-300 font-semibold">Are we making AI safer while creating meaningful jobs?</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/training">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Start Training Today
              </Button>
            </Link>
            <Link href="/certification">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn About Certification
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Recognition & Standards */}
      <div className="container py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="p-10 bg-gradient-to-r from-blue-50 to-emerald-50 border-2 border-emerald-200">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="p-6 bg-white rounded-full shadow-lg">
                <Award className="h-16 w-16 text-emerald-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-bold mb-4">Aligned with Global Standards</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  CSOAI training and certification aligns with the three major global AI governance frameworks: 
                  EU AI Act (Europe), NIST AI RMF (United States), and ISO 42001 (International). 
                  Our certification is recognized by enterprises and governments worldwide.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Badge variant="outline" className="text-sm py-2 px-4">EU AI Act Compliant</Badge>
                  <Badge variant="outline" className="text-sm py-2 px-4">NIST AI RMF Aligned</Badge>
                  <Badge variant="outline" className="text-sm py-2 px-4">ISO 42001 Certified</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Meet the Team */}
      <div className="container py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30">Our Leadership</Badge>
            <h2 className="text-4xl font-bold mb-6">Meet the Team Behind CSOAI</h2>
            <p className="text-xl text-gray-600">Dedicated to building the future of AI safety and creating meaningful careers</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Team Member Card */}
            <Card className="p-8 text-center border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto mb-6 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">NT</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Nicholas Templeman</h3>
              <p className="text-emerald-600 font-semibold mb-4">Founder & AI Safety Advocate</p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Visionary leader driving the mission to protect humanity from AI risks while creating thousands of meaningful careers for displaced workers.
              </p>
              <div className="flex gap-4 justify-center">
                <a href="https://www.linkedin.com/in/nicktempleman/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.292-1.194-2.292-1.195 0-1.38.932-1.38 1.893v4.577H8.368V9.892h2.519v.979h.037c.356-.674 1.228-1.387 2.528-1.387 2.699 0 3.199 1.774 3.199 4.085v4.171zM3.819 8.414a1.54 1.54 0 11.46-3.06 1.54 1.54 0 01-.46 3.06m1.32 7.924H2.5V9.892h2.639v6.446zM17.644 0H.356C.16 0 0 .156 0 .35v19.3c0 .194.16.35.356.35h17.288c.196 0 .356-.156.356-.35V.35c0-.194-.16-.35-.356-.35z"/></svg>
                  LinkedIn
                </a>
              </div>
            </Card>

            {/* Mission Card */}
            <Card className="p-8 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-emerald-600 font-bold text-lg">✓</span>
                  <span><strong>Protect humanity</strong> from AI risks through rigorous safety oversight</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-600 font-bold text-lg">✓</span>
                  <span><strong>Create careers</strong> for workers displaced by automation</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-600 font-bold text-lg">✓</span>
                  <span><strong>Build transparency</strong> in AI governance globally</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-600 font-bold text-lg">✓</span>
                  <span><strong>Establish standards</strong> aligned with EU AI Act, NIST RMF, and ISO 42001</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-20">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about CSOAI</p>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-3">Who can become an AI Safety Analyst?</h3>
              <p className="text-gray-600 leading-relaxed">
                Anyone with critical thinking skills and attention to detail. You don't need a computer science degree 
                or coding experience. Our training teaches you everything you need to know about AI safety frameworks, 
                risk assessment, and compliance monitoring.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-3">How long does certification take?</h3>
              <p className="text-gray-600 leading-relaxed">
                Most students complete the training in 4-6 hours and pass the certification exam on their first attempt. 
                The exam is 50 questions, 90 minutes, with a 70% passing threshold. You can retake it as many times as needed.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-3">What do AI Safety Analysts actually do?</h3>
              <p className="text-gray-600 leading-relaxed">
                You review AI systems for compliance with safety frameworks (EU AI Act, NIST AI RMF, ISO 42001). 
                This includes checking documentation, assessing risk levels, identifying bias, and writing safety reports. 
                You work with our 33-Agent Council system to make final safety determinations.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-3">Why should companies trust CSOAI?</h3>
              <p className="text-gray-600 leading-relaxed">
                Unlike single-vendor AI safety tools, CSOAI uses a 33-Agent Council with 12 different AI providers 
                for unbiased assessments. Our Watchdog system is public by default, ensuring transparency. 
                We're aligned with EU AI Act, NIST AI RMF, and ISO 42001—the three major global frameworks.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-3">How is CSOAI different from other AI safety organizations?</h3>
              <p className="text-gray-600 leading-relaxed">
                Most AI safety organizations focus on research or advocacy. CSOAI is the only platform that combines 
                training, certification, job creation, and operational oversight. We're not just talking about AI safety—we're 
                building the instrument that measures it.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="container py-20">
        <Card className="p-12 bg-gradient-to-br from-slate-900 to-emerald-900 text-white text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join the Movement?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Whether you're an individual looking for a new career or an enterprise seeking AI compliance, 
            CSOAI has the solution. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/training">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Start Free Training
              </Button>
            </Link>
            <Link href="/enterprise">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Enterprise Solutions
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
