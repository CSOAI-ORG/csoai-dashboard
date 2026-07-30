/**
 * Watchdog → CEASA Conversion Funnel
 * Guides users from free public forum to paid certification
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
  Award,
  Globe,
  Lock,
  CheckCircle,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface ConversionStep {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  cta: string;
  benefits: string[];
}

const conversionSteps: ConversionStep[] = [
  {
    step: 1,
    title: 'Discover Issues in Watchdog Forum',
    description: 'Browse real-world AI safety issues reported by the public',
    icon: <Globe className="w-8 h-8 text-blue-600" />,
    action: 'Public',
    cta: 'Explore Forum',
    benefits: [
      'See real-world AI problems',
      'Learn from community insights',
      'Understand compliance gaps',
    ],
  },
  {
    step: 2,
    title: 'Take Free Educational Modules',
    description: 'Learn AI safety concepts through Watchdog educational content',
    icon: <BookOpen className="w-8 h-8 text-green-600" />,
    action: 'Free',
    cta: 'Start Learning',
    benefits: [
      'Master AI safety basics',
      'Understand EU AI Act',
      'No cost, lifetime access',
    ],
  },
  {
    step: 3,
    title: 'Upgrade to CEASA Fundamentals',
    description: 'Get certified with legal rigor and industry recognition',
    icon: <Award className="w-8 h-8 text-purple-600" />,
    action: 'Paid',
    cta: 'Get Certified',
    benefits: [
      'CEASA certificate',
      'Government integration',
      'Career advancement',
    ],
  },
  {
    step: 4,
    title: 'Advance to Professional',
    description: 'Become a certified AI safety analyst for enterprises',
    icon: <Briefcase className="w-8 h-8 text-orange-600" />,
    action: 'Premium',
    cta: 'Become Analyst',
    benefits: [
      'Job board access',
      'Higher salary potential',
      'Enterprise opportunities',
    ],
  },
  {
    step: 5,
    title: 'Reach Expert Level',
    description: 'Become a regulatory-level expert and policy influencer',
    icon: <TrendingUp className="w-8 h-8 text-red-600" />,
    action: 'Elite',
    cta: 'Become Expert',
    benefits: [
      'Government agency access',
      'Policy influence',
      'Leadership roles',
    ],
  },
];

interface ConversionFunnelProps {
  userStep: number;
  onProgress: (step: number) => void;
}

function ConversionStepCard({ step, isActive, onSelect }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: step.step * 0.1 }}
    >
      <Card
        className={`cursor-pointer transition-all ${
          isActive ? 'border-2 border-purple-600 shadow-lg' : 'hover:shadow-md'
        }`}
        onClick={() => onSelect(step.step)}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              {step.icon}
              <div>
                <p className="text-xs font-semibold text-gray-600">Step {step.step}</p>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </div>
            </div>
            <Badge variant={step.action === 'Public' ? 'default' : 'outline'}>
              {step.action}
            </Badge>
          </div>
          <CardDescription>{step.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Benefits:</p>
            <ul className="space-y-1">
              {step.benefits.map((benefit: string, idx: number) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <Button className="w-full" variant={isActive ? 'default' : 'outline'}>
            {step.cta}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function WatchdogToCEASAFunnel({ userStep = 1, onProgress }: ConversionFunnelProps) {
  const [selectedStep, setSelectedStep] = useState(userStep);
  const progressPercentage = (userStep / conversionSteps.length) * 100;

  const handleSelectStep = (step: number) => {
    if (step <= userStep + 1) {
      setSelectedStep(step);
      onProgress?.(step);
    } else {
      toast.info('Complete the previous steps first!');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold">Your Path to AI Safety Expertise</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          From discovering real-world AI issues to becoming a certified expert. Start free, grow
          your skills, and advance your career.
        </p>
      </motion.div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Your Progress</p>
                <p className="text-2xl font-bold">
                  Step {userStep} of {conversionSteps.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-600">{Math.round(progressPercentage)}%</p>
                <p className="text-sm text-gray-600">Complete</p>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Conversion Steps */}
      <div className="space-y-4">
        {conversionSteps.map((step) => (
          <ConversionStepCard
            key={step.step}
            step={step}
            isActive={selectedStep === step.step}
            onSelect={handleSelectStep}
          />
        ))}
      </div>

      {/* ROI Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-8"
      >
        <h3 className="text-2xl font-bold mb-6">Investment in Your Future</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fundamentals ROI */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CEASA Fundamentals</CardTitle>
              <CardDescription>Entry-level certification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Investment</p>
                <p className="text-2xl font-bold">£499</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Salary Increase (Avg)</p>
                <p className="text-2xl font-bold text-green-600">+£5K/year</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">ROI Timeline</p>
                <p className="text-lg font-semibold">~1 month</p>
              </div>
              <Button className="w-full" variant="outline">
                Enroll Now
              </Button>
            </CardContent>
          </Card>

          {/* Professional ROI */}
          <Card className="border-2 border-purple-600">
            <CardHeader>
              <Badge className="w-fit mb-2">Most Popular</Badge>
              <CardTitle className="text-lg">CEASA Professional</CardTitle>
              <CardDescription>Industry-recognized certification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Investment</p>
                <p className="text-2xl font-bold">£999</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Salary Increase (Avg)</p>
                <p className="text-2xl font-bold text-green-600">+£20K/year</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">ROI Timeline</p>
                <p className="text-lg font-semibold">~2 months</p>
              </div>
              <Button className="w-full">Enroll Now</Button>
            </CardContent>
          </Card>

          {/* Expert ROI */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CEASA Expert</CardTitle>
              <CardDescription>Regulatory-level expertise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Investment</p>
                <p className="text-2xl font-bold">£1,999</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Salary Increase (Avg)</p>
                <p className="text-2xl font-bold text-green-600">+£50K+/year</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">ROI Timeline</p>
                <p className="text-lg font-semibold">~3 months</p>
              </div>
              <Button className="w-full" variant="outline">
                Enroll Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Success Stories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="text-2xl font-bold">Success Stories</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              name: 'Sarah Chen',
              role: 'Compliance Officer → AI Safety Analyst',
              company: 'TechCorp EU',
              testimonial:
                'CEASA Fundamentals gave me the knowledge to identify compliance gaps. Now I lead our AI safety team.',
              tier: 'Professional',
            },
            {
              name: 'Marco Rossi',
              role: 'Policy Advisor',
              company: 'EU Commission',
              testimonial:
                'The Expert program prepared me perfectly for regulatory work. Highly recommended for government roles.',
              tier: 'Expert',
            },
          ].map((story, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">{story.name}</p>
                    <p className="text-sm text-gray-600">{story.role}</p>
                    <p className="text-xs text-gray-500">{story.company}</p>
                  </div>
                  <p className="text-sm italic text-gray-700">"{story.testimonial}"</p>
                  <Badge variant="outline">{story.tier}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="text-center space-y-4 py-8"
      >
        <h3 className="text-2xl font-bold">Ready to Start Your Journey?</h3>
        <p className="text-gray-600 max-w-xl mx-auto">
          Join thousands of professionals becoming certified AI safety analysts. Start free today.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Globe className="w-4 h-4 mr-2" />
            Explore Watchdog Forum
          </Button>
          <Button size="lg" variant="outline">
            <Award className="w-4 h-4 mr-2" />
            View CEASA Programs
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Export a simple BookOpen icon for the import
import { BookOpen } from 'lucide-react';
