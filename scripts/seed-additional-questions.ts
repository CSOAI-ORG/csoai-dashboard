/**
 * Seed additional exam questions to expand the question bank
 * Run with: pnpm tsx scripts/seed-additional-questions.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { testQuestions, certificationTests, trainingModules } from "../drizzle/schema";
import { additionalQuestions } from "./additional-questions";

async function seedAdditionalQuestions() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const db = drizzle(databaseUrl);

  try {
    console.log("🌱 Starting additional question seeding...\n");

    // Get the test ID for WATCHDOG_BASIC
    const [test] = await db
      .select()
      .from(certificationTests)
      .where(eq(certificationTests.code, "WATCHDOG_BASIC"))
      .limit(1);

    if (!test) {
      console.error("❌ WATCHDOG_BASIC test not found. Please create it first.");
      process.exit(1);
    }

    console.log(`📋 Found test: ${test.title} (ID: ${test.id})`);

    // Get module IDs for category mapping
    const modules = await db.select().from(trainingModules);
    const moduleMap = new Map(modules.map(m => [m.code, m.id]));

    // Category to module code mapping
    const categoryToModule: Record<string, string> = {
      "EU_AI_ACT": "EU_AI_ACT",
      "NIST_RMF": "NIST_RMF",
      "TC260": "TC260",
      "ETHICS": "ETHICS_BIAS",
      "INCIDENT_ANALYSIS": "INCIDENT_ANALYSIS"
    };

    // Count existing questions
    const existingQuestions = await db
      .select()
      .from(testQuestions)
      .where(eq(testQuestions.testId, test.id));

    console.log(`📊 Current question count: ${existingQuestions.length}`);
    console.log(`📝 Inserting ${additionalQuestions.length} additional questions...\n`);

    let insertedCount = 0;
    const categoryCount: Record<string, number> = {};

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
      categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;

      if (insertedCount % 10 === 0) {
        console.log(`  ✓ Inserted ${insertedCount} questions...`);
      }
    }

    console.log(`\n✅ Additional question seeding complete!`);
    console.log(`   - ${insertedCount} questions inserted`);
    console.log(`   - Total questions now: ${existingQuestions.length + insertedCount}`);
    console.log(`\n📊 Questions by category:`);
    for (const [category, count] of Object.entries(categoryCount)) {
      console.log(`   - ${category}: ${count} questions`);
    }

  } catch (error) {
    console.error("❌ Error seeding additional questions:", error);
    throw error;
  }
}

seedAdditionalQuestions().catch(console.error);
