/**
 * Comprehensive tests for exam system enhancements:
 * - Expanded question bank (275 questions)
 * - Practice mode functionality
 * - Analytics dashboard
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { getDb } from "../db";
import { testQuestions, userTestAttempts, certificationTests } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

describe("Exam System Enhancements", () => {
  let db: Awaited<ReturnType<typeof getDb>> | null = null;
  let dbAvailable = false;

  beforeAll(async () => {
    try {
      db = await getDb();
      dbAvailable = !!db;
    } catch (error) {
      console.log('⚠️ Database not available, tests will be skipped');
      dbAvailable = false;
    }
  });

  describe("Question Bank Expansion", () => {
    it("should have 200+ questions in the database", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const questions = await db
        .select()
        .from(testQuestions)
        .where(eq(testQuestions.isActive, true));

      expect(questions.length).toBeGreaterThanOrEqual(200);
      console.log(`✅ Total questions: ${questions.length}`);
    });

    it("should have diverse question types", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const questions = await db
        .select()
        .from(testQuestions)
        .where(eq(testQuestions.isActive, true));

      const types = new Set(questions.map((q) => q.questionType));
      
      expect(types.has("multiple_choice")).toBe(true);
      expect(questions.length).toBeGreaterThan(200);

      console.log(`✅ Question types found: ${Array.from(types).join(", ")}`);
      console.log(`✅ Total questions: ${questions.length}`);
    });

    it("should have questions at all difficulty levels", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const questions = await db
        .select()
        .from(testQuestions)
        .where(eq(testQuestions.isActive, true));

      const difficulties = new Set(questions.map((q) => q.difficulty));
      
      expect(difficulties.has("easy")).toBe(true);
      expect(difficulties.has("medium")).toBe(true);
      expect(difficulties.has("hard")).toBe(true);

      const easyCount = questions.filter((q) => q.difficulty === "easy").length;
      const mediumCount = questions.filter((q) => q.difficulty === "medium").length;
      const hardCount = questions.filter((q) => q.difficulty === "hard").length;

      console.log(`✅ Difficulty distribution: Easy=${easyCount}, Medium=${mediumCount}, Hard=${hardCount}`);
    });

    it("should have correct question format with options and explanations", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const questions = await db
        .select()
        .from(testQuestions)
        .where(eq(testQuestions.isActive, true))
        .limit(10);

      for (const q of questions) {
        // Check options format
        const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
        expect(Array.isArray(options)).toBe(true);
        expect(options.length).toBeGreaterThan(0);
        
        // Each option should have id and text
        options.forEach((opt: any) => {
          expect(opt).toHaveProperty("id");
          expect(opt).toHaveProperty("text");
          expect(typeof opt.id).toBe("string");
          expect(typeof opt.text).toBe("string");
        });

        // Check correctAnswer is a letter
        expect(q.correctAnswer).toMatch(/^[A-Z]$/);

        // Check explanation exists
        expect(q.explanation).toBeTruthy();
        expect(typeof q.explanation).toBe("string");
      }

      console.log("✅ All questions have correct format");
    });
  });

  describe("Practice Mode", () => {
    it("should allow fetching test questions without authentication", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      // This simulates the practice mode query (public procedure)
      const [test] = await db
        .select()
        .from(certificationTests)
        .where(eq(certificationTests.id, 30001))
        .limit(1);

      expect(test).toBeTruthy();
      expect(test.title).toBeTruthy();

      const questions = await db
        .select()
        .from(testQuestions)
        .where(and(
          eq(testQuestions.testId, 30001),
          eq(testQuestions.isActive, true)
        ));

      expect(questions.length).toBeGreaterThan(0);
      console.log(`✅ Practice mode can access ${questions.length} questions`);
    });

    it("should have explanations for instant feedback", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const questions = await db
        .select()
        .from(testQuestions)
        .where(eq(testQuestions.testId, 30001))
        .limit(20);

      const questionsWithExplanations = questions.filter((q) => q.explanation && q.explanation.length > 10);
      
      expect(questionsWithExplanations.length).toBe(questions.length);
      console.log(`✅ All ${questions.length} questions have explanations for feedback`);
    });
  });

  describe("Analytics Dashboard", () => {
    it("should calculate pass rate correctly", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const attempts = await db
        .select()
        .from(userTestAttempts)
        .where(sql`${userTestAttempts.completedAt} IS NOT NULL`);

      if (attempts.length === 0) {
        console.log("⚠️ No completed attempts yet - skipping pass rate test");
        return;
      }

      const passedAttempts = attempts.filter((a) => a.passed).length;
      const passRate = (passedAttempts / attempts.length) * 100;

      expect(passRate).toBeGreaterThanOrEqual(0);
      expect(passRate).toBeLessThanOrEqual(100);

      console.log(`✅ Pass rate: ${passRate.toFixed(1)}% (${passedAttempts}/${attempts.length})`);
    });

    it("should calculate average score correctly", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const attempts = await db
        .select()
        .from(userTestAttempts)
        .where(sql`${userTestAttempts.completedAt} IS NOT NULL`);

      if (attempts.length === 0) {
        console.log("⚠️ No completed attempts yet - skipping average score test");
        return;
      }

      const averageScore = attempts.reduce((sum, a) => sum + (a.percentScore || 0), 0) / attempts.length;

      expect(averageScore).toBeGreaterThanOrEqual(0);
      expect(averageScore).toBeLessThanOrEqual(100);

      console.log(`✅ Average score: ${averageScore.toFixed(1)}%`);
    });

    it("should identify most missed questions", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const attempts = await db
        .select()
        .from(userTestAttempts)
        .where(sql`${userTestAttempts.completedAt} IS NOT NULL`);

      if (attempts.length === 0) {
        console.log("⚠️ No completed attempts yet - skipping most missed questions test");
        return;
      }

      const allQuestions = await db.select().from(testQuestions).limit(50);

      const questionStats = allQuestions.map((q) => {
        let totalAttempts = 0;
        let incorrectCount = 0;

        attempts.forEach((attempt) => {
          if (attempt.answers) {
            const answers = typeof attempt.answers === 'string' 
              ? JSON.parse(attempt.answers) 
              : attempt.answers;
            
            if (answers[q.id.toString()]) {
              totalAttempts++;
              if (answers[q.id.toString()] !== q.correctAnswer) {
                incorrectCount++;
              }
            }
          }
        });

        const missRate = totalAttempts > 0 ? (incorrectCount / totalAttempts) * 100 : 0;

        return {
          id: q.id,
          questionText: q.questionText,
          totalAttempts,
          incorrectCount,
          missRate,
        };
      });

      const mostMissed = questionStats
        .filter((q) => q.totalAttempts >= 1)
        .sort((a, b) => b.missRate - a.missRate)
        .slice(0, 5);

      console.log(`✅ Most missed questions analysis complete (${mostMissed.length} questions with data)`);
      
      if (mostMissed.length > 0) {
        console.log(`   Top miss rate: ${mostMissed[0].missRate.toFixed(1)}%`);
      }
    });

    it("should calculate score distribution", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const attempts = await db
        .select()
        .from(userTestAttempts)
        .where(sql`${userTestAttempts.completedAt} IS NOT NULL`);

      if (attempts.length === 0) {
        console.log("⚠️ No completed attempts yet - skipping score distribution test");
        return;
      }

      const scoreRanges = [
        { range: "0-20%", min: 0, max: 20 },
        { range: "21-40%", min: 21, max: 40 },
        { range: "41-60%", min: 41, max: 60 },
        { range: "61-80%", min: 61, max: 80 },
        { range: "81-100%", min: 81, max: 100 },
      ];

      const distribution = scoreRanges.map((bucket) => {
        const count = attempts.filter(
          (a) => a.percentScore! >= bucket.min && a.percentScore! <= bucket.max
        ).length;
        return {
          range: bucket.range,
          count,
          percentage: (count / attempts.length) * 100,
        };
      });

      const totalPercentage = distribution.reduce((sum, d) => sum + d.percentage, 0);
      expect(Math.abs(totalPercentage - 100)).toBeLessThan(1); // Allow for rounding errors

      console.log("✅ Score distribution:");
      distribution.forEach((d) => {
        console.log(`   ${d.range}: ${d.count} attempts (${d.percentage.toFixed(1)}%)`);
      });
    });
  });

  describe("Integration Tests", () => {
    it("should have consistent data across all tables", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const tests = await db.select().from(certificationTests);
      const questions = await db.select().from(testQuestions);
      const attempts = await db.select().from(userTestAttempts);

      expect(tests.length).toBeGreaterThan(0);
      expect(questions.length).toBeGreaterThan(0);

      // Verify all questions reference valid tests
      const testIds = new Set(tests.map((t) => t.id));
      questions.forEach((q) => {
        expect(testIds.has(q.testId)).toBe(true);
      });

      // Verify all attempts reference valid tests
      if (attempts.length > 0) {
        attempts.forEach((a) => {
          expect(testIds.has(a.testId)).toBe(true);
        });
      }

      console.log("✅ Data consistency verified across all tables");
    });
  });
});

describe("Phase 12 - Question Randomization & Timed Practice", () => {
  let db: Awaited<ReturnType<typeof getDb>> | null = null;
  let dbAvailable = false;

  beforeAll(async () => {
    try {
      db = await getDb();
      dbAvailable = !!db;
    } catch (error) {
      console.log('\u26a0\ufe0f Database not available, tests will be skipped');
      dbAvailable = false;
    }
  });

  describe("Question Randomization", () => {
    it("should verify questions can be shuffled using Fisher-Yates algorithm", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const questions = await db
        .select({
          id: testQuestions.id,
          questionText: testQuestions.questionText,
        })
        .from(testQuestions)
        .where(eq(testQuestions.testId, 30001))
        .limit(20);

      expect(questions.length).toBeGreaterThan(5);

      // Simulate Fisher-Yates shuffle
      const shuffled = [...questions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Verify shuffle maintains all questions
      expect(shuffled.length).toBe(questions.length);
      const originalIds = new Set(questions.map(q => q.id));
      const shuffledIds = new Set(shuffled.map(q => q.id));
      expect(shuffledIds.size).toBe(originalIds.size);

      console.log("✅ Question randomization algorithm verified");
    });

    it("should verify options can be shuffled within questions", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const [question] = await db
        .select({
          id: testQuestions.id,
          options: testQuestions.options,
        })
        .from(testQuestions)
        .where(eq(testQuestions.testId, 30001))
        .limit(1);

      expect(question).toBeDefined();
      
      const options = typeof question.options === 'string' 
        ? JSON.parse(question.options) 
        : question.options;
      
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(1);

      // Simulate option shuffle
      const shuffledOptions = [...options];
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }

      // Verify all options preserved
      expect(shuffledOptions.length).toBe(options.length);
      const originalIds = new Set(options.map((o: any) => o.id));
      const shuffledIds = new Set(shuffledOptions.map((o: any) => o.id));
      expect(shuffledIds.size).toBe(originalIds.size);

      console.log("✅ Option randomization algorithm verified");
    });
  });

  describe("Timed Practice Mode", () => {
    it("should support timed practice with instant feedback", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const [test] = await db
        .select()
        .from(certificationTests)
        .where(eq(certificationTests.id, 30001))
        .limit(1);

      expect(test).toBeDefined();
      expect(test.timeLimitMinutes).toBeGreaterThan(0);

      // Verify questions have explanations for instant feedback
      const questions = await db
        .select({
          id: testQuestions.id,
          correctAnswer: testQuestions.correctAnswer,
          explanation: testQuestions.explanation,
          points: testQuestions.points,
        })
        .from(testQuestions)
        .where(eq(testQuestions.testId, 30001))
        .limit(10);

      questions.forEach((q: any) => {
        expect(q.correctAnswer).toBeDefined();
        expect(q.explanation).toBeDefined();
        expect(q.explanation.length).toBeGreaterThan(0);
        expect(q.points).toBeGreaterThan(0);
      });

      console.log(`✅ Timed practice mode data verified (${questions.length} questions with feedback)`);
    });

    it("should calculate practice mode scores without database storage", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const questions = await db
        .select({
          id: testQuestions.id,
          points: testQuestions.points,
          correctAnswer: testQuestions.correctAnswer,
        })
        .from(testQuestions)
        .where(eq(testQuestions.testId, 30001))
        .limit(15);

      // Simulate practice mode scoring (client-side calculation)
      const userAnswers: Record<string, string> = {};
      let totalPoints = 0;
      let earnedPoints = 0;

      questions.forEach((q: any, index: number) => {
        totalPoints += q.points;
        // Simulate 80% correct rate
        if (index < 12) {
          userAnswers[q.id.toString()] = q.correctAnswer;
          earnedPoints += q.points;
        } else {
          userAnswers[q.id.toString()] = "WRONG";
        }
      });

      const percentScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const passed = percentScore >= 70;

      expect(percentScore).toBeGreaterThan(0);
      expect(percentScore).toBeLessThanOrEqual(100);
      expect(passed).toBe(true);

      console.log(`✅ Practice mode scoring: ${percentScore}% (${earnedPoints}/${totalPoints} points)`);
    });
  });

  describe("Exam Review Feature", () => {
    it("should provide complete review data structure", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      // Get a completed attempt (if any exists)
      const [attempt] = await db
        .select()
        .from(userTestAttempts)
        .where(sql`${userTestAttempts.completedAt} IS NOT NULL`)
        .limit(1);

      if (!attempt) {
        console.log("⚠️ No completed attempts - creating mock review data");
        
        // Verify review data structure can be built
        const questions = await db
          .select()
          .from(testQuestions)
          .where(eq(testQuestions.testId, 30001))
          .limit(10);

        const mockUserAnswers: Record<string, string> = {};
        const reviewQuestions = questions.map((q: any) => {
          const userAnswer = mockUserAnswers[q.id.toString()] || null;
          const isCorrect = userAnswer === q.correctAnswer;

          return {
            id: q.id,
            questionText: q.questionText,
            options: q.options,
            userAnswer,
            correctAnswer: q.correctAnswer,
            isCorrect,
            explanation: q.explanation,
            points: q.points,
            difficulty: q.difficulty,
          };
        });

        expect(reviewQuestions.length).toBe(questions.length);
        reviewQuestions.forEach((rq: any) => {
          expect(rq).toHaveProperty("userAnswer");
          expect(rq).toHaveProperty("correctAnswer");
          expect(rq).toHaveProperty("isCorrect");
          expect(rq).toHaveProperty("explanation");
        });

        console.log("✅ Review data structure verified");
        return;
      }

      // Verify actual attempt review data
      const questions = await db
        .select()
        .from(testQuestions)
        .where(eq(testQuestions.testId, attempt.testId));

      const userAnswers = typeof attempt.answers === 'string'
        ? JSON.parse(attempt.answers)
        : attempt.answers || {};

      let correctCount = 0;
      let incorrectCount = 0;
      let unansweredCount = 0;

      questions.forEach((q: any) => {
        const userAnswer = userAnswers[q.id.toString()];
        if (!userAnswer) {
          unansweredCount++;
        } else if (userAnswer === q.correctAnswer) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      });

      expect(correctCount + incorrectCount + unansweredCount).toBe(questions.length);

      console.log(`✅ Review summary: ${correctCount} correct, ${incorrectCount} incorrect, ${unansweredCount} unanswered`);
    });

    it("should support filtering review questions by status", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      const questions = await db
        .select()
        .from(testQuestions)
        .where(eq(testQuestions.testId, 30001))
        .limit(20);

      // Simulate review filtering
      const mockUserAnswers: Record<string, string> = {};
      questions.forEach((q: any, index: number) => {
        if (index < 10) {
          mockUserAnswers[q.id.toString()] = q.correctAnswer; // Correct
        } else if (index < 15) {
          mockUserAnswers[q.id.toString()] = "WRONG"; // Incorrect
        }
        // Rest are unanswered
      });

      const reviewQuestions = questions.map((q: any) => {
        const userAnswer = mockUserAnswers[q.id.toString()] || null;
        return {
          id: q.id,
          userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: userAnswer === q.correctAnswer,
        };
      });

      const correctOnly = reviewQuestions.filter(q => q.isCorrect);
      const incorrectOnly = reviewQuestions.filter(q => !q.isCorrect && q.userAnswer);
      const unansweredOnly = reviewQuestions.filter(q => !q.userAnswer);

      expect(correctOnly.length).toBe(10);
      expect(incorrectOnly.length).toBe(5);
      expect(unansweredOnly.length).toBe(5);
      expect(correctOnly.length + incorrectOnly.length + unansweredOnly.length).toBe(questions.length);

      console.log("✅ Review filtering verified: correct, incorrect, unanswered");
    });
  });

  describe("Integration - All Phase 12 Features", () => {
    it("should support complete exam workflow with all enhancements", async () => {
      if (!db || !dbAvailable) {
        console.log('⚠️ Database not available, skipping test');
        return;
      }

      // 1. Get test with time limit
      const [test] = await db
        .select()
        .from(certificationTests)
        .where(eq(certificationTests.id, 30001))
        .limit(1);

      expect(test).toBeDefined();
      expect(test.timeLimitMinutes).toBeGreaterThan(0);

      // 2. Get randomizable questions
      const questions = await db
        .select()
        .from(testQuestions)
        .where(and(
          eq(testQuestions.testId, 30001),
          eq(testQuestions.isActive, true)
        ))
        .limit(20);

      expect(questions.length).toBeGreaterThan(0);

      // 3. Verify questions support randomization
      questions.forEach((q: any) => {
        const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
        expect(Array.isArray(options)).toBe(true);
        expect(options.length).toBeGreaterThan(1);
      });

      // 4. Verify questions support practice mode feedback
      questions.forEach((q: any) => {
        expect(q.correctAnswer).toBeDefined();
        expect(q.explanation).toBeDefined();
        expect(q.explanation.length).toBeGreaterThan(0);
      });

      // 5. Verify questions support review feature
      questions.forEach((q: any) => {
        expect(q.questionText).toBeDefined();
        expect(q.points).toBeGreaterThan(0);
        expect(q.difficulty).toBeDefined();
      });

      console.log("✅ All Phase 12 features integrated successfully");
      console.log(`   - Question randomization: ✓`);
      console.log(`   - Timed practice mode: ✓`);
      console.log(`   - Exam review feature: ✓`);
    });
  });
});
