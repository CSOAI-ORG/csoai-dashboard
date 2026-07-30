import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ChevronDown, Search } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function FAQ() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const faqs = [
    {
      category: "Getting Started",
      items: [
        {
          question: "What is CSOAI?",
          answer: "CSOAI (Council of AIs) is the world's first comprehensive AI safety platform that trains, certifies, and employs AI Safety Analysts. We combine human expertise with a 33-Agent Byzantine Council to ensure unbiased AI safety assessments. Our platform integrates with 12+ global regulatory frameworks including the EU AI Act, UK AISI, US NIST RMF, and China TC260."
        },
        {
          question: "What is the difference between CSOAI and CEASAI?",
          answer: "**CSOAI (Council of AIs)** is our FREE public platform that includes:\n\n• The Watchdog incident reporting system\n• Public AI safety database\n• Free Watchdog Analyst training & certification\n• Community forum access\n• 33-Agent Byzantine Council voting system\n\n**CEASAI (Certified European AI Safety Analyst Institute)** is our professional certification body that offers PAID courses:\n\n• Individual Modules: £499 each (7 regional frameworks available)\n• Foundation Bundle: £999 (3 core frameworks - EU AI Act, NIST AI RMF, ISO 42001)\n• Complete Certification: £1,999 (all 7 modules = Global AI Safety Analyst Expert)\n\nCEASAI operates under CSOAI to provide legally recognized professional certifications."
        },
        {
          question: "Is the Watchdog program really free?",
          answer: "Yes! The CSOAI Watchdog program is 100% FREE. This includes:\n\n• Free Watchdog Analyst training (5 introductory modules)\n• Free certification exam\n• Free digital certificate\n• Access to report AI safety incidents\n• Community forum access\n• Participation in the £1M training giveaway (until Aug 2, 2026)\n\nThe paid CEASAI courses (£499-£1,999) are optional professional certifications for those who want advanced training and career advancement."
        },
        {
          question: "Do I need any prior experience to become an AI Safety Analyst?",
          answer: "No prior experience required. We teach you everything from scratch. You only need critical thinking skills, attention to detail, and a commitment to protecting humanity from AI risks. Our Fundamentals course (£499) is designed for complete beginners and covers the 5 essential frameworks."
        },
        {
          question: "How do I sign up?",
          answer: "Visit our signup page at /watchdog-signup, enter your email, and create a password. You'll get instant access to free introductory training. No credit card required for the free content. To access paid CEASAI courses, visit /landing to choose your certification tier."
        },
        {
          question: "What is the £1M training giveaway?",
          answer: "Until August 2, 2026, we're giving away £1,000,000 worth of FREE AI Safety Analyst training to build a global community of certified analysts. This includes:\n\n• Free access to all 5 Fundamentals modules (normally £499 value)\n• Free certification exam\n• Free digital certificate\n• Priority job placement after certification\n\nAfter Aug 2, 2026, only the basic Watchdog training remains free. Sign up NOW to claim your spot!"
        }
      ]
    },
    {
      category: "Course Structure & Pricing",
      items: [
        {
          question: "What are the three certification levels?",
          answer: "We offer flexible certification options:\n\n• **Individual Modules (£499 each)** - 7 regional frameworks available: EU AI Act, NIST AI RMF, UK AI Safety, Canada AIDA, Australia AI Ethics, ISO 42001, and China TC260. Perfect for focused learning. Each module includes certification exam.\n\n• **Foundation Bundle (£999)** - 3 core frameworks: EU AI Act, NIST AI RMF, and ISO 42001. Save £498 vs individual purchase. 100 exam questions, 75% passing threshold.\n\n• **Complete Certification (£1,999)** - All 7 modules. Earn the **Global AI Safety Analyst Expert** certification. Save £1,494 vs individual purchase. 150 exam questions, 80% passing threshold. Includes government agency access and white-label integration opportunities.\n\nMonthly payment plans available for all options."
        },
        {
          question: "How long does each course take?",
          answer: "Course durations are flexible, but recommended timelines:\n\n• **Fundamentals**: 4-6 weeks (5-7 hours/week)\n• **Professional**: 8-10 weeks (8-10 hours/week)\n• **Expert**: 12-16 weeks (10-12 hours/week)\n\nYou can learn at your own pace. These are recommended timelines, but you have lifetime access to all course materials once purchased."
        },
        {
          question: "What's the difference between the 13 modules and the 33-Agent Council?",
          answer: "Great question! These are completely different:\n\n**13 Training Modules** = Your education content:\n• 5 Fundamentals modules (£499 tier)\n• 8 Regional framework modules (£999 tier adds 5 of these)\n• All 13 modules = Expert tier (£1,999)\n\n**33-Agent Byzantine Council** = Our voting/decision system:\n• 33 AI agents from 12+ different providers (OpenAI, Anthropic, Google, Meta, Mistral, Cohere, xAI, etc.)\n• They vote on incident reports and compliance decisions\n• Requires 23 of 33 agents to agree (Byzantine fault tolerance)\n• Prevents single-vendor bias or manipulation\n\nThe 33 agents are the MECHANISM, not the training content."
        },
        {
          question: "Can I upgrade from Fundamentals to Professional or Expert later?",
          answer: "Yes! You can upgrade at any time. When you upgrade:\n\n• Pay only the difference (£499 → £999 = pay £500 more)\n• Keep all your previous progress and certificates\n• Unlock additional modules immediately\n• No need to retake previous exams\n\nMany students start with Fundamentals to test the waters, then upgrade to Professional or Expert as their career goals evolve."
        },
        {
          question: "Are there payment plans available?",
          answer: "Yes! We offer flexible payment options through Stripe:\n\n• **Pay in Full**: One-time payment at the listed price\n• **Monthly Installments**: Split payments over 3, 6, or 12 months\n• **Enterprise Sponsorship**: Companies can sponsor employee training\n\nAll payment plans include the same full access to course materials. Contact us for custom enterprise pricing for teams of 10+ analysts."
        },
        {
          question: "What's included in each course?",
          answer: "All courses include:\n\n• Full module access with video lessons and written content\n• Interactive quizzes and assessments\n• Real-world case studies from actual AI incidents\n• Digital certificate upon passing the exam\n• Lifetime access to course materials (including updates)\n• Community forum access\n• Job board access after certification\n\nProfessional and Expert levels also include:\n• Blockchain-verified certificates for authenticity\n• Priority job placement\n• Professional community membership\n• Government portal integration (Expert only)\n• White-label licensing opportunities (Expert only)"
        }
      ]
    },
    {
      category: "Exams & Certification",
      items: [
        {
          question: "How difficult is the certification exam?",
          answer: "Exam details by level:\n\n• **Fundamentals**: 50 multiple-choice questions, 60-minute time limit, 70% passing threshold (35 correct answers needed)\n• **Professional**: 100 questions, 120-minute time limit, 75% passing threshold (75 correct answers needed)\n• **Expert**: 150 questions, 180-minute time limit, 80% passing threshold (120 correct answers needed)\n\nMost students pass on their first attempt with proper preparation. The questions test real-world application, not just memorization."
        },
        {
          question: "Can I retake the exam if I fail?",
          answer: "Yes, unlimited retakes are included in your course fee. We provide detailed feedback after each attempt showing which areas need improvement. There's a 24-hour waiting period between attempts to encourage review. Many students use their first attempt as a learning experience."
        },
        {
          question: "How long is the certification valid?",
          answer: "Certificate validity periods:\n\n• **Fundamentals**: 2 years validity\n• **Professional**: 3 years validity\n• **Expert**: 5 years validity\n\nAfter expiration, you can renew by taking a shorter refresher exam (50% of original length) to stay current with new frameworks and regulations. Renewal exams are 50% discounted."
        },
        {
          question: "Are the certificates recognized by employers and governments?",
          answer: "Yes! Our certifications are:\n\n• **Industry-recognized**: Aligned with EU AI Act, NIST RMF, ISO 42001, and TC260 standards\n• **Blockchain-verified**: Professional and Expert certificates are immutably recorded (prevents forgery)\n• **Government-accepted**: Expert certification qualifies you for government AI safety auditor roles in 124+ countries\n• **White-label ready**: Governments can license our platform for national AI safety programs\n\nMany enterprises specifically look for CEASAI-certified analysts when hiring for AI compliance roles. Our Expert certification is being adopted as the standard for government AI auditors globally."
        },
        {
          question: "What does 'Global AI Safety Analyst Expert' certification mean?",
          answer: "The Expert certification (£1,999) makes you a **Global AI Safety Analyst Expert**, which means:\n\n• You've mastered all 13 modules (5 Fundamentals + 8 Regional frameworks)\n• You can assess AI systems against ANY major global framework\n• You're qualified to work as an AI safety auditor in 124+ countries\n• You can consult for governments on AI safety policy\n• You're eligible for white-label licensing (teach others using our platform)\n• You have the highest credential in the AI safety field\n\nThis is the gold standard certification for AI safety professionals worldwide."
        }
      ]
    },
    {
      category: "Work & Earnings",
      items: [
        {
          question: "What kind of work can I do as an AI Safety Analyst?",
          answer: "The scope of work grows with your certification level:\n\n• **Fundamentals certified**: entry-level incident review\n• **Professional certified**: multi-framework compliance auditing\n• **Expert certified**: government consulting and policy development\n\nAll work is remote and flexible. Expert-certified analysts with specialized skills (e.g., healthcare AI, financial AI) can take on consulting roles, and Expert certification is recognised for government contract work."
        },
        {
          question: "How do I find jobs after certification?",
          answer: "After certification, you can:\n\n1. **Browse our job board**: Active listings from enterprises needing analysts\n2. **Get matched automatically**: Our platform matches your skills to open roles\n3. **Government contracts**: Expert-certified analysts get priority for government auditor positions\n4. **Direct enterprise access**: Companies can hire you directly through the platform\n5. **Consulting opportunities**: Build your own practice with white-label licensing (Expert only)"
        },
        {
          question: "Can I work part-time?",
          answer: "Yes, 100% flexible. You set your own hours and choose which jobs to take. Many analysts work part-time (10-20 hours/week) while maintaining other jobs or studying. Our platform supports:\n\n• Part-time (10-20 hours/week)\n• Full-time (40+ hours/week)\n• Project-based (one-off audits)\n• Retainer agreements (ongoing monitoring)\n\nYou control your schedule completely."
        },
        {
          question: "What support do I get finding work after certification?",
          answer: "We have a large and growing network of enterprises needing analysts. If you don't, we offer:\n\n• **Free career support**: Resume review, interview prep, portfolio building\n• **Direct introductions**: We connect you with hiring partners\n• **Skill gap analysis**: Identify areas for improvement\n\nWe succeed when you succeed."
        }
      ]
    },
    {
      category: "Platform & Technology",
      items: [
        {
          question: "What is the 33-Agent Byzantine Council?",
          answer: "Our 33-Agent Council uses AI models from 12+ different providers:\n\n• OpenAI (GPT-4, GPT-4o)\n• Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)\n• Google DeepMind (Gemini 2.0 Flash, Gemini 1.5 Pro)\n• Meta AI (Llama 3.1, Llama 3.2)\n• Mistral AI (Mistral Large, Mistral Medium)\n• Cohere (Command R+)\n• xAI (Grok-2)\n• And more...\n\nEvery safety decision requires **23 of 33 agents to agree** (Byzantine fault tolerance). This prevents any single vendor from manipulating outcomes and ensures unbiased assessments. If OpenAI is compromised, the other 32 agents catch it."
        },
        {
          question: "Why do you use multiple AI providers instead of just one?",
          answer: "Single-vendor AI safety tools can be biased or manipulated. By using 12+ providers, we ensure:\n\n• **Unbiased assessments**: No single company controls the outcome\n• **Redundancy**: If one provider fails, others continue working\n• **Cross-validation**: Different models catch different issues\n• **Protection against manipulation**: Vendor can't rig results in their favor\n• **Regulatory compliance**: Meets EU AI Act requirements for independent oversight\n\nThis is called Byzantine fault tolerance - the same principle used in blockchain and military systems."
        },
        {
          question: "How do you integrate with government regulators?",
          answer: "We integrate with 12+ global regulatory frameworks:\n\n**Tier 1 (Fundamentals - £499):**\n• EU AI Act (European Union)\n• NIST AI RMF (USA)\n• ISO/IEC 42001 (International)\n• AI Ethics & Bias Standards\n• Incident Analysis Protocols\n\n**Tier 2 (Professional - £999, choose 5):**\n• UK AI Safety Institute\n• Canada AIDA\n• Australia AI Ethics Framework\n• China TC260\n• Singapore IMDA\n• Japan METI AI Strategy\n• South Korea AI Act\n• Brazil AI Bill\n\nOur platform automatically tracks regulatory updates and adjusts compliance requirements. Expert-certified analysts can consult for governments on implementing these frameworks."
        },
        {
          question: "Is my data private and secure?",
          answer: "Yes. We take security seriously:\n\n• **Encryption**: All data encrypted in transit (TLS 1.3) and at rest (AES-256)\n• **Privacy controls**: You control what data you share\n• **GDPR compliant**: Full compliance with EU data protection laws\n• **SOC 2 Type II**: Independently audited security controls\n• **Anonymization**: Watchdog reports can be anonymized on request\n\nWatchdog reports are public by default to ensure transparency (this is intentional - sunlight is the best disinfectant). But you can request anonymization for sensitive reports involving personal data."
        },
        {
          question: "What is the white-label government solution?",
          answer: "Our Expert certification (£1,999) includes access to our white-label platform licensing program. This allows:\n\n• **Governments**: License our platform for national AI safety programs\n• **Regulatory bodies**: Deploy CSOAI as their official AI auditing system\n• **International organizations**: Use our framework for cross-border AI governance\n\n**124+ countries** without comprehensive AI safety frameworks can adopt our platform immediately. We provide:\n\n• Full platform customization (branding, language, local regulations)\n• Training for government auditors\n• Technical support and maintenance\n• Regulatory update tracking\n• Integration with existing government systems\n\nThis is how we're building the global AI safety infrastructure. Expert-certified analysts can become licensed trainers and consultants for these government implementations."
        }
      ]
    },
    {
      category: "Enterprise & Compliance",
      items: [
        {
          question: "I'm an enterprise. How does CSOAI help my company?",
          answer: "Register your AI systems on CSOAI. Our platform:\n\n• **Automatically assesses compliance** with EU AI Act, NIST, ISO 42001, and TC260 standards\n• **Provides real-time compliance scores** across all frameworks\n• **Tracks regulatory changes automatically** (we monitor 12+ jurisdictions)\n• **Implements SOAI-PDCA continuous improvement cycles** (Plan-Do-Check-Act)\n• **Helps avoid fines** up to €35M under EU AI Act (deadline: August 2, 2026)\n• **Connects you with certified analysts** for auditing and monitoring\n\nThe EU AI Act enforcement begins August 2, 2026. Companies without compliance systems face massive fines. Start now."
        },
        {
          question: "How much does enterprise compliance cost?",
          answer: "Enterprise plans:\n\n• **Starter**: £999/month - Up to 5 AI systems, basic compliance monitoring\n• **Professional**: £2,999/month - Up to 25 AI systems, multi-framework compliance, dedicated analyst support\n• **Enterprise**: £9,999/month - Unlimited AI systems, white-glove service, custom integrations, dedicated compliance team\n• **Government**: Custom pricing - National-scale deployments, white-label licensing, full platform customization\n\nAll plans include:\n• Real-time compliance dashboards\n• Automated regulatory update tracking\n• Access to certified analyst network\n• API access for integrations\n• SOAI-PDCA cycle management\n\nContact our sales team for a demo and personalized quote."
        },
        {
          question: "Can we integrate CSOAI with our existing systems?",
          answer: "Yes. We provide:\n\n• **REST APIs**: Programmatic access to all platform features\n• **Webhooks**: Real-time alerts for compliance changes, incidents, regulatory updates\n• **SDKs**: Python and JavaScript libraries for easy integration\n• **Enterprise SSO**: SAML 2.0 and OAuth 2.0 support\n• **Custom integrations**: For large deployments, we build custom connectors\n\nSee our API documentation at /api-docs for details. Our APIs are RESTful, well-documented, and include code examples in multiple languages."
        },
        {
          question: "What is SOAI-PDCA and why does it matter?",
          answer: "SOAI-PDCA is our proprietary continuous improvement framework:\n\n**SOAI** = Safety-Oriented AI (our philosophy)\n**PDCA** = Plan-Do-Check-Act (Deming cycle)\n\nHow it works:\n1. **Plan**: Define AI safety goals and compliance requirements\n2. **Do**: Implement safety controls and monitoring\n3. **Check**: Certified analysts review your AI systems\n4. **Act**: Improve based on findings, then repeat\n\nThis is the same methodology used by China's TC260 system and ISO quality management standards. It ensures continuous improvement rather than one-time compliance checks.\n\nThe EU AI Act requires ongoing monitoring - SOAI-PDCA makes this automatic."
        }
      ]
    },
    {
      category: "About CSOAI & Vision",
      items: [
        {
          question: "Who founded CSOAI and why?",
          answer: "CSOAI was founded by AI safety researchers and compliance experts who believe the world needs a transparent, unbiased platform for AI governance. We're building the Western equivalent of China's TC260 system - but open source, transparent, and globally accessible.\n\nOur mission: **Make AI safe for humanity by creating a global network of certified AI Safety Analysts who can audit, monitor, and improve AI systems before they cause harm.**\n\nWe believe AI safety is too important to be controlled by any single company, government, or ideology. That's why we're open source and use Byzantine fault tolerance."
        },
        {
          question: "Is CSOAI open source?",
          answer: "Yes! Our core platform is open source on GitHub under the MIT License:\n\n• **Full transparency**: Anyone can audit our code\n• **Community contributions**: We accept pull requests and feature suggestions\n• **No vendor lock-in**: You can self-host if needed\n• **Reproducible results**: All algorithms and decision logic are public\n\nWe believe AI safety requires transparency. Closed-source safety tools can hide biases or manipulation. Open source ensures accountability.\n\nView our code: github.com/optimobile/coai-dashboard"
        },
        {
          question: "How is CSOAI funded?",
          answer: "CSOAI is funded through:\n\n1. **CEASAI course fees** (£499-£1,999): Professional certifications for career advancement\n2. **Enterprise subscriptions** (£999-£9,999/month): Compliance monitoring for AI companies\n3. **Government licensing** (custom pricing): White-label platform deployments for national AI safety programs\n4. **Grants and partnerships**: Research grants from AI safety organizations\n\nThe free Watchdog program is subsidized by paid services. Our goal is to make basic AI safety training accessible to everyone while monetizing advanced professional services.\n\nWe're currently raising a Series A round. Our £1M training giveaway is designed to build a global community of 10,000+ certified analysts, demonstrating market demand for AI safety services."
        },
        {
          question: "What is your business model for the £1M giveaway?",
          answer: "The £1M training giveaway (until Aug 2, 2026) is a strategic investment:\n\n**Cost**: £1M in free training (10,000 analysts × £100 cost per analyst)\n**Return**: \n• 10,000 certified analysts create network effects\n• Enterprises pay £999-£9,999/month to access this analyst network\n• Governments license our platform for £100K-£1M per country\n• Analysts become advocates, driving enterprise adoption\n\n**Example**: If just 100 enterprises sign up at £2,999/month, that's £3.6M annual recurring revenue. If 10 governments license at £500K each, that's £5M. Total addressable market: 124+ countries without AI safety frameworks.\n\nThe giveaway is customer acquisition. The real revenue comes from enterprise and government services.\n\nThis is why we're confident in a Series A valuation of £10-20M."
        },
        {
          question: "Why should I trust CSOAI over other AI safety platforms?",
          answer: "Unlike other platforms, CSOAI is:\n\n1. **Open source**: You can audit our code (github.com/optimobile/coai-dashboard)\n2. **Multi-vendor**: 33 agents from 12+ providers (no single-vendor bias)\n3. **Human-verified**: Real certified analysts, not just automated checks\n4. **Globally aligned**: Supports 12+ regulatory frameworks, not just one\n5. **Transparent**: All council votes are public\n6. **Non-profit mission**: We're building for humanity, not just profit\n7. **Government-grade**: Being adopted as the standard for national AI safety programs\n\nOther platforms are closed-source, single-vendor (e.g., OpenAI's safety tools only use OpenAI models), and lack human oversight. We're building the infrastructure that AI companies need and humanity deserves."
        },
        {
          question: "What happens after the £1M giveaway ends on Aug 2, 2026?",
          answer: "After August 2, 2026:\n\n• **Free Watchdog training remains free**: Basic incident reporting and community access\n• **CEASAI courses return to full price**: £499/£999/£1,999 for Fundamentals/Professional/Expert\n• **Early adopters get lifetime benefits**: Anyone who signs up before Aug 2 gets:\n  - Lifetime access to all Fundamentals modules (£499 value)\n  - Priority job placement\n  - Founding member badge\n  - 50% discount on future course upgrades\n\n**Sign up NOW to lock in your free training before the deadline!**\n\nThis is a limited-time opportunity to become a certified AI Safety Analyst at no cost. After Aug 2, you'll pay £499+ for the same training."
        }
      ]
    }
  ];

  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.flatMap(category =>
      category.items.map(item => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer.replace(/\*\*/g, "").replace(/•/g, "-").replace(/\n+/g, " ").trim(),
        },
      }))
    ),
  }), []);

  const filteredFaqs = faqs.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const toggleExpand = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setExpandedIndex(expandedIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>CSOAI FAQ — Certification, Pricing & Exams Answered</title>
        <meta name="description" content="Answers on CSOAI & CEASAI: certification tiers, course pricing, exam pass marks, earnings, the 33-Agent Council and the £1M training giveaway. Get started free." />
        <link rel="canonical" href="https://csoai.org/faq" />
        <meta property="og:title" content="CSOAI FAQ — Certification, Pricing & Exams Answered" />
        <meta property="og:description" content="Everything about CSOAI & CEASAI: certifications, pricing, exams, earnings and how AI safety analysts get certified." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://csoai.org/faq" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Everything you need to know about CSOAI, CEASAI certifications, and the £1M training giveaway
            </p>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFaqs.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-sm">
                      {category.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {category.items.length} question{category.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => {
                      const key = `${categoryIndex}-${itemIndex}`;
                      const isExpanded = expandedIndex === key;

                      return (
                        <Card key={itemIndex} className="overflow-hidden">
                          <button
                            onClick={() => toggleExpand(categoryIndex, itemIndex)}
                            className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <h3 className="font-semibold text-lg pr-4">
                                {item.question}
                              </h3>
                              <ChevronDown
                                className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="px-6 pb-6">
                              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                                {item.answer}
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredFaqs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No questions found matching "{searchTerm}"
                  </p>
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear search
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* CTA */}
          <Card className="mt-12 bg-primary/5 border-primary/20">
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Get in touch with our team.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" onClick={() => window.location.href = '/watchdog-signup'}>
                  Sign Up for Free Training
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/landing">View Pricing</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
