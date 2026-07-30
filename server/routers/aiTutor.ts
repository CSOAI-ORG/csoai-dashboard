/**
 * AI Tutor Router - Real-Time Adaptive Training System
 * 
 * Provides AI-powered tutoring during practice questions:
 * - Real-time explanations when users answer questions
 * - Weakness detection and tracking
 * - Spaced repetition recommendations
 * - Learning analytics dashboard
 * - Framework-specific tutoring for £500 certification courses
 * - Ongoing adaptive learning to speed up AI Analyst training
 * 
 * This enables learning-while-practicing, which increases pass rates
 * and reduces time-to-certification compared to traditional exams.
 * 
 * CSOAI - Civil Society Organisation for AI
 * Legally qualified certification for AI Safety Analysts
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { testQuestions, userTestAttempts, certificationTests, trainingModules } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// Framework-specific learning resources
const FRAMEWORK_RESOURCES: Record<string, any> = {
  EU_AI_ACT: {
    name: "EU AI Act (Regulation 2024/1689)",
    keyArticles: ["Article 5", "Articles 6-7", "Articles 8-15", "Articles 50-52", "Articles 99-101"],
    studyTips: [
      "Focus on the four-tier risk classification system",
      "Understand prohibited AI practices in Article 5",
      "Learn the conformity assessment procedures",
      "Know the penalty structure (up to €35M or 7% turnover)"
    ],
    practiceAreas: ["Risk Classification", "Prohibited Practices", "High-Risk Requirements", "Transparency"]
  },
  NIST_AI_RMF: {
    name: "NIST AI Risk Management Framework",
    keyComponents: ["GOVERN", "MAP", "MEASURE", "MANAGE"],
    studyTips: [
      "Understand the four core functions and their subcategories",
      "Learn the trustworthy AI characteristics",
      "Practice applying the AI RMF Playbook",
      "Know how to map risks to organizational context"
    ],
    practiceAreas: ["Governance", "Risk Mapping", "Risk Measurement", "Risk Management"]
  },
  ISO_42001: {
    name: "ISO/IEC 42001:2023",
    keyClauses: ["Clause 4", "Clause 5", "Clause 6", "Clause 7", "Clause 8", "Clause 9", "Clause 10"],
    studyTips: [
      "Understand the Plan-Do-Check-Act cycle",
      "Learn AI risk assessment methodology",
      "Know documentation requirements",
      "Practice internal audit procedures"
    ],
    practiceAreas: ["Context", "Leadership", "Planning", "Operation", "Performance"]
  },
  UK_AI_BILL: {
    name: "UK AI Bill & AI Safety Institute",
    keyComponents: ["AI Safety Institute", "Foundation Models", "Sector Regulators", "Transparency"],
    studyTips: [
      "Understand the pro-innovation regulatory approach",
      "Learn AI Safety Institute evaluation methods",
      "Know sector-specific regulatory duties",
      "Understand compute thresholds and safety evaluations"
    ],
    practiceAreas: ["AISI Functions", "Foundation Models", "Sector Regulation", "International Cooperation"]
  },
  CANADA_AIDA: {
    name: "Canada AI and Data Act (AIDA)",
    keyComponents: ["High-Impact Systems", "Risk Assessment", "Transparency", "Enforcement"],
    studyTips: [
      "Understand high-impact AI system criteria",
      "Learn algorithmic impact assessment requirements",
      "Know the Privacy Commissioner's role",
      "Understand penalty framework"
    ],
    practiceAreas: ["High-Impact Classification", "Risk Assessment", "Transparency", "Compliance"]
  },
  AUSTRALIA_AI: {
    name: "Australia AI Ethics Framework",
    keyPrinciples: ["Human-centred", "Fairness", "Privacy", "Reliability", "Transparency", "Contestability", "Accountability", "Oversight"],
    studyTips: [
      "Learn all eight AI Ethics Principles",
      "Understand the Voluntary AI Safety Standard",
      "Know Indigenous data sovereignty considerations",
      "Practice applying principles to real scenarios"
    ],
    practiceAreas: ["Ethics Principles", "Safety Standard", "Governance", "Data Sovereignty"]
  },
  TC260: {
    name: "TC260 China AI Standards",
    keyRegulations: ["PIPL", "Data Security Law", "Algorithm Regulations", "Deep Synthesis", "Generative AI"],
    studyTips: [
      "Understand the multi-layered governance approach",
      "Learn algorithm registration requirements",
      "Know content moderation obligations",
      "Understand cross-border data transfer rules"
    ],
    practiceAreas: ["Personal Information", "Algorithm Registration", "Content Moderation", "Generative AI"]
  },
  ETHICS: {
    name: "AI Ethics & Incident Analysis",
    keyComponents: ["Ethical Principles", "Bias Detection", "Incident Investigation", "Remediation"],
    studyTips: [
      "Learn bias detection and mitigation techniques",
      "Understand incident investigation methodology",
      "Practice root cause analysis",
      "Know stakeholder communication best practices"
    ],
    practiceAreas: ["Ethics", "Bias", "Incidents", "Remediation"]
  }
};

export const aiTutorRouter = router({
  /**
   * Get a practice question for a specific test
   * Returns questions in adaptive order based on user's weak areas
   */
  getPracticeQuestion: protectedProcedure
    .input(
      z.object({
        testId: z.number().optional(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
        framework: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (!ctx.user?.id) throw new Error("User not authenticated");

      // Get user's weak areas from previous attempts
      const weakAreas = await db
        .select({
          moduleId: testQuestions.moduleId,
          correctCount: sql<number>`SUM(CASE WHEN ${userTestAttempts.passed} = 1 THEN 1 ELSE 0 END)`,
          totalCount: sql<number>`COUNT(*)`,
        })
        .from(userTestAttempts)
        .innerJoin(
          testQuestions,
          eq(userTestAttempts.testId, testQuestions.testId)
        )
        .where(eq(userTestAttempts.userId, ctx.user.id))
        .groupBy(testQuestions.moduleId);

      // Calculate accuracy per module
      const weakModules = weakAreas
        .map((area: any) => ({
          moduleId: area.moduleId,
          accuracy: area.correctCount / (area.totalCount || 1),
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5);

      // Get next question - prioritize weak areas
      let whereConditions: any[] = [eq(testQuestions.isActive, 1)];
      
      if (input.testId) {
        whereConditions.push(eq(testQuestions.testId, input.testId));
      }
      if (input.difficulty) {
        whereConditions.push(eq(testQuestions.difficulty, input.difficulty));
      }

      const questions = await db
        .select()
        .from(testQuestions)
        .where(and(...whereConditions))
        .limit(100);

      // Prioritize weak modules, then randomize
      let selectedQuestion: (typeof testQuestions.$inferSelect) | null = null;

      if (weakModules.length > 0) {
        const weakModuleIds = weakModules.map((t: any) => t.moduleId).filter(Boolean);
        const weakQuestion = questions.find((q: any) =>
          weakModuleIds.includes(q.moduleId)
        );
        if (weakQuestion) {
          selectedQuestion = weakQuestion;
        }
      }

      // If no weak area question, pick random
      if (!selectedQuestion && questions.length > 0) {
        selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
      }

      if (!selectedQuestion) {
        throw new Error("No questions available");
      }

      return {
        id: selectedQuestion.id,
        question: selectedQuestion.questionText,
        options: selectedQuestion.options as string[],
        difficulty: selectedQuestion.difficulty,
        moduleId: selectedQuestion.moduleId,
      };
    }),

  /**
   * Submit a practice answer and get AI explanation
   */
  submitPracticeAnswer: protectedProcedure
    .input(
      z.object({
        questionId: z.number(),
        selectedAnswer: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (!ctx.user?.id) throw new Error("User not authenticated");

      const [question] = await db
        .select()
        .from(testQuestions)
        .where(eq(testQuestions.id, input.questionId));

      if (!question) {
        throw new Error("Question not found");
      }

      const isCorrect = question.correctAnswer === input.selectedAnswer;
      const options = question.options as any[];
      
      const explanationPrompt = `You are an expert AI compliance trainer. A user just answered a question.

Question: ${question.questionText}

Options:
${options.map((opt: any, idx: number) => `${String.fromCharCode(65 + idx)}) ${typeof opt === 'string' ? opt : opt.text}`).join("\n")}

User's Answer: ${input.selectedAnswer}
Correct Answer: ${question.correctAnswer}
Is Correct: ${isCorrect ? "YES" : "NO"}

Explanation: ${question.explanation || "No explanation provided"}

Please provide a brief, helpful response as JSON:
{"whyCorrect": "2-3 sentences explaining why", "keyConcept": "1 sentence key concept", "example": "1-2 sentences practical example", "nextReview": "1 sentence what to review if wrong"}`;

      let aiExplanation = {
        whyCorrect: question.explanation || "Unable to generate explanation",
        keyConcept: "",
        example: "",
        nextReview: "",
      };

      try {
        const response = await invokeLLM({ messages: [{ role: 'user', content: explanationPrompt }] });
        if (typeof response === 'string') {
          const parsed = JSON.parse(response);
          aiExplanation = {
            whyCorrect: parsed.whyCorrect || aiExplanation.whyCorrect,
            keyConcept: parsed.keyConcept || "",
            example: parsed.example || "",
            nextReview: parsed.nextReview || "",
          };
        }
      } catch (error) {
        console.error("Error generating AI explanation:", error);
      }

      return {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: aiExplanation,
        moduleId: question.moduleId,
      };
    }),

  /**
   * Get user's learning analytics and weak areas
   */
  getLearningAnalytics: protectedProcedure
    .input(z.object({ testId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (!ctx.user?.id) throw new Error("User not authenticated");

      const attempts = await db
        .select()
        .from(userTestAttempts)
        .where(eq(userTestAttempts.userId, ctx.user.id))
        .orderBy(desc(userTestAttempts.createdAt));

      if (attempts.length === 0) {
        return {
          totalAttempts: 0,
          correctAnswers: 0,
          accuracy: 0,
          weakAreas: [],
          strongAreas: [],
          recentAttempts: [],
          improvementTrend: [],
        };
      }

      const totalAttempts = attempts.length;
      const correctAnswers = attempts.filter((a: any) => a.passed === 1).length;
      const accuracy = Math.round((correctAnswers / totalAttempts) * 100);

      const recentAttempts = attempts.slice(0, 10).map((a: any) => ({
        id: a.id,
        testId: a.testId,
        score: a.score,
        passed: a.passed === 1,
        createdAt: a.createdAt,
      }));

      const improvementTrend = attempts.slice(0, 5).reverse().map((a: any, idx: number) => ({
        attemptNumber: idx + 1,
        score: a.score || 0,
        passed: a.passed === 1,
      }));

      return {
        totalAttempts,
        correctAnswers,
        accuracy,
        weakAreas: [],
        strongAreas: [],
        recentAttempts,
        improvementTrend,
      };
    }),

  /**
   * Get spaced repetition recommendations
   */
  getSpacedRepetitionRecommendations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (!ctx.user?.id) throw new Error("User not authenticated");

    const attempts = await db
      .select()
      .from(userTestAttempts)
      .where(eq(userTestAttempts.userId, ctx.user.id))
      .orderBy(desc(userTestAttempts.createdAt))
      .limit(50);

    const incorrectAttempts = attempts.filter((a: any) => a.passed === 0);
    const testIds = [...new Set(incorrectAttempts.map((a: any) => a.testId))];

    const reviewQuestions = testIds.length > 0 ? await db
      .select()
      .from(testQuestions)
      .where(sql`${testQuestions.testId} IN (${sql.join(testIds.map((id: any) => sql`${id}`), sql`, `)})`)
      .limit(10) : [];

    return {
      questionsToReview: reviewQuestions.map((q: any) => ({
        id: q.id,
        question: q.questionText,
        difficulty: q.difficulty,
        moduleId: q.moduleId,
        reason: "Previously answered incorrectly",
      })),
      nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      totalPendingReviews: reviewQuestions.length,
    };
  }),

  /**
   * Get available tests for practice
   */
  getAvailableTests: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const tests = await db
      .select()
      .from(certificationTests)
      .where(eq(certificationTests.isActive, 1));

    return tests.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      passingScore: t.passingScore,
      timeLimit: t.timeLimitMinutes,
      questionCount: t.totalQuestions,
    }));
  }),

  /**
   * Get framework-specific tutoring session
   */
  getFrameworkTutoring: protectedProcedure
    .input(
      z.object({
        framework: z.enum([
          "EU_AI_ACT",
          "NIST_AI_RMF",
          "ISO_42001",
          "UK_AI_BILL",
          "CANADA_AIDA",
          "AUSTRALIA_AI",
          "TC260",
          "ETHICS"
        ]),
        topic: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (!ctx.user?.id) throw new Error("User not authenticated");

      const [module] = await db
        .select()
        .from(trainingModules)
        .where(eq(trainingModules.code, input.framework))
        .limit(1);

      const questions = await db
        .select()
        .from(testQuestions)
        .where(
          module?.id
            ? eq(testQuestions.moduleId, module.id)
            : eq(testQuestions.isActive, 1)
        )
        .limit(50);

      const resources = FRAMEWORK_RESOURCES[input.framework] || FRAMEWORK_RESOURCES.EU_AI_ACT;

      return {
        framework: input.framework,
        resources,
        questionCount: questions.length,
        moduleInfo: module ? {
          id: module.id,
          title: module.title,
          description: module.description,
          duration: module.durationMinutes,
        } : null,
        sampleQuestions: questions.slice(0, 5).map((q: any) => ({
          id: q.id,
          preview: q.questionText.substring(0, 100) + "...",
          difficulty: q.difficulty,
        })),
      };
    }),

  /**
   * Generate adaptive practice questions based on user's weak areas
   */
  generateAdaptiveQuestion: protectedProcedure
    .input(
      z.object({
        framework: z.string(),
        weakArea: z.string(),
        difficulty: z.enum(["easy", "medium", "hard"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (!ctx.user?.id) throw new Error("User not authenticated");

      const prompt = `You are an expert AI compliance examiner. Generate a multiple-choice exam question for the ${input.framework} framework.

Topic/Weak Area: ${input.weakArea}
Difficulty: ${input.difficulty || "medium"}

Generate a question that tests understanding of ${input.weakArea}, has 4 options (A, B, C, D) with only one correct answer, is appropriate for a professional certification exam, and references specific regulatory provisions where applicable.

Format your response as JSON:
{"questionText": "The question text", "options": [{"id": "A", "text": "Option A"}, {"id": "B", "text": "Option B"}, {"id": "C", "text": "Option C"}, {"id": "D", "text": "Option D"}], "correctAnswer": "B", "explanation": "Why B is correct", "keyConcept": "The main concept being tested"}`;

      try {
        const response = await invokeLLM({ messages: [{ role: 'user', content: prompt }] });
        if (typeof response === 'string') {
          const parsed = JSON.parse(response);
          return {
            success: true,
            question: {
              questionText: parsed.questionText,
              options: parsed.options,
              correctAnswer: parsed.correctAnswer,
              explanation: parsed.explanation,
              keyConcept: parsed.keyConcept,
              framework: input.framework,
              difficulty: input.difficulty || "medium",
              isGenerated: true,
            },
          };
        }
      } catch (error) {
        console.error("Error generating adaptive question:", error);
      }

      return {
        success: false,
        error: "Failed to generate question",
      };
    }),

  /**
   * Get comprehensive learning path recommendation
   */
  getLearningPathRecommendation: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (!ctx.user?.id) throw new Error("User not authenticated");

    const attempts = await db
      .select()
      .from(userTestAttempts)
      .where(eq(userTestAttempts.userId, ctx.user.id))
      .orderBy(desc(userTestAttempts.createdAt))
      .limit(100);

    const modules = await db
      .select()
      .from(trainingModules)
      .where(eq(trainingModules.isActive, 1));

    const moduleStats = modules.map((module: any) => {
      const moduleAttempts = attempts.filter((a: any) => a.testId === module.id);
      const passedAttempts = moduleAttempts.filter((a: any) => a.passed === 1);
      
      return {
        moduleId: module.id,
        moduleCode: module.code,
        moduleTitle: module.title,
        attemptCount: moduleAttempts.length,
        passCount: passedAttempts.length,
        accuracy: moduleAttempts.length > 0 
          ? Math.round((passedAttempts.length / moduleAttempts.length) * 100)
          : 0,
        status: passedAttempts.length > 0 ? "completed" : moduleAttempts.length > 0 ? "in_progress" : "not_started",
      };
    });

    const weakAreas = moduleStats
      .filter((m: any) => m.accuracy < 70 && m.attemptCount > 0)
      .sort((a, b) => a.accuracy - b.accuracy);

    const strongAreas = moduleStats
      .filter((m: any) => m.accuracy >= 80 && m.attemptCount > 0)
      .sort((a, b) => b.accuracy - a.accuracy);

    const recommendedModules = moduleStats
      .filter((m: any) => m.status === "not_started" || m.accuracy < 70)
      .slice(0, 3);

    const completedModules = moduleStats.filter((m: any) => m.status === "completed").length;
    const overallAccuracy = moduleStats.reduce((sum, m) => sum + m.accuracy, 0) / (moduleStats.length || 1);
    const certificationReadiness = Math.round(
      (completedModules / (modules.length || 1)) * 50 + (overallAccuracy / 100) * 50
    );

    return {
      overallProgress: {
        modulesCompleted: completedModules,
        totalModules: modules.length,
        overallAccuracy: Math.round(overallAccuracy),
        certificationReadiness,
        readyForExam: certificationReadiness >= 70,
      },
      weakAreas: weakAreas.slice(0, 5),
      strongAreas: strongAreas.slice(0, 5),
      recommendedModules,
      nextSteps: [
        certificationReadiness < 50 
          ? "Focus on completing more training modules"
          : certificationReadiness < 70
          ? "Review weak areas before attempting certification"
          : "You're ready to attempt the certification exam!",
        weakAreas.length > 0
          ? `Priority: Improve your ${weakAreas[0]?.moduleTitle || 'weak areas'} knowledge`
          : "Continue practicing to maintain your skills",
      ],
    };
  }),

  /**
   * Get certification exam preparation summary
   */
  getExamPreparation: protectedProcedure
    .input(z.object({ testId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      if (!ctx.user?.id) throw new Error("User not authenticated");

      const [test] = input.testId
        ? await db
            .select()
            .from(certificationTests)
            .where(eq(certificationTests.id, input.testId))
        : await db
            .select()
            .from(certificationTests)
            .where(eq(certificationTests.isActive, 1))
            .limit(1);

      if (!test) {
        throw new Error("No certification test available");
      }

      const questionStats = await db
        .select({
          difficulty: testQuestions.difficulty,
          count: sql<number>`COUNT(*)`,
        })
        .from(testQuestions)
        .where(eq(testQuestions.testId, test.id))
        .groupBy(testQuestions.difficulty);

      const recentAttempts = await db
        .select()
        .from(userTestAttempts)
        .where(
          and(
            eq(userTestAttempts.userId, ctx.user.id),
            eq(userTestAttempts.testId, test.id)
          )
        )
        .orderBy(desc(userTestAttempts.createdAt))
        .limit(5);

      const bestScore = recentAttempts.length > 0
        ? Math.max(...recentAttempts.map((a: any) => a.score || 0))
        : 0;

      const hasPassed = recentAttempts.some((a: any) => a.passed === 1);

      return {
        test: {
          id: test.id,
          title: test.title,
          description: test.description,
          passingScore: test.passingScore,
          timeLimit: test.timeLimitMinutes,
          totalQuestions: test.totalQuestions,
        },
        questionBreakdown: questionStats.reduce((acc: any, stat: any) => {
          acc[stat.difficulty] = stat.count;
          return acc;
        }, {}),
        userProgress: {
          attemptCount: recentAttempts.length,
          bestScore,
          hasPassed,
          lastAttempt: recentAttempts[0]?.createdAt || null,
        },
        recommendations: [
          bestScore < test.passingScore
            ? `You need ${test.passingScore - bestScore}% more to pass. Focus on weak areas.`
            : "Great progress! You're on track to pass.",
          "Review all framework-specific materials before the exam",
          "Practice with timed questions to improve speed",
          "Focus on scenario-based questions for practical application",
        ],
        certificationInfo: {
          name: "CSOAI Certified AI Safety Analyst",
          validityPeriod: "24 months",
          cpdRequirement: "20 hours per year",
          accreditation: "ISO 17024 aligned",
        },
      };
    }),
});
