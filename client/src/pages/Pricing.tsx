import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/lib/trpc';
import { 
  Check, 
  X, 
  Zap, 
  Building2, 
  Rocket,
  Shield,
  Users,
  FileText,
  Brain,
  Globe,
  Mail,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const PRICING_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams getting started with AI governance',
    monthlyPrice: 499,
    yearlyPrice: 399,
    icon: Zap,
    color: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    features: {
      aiSystems: 5,
      assessments: 25,
      teamMembers: 3,
      frameworks: ['EU AI Act', 'NIST RMF'],
      support: 'Email',
      apiAccess: true,
      pdfReports: true,
      emailDelivery: true,
      bulkRegistration: false,
      customIntegrations: false,
      dedicatedSupport: false,
      sla: '48-hour response',
      councilAccess: 'Full access',
      watchdogReports: 25,
      pdcaCycles: 5,
      knowledgeBase: 'Full',
    },
    cta: 'Start with Starter',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For growing organizations with compliance needs',
    monthlyPrice: 999,
    yearlyPrice: 799,
    icon: Rocket,
    color: 'text-emerald-500 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/50',
    features: {
      aiSystems: 25,
      assessments: 'Unlimited',
      teamMembers: 10,
      frameworks: ['EU AI Act', 'NIST RMF', 'TC260'],
      support: 'Priority Email',
      apiAccess: true,
      pdfReports: true,
      emailDelivery: true,
      bulkRegistration: true,
      customIntegrations: false,
      dedicatedSupport: false,
      sla: '24-hour response',
      councilAccess: 'Full access',
      watchdogReports: 'Unlimited',
      pdcaCycles: 25,
      knowledgeBase: 'Full',
    },
    cta: 'Start Professional',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations requiring full compliance',
    monthlyPrice: 1999,
    yearlyPrice: 1599,
    icon: Building2,
    color: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    features: {
      aiSystems: 'Unlimited',
      assessments: 'Unlimited',
      teamMembers: 'Unlimited',
      frameworks: ['EU AI Act', 'NIST RMF', 'TC260', 'ISO 42001'],
      support: 'Priority + Phone',
      apiAccess: true,
      pdfReports: true,
      emailDelivery: true,
      bulkRegistration: true,
      customIntegrations: true,
      dedicatedSupport: true,
      sla: '4-hour response',
      councilAccess: 'Full + Priority',
      watchdogReports: 'Unlimited',
      pdcaCycles: 'Unlimited',
      knowledgeBase: 'Full + Custom',
    },
    cta: 'Contact Sales',
    popular: false,
  },
];

const FEATURE_CATEGORIES = [
  {
    name: 'Core Features',
    features: [
      { key: 'aiSystems', label: 'AI Systems', description: 'Number of AI systems you can register' },
      { key: 'assessments', label: 'Compliance Assessments', description: 'Monthly assessment limit' },
      { key: 'teamMembers', label: 'Team Members', description: 'Users in your organization' },
      { key: 'frameworks', label: 'Compliance Frameworks', description: 'Supported regulatory frameworks' },
    ],
  },
  {
    name: 'Reporting & Analytics',
    features: [
      { key: 'pdfReports', label: 'PDF Reports', description: 'Generate downloadable compliance reports' },
      { key: 'emailDelivery', label: 'Email Delivery', description: 'Send reports directly via email' },
      { key: 'pdcaCycles', label: 'PDCA Cycles', description: 'Continuous improvement workflows' },
      { key: 'knowledgeBase', label: 'Knowledge Base', description: 'Access to AI safety scenarios' },
    ],
  },
  {
    name: 'Integration & API',
    features: [
      { key: 'apiAccess', label: 'API Access', description: 'Programmatic access to CSOAI' },
      { key: 'bulkRegistration', label: 'Bulk Registration', description: 'Register multiple systems at once' },
      { key: 'customIntegrations', label: 'Custom Integrations', description: 'Connect to your existing tools' },
    ],
  },
  {
    name: 'Support & SLA',
    features: [
      { key: 'support', label: 'Support Channel', description: 'How to reach our team' },
      { key: 'sla', label: 'Response SLA', description: 'Guaranteed response time' },
      { key: 'dedicatedSupport', label: 'Dedicated Support', description: 'Named account manager' },
    ],
  },
  {
    name: 'CSOAI Ecosystem',
    features: [
      { key: 'councilAccess', label: '33-Agent Council', description: 'AI safety evaluation access' },
      { key: 'watchdogReports', label: 'Watchdog Reports', description: 'Monthly incident reports' },
    ],
  },
];

