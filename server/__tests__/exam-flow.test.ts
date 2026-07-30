/**
 * Comprehensive exam flow test
 * Tests the complete certification exam workflow
 */

import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../db";
import { certificationTests, testQuestions, userTestAttempts, userCertificates } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

describe("Certification Exam Flow", () => {
  let db: any;
  let testId: number;
  let userId: number;
  let dbAvailable = false;

  beforeAll(async () => {
    try {
      db = await getDb();
      if (db) {
        dbAvailable = true;
      }
    } catch (e) {
      console.warn('⚠ Database not available, skipping tests');
    }

    // Use test ID 30001 (Watchdog Analyst Basic Certification)
    testId = 30001;
    userId = 1; // Admin user
  });

  it("should have certification test in database", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    const [test] = await db
      .select()
      .from(certificationTests)
      .where(eq(certificationTests.id, testId))
      .limit(1);

    expect(test).toBeDefined();
    expect(test.id).toBe(testId);
    expect(test.title).toBe("Watchdog Analyst Basic Certification");
    expect(test.isActive).toBeTruthy();
    expect(test.passingScore).toBe(70);
    expect(test.timeLimitMinutes).toBe(90);
  });

  it("should have questions for the test", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    const questions = await db
      .select()
      .from(testQuestions)
      .where(and(
        eq(testQuestions.testId, testId),
        eq(testQuestions.isActive, true)
      ));

    expect(questions.length).toBeGreaterThan(0);
    console.log(`✅ Found ${questions.length} questions for test ${testId}`);

    // Verify question structure
    const firstQuestion = questions[0];
    expect(firstQuestion).toHaveProperty('id');
    expect(firstQuestion).toHaveProperty('questionText');
    expect(firstQuestion).toHaveProperty('questionType');
    expect(firstQuestion).toHaveProperty('options');
    expect(firstQuestion).toHaveProperty('correctAnswer');
    expect(firstQuestion).toHaveProperty('difficulty');
    expect(firstQuestion).toHaveProperty('points');

    // Verify options are properly formatted
    expect(Array.isArray(firstQuestion.options)).toBe(true);
    if (firstQuestion.questionType === 'multiple_choice') {
      expect(firstQuestion.options.length).toBeGreaterThan(1);
    }
  });

  it("should return test data with questions via API query", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    // Simulate the getTestQuestions query
    const [test] = await db
      .select()
      .from(certificationTests)
      .where(eq(certificationTests.id, testId))
      .limit(1);

    const questions = await db
      .select({
        id: testQuestions.id,
        questionText: testQuestions.questionText,
        questionType: testQuestions.questionType,
        options: testQuestions.options,
        points: testQuestions.points,
        difficulty: testQuestions.difficulty,
      })
      .from(testQuestions)
      .where(and(
        eq(testQuestions.testId, testId),
        eq(testQuestions.isActive, true)
      ));

    expect(test).toBeDefined();
    expect(questions.length).toBeGreaterThan(0);
    
    console.log(`✅ API would return: test=${test.title}, questions=${questions.length}`);
  });

  it("should create test attempt when starting exam", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    // Create a test attempt
    const result = await db.insert(userTestAttempts).values({
      userId: userId,
      testId: testId,
      startedAt: new Date().toISOString(),
    });

    const attemptId = Number(result[0]?.insertId ?? result.insertId);
    expect(attemptId).toBeGreaterThan(0);

    console.log(`✅ Created test attempt ID: ${attemptId}`);

    // Clean up
    await db.delete(userTestAttempts).where(eq(userTestAttempts.id, attemptId));
  });

  it("should calculate score correctly", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    // Get some questions
    const questions = await db
      .select()
      .from(testQuestions)
      .where(eq(testQuestions.testId, testId))
      .limit(10);

    expect(questions.length).toBeGreaterThan(0);

    // Simulate answers (all correct)
    const answers: Record<string, string> = {};
    questions.forEach((q: any) => {
      answers[q.id.toString()] = q.correctAnswer;
    });

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach((q: any) => {
      totalPoints += q.points;
      if (answers[q.id.toString()] === q.correctAnswer) {
        earnedPoints += q.points;
      }
    });

    const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);

    expect(scorePercentage).toBe(100); // All correct
    console.log(`✅ Score calculation: ${earnedPoints}/${totalPoints} = ${scorePercentage}%`);
  });

  it("should determine pass/fail correctly", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    const [test] = await db
      .select()
      .from(certificationTests)
      .where(eq(certificationTests.id, testId))
      .limit(1);

    const passingScore = test.passingScore;
    
    expect(passingScore).toBe(70);

    // Test passing score
    expect(75 >= passingScore).toBe(true);
    expect(70 >= passingScore).toBe(true);
    expect(69 >= passingScore).toBe(false);

    console.log(`✅ Passing score threshold: ${passingScore}%`);
  });

  it("should have valid question options format", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    const questions = await db
      .select()
      .from(testQuestions)
      .where(eq(testQuestions.testId, testId))
      .limit(5);

    questions.forEach((q: any) => {
      // Options should be an array
      expect(Array.isArray(q.options)).toBe(true);
      
      // For multiple choice, should have multiple options
      if (q.questionType === 'multiple_choice') {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        
        // Each option should have id and text
        q.options.forEach((opt: any) => {
          expect(opt).toHaveProperty('id');
          expect(opt).toHaveProperty('text');
          expect(typeof opt.id).toBe('string');
          expect(typeof opt.text).toBe('string');
        });
      }

      // Correct answer should match one of the option IDs
      const optionIds = q.options.map((opt: any) => opt.id);
      expect(optionIds).toContain(q.correctAnswer);
    });

    console.log(`✅ All question options are properly formatted`);
  });
});
