/**
 * CEASAI Certification Pricing
 * £499 / £999 / £1,999 tiers with correct module structure
 * Fundamentals: 5 core modules
 * Professional: Choose 5 from 8 regional frameworks
 * Expert: All 13 modules = Global AI Safety Analyst Expert
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  TrendingUp,
  Shield,
  Award,
  BookOpen,
  Clock,
  Users,
  Globe,
  Zap,
  CreditCard,
  Gift,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface PricingTier {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  currency: string;
  duration: string;
  modules: string;
  questions: number;
  passingThreshold: string;
  features: string[];
  monthlyOptions: {
    months: number;
    monthlyPrice: number;
    totalPrice: number;
  }[];
  popular?: boolean;
  color: string;
  icon: React.ElementType;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'fundamentals',
    name: 'Fundamentals',
    subtitle: 'Core AI Safety Frameworks',
    price: 4990,
    currency: '£',
    duration: '4-6 weeks',
    modules: '5 core modules',
    questions: 50,
    passingThreshold: '70%',
    features: [
      'EU AI Act essentials',
      'NIST AI RMF basics',
      'ISO 42001 introduction',
      'AI Ethics & Bias training',
      'Incident Analysis methods',
      'Digital certificate (2-year validity)',
      'Lifetime course access',
      'Community forum access',
      'Job board access',
      'Email support',
    ],
    monthlyOptions: [
      { months: 3, monthlyPrice: 1700, totalPrice: 5100 },
      { months: 6, monthlyPrice: 850, totalPrice: 5100 },
      { months: 12, monthlyPrice: 425, totalPrice: 5100 },
    ],
    color: 'emerald',
    icon: BookOpen,
  },
  {
    id: 'professional',
    name: 'Professional',
    subtitle: 'Multi-Framework Specialist',
    price: 9990,
    currency: '£',
    duration: '8-10 weeks',
    modules: 'Choose 5 from 8 regional frameworks',
    questions: 100,
    passingThreshold: '75%',
    features: [
      'Everything in Fundamentals',
      'Choose 5 regional frameworks:',
      '• UK AISI Framework',
      '• Canada AIDA',
      '• Australia AI Ethics',
      '• China TC260',
      '• Singapore IMDA',
      '• Japan METI AI Strategy',
      '• South Korea AI Act',
      '• Brazil AI Bill',
      'Blockchain-verified certificate (3-year validity)',
      'Priority job placement',
      'Professional community membership',
      'Priority email support',
    ],
    monthlyOptions: [
      { months: 3, monthlyPrice: 3400, totalPrice: 10200 },
      { months: 6, monthlyPrice: 1700, totalPrice: 10200 },
      { months: 12, monthlyPrice: 850, totalPrice: 10200 },
    ],
    popular: true,
    color: 'blue',
    icon: TrendingUp,
  },
  {
    id: 'expert',
    name: 'Expert',
    subtitle: 'Global AI Safety Analyst Expert',
    price: 19990,
    currency: '£',
    duration: '12-16 weeks',
    modules: 'All 13 modules (5 core + 8 regional)',
    questions: 150,
    passingThreshold: '80%',
    features: [
      'Everything in Professional',
      'All 5 Fundamentals modules',
      'All 8 Regional framework modules',
      'Earn "Global AI Safety Analyst Expert" certification',
      'Qualified for government AI auditor roles in 124+ countries',
      'White-label licensing opportunities',
      'Government portal integration',
      'Policy development training',
      'International harmonization expertise',
      'Multi-signature blockchain certificate (5-year validity)',
      'Dedicated account manager',
      'Lifetime professional network',
      'Speaking & consulting opportunities',
    ],
    monthlyOptions: [
      { months: 3, monthlyPrice: 6800, totalPrice: 20400 },
      { months: 6, monthlyPrice: 3400, totalPrice: 20400 },
      { months: 12, monthlyPrice: 1700, totalPrice: 20400 },
    ],
    color: 'purple',
    icon: Shield,
  },
];

interface PricingCardProps {
  tier: PricingTier;
  paymentType: 'full' | 'monthly';
  selectedMonths: number;
  onSelect: (tierId: string) => void;
}

function PricingCard({ tier, paymentType, selectedMonths, onSelect }: PricingCardProps) {
  const Icon = tier.icon;
  const monthlyOption = tier.monthlyOptions.find(o => o.months === selectedMonths);
  
  const colorClasses = {
    emerald: {
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      border: 'border-emerald-500/50',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      button: 'bg-emerald-600 hover:bg-emerald-700',
    },
    blue: {
      badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      border: 'border-blue-500/50',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
    purple: {
      badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      border: 'border-purple-500/50',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      button: 'bg-purple-600 hover:bg-purple-700',
    },
  };
  
  const colors = colorClasses[tier.color as keyof typeof colorClasses];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative ${tier.popular ? 'md:scale-105 z-10' : ''}`}
    >
      {tier.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-1">
            Most Popular
          </Badge>
        </div>
      )}

      <Card className={`h-full bg-slate-900/50 backdrop-blur-sm border-2 ${tier.popular ? colors.border : 'border-slate-700'} ${tier.popular ? 'shadow-xl shadow-blue-500/20' : ''}`}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between mb-2">
            <div className={`p-3 rounded-xl ${colors.bg}`}>
              <Icon className={`w-6 h-6 ${colors.text}`} />
            </div>
            <Badge className={colors.badge}>{tier.duration}</Badge>
          </div>
          <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
          <CardDescription className="text-slate-400">{tier.subtitle}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Price Display */}
          <div className={`rounded-xl p-4 ${colors.bg}`}>
            {paymentType === 'full' ? (
              <div>
                <p className="text-slate-400 text-sm mb-1">One-time payment</p>
                <p className="text-4xl font-bold text-white">
                  {tier.currency}{tier.price.toLocaleString()}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-slate-400 text-sm mb-1">{selectedMonths} monthly payments of</p>
                <p className="text-4xl font-bold text-white">
                  {tier.currency}{monthlyOption?.monthlyPrice}
                  <span className="text-lg text-slate-400 font-normal">/mo</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Total: {tier.currency}{monthlyOption?.totalPrice.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Program Stats */}
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">{tier.modules}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-500" />
              <span className="text-slate-300">{tier.questions} exam questions ({tier.passingThreshold} to pass)</span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {tier.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.text}`} />
                <span className="text-sm text-slate-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => onSelect(tier.id)}
            className={`w-full ${colors.button} text-white`}
            size="lg"
          >
            Enroll Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CEASAIPricing() {
  const [paymentType, setPaymentType] = useState<'full' | 'monthly'>('full');
  const [selectedMonths, setSelectedMonths] = useState(6);

  const handleSelect = (tierId: string) => {
    const tier = pricingTiers.find(t => t.id === tierId);
    if (tier) {
      toast.success(`Selected ${tier.name} certification!`, {
        description: paymentType === 'full' 
          ? `One-time payment of ${tier.currency}${tier.price}`
          : `${selectedMonths} payments of ${tier.currency}${tier.monthlyOptions.find(o => o.months === selectedMonths)?.monthlyPrice}/month`,
      });
    }
  };

  return (
    <div className="relative py-20 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 text-emerald-400 border-emerald-500/30">
            <Sparkles className="w-4 h-4 mr-2" />
            CEASAI Professional Certification
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Become a Global AI Safety Expert
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-4">
            Master 5 core frameworks or all 13 modules to earn the <strong className="text-white">Global AI Safety Analyst Expert</strong> certification. Qualified for government auditor roles in 124+ countries.
          </p>
          <p className="text-sm text-emerald-400 font-semibold">
            🎁 £1M Training Giveaway until Aug 2, 2026 - Fundamentals tier FREE for early adopters!
          </p>
        </div>

        {/* Payment Type Toggle */}
        <div className="flex flex-col items-center gap-6 mb-12">
          <Tabs value={paymentType} onValueChange={(v) => setPaymentType(v as 'full' | 'monthly')} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
              <TabsTrigger value="full" className="data-[state=active]:bg-emerald-600">
                <CreditCard className="w-4 h-4 mr-2" />
                Pay in Full
              </TabsTrigger>
              <TabsTrigger value="monthly" className="data-[state=active]:bg-emerald-600">
                <Clock className="w-4 h-4 mr-2" />
                Monthly Installments
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Monthly Options */}
          {paymentType === 'monthly' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex gap-4"
            >
              {[3, 6, 12].map((months) => (
                <button
                  key={months}
                  onClick={() => setSelectedMonths(months)}
                  className={`px-6 py-3 rounded-lg border-2 transition-all ${
                    selectedMonths === months
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className="font-bold">{months}</span> months
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {pricingTiers.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              paymentType={paymentType}
              selectedMonths={selectedMonths}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* Module Structure Explanation */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-slate-900/50 backdrop-blur-sm border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                Understanding the 13-Module Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300">
              <div>
                <h4 className="font-semibold text-white mb-2">5 Core Modules (Fundamentals - £499):</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>EU AI Act Essentials</li>
                  <li>NIST AI RMF Basics</li>
                  <li>ISO 42001 Introduction</li>
                  <li>AI Ethics & Bias Training</li>
                  <li>Incident Analysis Methods</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">8 Regional Frameworks (Professional - £999, choose 5):</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>UK AI Safety Institute (AISI) Framework</li>
                  <li>Canada Artificial Intelligence and Data Act (AIDA)</li>
                  <li>Australia AI Ethics Framework</li>
                  <li>China TC260 AI Governance Standards</li>
                  <li>Singapore IMDA AI Governance Framework</li>
                  <li>Japan METI AI Strategy</li>
                  <li>South Korea AI Act</li>
                  <li>Brazil AI Bill</li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-700">
                <h4 className="font-semibold text-white mb-2">Expert Tier (£1,999) = All 13 Modules:</h4>
                <p className="text-sm">
                  Master all 5 core + all 8 regional frameworks to earn the prestigious <strong className="text-emerald-400">Global AI Safety Analyst Expert</strong> certification. 
                  This qualifies you for government AI auditor positions in 124+ countries and white-label licensing opportunities.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-6">Trusted by professionals and governments worldwide</p>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-5 h-5" />
              <span>Blockchain-Verified Certificates</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Award className="w-5 h-5" />
              <span>Government-Recognized</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Globe className="w-5 h-5" />
              <span>124+ Countries</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="w-5 h-5" />
              <span>10,000+ Certified Analysts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CEASAIPricing;
