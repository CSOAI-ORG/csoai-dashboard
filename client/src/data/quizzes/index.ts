import type { QuizQuestion } from '@/types/quiz';
import { euAiActModule1Quiz } from './eu-ai-act-module-1';
import { euAiActModule2Quiz } from './eu-ai-act-module-2';
import { euAiActModule3Quiz } from './eu-ai-act-module-3';
import { euAiActModule4Quiz } from './eu-ai-act-module-4';
import { euAiActModule5Quiz } from './eu-ai-act-module-5';
import { euAiActModule6Quiz } from './eu-ai-act-module-6';
import { euAiActModule7Quiz } from './eu-ai-act-module-7';
import { euAiActModule8Quiz } from './eu-ai-act-module-8';
import { nistAiRmfModule1Quiz } from './nist-ai-rmf-module-1';
import { nistAiRmfModule2Quiz } from './nist-ai-rmf-module-2';
import { nistAiRmfModule3Quiz } from './nist-ai-rmf-module-3';
import { nistAiRmfModule4Quiz } from './nist-ai-rmf-module-4';
import { nistAiRmfModule5Quiz } from './nist-ai-rmf-module-5';
import { nistAiRmfModule6Quiz } from './nist-ai-rmf-module-6';
import { nistAiRmfModule7Quiz } from './nist-ai-rmf-module-7';
import { nistAiRmfModule8Quiz } from './nist-ai-rmf-module-8';
import { iso42001Module1Quiz } from './iso-42001-module-1';
import { iso42001Module2Quiz } from './iso-42001-module-2';
import { iso42001Module3Quiz } from './iso-42001-module-3';
import { iso42001Module4Quiz } from './iso-42001-module-4';
import { iso42001Module5Quiz } from './iso-42001-module-5';
import { iso42001Module6Quiz } from './iso-42001-module-6';
import { iso42001Module7Quiz } from './iso-42001-module-7';
import { iso42001Module8Quiz } from './iso-42001-module-8';

// Quiz mapping: courseId -> moduleIndex -> quiz questions
const quizMap: Record<number, Record<number, QuizQuestion[]>> = {
  // EU AI Act Fundamentals (courseId: 100001)
  100001: {
    0: euAiActModule1Quiz,
    1: euAiActModule2Quiz,
    2: euAiActModule3Quiz,
    3: euAiActModule4Quiz,
    4: euAiActModule5Quiz,
    5: euAiActModule6Quiz,
    6: euAiActModule7Quiz,
    7: euAiActModule8Quiz,
  },
  // NIST AI RMF Fundamentals (courseId: 100002)
  100002: {
    0: nistAiRmfModule1Quiz,
    1: nistAiRmfModule2Quiz,
    2: nistAiRmfModule3Quiz,
    3: nistAiRmfModule4Quiz,
    4: nistAiRmfModule5Quiz,
    5: nistAiRmfModule6Quiz,
    6: nistAiRmfModule7Quiz,
    7: nistAiRmfModule8Quiz,
  },
  // ISO 42001 AI Management System Fundamentals (courseId: 100006)
  100006: {
    0: iso42001Module1Quiz,
    1: iso42001Module2Quiz,
    2: iso42001Module3Quiz,
    3: iso42001Module4Quiz,
    4: iso42001Module5Quiz,
    5: iso42001Module6Quiz,
    6: iso42001Module7Quiz,
    7: iso42001Module8Quiz,
  },
  // Legacy IDs for backwards compatibility
  1: {
    0: euAiActModule1Quiz,
    1: euAiActModule2Quiz,
    2: euAiActModule3Quiz,
    3: euAiActModule4Quiz,
    4: euAiActModule5Quiz,
    5: euAiActModule6Quiz,
    6: euAiActModule7Quiz,
    7: euAiActModule8Quiz,
  },
  2: {
    0: nistAiRmfModule1Quiz,
    1: nistAiRmfModule2Quiz,
    2: nistAiRmfModule3Quiz,
    3: nistAiRmfModule4Quiz,
    4: nistAiRmfModule5Quiz,
    5: nistAiRmfModule6Quiz,
    6: nistAiRmfModule7Quiz,
    7: nistAiRmfModule8Quiz,
  },
  3: {
    0: iso42001Module1Quiz,
    1: iso42001Module2Quiz,
    2: iso42001Module3Quiz,
    3: iso42001Module4Quiz,
    4: iso42001Module5Quiz,
    5: iso42001Module6Quiz,
    6: iso42001Module7Quiz,
    7: iso42001Module8Quiz,
  },
};

/**
 * Get quiz questions for a specific course module
 * @param courseId - The ID of the course
 * @param moduleIndex - The index of the module (0-based)
 * @returns Quiz questions array, or undefined if no quiz exists
 */
export function getModuleQuiz(
  courseId: number,
  moduleIndex: number
): QuizQuestion[] | undefined {
  return quizMap[courseId]?.[moduleIndex];
}

/**
 * Check if a quiz exists for a specific course module
 * @param courseId - The ID of the course
 * @param moduleIndex - The index of the module (0-based)
 * @returns True if a quiz exists, false otherwise
 */
export function hasModuleQuiz(courseId: number, moduleIndex: number): boolean {
  return !!quizMap[courseId]?.[moduleIndex];
}
