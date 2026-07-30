/**
 * Watchdog Educational Modules
 * Free public training on AI safety and EU AI Act compliance
 * Converts real-world issues into learning opportunities
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Play,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Lock,
  Unlock,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface Module {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessons: number;
  category: string;
  isLocked: boolean;
  completed: boolean;
  progress: number;
  realWorldCaseStudy: string;
  learningOutcomes: string[];
}

interface EducationalModuleProps {
  module: Module;
  onStart: (moduleId: number) => void;
  onUpgrade: () => void;
}

const watchdogModules: Module[] = [
  {
    id: 1,
    title: 'AI Safety Basics',
    description: 'Learn fundamental concepts of AI safety and why it matters',
    duration: '45 min',
    difficulty: 'beginner',
    lessons: 4,
    category: 'Fundamentals',
    isLocked: false,
    completed: false,
    progress: 0,
    realWorldCaseStudy: 'ChatGPT Medical Hallucinations',
    learningOutcomes: [
      'Understand AI risk categories',
      'Identify common AI failures',
      'Recognize safety red flags',
    ],
  },
  {
    id: 2,
    title: 'Bias Detection & Fairness',
    description: 'Detect and mitigate bias in AI systems',
    duration: '60 min',
    difficulty: 'intermediate',
    lessons: 5,
    category: 'Technical',
    isLocked: false,
    completed: false,
    progress: 0,
    realWorldCaseStudy: 'Facial Recognition Hiring Bias',
    learningOutcomes: [
      'Identify bias sources',
      'Test for fairness',
      'Implement mitigation strategies',
    ],
  },
  {
    id: 3,
    title: 'EU AI Act Compliance',
    description: 'Navigate EU AI Act requirements (Feb 2, 2025 enforcement)',
    duration: '90 min',
    difficulty: 'intermediate',
    lessons: 8,
    category: 'Legal',
    isLocked: false,
    completed: false,
    progress: 0,
    realWorldCaseStudy: 'High-Risk AI Classification',
    learningOutcomes: [
      'Classify AI systems by risk',
      'Understand compliance requirements',
      'Prepare for regulatory inspection',
    ],
  },
  {
    id: 4,
    title: 'Risk Assessment Frameworks',
    description: 'Conduct comprehensive AI risk assessments',
    duration: '75 min',
    difficulty: 'advanced',
    lessons: 6,
    category: 'Technical',
    isLocked: true,
    completed: false,
    progress: 0,
    realWorldCaseStudy: 'Autonomous Vehicle Safety Analysis',
    learningOutcomes: [
      'Identify potential harms',
      'Assess likelihood and severity',
      'Plan mitigation measures',
    ],
  },
  {
    id: 5,
    title: 'Transparency & Explainability',
    description: 'Make AI systems transparent and explainable to users',
    duration: '60 min',
    difficulty: 'intermediate',
    lessons: 5,
    category: 'Technical',
    isLocked: true,
    completed: false,
    progress: 0,
    realWorldCaseStudy: 'Financial AI Decision Explanations',
    learningOutcomes: [
      'Create model cards and datasheets',
      'Explain AI decisions',
      'Communicate limitations',
    ],
  },
  {
    id: 6,
    title: 'Post-Market Monitoring',
    description: 'Monitor AI systems after deployment and respond to incidents',
    duration: '70 min',
    difficulty: 'advanced',
    lessons: 6,
    category: 'Operations',
    isLocked: true,
    completed: false,
    progress: 0,
    realWorldCaseStudy: 'Content Moderation Incident Response',
    learningOutcomes: [
      'Set up monitoring systems',
      'Identify serious incidents',
      'Execute corrective actions',
    ],
  },
];

export function EducationalModuleCard({ module, onStart, onUpgrade }: EducationalModuleProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow relative overflow-hidden">
        {module.isLocked && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <Lock className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white font-semibold">Upgrade to CEASA</p>
              <p className="text-white/80 text-sm">Professional to unlock</p>
            </div>
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge className={difficultyColors[module.difficulty]}>
              {module.difficulty.charAt(0).toUpperCase() + module.difficulty.slice(1)}
            </Badge>
            <Badge variant="outline">{module.category}</Badge>
          </div>
          <CardTitle className="text-lg">{module.title}</CardTitle>
          <CardDescription>{module.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Real-World Case Study */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-blue-900 mb-1">Real-World Case Study</p>
            <p className="text-sm text-blue-800">{module.realWorldCaseStudy}</p>
          </div>

          {/* Learning Outcomes */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">You'll Learn:</p>
            <ul className="space-y-1">
              {module.learningOutcomes.map((outcome, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          {/* Progress */}
          {module.progress > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold text-gray-700">Progress</p>
                <span className="text-xs text-gray-600">{module.progress}%</span>
              </div>
              <Progress value={module.progress} className="h-2" />
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{module.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{module.lessons} lessons</span>
              </div>
            </div>
            {module.completed && <CheckCircle className="w-4 h-4 text-green-600" />}
          </div>

          {/* Action Button */}
          <Button
            onClick={() => {
              if (module.isLocked) {
                onUpgrade();
              } else {
                onStart(module.id);
              }
            }}
            className="w-full"
            variant={module.isLocked ? 'outline' : 'default'}
          >
            {module.isLocked ? (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Upgrade to CEASA
              </>
            ) : module.completed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Review Module
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Learning
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function WatchdogEducation() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [completedCount] = useState(0);

  const categories = ['All', ...Array.from(new Set(watchdogModules.map((m) => m.category)))];
  const filteredModules = selectedCategory
    ? watchdogModules.filter((m) => m.category === selectedCategory || selectedCategory === 'All')
    : watchdogModules;

  const handleStartModule = (moduleId: number) => {
    toast.success(`Starting module ${moduleId}...`);
  };

  const handleUpgrade = () => {
    toast.info('Redirecting to CEASA Professional...');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Free AI Safety Training</h2>
            <p className="text-blue-100 mb-4">
              Learn from real-world AI issues reported in the Watchdog Forum. Master AI safety
              concepts and EU AI Act compliance.
            </p>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-bold">{watchdogModules.length}</p>
                <p className="text-blue-100 text-sm">Modules Available</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-blue-100 text-sm">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold">Free</p>
                <p className="text-blue-100 text-sm">Forever</p>
              </div>
            </div>
          </div>
          <BookOpen className="w-16 h-16 text-blue-200 opacity-50" />
        </div>
      </motion.div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat || (selectedCategory === null && cat === 'All') ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat === 'All' ? null : cat)}
            className="whitespace-nowrap"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <EducationalModuleCard
            key={module.id}
            module={module}
            onStart={handleStartModule}
            onUpgrade={handleUpgrade}
          />
        ))}
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-8 text-center"
      >
        <h3 className="text-2xl font-bold mb-2">Ready to Become a Certified AI Safety Analyst?</h3>
        <p className="text-gray-700 mb-6">
          Complete the free Watchdog modules, then upgrade to CEASA Professional for industry-recognized
          certification and government integration.
        </p>
        <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
          Explore CEASA Professional
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
