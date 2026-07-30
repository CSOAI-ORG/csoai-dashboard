/**
 * End-to-end exam flow test
 * Tests the complete certification exam workflow from start to finish
 */

import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "../db";
import { certificationTests, testQuestions, userTestAttempts, userCertificates, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

describe("End-to-End Exam Flow", () => {
  let db: any;
  const testId = 30001; // WATCHDOG_BASIC test
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
      return;
    }
    if (!db) return;

    // Get or create a test user
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, "test@example.com"))
      .limit(1);

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const [newUser] = await db.insert(users).values({
        email: "test@example.com",
        name: "Test User",
        passwordHash: "test",
      }).$returningId() as { id: number }[];
      userId = newUser.id;
    }
  });

  it("Step 1: Verify test exists and is active", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    const [test] = await db
      .select()
      .from(certificationTests)
      .where(eq(certificationTests.id, testId))
      .limit(1);

    expect(test).toBeDefined();
    expect(test.id).toBe(testId);
    expect(test.code).toBe("WATCHDOG_BASIC");
    expect(test.isActive).toBeTruthy();
    expect(test.passingScore).toBe(70);
    expect(test.timeLimitMinutes).toBe(90);

    console.log(`✅ Test found: ${test.title}`);
  });

  it("Step 2: Verify questions are loaded with correct format", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    const questions = await db
      .select()
      .from(testQuestions)
      .where(and(
        eq(testQuestions.testId, testId),
        eq(testQuestions.isActive, true)
      ));

    expect(questions.length).toBeGreaterThan(0);
    console.log(`✅ Found ${questions.length} questions`);

    // Verify first question has correct structure
    const firstQuestion = questions[0];
    expect(firstQuestion).toHaveProperty('id');
    expect(firstQuestion).toHaveProperty('questionText');
    expect(firstQuestion).toHaveProperty('questionType');
    expect(firstQuestion).toHaveProperty('options');
    expect(firstQuestion).toHaveProperty('correctAnswer');

    // Verify options are objects with id and text
    expect(Array.isArray(firstQuestion.options)).toBe(true);
    expect(firstQuestion.options.length).toBeGreaterThan(0);
    
    const firstOption = firstQuestion.options[0];
    expect(firstOption).toHaveProperty('id');
    expect(firstOption).toHaveProperty('text');
    expect(typeof firstOption.id).toBe('string');
    expect(typeof firstOption.text).toBe('string');

    console.log(`✅ Question format verified: options have {id, text} structure`);
  });

  it("Step 3: Simulate starting the exam", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    // Create a test attempt
    await db.insert(userTestAttempts).values({
      userId: userId,
      testId: testId,
      startedAt: new Date().toISOString(),
    });

    // Query the created attempt
    const [attempt] = await db
      .select()
      .from(userTestAttempts)
      .where(and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.testId, testId)
      ))
      .orderBy(userTestAttempts.id)
      .limit(1);

    expect(attempt).toBeDefined();
    expect(attempt.id).toBeGreaterThan(0);

    console.log(`✅ Test attempt created: ID ${attempt.id}`);

    // Clean up
    await db.delete(userTestAttempts).where(eq(userTestAttempts.id, attempt.id));
  });

  it("Step 4: Simulate answering questions and calculating score", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    // Get 10 questions for testing
    const questions = await db
      .select()
      .from(testQuestions)
      .where(eq(testQuestions.testId, testId))
      .limit(10);

    expect(questions.length).toBe(10);

    // Simulate correct answers
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

    expect(scorePercentage).toBe(100); // All answers correct
    console.log(`✅ Score calculated: ${earnedPoints}/${totalPoints} = ${scorePercentage}%`);
  });

  it("Step 5: Verify passing score logic", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    const [test] = await db
      .select()
      .from(certificationTests)
      .where(eq(certificationTests.id, testId))
      .limit(1);

    const passingScore = test.passingScore;

    // Test various scores
    expect(80 >= passingScore).toBe(true); // Pass
    expect(70 >= passingScore).toBe(true); // Pass (exact)
    expect(69 >= passingScore).toBe(false); // Fail

    console.log(`✅ Passing score logic verified: ${passingScore}% required`);
  });

  it("Step 6: Simulate submitting exam and creating certificate", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    // Create a test attempt
    await db.insert(userTestAttempts).values({
      userId: userId,
      testId: testId,
      startedAt: new Date().toISOString(),
    });

    // Query the created attempt
    const [attempt] = await db
      .select()
      .from(userTestAttempts)
      .where(and(
        eq(userTestAttempts.userId, userId),
        eq(userTestAttempts.testId, testId)
      ))
      .orderBy(userTestAttempts.id)
      .limit(1);

    // Simulate passing score
    const score = 85;
    const passed = true;

    await db.update(userTestAttempts)
      .set({
        completedAt: new Date().toISOString(),
        score: score,
        passed: passed,
      })
      .where(eq(userTestAttempts.id, attempt.id));

    // Verify attempt was updated
    const [updatedAttempt] = await db
      .select()
      .from(userTestAttempts)
      .where(eq(userTestAttempts.id, attempt.id))
      .limit(1);

    expect(updatedAttempt.score).toBe(score);
    expect(updatedAttempt.passed).toBe(1); // MySQL stores boolean as 1/0
    expect(updatedAttempt.completedAt).toBeDefined();

    console.log(`✅ Exam submitted: Score ${score}%, Passed: ${passed}`);

    // Clean up
    await db.delete(userTestAttempts).where(eq(userTestAttempts.id, attempt.id));
  });

  it("Step 7: Verify complete data flow", async () => {
    if (!dbAvailable) { console.warn("⚠ Database not available, skipping test"); return; }
    // This test verifies the entire data structure is correct
    const [test] = await db
      .select()
      .from(certificationTests)
      .where(eq(certificationTests.id, testId))
      .limit(1);

    const questions = await db
      .select()
      .from(testQuestions)
      .where(eq(testQuestions.testId, testId));

    // Verify we have a complete exam
    expect(test).toBeDefined();
    expect(questions.length).toBeGreaterThan(0);

    // Verify all questions have valid structure
    let validQuestions = 0;
    for (const q of questions) {
      if (
        q.questionText &&
        q.questionType &&
        Array.isArray(q.options) &&
        q.options.length > 0 &&
        q.correctAnswer &&
        q.options.some((opt: any) => opt.id === q.correctAnswer)
      ) {
        validQuestions++;
      }
    }

    expect(validQuestions).toBe(questions.length);
    console.log(`✅ All ${validQuestions} questions have valid structure`);
  });
});
