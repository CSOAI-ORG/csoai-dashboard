/**
 * FAQ Component - Reusable FAQ section for all pages
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  className?: string;
}

export function FAQ({ title = "Frequently Asked Questions", subtitle, items, className }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={cn("py-16", className)}>
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-4">
            <HelpCircle className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-600 text-sm font-medium">FAQ</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <Card
              key={index}
              className={cn(
                "overflow-hidden transition-all duration-200",
                openIndex === index ? "ring-2 ring-emerald-500/20" : ""
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="font-semibold text-gray-900 dark:text-white pr-4">
                  {item.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
                  {item.answer}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pre-defined FAQ sets for different pages
export const trainingFAQs: FAQItem[] = [
  {
    question: "What is included in the free training?",
    answer: "Our free training includes 5 comprehensive modules covering AI safety fundamentals, the EU AI Act, NIST AI RMF, and ISO 42001. You'll learn the core concepts needed to understand AI governance and compliance. The free training takes approximately 4 hours to complete and prepares you for the professional certification."
  },
  {
    question: "How long does the training take to complete?",
    answer: "The free foundation training takes approximately 4 hours. Professional certification courses (£499-£1,999) range from 8-40 hours depending on the depth and specialization. All courses are self-paced, so you can complete them on your own schedule."
  },
  {
    question: "Do I get a certificate after completing training?",
    answer: "Yes! Upon completing the free training, you receive a completion certificate. For professional certifications (CEASAI), you'll receive an official certificate that's verified on the blockchain and recognized by employers worldwide. The CEASAI certification demonstrates your expertise in AI safety and compliance."
  },
  {
    question: "What are the payment options for professional courses?",
    answer: "We offer flexible payment options: pay the full amount upfront for the best value, or spread payments over 3, 6, or 12 months. Monthly payments are calculated so the total equals the one-time price. For example, a £499 course can be paid as £166.33/month for 3 months."
  },
  {
    question: "Can I earn money after getting certified?",
    answer: "Absolutely! Certified AI Safety Analysts earn $45-150/hour reviewing AI systems for compliance. With the EU AI Act Article 50 deadline approaching (Aug 2, 2026), there's massive demand for qualified professionals. Our job board connects certified analysts with enterprises needing compliance support."
  }
];

export const certificationFAQs: FAQItem[] = [
  {
    question: "What is the CEASAI certification?",
    answer: "CEASAI (Certified Enterprise AI Safety Analyst) is the industry-standard certification for AI safety professionals. It demonstrates your ability to assess AI systems against major global frameworks including the EU AI Act, NIST AI RMF, and ISO 42001. The certification is recognized by enterprises and regulators worldwide."
  },
  {
    question: "How is the exam structured?",
    answer: "The certification exam consists of 50 multiple-choice questions to be completed in 90 minutes. You need a score of 70% or higher to pass. Questions cover all major AI safety frameworks, risk assessment, compliance documentation, and real-world case studies. You can retake the exam if needed."
  },
  {
    question: "How long is the certification valid?",
    answer: "CEASAI certification is valid for 2 years. To maintain your certification, you'll need to complete continuing education credits and stay current with regulatory updates. We provide ongoing training resources to help you maintain your certification."
  },
  {
    question: "What's the difference between the three certification tiers?",
    answer: "Fundamentals (£499) covers core AI safety concepts and one framework. Professional (£999) includes advanced topics and multiple frameworks. Expert (£1,999) provides comprehensive mastery of all frameworks plus specialized modules on emerging regulations. Each tier builds on the previous one."
  },
  {
    question: "Is the certification recognized by employers?",
    answer: "Yes! CEASAI certification is recognized by leading enterprises, consultancies, and regulatory bodies. Our certified analysts work at Fortune 500 companies, government agencies, and AI startups. The certification demonstrates practical, job-ready skills that employers value."
  }
];

export const pricingFAQs: FAQItem[] = [
  {
    question: "What's included in each pricing tier?",
    answer: "Pro (£39/month) includes unlimited training access, basic compliance tools, and email support. Enterprise (£159/month) adds API access, team management, custom reports, and dedicated support. Both tiers include access to our job board and community forums."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. Your access continues until the end of your current billing period. There are no cancellation fees or long-term commitments. If you cancel, you keep access to any certificates you've earned."
  },
  {
    question: "Do you offer discounts for teams or enterprises?",
    answer: "Yes! We offer volume discounts for teams of 5+ members. Enterprise customers with 50+ users receive custom pricing and dedicated account management. Contact our sales team for a custom quote tailored to your organization's needs."
  },
  {
    question: "Is there a free trial?",
    answer: "We offer free foundation training that gives you a comprehensive introduction to AI safety. This lets you experience our platform before committing to a paid plan. Additionally, Pro subscribers get a 14-day money-back guarantee if they're not satisfied."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through Stripe. We also support invoicing for enterprise accounts."
  }
];

export const complianceFAQs: FAQItem[] = [
  {
    question: "What compliance frameworks do you support?",
    answer: "We support all major AI governance frameworks including the EU AI Act, NIST AI RMF, ISO/IEC 42001, China's TC260, UK AI Bill, Canada's AIDA, and Australia's AI governance framework. Our platform helps you track compliance across multiple frameworks simultaneously."
  },
  {
    question: "How does the compliance tracking work?",
    answer: "Our SOAI-PDCA methodology provides a structured approach: Plan your compliance strategy, Do implement controls, Check through assessments and audits, Act on findings. The dashboard shows your compliance score across all frameworks with actionable recommendations."
  },
  {
    question: "Can I generate compliance reports for auditors?",
    answer: "Yes! Our platform generates comprehensive compliance reports suitable for regulatory audits. Reports include evidence documentation, control mappings, risk assessments, and remediation tracking. Enterprise users can customize report templates for specific regulatory requirements."
  },
  {
    question: "What is the Watchdog system?",
    answer: "The Watchdog system allows anyone to report AI safety concerns anonymously. Reports are reviewed by our 33-Agent Council (AI agents representing different perspectives) and certified human analysts. This creates a crowdsourced safety monitoring network for AI systems worldwide."
  },
  {
    question: "How do I know if my AI system is high-risk under the EU AI Act?",
    answer: "Our platform includes an AI system classifier that analyzes your use case against EU AI Act Annex III criteria. It identifies whether your system falls into prohibited, high-risk, limited-risk, or minimal-risk categories and provides specific compliance requirements for each classification."
  }
];

export const enterpriseFAQs: FAQItem[] = [
  {
    question: "What's included in enterprise pricing?",
    answer: "Enterprise plans include unlimited users, custom integrations, dedicated account management, SLA guarantees, on-premise deployment options, custom training programs, and white-label reporting. Pricing is customized based on your organization's size and needs."
  },
  {
    question: "Can you integrate with our existing systems?",
    answer: "Yes! We offer REST APIs and webhooks for integration with your existing GRC, ITSM, and compliance tools. We support SSO/SAML for enterprise authentication. Our team can help with custom integrations for your specific technology stack."
  },
  {
    question: "Do you offer on-premise deployment?",
    answer: "Yes, enterprise customers can choose between cloud-hosted (SaaS) or on-premise deployment. On-premise deployment is ideal for organizations with strict data residency requirements or air-gapped environments. We provide full support for both deployment models."
  },
  {
    question: "What support do enterprise customers receive?",
    answer: "Enterprise customers receive dedicated account management, 24/7 priority support, custom training sessions, quarterly business reviews, and direct access to our product team for feature requests. We also provide implementation support and change management guidance."
  },
  {
    question: "How do you handle data security and privacy?",
    answer: "We're SOC 2 Type II certified and GDPR compliant. Data is encrypted at rest and in transit. We offer data residency options for EU, US, and APAC regions. Enterprise customers can configure data retention policies and receive detailed security documentation for their compliance needs."
  }
];

export default FAQ;
