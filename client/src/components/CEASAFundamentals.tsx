/**
 * CEASA Fundamentals Program
 * Legal, industry-recognized certification based on EU AI Act
 * Converts free Watchdog modules into paid certification
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle,
  Clock,
  BookOpen,
  Zap,
  Shield,
  TrendingUp,
  Download,
  Share2,
  Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface CEASAModule {
  id: number;
  title: string;
  description: string;
  duration: string;
  lessons: number;
  euAiActArticles: string[];
  complianceRequirements: string[];
  examQuestions: number;
  realWorldCaseStudies: string[];
  completed: boolean;
  score?: number;
}

interface CertificateData {
  certificateId: string;
  analystName: string;
  certificationLevel: 'fundamentals' | 'professional' | 'expert';
  issuanceDate: Date;
  expiryDate: Date;
  score: number;
  blockchainHash: string;
  qrCodeUrl: string;
}

const ceasaModules: CEASAModule[] = [
  {
    id: 1,
    title: 'EU AI Act Essentials & Risk Framework',
    description: 'Master the foundational concepts of the EU AI Act and risk-based approach',
    duration: '3-4 days',
    lessons: 4,
    euAiActArticles: ['Article 1-6', 'Annex I', 'Annex II'],
    complianceRequirements: [
      'Understand prohibited practices (Article 5)',
      'Classify AI systems by risk tier',
      'Know enforcement timeline (Feb 2, 2025)',
    ],
    examQuestions: 10,
    realWorldCaseStudies: ['ChatGPT Medical Hallucinations', 'Social Scoring Systems'],
    completed: false,
  },
  {
    id: 2,
    title: 'Prohibited AI Practices & Unacceptable Risk',
    description: 'Identify and avoid 8 explicitly prohibited AI practices',
    duration: '3-4 days',
    lessons: 4,
    euAiActArticles: ['Article 5', 'Recitals 9-16'],
    complianceRequirements: [
      'Recognize subliminal manipulation',
      'Understand social scoring prohibitions',
      'Know enforcement penalties (€35M or 7% turnover)',
    ],
    examQuestions: 10,
    realWorldCaseStudies: ['Facial Recognition Bias', 'Emotion Recognition at Work'],
    completed: false,
  },
  {
    id: 3,
    title: 'High-Risk AI Systems Classification',
    description: 'Classify and manage high-risk AI systems under Annex III',
    duration: '4-5 days',
    lessons: 5,
    euAiActArticles: ['Article 6-15', 'Annex III'],
    complianceRequirements: [
      'Identify 20+ high-risk use cases',
      'Conduct risk assessments',
      'Implement compliance requirements',
    ],
    examQuestions: 10,
    realWorldCaseStudies: ['Autonomous Vehicle Safety', 'AI in Criminal Justice'],
    completed: false,
  },
  {
    id: 4,
    title: 'Data Governance & Quality Management',
    description: 'Ensure high-quality, representative, unbiased training data',
    duration: '4-5 days',
    lessons: 5,
    euAiActArticles: ['Article 10', 'Article 11'],
    complianceRequirements: [
      'Create data governance plans',
      'Detect and mitigate bias',
      'Document training data',
    ],
    examQuestions: 10,
    realWorldCaseStudies: ['Hiring Algorithm Bias', 'Loan Approval Discrimination'],
    completed: false,
  },
  {
    id: 5,
    title: 'Risk Assessment & Mitigation Strategies',
    description: 'Conduct comprehensive risk assessments and implement safeguards',
    duration: '4-5 days',
    lessons: 5,
    euAiActArticles: ['Article 9', 'Article 14'],
    complianceRequirements: [
      'Identify potential harms',
      'Assess likelihood and severity',
      'Plan and verify mitigation measures',
    ],
    examQuestions: 10,
    realWorldCaseStudies: ['Medical Diagnosis AI', 'Financial Risk Assessment'],
    completed: false,
  },
  {
    id: 6,
    title: 'Transparency & Explainability Requirements',
    description: 'Make AI systems transparent and understandable to users',
    duration: '3-4 days',
    lessons: 4,
    euAiActArticles: ['Article 13', 'Article 52'],
    complianceRequirements: [
      'Create model cards and datasheets',
      'Provide explainable decisions',
      'Communicate limitations to users',
    ],
    examQuestions: 10,
    realWorldCaseStudies: ['Content Moderation Transparency', 'Loan Denial Explanations'],
    completed: false,
  },
  {
    id: 7,
    title: 'Human Oversight & Accountability',
    description: 'Establish meaningful human control and clear accountability',
    duration: '3-4 days',
    lessons: 4,
    euAiActArticles: ['Article 14', 'Article 26-28'],
    complianceRequirements: [
      'Design human oversight procedures',
      'Establish appeal processes',
      'Assign clear responsibility',
    ],
    examQuestions: 10,
    realWorldCaseStudies: ['AI-Assisted Hiring', 'Benefit Eligibility Decisions'],
    completed: false,
  },
  {
    id: 8,
    title: 'Compliance Documentation & Audit Trails',
    description: 'Maintain comprehensive documentation for regulatory inspection',
    duration: '4-5 days',
    lessons: 5,
    euAiActArticles: ['Article 11', 'Article 12'],
    complianceRequirements: [
      'Create technical documentation',
      'Maintain audit trails',
      'Prepare for regulatory inspection',
    ],
    examQuestions: 10,
    realWorldCaseStudies: ['Regulatory Audit Preparation', 'Incident Documentation'],
    completed: false,
  },
  {
    id: 9,
    title: 'Post-Market Monitoring & Incident Reporting',
    description: 'Monitor systems after deployment and respond to incidents',
    duration: '3-4 days',
    lessons: 4,
    euAiActArticles: ['Article 15', 'Article 73'],
    complianceRequirements: [
      'Set up monitoring systems',
      'Identify serious incidents',
      'Report within 72 hours',
    ],
    examQuestions: 10,
    realWorldCaseStudies: ['Product Recall Procedures', 'Incident Response Plans'],
    completed: false,
  },
  {
    id: 10,
    title: 'CEASA Fundamentals Capstone Exam',
    description: 'Comprehensive assessment and certification',
    duration: '2-3 days',
    lessons: 1,
    euAiActArticles: ['All Articles'],
    complianceRequirements: [
      'Pass 50-question exam (70% required)',
      'Demonstrate comprehensive knowledge',
      'Receive CEASA certificate',
    ],
    examQuestions: 50,
    realWorldCaseStudies: ['Multi-scenario compliance assessment'],
    completed: false,
  },
];

interface ModuleCardProps {
  module: CEASAModule;
  onStart: (moduleId: number) => void;
}

function CEASAModuleCard({ module, onStart }: ModuleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge className="bg-blue-100 text-blue-800">Module {module.id}</Badge>
            {module.completed && <CheckCircle className="w-5 h-5 text-green-600" />}
          </div>
          <CardTitle className="text-lg">{module.title}</CardTitle>
          <CardDescription>{module.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* EU AI Act References */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-900 mb-2">EU AI Act References</p>
            <div className="flex flex-wrap gap-1">
              {module.euAiActArticles.map((article) => (
                <Badge key={article} variant="outline" className="text-xs">
                  {article}
                </Badge>
              ))}
            </div>
          </div>

          {/* Compliance Requirements */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Compliance Requirements</p>
            <ul className="space-y-1">
              {module.complianceRequirements.map((req, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Real-World Case Studies */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Case Studies</p>
            <div className="flex flex-wrap gap-1">
              {module.realWorldCaseStudies.map((study) => (
                <Badge key={study} variant="secondary" className="text-xs">
                  {study}
                </Badge>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{module.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{module.examQuestions} questions</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button onClick={() => onStart(module.id)} className="w-full" variant="default">
            {module.completed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Review Module
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Start Module
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function CEASAFundamentals() {
  const [showCertificate, setShowCertificate] = useState(false);
  const completedModules = ceasaModules.filter((m) => m.completed).length;
  const progress = (completedModules / ceasaModules.length) * 100;

  const mockCertificate: CertificateData = {
    certificateId: 'CEASA-12345-ABC123-DEMO',
    analystName: 'John Analyst',
    certificationLevel: 'fundamentals',
    issuanceDate: new Date(),
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    score: 85,
    blockchainHash: 'abc123def456...',
    qrCodeUrl: 'https://csoai.org/verify/CEASA-12345',
  };

  const handleStartModule = (moduleId: number) => {
    toast.success(`Starting module ${moduleId}...`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-8 h-8" />
              <h2 className="text-3xl font-bold">CEASA Fundamentals</h2>
            </div>
            <p className="text-blue-100 mb-4">
              Certified EU AI Safety Analyst - Fundamentals Program
            </p>
            <p className="text-blue-100 text-sm max-w-2xl">
              Industry-recognized certification proving your competency in EU AI Act compliance,
              risk assessment, and AI safety practices. Legally defensible and government-integrated.
            </p>
          </div>
          <Shield className="w-16 h-16 text-blue-200 opacity-50" />
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Program Progress</span>
            <span className="font-semibold">
              {completedModules}/{ceasaModules.length} modules
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </motion.div>

      {/* Program Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{ceasaModules.length}</p>
              <p className="text-sm text-gray-600">Modules</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">100</p>
              <p className="text-sm text-gray-600">Exam Questions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">6</p>
              <p className="text-sm text-gray-600">Weeks Duration</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">1 Yr</p>
              <p className="text-sm text-gray-600">Certificate Validity</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div>
        <h3 className="text-2xl font-bold mb-6">Program Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ceasaModules.map((module) => (
            <CEASAModuleCard
              key={module.id}
              module={module}
              onStart={handleStartModule}
            />
          ))}
        </div>
      </div>

      {/* Certificate Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Your CEASA Certificate</h3>
          <Award className="w-8 h-8 text-purple-600" />
        </div>

        <div className="bg-white rounded-lg p-6 border-2 border-purple-200 mb-4">
          <div className="text-center space-y-2 mb-6">
            <p className="text-sm text-gray-600">Certificate ID</p>
            <p className="font-mono text-lg font-bold">{mockCertificate.certificateId}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-gray-600 mb-1">Certification Level</p>
              <p className="font-semibold capitalize">{mockCertificate.certificationLevel}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Score</p>
              <p className="font-semibold">{mockCertificate.score}%</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Issued</p>
              <p className="font-semibold">{mockCertificate.issuanceDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Expires</p>
              <p className="font-semibold">{mockCertificate.expiryDate.toLocaleDateString()}</p>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-600 mb-2">Blockchain Verified</p>
            <p className="font-mono text-xs text-gray-700 break-all">
              {mockCertificate.blockchainHash}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1" variant="default">
            <Download className="w-4 h-4 mr-2" />
            Download Certificate
          </Button>
          <Button className="flex-1" variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share Certificate
          </Button>
          <Button className="flex-1" variant="outline">
            Verify on Government Portal
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
