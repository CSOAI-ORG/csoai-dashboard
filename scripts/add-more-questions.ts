/**
 * Add more exam questions to reach 55+ total
 * Run with: pnpm tsx scripts/add-more-questions.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { testQuestions, certificationTests, trainingModules } from "../drizzle/schema";

interface QuestionData {
  questionText: string;
  questionType: "multiple_choice" | "true_false" | "scenario";
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  points: number;
}

// Additional questions to expand the question bank
const additionalQuestions: QuestionData[] = [
  // ============================================
  // ADDITIONAL EU AI ACT QUESTIONS
  // ============================================
  {
    questionText: "Under the EU AI Act, what is the deadline for general-purpose AI (GPAI) model providers to comply with transparency requirements?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "February 2, 2025" },
      { id: "B", text: "August 2, 2025" },
      { id: "C", text: "February 2, 2026" },
      { id: "D", text: "August 2, 2027" }
    ],
    correctAnswer: "B",
    explanation: "GPAI model providers must comply with transparency requirements by August 2, 2025 (12 months after entry into force). This includes providing technical documentation and information about training data.",
    difficulty: "hard",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "Which of the following is classified as a 'limited risk' AI system under the EU AI Act?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "AI systems for credit scoring" },
      { id: "B", text: "Chatbots that interact with humans" },
      { id: "C", text: "AI systems for biometric identification" },
      { id: "D", text: "AI systems for recruitment" }
    ],
    correctAnswer: "B",
    explanation: "Chatbots are classified as limited risk AI systems under the EU AI Act. They only need to meet transparency requirements - users must be informed they are interacting with an AI system.",
    difficulty: "easy",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "What is the role of 'notified bodies' under the EU AI Act?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To develop AI systems for the EU" },
      { id: "B", text: "To conduct third-party conformity assessments for high-risk AI" },
      { id: "C", text: "To enforce penalties against non-compliant companies" },
      { id: "D", text: "To train AI developers in compliance" }
    ],
    correctAnswer: "B",
    explanation: "Notified bodies are independent organizations designated by EU member states to conduct third-party conformity assessments for certain high-risk AI systems, particularly biometric identification systems.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "Under the EU AI Act, what must providers of high-risk AI systems establish to receive complaints from users?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "A dedicated AI ethics committee" },
      { id: "B", text: "A complaints handling procedure" },
      { id: "C", text: "A 24/7 support hotline" },
      { id: "D", text: "A public forum for feedback" }
    ],
    correctAnswer: "B",
    explanation: "Article 20 requires providers of high-risk AI systems to establish a complaints handling procedure to receive and process complaints from affected persons and to keep records of all complaints received.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },
  {
    questionText: "What is the purpose of the EU AI Act's 'post-market monitoring' requirement?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To track sales of AI systems" },
      { id: "B", text: "To continuously monitor AI system performance and identify risks after deployment" },
      { id: "C", text: "To collect user feedback for marketing purposes" },
      { id: "D", text: "To ensure AI systems are profitable" }
    ],
    correctAnswer: "B",
    explanation: "Post-market monitoring (Article 72) requires providers to actively collect and analyze data on AI system performance after deployment to identify and address any risks that emerge during real-world use.",
    difficulty: "medium",
    category: "EU_AI_ACT",
    points: 1
  },

  // ============================================
  // ADDITIONAL NIST RMF QUESTIONS
  // ============================================
  {
    questionText: "In the NIST AI RMF, what does the MAP function help organizations understand?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "The financial cost of AI systems" },
      { id: "B", text: "The context in which AI systems operate and potential impacts" },
      { id: "C", text: "The marketing strategy for AI products" },
      { id: "D", text: "The legal contracts for AI deployment" }
    ],
    correctAnswer: "B",
    explanation: "The MAP function helps organizations understand the context in which AI systems operate, including intended purposes, potential positive and negative impacts, and the operational environment.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "According to NIST AI RMF, what is 'AI system lifecycle'?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "The warranty period of an AI system" },
      { id: "B", text: "All phases from design through deployment, operation, and decommissioning" },
      { id: "C", text: "The time it takes to train an AI model" },
      { id: "D", text: "The marketing cycle of an AI product" }
    ],
    correctAnswer: "B",
    explanation: "The AI system lifecycle encompasses all phases including design, data collection, model building, verification, deployment, operation, monitoring, and eventual decommissioning or retirement.",
    difficulty: "easy",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "What does NIST AI RMF recommend for managing third-party AI components?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Avoid using any third-party components" },
      { id: "B", text: "Apply the same risk management practices as for internally developed components" },
      { id: "C", text: "Only use components from US-based vendors" },
      { id: "D", text: "Third-party components don't require risk management" }
    ],
    correctAnswer: "B",
    explanation: "NIST recommends applying consistent risk management practices to third-party AI components, including understanding their provenance, assessing their risks, and ensuring they meet organizational standards.",
    difficulty: "medium",
    category: "NIST_RMF",
    points: 1
  },
  {
    questionText: "In NIST AI RMF, what is the purpose of 'impact assessment'?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To measure the financial return on AI investment" },
      { id: "B", text: "To evaluate potential effects of AI systems on individuals, groups, and society" },
      { id: "C", text: "To assess the environmental impact of AI hardware" },
      { id: "D", text: "To measure AI system performance metrics" }
    ],
    correctAnswer: "B",
    explanation: "Impact assessment in NIST AI RMF evaluates the potential effects of AI systems on individuals, groups, communities, organizations, and society, including both intended and unintended consequences.",
    difficulty: "medium",
    category: "NIST_RMF",
    points: 1
  },

  // ============================================
  // ADDITIONAL TC260 QUESTIONS
  // ============================================
  {
    questionText: "Under China's TC260 framework, what is required before deploying a generative AI service to the public?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Only internal testing" },
      { id: "B", text: "Algorithm registration and security assessment" },
      { id: "C", text: "International certification" },
      { id: "D", text: "No specific requirements" }
    ],
    correctAnswer: "B",
    explanation: "China requires algorithm registration with the Cyberspace Administration and security assessments before deploying generative AI services that can influence public opinion or mobilize the public.",
    difficulty: "medium",
    category: "TC260",
    points: 1
  },
  {
    questionText: "What is the primary focus of TC260's AI safety standards?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Maximizing AI system performance" },
      { id: "B", text: "Ensuring AI systems align with socialist core values and national security" },
      { id: "C", text: "Promoting AI exports" },
      { id: "D", text: "Reducing AI development costs" }
    ],
    correctAnswer: "B",
    explanation: "TC260's AI safety standards emphasize alignment with socialist core values, national security, and social stability, alongside technical safety requirements.",
    difficulty: "medium",
    category: "TC260",
    points: 1
  },
  {
    questionText: "Under TC260 guidelines, what must AI systems do regarding content generation?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Generate any content requested by users" },
      { id: "B", text: "Filter and block content that violates laws or social morality" },
      { id: "C", text: "Only generate content in Chinese" },
      { id: "D", text: "Require government approval for each output" }
    ],
    correctAnswer: "B",
    explanation: "TC260 requires AI systems to implement content filtering to prevent generation of illegal content, content that harms national security, or content that violates social morality and public order.",
    difficulty: "easy",
    category: "TC260",
    points: 1
  },
  {
    questionText: "What is the TC260 requirement for AI system transparency?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "All AI code must be open source" },
      { id: "B", text: "Users must be informed when interacting with AI and AI-generated content must be labeled" },
      { id: "C", text: "No transparency requirements exist" },
      { id: "D", text: "Only government agencies need to know about AI usage" }
    ],
    correctAnswer: "B",
    explanation: "TC260 requires that users be clearly informed when they are interacting with AI systems, and AI-generated content must be appropriately labeled to distinguish it from human-created content.",
    difficulty: "medium",
    category: "TC260",
    points: 1
  },

  // ============================================
  // ADDITIONAL ETHICS QUESTIONS
  // ============================================
  {
    questionText: "What is 'algorithmic accountability' in AI ethics?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Making algorithms run faster" },
      { id: "B", text: "The principle that organizations must be answerable for AI system decisions and impacts" },
      { id: "C", text: "Counting the number of algorithms used" },
      { id: "D", text: "Protecting algorithm source code" }
    ],
    correctAnswer: "B",
    explanation: "Algorithmic accountability means organizations deploying AI systems must be answerable for the decisions made by those systems, including being able to explain decisions and address harms.",
    difficulty: "easy",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is 'proxy discrimination' in AI systems?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Using a proxy server for AI systems" },
      { id: "B", text: "Discrimination that occurs through seemingly neutral variables that correlate with protected characteristics" },
      { id: "C", text: "Delegating AI decisions to third parties" },
      { id: "D", text: "Using AI to replace human decision-makers" }
    ],
    correctAnswer: "B",
    explanation: "Proxy discrimination occurs when AI systems use variables that appear neutral (like zip code) but actually correlate strongly with protected characteristics (like race), leading to discriminatory outcomes.",
    difficulty: "hard",
    category: "ETHICS",
    points: 1
  },
  {
    questionText: "What is the 'right to explanation' in AI ethics?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "The right to read AI source code" },
      { id: "B", text: "The right to receive meaningful information about the logic behind automated decisions affecting individuals" },
      { id: "C", text: "The right to explain AI to others" },
      { id: "D", text: "The right to train AI systems" }
    ],
    correctAnswer: "B",
    explanation: "The right to explanation means individuals affected by automated decisions have the right to receive meaningful information about how those decisions were made, including the main factors and logic involved.",
    difficulty: "medium",
    category: "ETHICS",
    points: 1
  },

  // ============================================
  // ADDITIONAL INCIDENT ANALYSIS QUESTIONS
  // ============================================
  {
    questionText: "What is a 'near miss' in AI incident analysis?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "An AI system that almost achieved its performance target" },
      { id: "B", text: "An event that could have caused harm but was prevented or didn't result in actual harm" },
      { id: "C", text: "An AI prediction that was almost correct" },
      { id: "D", text: "A competitor's AI system" }
    ],
    correctAnswer: "B",
    explanation: "A near miss is an event where harm was narrowly avoided. Analyzing near misses is crucial for preventing future incidents, as they reveal vulnerabilities before actual harm occurs.",
    difficulty: "easy",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is the purpose of 'root cause analysis' in AI incident investigation?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To find someone to blame" },
      { id: "B", text: "To identify the fundamental underlying causes that led to an incident" },
      { id: "C", text: "To calculate the financial cost of incidents" },
      { id: "D", text: "To determine if the AI system should be shut down" }
    ],
    correctAnswer: "B",
    explanation: "Root cause analysis aims to identify the fundamental underlying causes of an incident, not just the immediate triggers, to prevent similar incidents from occurring in the future.",
    difficulty: "easy",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is 'incident severity classification' used for?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "To determine legal liability" },
      { id: "B", text: "To prioritize response efforts and allocate resources appropriately" },
      { id: "C", text: "To calculate insurance premiums" },
      { id: "D", text: "To rank AI systems by quality" }
    ],
    correctAnswer: "B",
    explanation: "Incident severity classification helps organizations prioritize their response efforts, allocate appropriate resources, and determine the level of urgency for remediation actions.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },
  {
    questionText: "What is 'defense in depth' as applied to AI safety?",
    questionType: "multiple_choice",
    options: [
      { id: "A", text: "Using multiple AI models for the same task" },
      { id: "B", text: "Implementing multiple layers of safety controls so that if one fails, others remain" },
      { id: "C", text: "Training AI models on more data" },
      { id: "D", text: "Hiring more AI safety engineers" }
    ],
    correctAnswer: "B",
    explanation: "Defense in depth means implementing multiple overlapping safety controls at different levels, so that if one control fails, other controls can still prevent or mitigate harm.",
    difficulty: "medium",
    category: "INCIDENT_ANALYSIS",
    points: 1
  },

  // ============================================
  // ADDITIONAL SCENARIO QUESTIONS
  // ============================================
  {
    questionText: "Scenario: A healthcare AI system recommends different treatment options based on patient zip code, which correlates with race. What ethical principle is violated?",
    questionType: "scenario",
    options: [
      { id: "A", text: "Only efficiency principles" },
      { id: "B", text: "Non-discrimination and equal treatment principles" },
      { id: "C", text: "Only data privacy principles" },
      { id: "D", text: "No principles are violated" }
    ],
    correctAnswer: "B",
    explanation: "This is proxy discrimination - using zip code as a proxy for race leads to discriminatory healthcare recommendations, violating non-discrimination principles even though race isn't explicitly used.",
    difficulty: "hard",
    category: "SCENARIO",
    points: 2
  },
  {
    questionText: "Scenario: An AI-powered autonomous vehicle causes an accident. Under the EU AI Act, who bears primary responsibility?",
    questionType: "scenario",
    options: [
      { id: "A", text: "The passenger in the vehicle" },
      { id: "B", text: "The provider (manufacturer) of the AI system" },
      { id: "C", text: "The road authority" },
      { id: "D", text: "No one - AI systems cannot be held responsible" }
    ],
    correctAnswer: "B",
    explanation: "Under the EU AI Act, the provider (manufacturer) of high-risk AI systems like autonomous vehicles bears primary responsibility for ensuring compliance and safety. They must conduct risk assessments and maintain documentation.",
    difficulty: "medium",
    category: "SCENARIO",
    points: 2
  },
  {
    questionText: "Scenario: A company wants to deploy an AI hiring system in both the EU and China. What compliance approach should they take?",
    questionType: "scenario",
    options: [
      { id: "A", text: "Only comply with EU regulations since they are stricter" },
      { id: "B", text: "Only comply with Chinese regulations since the company is based there" },
      { id: "C", text: "Comply with both EU AI Act and TC260 requirements for respective markets" },
      { id: "D", text: "No compliance is needed for hiring systems" }
    ],
    correctAnswer: "C",
    explanation: "Companies operating in multiple jurisdictions must comply with all applicable regulations. AI hiring systems are high-risk under the EU AI Act and require algorithm registration under Chinese law.",
    difficulty: "hard",
    category: "SCENARIO",
    points: 2
  }
];

async function addMoreQuestions() {
  console.log("🌱 Adding more exam questions...");
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable not set");
    process.exit(1);
  }

  const db = drizzle(databaseUrl);

  try {
    // Get the test ID
    const [test] = await db
      .select()
      .from(certificationTests)
      .where(eq(certificationTests.code, "WATCHDOG_BASIC"))
      .limit(1);

    if (!test) {
      console.error("❌ WATCHDOG_BASIC test not found.");
      process.exit(1);
    }

    console.log(`📋 Found test: ${test.title} (ID: ${test.id})`);

    // Get module IDs
    const modules = await db.select().from(trainingModules);
    const moduleMap = new Map(modules.map(m => [m.code, m.id]));

    const categoryToModule: Record<string, string> = {
      "EU_AI_ACT": "EU_AI_ACT",
      "NIST_RMF": "NIST_RMF",
      "TC260": "TC260",
      "ETHICS": "ETHICS_BIAS",
      "INCIDENT_ANALYSIS": "INCIDENT_ANALYSIS",
      "SCENARIO": "INCIDENT_ANALYSIS"
    };

    console.log("📝 Inserting additional questions...");
    let insertedCount = 0;

    for (const q of additionalQuestions) {
      const moduleCode = categoryToModule[q.category];
      const moduleId = moduleMap.get(moduleCode) || null;

      await db.insert(testQuestions).values({
        testId: test.id,
        moduleId,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        points: q.points,
        difficulty: q.difficulty,
        isActive: true,
      });

      insertedCount++;
    }

    console.log(`\n✅ Added ${insertedCount} new questions!`);
    console.log("   - 5 EU AI Act questions");
    console.log("   - 4 NIST RMF questions");
    console.log("   - 4 TC260 questions");
    console.log("   - 3 Ethics questions");
    console.log("   - 4 Incident Analysis questions");
    console.log("   - 3 Scenario questions");

  } catch (error) {
    console.error("❌ Error adding questions:", error);
    throw error;
  }
}

addMoreQuestions().catch(console.error);
