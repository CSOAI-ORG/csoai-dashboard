/**
 * Comprehensive Question Generation Script
 * Generates 50+ high-quality exam questions for all training modules
 * Uses Google Gemini API for AI-powered question generation
 */

import mysql from 'mysql2/promise';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Module definitions with current question counts
const modulesToGenerate = [
  { id: 1, code: 'module_1', title: 'Introduction to AI Safety', current: 10, target: 50, framework: 'General AI Safety' },
  { id: 2, code: 'module_2', title: 'Understanding the EU AI Act', current: 9, target: 50, framework: 'EU AI Act' },
  { id: 3, code: 'module_3', title: 'NIST AI Risk Management Framework', current: 10, target: 50, framework: 'NIST AI RMF' },
  { id: 4, code: 'module_4', title: 'Identifying AI Bias and Fairness Issues', current: 11, target: 50, framework: 'AI Ethics' },
  { id: 5, code: 'module_5', title: 'Making Decisions as a Watchdog Analyst', current: 11, target: 50, framework: 'Watchdog Training' },
  { id: 30001, code: 'UK_AI_BILL', title: 'UK AI Bill & AI Safety Institute', current: 35, target: 55, framework: 'UK AI Regulation' },
  { id: 30002, code: 'CANADA_AIDA', title: 'Canada AIDA (AI and Data Act)', current: 35, target: 55, framework: 'Canadian AI Law' },
  { id: 30003, code: 'AUSTRALIA_AI', title: 'Australia AI Ethics Framework', current: 35, target: 55, framework: 'Australian AI Ethics' },
  { id: 30006, code: 'NIST_RMF', title: 'NIST AI Risk Management Framework', current: 23, target: 55, framework: 'NIST AI RMF Advanced' },
  { id: 30007, code: 'ISO_42001', title: 'ISO/IEC 42001:2023 AI Management Systems', current: 36, target: 55, framework: 'ISO 42001' },
  { id: 30008, code: 'TC260', title: 'TC260 China AI Standards', current: 45, target: 55, framework: 'TC260 Standards' },
];

console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
console.log('║                    EXAM QUESTION GENERATION - GEMINI AI                       ║');
console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

async function generateQuestionsForModule(module) {
  const needed = module.target - module.current;
  console.log(`\n📝 Generating ${needed} questions for: ${module.title}`);
  console.log(`   Framework: ${module.framework}`);
  console.log(`   Current: ${module.current} | Target: ${module.target}`);
  
  const prompt = `You are an expert AI safety certification exam writer. Generate ${needed} high-quality multiple-choice exam questions for the following training module:

**Module**: ${module.title}
**Framework**: ${module.framework}
**Difficulty Mix**: 40% easy, 40% medium, 20% hard

Requirements:
1. Each question must test practical knowledge and real-world application
2. Questions should cover different aspects of the framework
3. Include scenario-based questions that test decision-making
4. Provide 4 answer options (A, B, C, D) with only ONE correct answer
5. Include detailed explanations for why the correct answer is right
6. Make distractors plausible but clearly incorrect
7. Avoid ambiguous wording

Return ONLY a valid JSON array with this exact structure:
[
  {
    "questionText": "Question text here?",
    "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
    "correctAnswer": "A",
    "explanation": "Detailed explanation of why A is correct and others are wrong.",
    "difficulty": "medium",
    "points": 1
  }
]

Generate exactly ${needed} questions. Return ONLY the JSON array, no additional text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const questions = JSON.parse(jsonText);
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid response format');
    }
    
    console.log(`   ✅ Generated ${questions.length} questions`);
    return questions;
    
  } catch (error) {
    console.error(`   ❌ Error generating questions: ${error.message}`);
    return [];
  }
}

async function insertQuestionsToDatabase(moduleId, questions) {
  let inserted = 0;
  
  for (const q of questions) {
    try {
      await connection.query(
        `INSERT INTO test_questions 
        (testId, moduleId, questionText, questionType, options, correctAnswer, explanation, points, difficulty, isActive) 
        VALUES (1, ?, ?, 'multiple_choice', ?, ?, ?, ?, ?, 1)`,
        [
          moduleId,
          q.questionText,
          JSON.stringify(q.options),
          q.correctAnswer,
          q.explanation,
          q.points || 1,
          q.difficulty || 'medium'
        ]
      );
      inserted++;
    } catch (error) {
      console.error(`   ⚠️  Failed to insert question: ${error.message}`);
    }
  }
  
  return inserted;
}

// Main execution
async function main() {
  let totalGenerated = 0;
  let totalInserted = 0;
  
  for (const module of modulesToGenerate) {
    const questions = await generateQuestionsForModule(module);
    
    if (questions.length > 0) {
      const inserted = await insertQuestionsToDatabase(module.id, questions);
      totalGenerated += questions.length;
      totalInserted += inserted;
      console.log(`   💾 Inserted ${inserted}/${questions.length} questions into database`);
    }
    
    // Rate limiting - wait 2 seconds between modules
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '─'.repeat(80));
  console.log(`\n📊 GENERATION COMPLETE:`);
  console.log(`   Total Questions Generated: ${totalGenerated}`);
  console.log(`   Total Questions Inserted: ${totalInserted}`);
  console.log(`   Success Rate: ${Math.round((totalInserted / totalGenerated) * 100)}%`);
  console.log('');
  
  await connection.end();
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
