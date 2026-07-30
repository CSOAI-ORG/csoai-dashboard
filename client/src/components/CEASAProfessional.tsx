/**
 * CEASA Professional & Expert Programs
 * Advanced certifications for industry practitioners and regulators
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  CheckCircle,
  Lock,
  TrendingUp,
  Users,
  Globe,
  Award,
  BookOpen,
  Code,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ProgramTier {
  name: 'fundamentals' | 'professional' | 'expert';
  title: string;
  subtitle: string;
  duration: string;
  modules: number;
  questions: number;
  price: number;
  features: string[];
  targetAudience: string[];
  prerequisites?: string;
  governmentIntegration: boolean;
  blockchainCertificate: boolean;
  validityPeriod: string;
}

const programTiers: ProgramTier[] = [
  {
    name: 'fundamentals',
    title: 'CEASA Fundamentals',
    subtitle: 'Entry-level certification',
    duration: '6 weeks',
    modules: 10,
    questions: 100,
    price: 499,
    features: [
      'EU AI Act essentials',
      'Risk classification',
      'Compliance basics',
      'Certificate of completion',
      'Lifetime access to materials',
      '1 year certificate validity',
    ],
    targetAudience: [
      'Compliance officers',
      'Project managers',
      'Business analysts',
      'Policy makers',
    ],
    governmentIntegration: false,
    blockchainCertificate: false,
    validityPeriod: '1 year',
  },
  {
    name: 'professional',
    title: 'CEASA Professional',
    subtitle: 'Industry-recognized certification',
    duration: '12 weeks',
    modules: 20,
    questions: 200,
    price: 999,
    features: [
      'All Fundamentals content',
      'Advanced risk assessment',
      'Conformity assessment procedures',
      'Quality management systems',
      'Sector-specific compliance',
      'Government portal integration',
      'Blockchain-verified certificate',
      'Job board access',
      'Professional community',
      '2 year certificate validity',
      'Continuing education credits',
    ],
    targetAudience: [
      'AI safety analysts',
      'Compliance auditors',
      'Enterprise architects',
      'Regulatory consultants',
    ],
    prerequisites: 'CEASA Fundamentals or equivalent experience',
    governmentIntegration: true,
    blockchainCertificate: true,
    validityPeriod: '2 years',
  },
  {
    name: 'expert',
    title: 'CEASA Expert',
    subtitle: 'Regulatory-level expertise',
    duration: '16 weeks',
    modules: 30,
    questions: 300,
    price: 1999,
    features: [
      'All Professional content',
      'Advanced regulatory procedures',
      'Notified Body operations',
      'Policy development',
      'International harmonization',
      'Research projects',
      'Mentorship program',
      'Government agency access',
      'Blockchain + multi-signature certificates',
      'Speaking opportunities',
      'Regulatory consultation rights',
      '3 year certificate validity',
      'Lifetime professional network',
    ],
    targetAudience: [
      'Regulatory authorities',
      'Policy makers',
      'Senior consultants',
      'Academic researchers',
      'Government officials',
    ],
    prerequisites: 'CEASA Professional or 5+ years AI governance experience',
    governmentIntegration: true,
    blockchainCertificate: true,
    validityPeriod: '3 years',
  },
];

interface TierCardProps {
  tier: ProgramTier;
  isPopular?: boolean;
  onSelect: (tierName: string) => void;
}

function ProgramTierCard({ tier, isPopular, onSelect }: TierCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative ${isPopular ? 'md:scale-105' : ''}`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-purple-600">Most Popular</Badge>
        </div>
      )}

      <Card className={`h-full ${isPopular ? 'border-2 border-purple-600 shadow-xl' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div>
              <CardTitle className="text-2xl">{tier.title}</CardTitle>
              <CardDescription>{tier.subtitle}</CardDescription>
            </div>
            {tier.name === 'professional' && <TrendingUp className="w-6 h-6 text-purple-600" />}
            {tier.name === 'expert' && <Shield className="w-6 h-6 text-blue-600" />}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Price */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
            <p className="text-gray-600 text-sm mb-1">Starting at</p>
            <p className="text-3xl font-bold">
              £{tier.price}
              <span className="text-lg text-gray-600 font-normal">/program</span>
            </p>
          </div>

          {/* Program Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Duration</p>
              <p className="font-semibold">{tier.duration}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Modules</p>
              <p className="font-semibold">{tier.modules} modules</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Exam Questions</p>
              <p className="font-semibold">{tier.questions} questions</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Certificate Validity</p>
              <p className="font-semibold">{tier.validityPeriod}</p>
            </div>
          </div>

          {/* Features */}
          <div>
            <p className="font-semibold text-sm mb-3">Includes:</p>
            <ul className="space-y-2">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Target Audience */}
          <div>
            <p className="font-semibold text-sm mb-2">For:</p>
            <div className="flex flex-wrap gap-1">
              {tier.targetAudience.map((audience) => (
                <Badge key={audience} variant="secondary" className="text-xs">
                  {audience}
                </Badge>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          {tier.prerequisites && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-900 mb-1">Prerequisites</p>
              <p className="text-sm text-blue-800">{tier.prerequisites}</p>
            </div>
          )}

          {/* CTA Button */}
          <Button
            onClick={() => onSelect(tier.name)}
            className="w-full"
            variant={isPopular ? 'default' : 'outline'}
          >
            {tier.name === 'fundamentals' ? 'Start Free Trial' : 'Enroll Now'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CEASAProfessionalTiers() {
  const handleSelectTier = (tierName: string) => {
    toast.success(`Enrolled in CEASA ${tierName.charAt(0).toUpperCase() + tierName.slice(1)}!`);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-4"
      >
        <h2 className="text-4xl font-bold">CEASA Certification Programs</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose your path to becoming a certified EU AI safety analyst. From fundamentals to
          expert-level regulatory expertise.
        </p>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {programTiers.map((tier) => (
          <ProgramTierCard
            key={tier.name}
            tier={tier}
            isPopular={tier.name === 'professional'}
            onSelect={handleSelectTier}
          />
        ))}
      </div>

      {/* Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-2xl font-bold">Detailed Comparison</h3>

        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="career">Career Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-semibold">Feature</th>
                        {programTiers.map((tier) => (
                          <th key={tier.name} className="text-center py-2 px-4 font-semibold">
                            {tier.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-4">Government Integration</td>
                        {programTiers.map((tier) => (
                          <td key={tier.name} className="text-center py-2 px-4">
                            {tier.governmentIntegration ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <Lock className="w-5 h-5 text-gray-400 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Blockchain Certificate</td>
                        {programTiers.map((tier) => (
                          <td key={tier.name} className="text-center py-2 px-4">
                            {tier.blockchainCertificate ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <Lock className="w-5 h-5 text-gray-400 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-4">Job Board Access</td>
                        {programTiers.map((tier) => (
                          <td key={tier.name} className="text-center py-2 px-4">
                            {tier.name !== 'fundamentals' ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <Lock className="w-5 h-5 text-gray-400 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-4">Professional Community</td>
                        {programTiers.map((tier) => (
                          <td key={tier.name} className="text-center py-2 px-4">
                            {tier.name !== 'fundamentals' ? (
                              <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <Lock className="w-5 h-5 text-gray-400 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-600 mb-4">
                  Each tier builds on the previous level with increasingly advanced content:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Badge className="mr-3 mt-1">Fundamentals</Badge>
                    <span className="text-sm">
                      10 modules covering EU AI Act basics, risk classification, and compliance
                      fundamentals
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Badge className="mr-3 mt-1">Professional</Badge>
                    <span className="text-sm">
                      20 modules adding advanced risk assessment, conformity procedures, and
                      sector-specific compliance
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Badge className="mr-3 mt-1">Expert</Badge>
                    <span className="text-sm">
                      30 modules including regulatory procedures, policy development, and
                      international harmonization
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="career" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Career Paths by Tier:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Fundamentals:</strong> Compliance officer, project manager,
                          business analyst
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Professional:</strong> AI safety analyst, compliance auditor,
                          enterprise architect
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Expert:</strong> Regulatory authority, policy maker, senior
                          consultant
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-gray-50 rounded-lg p-8"
      >
        <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Can I upgrade from Fundamentals to Professional?</h4>
            <p className="text-sm text-gray-600">
              Yes! You can upgrade anytime. We'll credit your Fundamentals payment toward the
              Professional program.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Is the certificate recognized by governments?</h4>
            <p className="text-sm text-gray-600">
              CEASA certificates are blockchain-verified and integrated with EU government portals,
              making them officially recognized for compliance purposes.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What if I don't pass the exam?</h4>
            <p className="text-sm text-gray-600">
              You can retake the exam unlimited times. We provide study materials and tutoring to
              help you succeed.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Do certificates expire?</h4>
            <p className="text-sm text-gray-600">
              Certificates are valid for 1-3 years depending on tier. Renewal is available through
              continuing education credits.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
