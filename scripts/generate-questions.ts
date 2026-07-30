/**
 * Generate additional exam questions using Gemini API
 * This script generates high-quality questions across all categories
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface Question {
  questionText: string;
  questionType: "multiple_choice" | "scenario";
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  points: number;
}

const categories = [
  {
    code: "EU_AI_ACT",
    name: "EU AI Act",
    description: "Questions about the EU Artificial Intelligence Act, risk categories, compliance requirements, and penalties",
  },
  {
    code: "NIST_RMF",
    name: "NIST AI RMF",
    description: "Questions about the NIST AI Risk Management Framework, including Govern, Map, Measure, and Manage functions",
  },
  {
    code: "TC260",
    name: "China TC260",
    description: "Questions about China's TC260 AI governance standards and requirements",
  },
  {
    code: "ETHICS",
    name: "AI Ethics & Bias",
    description: "Questions about AI bias, fairness, discrimination, and ethical considerations in AI systems",
  },
  {
    code: "INCIDENT_ANALYSIS",
    name: "Incident Analysis",
    description: "Questions about analyzing AI safety incidents, root cause analysis, and remediation strategies",
  },
];

async function generateQuestions(category: any, count: number, difficulty: string): Promise<Question[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `Generate ${count} high-quality multiple-choice exam questions for AI Safety Analysts about ${category.name}.

Context: ${category.description}

Requirements:
- Difficulty level: ${difficulty}
- Each question must have exactly 4 options (A, B, C, D)
- Questions should test practical knowledge and real-world application
- Include detailed explanations for correct answers
- Questions should be realistic and based on actual regulations/frameworks
- For ${difficulty} difficulty:
  * easy: Basic definitions and concepts
  * medium: Application of concepts and analysis
  * hard: Complex scenarios requiring deep understanding

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
[
  {
    "questionText": "Question text here?",
    "options": [
      {"id": "A", "text": "Option A text"},
      {"id": "B", "text": "Option B text"},
      {"id": "C", "text": "Option C text"},
      {"id": "D", "text": "Option D text"}
    ],
    "correctAnswer": "B",
    "explanation": "Detailed explanation of why this is correct and why others are wrong",
    "difficulty": "${difficulty}"
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Clean up response - remove markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, "");
    }
    
    const questions = JSON.parse(cleanedResponse);
    
    // Add category and points to each question
    return questions.map((q: any) => ({
      ...q,
      questionType: "multiple_choice" as const,
      category: category.code,
      points: 1,
    }));
  } catch (error) {
    console.error(`Error generating questions for ${category.name} (${difficulty}):`, error);
    return [];
  }
}

async function main() {
  console.log("🤖 Starting AI-powered question generation...\n");

  const allQuestions: Question[] = [];

  // Generate questions for each category and difficulty
  for (const category of categories) {
    console.log(`\n📚 Generating questions for ${category.name}...`);
    
    for (const difficulty of ["easy", "medium", "hard"]) {
      console.log(`  ⚙️  Generating ${difficulty} questions...`);
      
      const count = 10; // 10 questions per difficulty per category
      const questions = await generateQuestions(category, count, difficulty);
      
      if (questions.length > 0) {
        allQuestions.push(...questions);
        console.log(`  ✅ Generated ${questions.length} ${difficulty} questions`);
      } else {
        console.log(`  ❌ Failed to generate ${difficulty} questions`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n✅ Total questions generated: ${allQuestions.length}`);

  // Save to file
  const outputPath = "./scripts/generated-questions.json";
  fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2));
  console.log(`💾 Questions saved to ${outputPath}`);

  // Also create a TypeScript file for easy import
  const tsOutput = `export const generatedQuestions = ${JSON.stringify(allQuestions, null, 2)};`;
  fs.writeFileSync("./scripts/generated-questions.ts", tsOutput);
  console.log(`💾 TypeScript file saved to ./scripts/generated-questions.ts`);
}

main().catch(console.error);