const FAQ = [
  {
    question: 'What\'s included in each pricing tier?',
    answer: 'Starter (£499/month) includes 5 AI systems, 25 assessments, and email support. Professional (£999/month) adds 25 AI systems, unlimited assessments, bulk registration, and priority support. Enterprise (£1,999/month) includes unlimited everything, custom integrations, dedicated support, and 4-hour SLA. All tiers include API access and PDF reports.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. Your access continues until the end of your current billing period. There are no cancellation fees or long-term commitments. If you cancel, you keep access to any certificates you\'ve earned.',
  },
  {
    question: 'Do you offer discounts for teams or enterprises?',
    answer: 'Yes! We offer volume discounts for teams of 5+ members. Enterprise customers with 50+ users receive custom pricing and dedicated account management. Contact our sales team for a custom quote tailored to your organization\'s needs.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'We offer free foundation training that gives you a comprehensive introduction to AI safety. This lets you experience our platform before committing to a paid plan. Additionally, Pro subscribers get a 14-day money-back guarantee if they\'re not satisfied.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through Stripe. We also support invoicing for enterprise accounts.',
  },
  {
    question: 'What compliance frameworks are supported?',
    answer: 'We support all major AI governance frameworks including the EU AI Act, NIST AI RMF, ISO/IEC 42001, China\'s TC260, UK AI Bill, Canada\'s AIDA, and Australia\'s AI governance framework. Our platform helps you track compliance across multiple frameworks simultaneously.',
  },
  {
    question: 'How does the 33-Agent Council work?',
    answer: 'Our AI council evaluates safety scenarios using 33 specialized agents representing different stakeholder perspectives (regulators, ethicists, engineers, affected communities, etc.). Using Byzantine fault-tolerant consensus, they provide balanced recommendations that inform compliance decisions.',
  },
  {
    question: 'Can I get a custom enterprise quote?',
    answer: 'Absolutely! Enterprise plans include unlimited users, custom integrations, dedicated account management, SLA guarantees, on-premise deployment options, and white-label reporting. Contact our sales team for pricing customized to your organization\'s size and needs.',
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [isYearly, setIsYearly] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0); // Default to first FAQ expanded
  
  const { data: user } = trpc.auth.me.useQuery();
  const checkoutMutation = trpc.stripe.createCheckoutSession.useMutation();
  
  const handleSubscribe = async (tierId: string) => {
    if (tierId === 'starter') {
      // Starter tier goes through Stripe checkout
      try {
        const result = await checkoutMutation.mutateAsync({
          tier: 'pro' as 'pro' | 'enterprise', // Map starter to pro for now
          billingPeriod: isYearly ? 'yearly' : 'monthly',
        });
        if (result.url) {
          window.location.href = result.url;
        }
      } catch (error) {
        console.error('Checkout failed:', error);
      }
      return;
    }
    
    if (tierId === 'enterprise') {
      // Open contact form or email
      window.location.href = 'mailto:enterprise@csoai.org?subject=Enterprise%20Inquiry';
      return;
    }
    
    try {
      const result = await checkoutMutation.mutateAsync({
        tier: tierId as 'pro' | 'enterprise',
        billingPeriod: isYearly ? 'yearly' : 'monthly',
      });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };
  
  const renderFeatureValue = (value: any) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-400" />
      ) : (
        <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      );
    }
    if (Array.isArray(value)) {
      return <span className="text-sm">{value.join(', ')}</span>;
    }
    return <span className="text-sm font-medium">{value}</span>;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            Pricing
          </Badge>
          <h1 className="text-lg sm:text-xl md:text-2xl sm:text-3xl md:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your AI governance needs. All plans include core compliance features.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm ${!isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>Monthly</span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              data-testid="pricing-billing-toggle"
            />
            <span className={`text-sm ${isYearly ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
              Yearly <Badge className="ml-2 bg-green-500/20 text-green-400 border-green-500/30">Save 20%</Badge>
            </span>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16" data-testid="pricing-cards-grid">
          {PRICING_TIERS.map((tier) => {
            const Icon = tier.icon;
            const price = isYearly ? tier.yearlyPrice : tier.monthlyPrice;
            
            return (
              <Card 
                key={tier.id}
                data-testid={`pricing-card-${tier.id}`}
                className={`relative bg-white dark:bg-gray-900 border-2 ${tier.borderColor} ${
                  tier.popular ? 'scale-105 shadow-xl shadow-emerald-500/20' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-500 text-white border-0">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto p-3 rounded-xl ${tier.bgColor} w-fit mb-4`}>
                    <Icon className={`h-8 w-8 ${tier.color}`} />
                  </div>
                  <CardTitle className="text-lg sm:text-xl md:text-2xl text-white">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">£{price.toLocaleString()}</span>
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                    {isYearly && tier.monthlyPrice > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-500 mt-1">
                        Billed £{(price * 12).toLocaleString()}/year
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => handleSubscribe(tier.id)}
                    data-testid={`pricing-subscribe-${tier.id}`}
                    className={`w-full mb-6 ${
                      tier.popular 
                        ? 'bg-cyan-600 hover:bg-cyan-700' 
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {tier.cta}
                  </Button>
                  
                  <div className="text-left space-y-3">
                    <p className="text-sm font-medium text-slate-300 mb-2">Includes:</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span>{tier.features.aiSystems} AI System{tier.features.aiSystems !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span>{tier.features.assessments} Assessments</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span>{tier.features.teamMembers} Team Member{tier.features.teamMembers !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span>{tier.features.frameworks.length} Framework{tier.features.frameworks.length !== 1 ? 's' : ''}</span>
                      </div>
                      {tier.features.apiAccess && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span>API Access</span>
                        </div>
                      )}
                      {tier.features.pdfReports && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span>PDF Reports</span>
                        </div>
                      )}
                      {tier.features.dedicatedSupport && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span>Dedicated Support</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Feature Comparison Table */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center mb-8">Compare All Features</h2>
          <Card className="bg-white dark:bg-gray-900 border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-4 text-slate-400 font-medium">Feature</th>
                    {PRICING_TIERS.map(tier => (
                      <th key={tier.id} className="text-center p-4 text-white font-medium">
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_CATEGORIES.map((category, catIndex) => (
                    <>
                      <tr key={`cat-${catIndex}`} className="bg-gray-50 dark:bg-gray-800">
                        <td colSpan={4} className="p-3 text-sm font-semibold text-emerald-500 dark:text-emerald-400">
                          {category.name}
                        </td>
                      </tr>
                      {category.features.map((feature, featIndex) => (
                        <tr key={`feat-${catIndex}-${featIndex}`} className="border-b border-slate-700/50">
                          <td className="p-4">
                            <div>
                              <p className="text-white text-sm">{feature.label}</p>
                              <p className="text-slate-500 text-xs">{feature.description}</p>
                            </div>
                          </td>
                          {PRICING_TIERS.map(tier => (
                            <td key={tier.id} className="text-center p-4">
                              {renderFeatureValue((tier.features as any)[feature.key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        
        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQ.map((item, index) => (
              <Card 
                key={index}
                className="bg-white dark:bg-gray-900 border-slate-700"
              >
                <CardContent className="p-4">
                  <h3 className="font-medium text-white mb-2">{item.question}</h3>
                  <p className="mt-3 text-slate-400 text-sm">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/30">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4">Need a Custom Solution?</h2>
              <p className="text-slate-300 mb-6">
                Large organizations and government agencies can get custom pricing, dedicated support, 
                and tailored compliance workflows.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.location.href = 'mailto:enterprise@csoai.org'}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Sales
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/enterprise-onboarding')}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Start Enterprise Trial
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
