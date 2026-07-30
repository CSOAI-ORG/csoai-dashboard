import { Link } from "wouter";
import { Shield, Users, TrendingUp, Award, Eye, Globe, ArrowRight, CheckCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function NewHome() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("individual");

  const handleLOISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    // TODO: Connect to backend LOI endpoint
    toast.success("Thank you! We'll be in touch soon with your Founding Member discount.");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A2540] via-[#1E3A5F] to-[#0A2540]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url(/hero-epic.png)" }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2540]/90 via-[#0A2540]/70 to-[#0A2540]/90" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <Badge className="mb-6 bg-emerald-500/20 text-emerald-300 border-blue-400/30 text-sm px-4 py-2">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            10,000+ Certified Analysts Worldwide
          </Badge>
          
          {/* Hero Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
            AI is Taking Jobs.<br />
            <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              We're Creating Them.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join the global movement protecting humanity from AI risks while earning from home. 
            No coding required—just critical thinking.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/watchdog-signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60 transition-all duration-300 hover:-translate-y-1">
                Start Training (Free)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/training">
              <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:-translate-y-1">
                <Play className="mr-2 h-5 w-5" />
                See Job Opportunities
              </Button>
            </Link>
          </div>
          
          {/* Live Stats Ticker */}
          <div className="flex flex-wrap justify-center gap-8 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>1,247 Analysts Online Now</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>52,891 Reports Reviewed Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span>33-Agent Council: 127 Decisions Made</span>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Job Creation Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Turn AI Anxiety Into AI Income
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              As AI grows, so does the need for AI safety oversight. When robotics go mainstream, 
              demand for watchdog analysts will explode 10x.
            </p>
          </div>

          {/* Job Creation Visual */}
          <div className="mb-16">
            <img 
              src="/job-creation-visual.png" 
              alt="Diverse analysts working from home" 
              className="w-full max-w-5xl mx-auto rounded-2xl shadow-2xl"
            />
          </div>

          {/* 3-Step Process */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-8 text-center hover:shadow-xl transition-shadow border-2 border-blue-100">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Train</h3>
              <p className="text-gray-600 mb-6">
                Complete free certification courses on AI safety, ethics, and technical assessment. 
                Learn at your own pace.
              </p>
              <Link href="/training">
                <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700">
                  Browse Courses →
                </Button>
              </Link>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-shadow border-2 border-green-100">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">2. Certify</h3>
              <p className="text-gray-600 mb-6">
                Pass industry-standard exams to become a certified AI Safety Watchdog Analyst. 
                Recognized globally.
              </p>
              <Link href="/certification">
                <Button variant="ghost" className="text-green-600 hover:text-green-700">
                  Take Exam →
                </Button>
              </Link>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-shadow border-2 border-purple-100">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Earn</h3>
              <p className="text-gray-600 mb-6">
                Get paid per report reviewed. Work from anywhere, set your own hours. 
                Average $45/hour.
              </p>
              <Link href="/workbench">
                <Button variant="ghost" className="text-purple-600 hover:text-purple-700">
                  Start Earning →
                </Button>
              </Link>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-black text-emerald-600 mb-2">10,000+</div>
              <div className="text-gray-600">Certified Analysts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-green-600 mb-2">$45/hr</div>
              <div className="text-gray-600">Average Pay</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">Work From Home</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-orange-600 mb-2">50K+</div>
              <div className="text-gray-600">Reports/Month</div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/watchdog-signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-12 py-6 text-lg font-semibold shadow-lg">
                See Current Job Openings
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* LOI Signup Section (Prominent) */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join the Founding Members
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Get 50% off your first year + priority job placement. 
              Limited to first 1,000 signups.
            </p>

            <form onSubmit={handleLOISubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-6 text-lg bg-white/10 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-6 py-6 text-lg bg-white/10 border border-white/30 text-white backdrop-blur-sm rounded-md"
              >
                <option value="individual" className="text-gray-900">Individual</option>
                <option value="enterprise" className="text-gray-900">Enterprise</option>
                <option value="government" className="text-gray-900">Government</option>
              </select>
              <Button 
                type="submit"
                size="lg" 
                className="bg-white text-emerald-600 hover:bg-emerald-50 px-8 py-6 text-lg font-semibold shadow-lg"
              >
                Get Early Access
              </Button>
            </form>

            <p className="text-sm text-blue-200 mt-4">
              ✓ No credit card required  ✓ Cancel anytime  ✓ 14-day free trial
            </p>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-100 text-emerald-700 text-sm px-4 py-2">
              The Western TC260
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Proven in China. Adapted for the West.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              China's TC260 has successfully governed AI safety for years. 
              CSOAI brings the same proven framework to Western markets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                33-Agent Byzantine Consensus
              </h3>
              <p className="text-gray-600">
                Decentralized decision-making across 5 LLM providers. 
                No single point of failure. Fault-tolerant governance.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Public Watchdog System
              </h3>
              <p className="text-gray-600">
                Anyone can report AI safety incidents. Certified analysts review. 
                Full transparency for public trust.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Certified Analyst Network
              </h3>
              <p className="text-gray-600">
                Trained professionals, not algorithms. Human oversight at scale. 
                Performance leaderboards ensure quality.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                PDCA Continuous Improvement
              </h3>
              <p className="text-gray-600">
                AI systems get safer over time through Plan-Do-Check-Act cycles. 
                Not one-time audits.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Transparent Public Dashboard
              </h3>
              <p className="text-gray-600">
                See every AI system, every incident, every decision. 
                Real-time compliance scores. No secrets.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Multi-Framework Compliance
              </h3>
              <p className="text-gray-600">
                EU AI Act, NIST AI RMF, ISO/IEC 42001. 
                One platform, all standards. Automated reporting.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              See It All. In Real-Time.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every AI system. Every incident. Every council decision. 
              Full transparency builds public trust.
            </p>
          </div>

          <div className="mb-12">
            <img 
              src="/transparency-visual.png" 
              alt="Real-time AI safety dashboard" 
              className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl"
            />
          </div>

          <div className="text-center">
            <Link href="/public-dashboard">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white px-12 py-6 text-lg font-semibold shadow-lg">
                Explore Public Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* For Enterprises Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-400/30">
                For Enterprises
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Prove Your AI is Safe. Publicly.
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Register your AI systems, get compliance scores, and show public transparency. 
                Avoid EU AI Act fines (up to €35M) and build customer trust.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Automated compliance assessments across EU AI Act, NIST, ISO</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">PDCA continuous improvement cycles with PDF reports</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">Public dashboard showing your commitment to safety</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">API/SDK integration for automated reporting</span>
                </li>
              </ul>

              <Link href="/enterprise-onboarding">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg font-semibold">
                  Register Your First AI System (Free Trial)
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div>
              <img 
                src="/council-visual.png" 
                alt="33-Agent Byzantine Consensus" 
                className="w-full rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted Globally
            </h2>
            <p className="text-xl text-gray-600">
              Governments, enterprises, and 10,000+ analysts rely on CSOAI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-black text-emerald-600 mb-2">1,000+</div>
              <div className="text-gray-600">AI Systems Registered</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-green-600 mb-2">50,000+</div>
              <div className="text-gray-600">Reports Reviewed</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-purple-600 mb-2">5,000+</div>
              <div className="text-gray-600">Council Decisions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Protect Humanity?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join 10,000+ certified analysts earning while making AI safer for everyone
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/watchdog-signup">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 px-12 py-6 text-lg font-semibold shadow-lg">
                Start Training (Individuals)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/enterprise-onboarding">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-12 py-6 text-lg font-semibold">
                Register AI System (Enterprises)
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-12 py-6 text-lg font-semibold">
                Request Demo (Governments)
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
