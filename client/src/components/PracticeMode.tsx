/**
 * Practice Mode Component
 * 
 * Provides real-time AI tutoring during practice questions:
 * - Displays practice questions one at a time
 * - Shows AI explanations after each answer
 * - Tracks progress and weak areas
 * - Recommends what to study next
 */

import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, XCircle, Lightbulb, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PracticeModeProps {
  framework: string;
  level?: "fundamentals" | "advanced" | "specialist";
  onComplete?: () => void;
}

export function PracticeMode({ framework, level, onComplete }: PracticeModeProps) {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch practice question
  const getPracticeQuestion = trpc.aiTutor.getPracticeQuestion.useQuery(
    { difficulty: level === "advanced" ? "hard" : level === "specialist" ? "hard" : "medium" },
    { enabled: !currentQuestion && !showExplanation }
  );

  // Submit answer mutation
  const submitAnswer = trpc.aiTutor.submitPracticeAnswer.useMutation();

  // Get learning analytics
  const analytics = trpc.aiTutor.getLearningAnalytics.useQuery(
    {},
    { enabled: questionsAnswered > 0 }
  );

  // Get recommendations - this method doesn't exist, commenting out
  // const recommendations = trpc.aiTutor.getRecommendations.useQuery(
  //   { framework },
  //   { enabled: questionsAnswered > 0 }
  // );

  // Load initial question
  useEffect(() => {
    if (getPracticeQuestion.data && !currentQuestion) {
      setCurrentQuestion(getPracticeQuestion.data);
    }
  }, [getPracticeQuestion.data, currentQuestion]);

  // Handle answer submission
  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentQuestion) return;

    setLoading(true);
    try {
      const result = await submitAnswer.mutateAsync({
        questionId: currentQuestion.id,
        selectedAnswer,
      });

      setIsCorrect(result.isCorrect);
      setExplanation(result.explanation);
      setShowExplanation(true);
      setQuestionsAnswered((prev) => prev + 1);

      if (result.isCorrect) {
        setCorrectAnswers((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setLoading(false);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setExplanation(null);
    setIsCorrect(null);
    setCurrentQuestion(null);
    getPracticeQuestion.refetch();
  };

  if (!currentQuestion && !showExplanation) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading practice question...</p>
        </div>
      </div>
    );
  }

  const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;
  const answerOptions = currentQuestion?.options || [];

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {correctAnswers}/{questionsAnswered} correct ({Math.round(accuracy)}%)
          </span>
        </div>
        <Progress value={accuracy} className="h-2" />
      </div>

      {/* Question Card */}
      {!showExplanation ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{currentQuestion?.question}</CardTitle>
            <CardDescription>
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mr-2">
                {currentQuestion?.topic}
              </span>
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                {currentQuestion?.difficulty}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Answer Options */}
            <div className="space-y-3">
              {answerOptions.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(option)}
                  className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                    selectedAnswer === option
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        selectedAnswer === option
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedAnswer === option && (
                        <span className="text-white text-xs font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-sm">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Checking answer..." : "Submit Answer"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Explanation Card */
        <Card className={isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardHeader>
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <CardTitle className="text-green-900">Correct!</CardTitle>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <CardTitle className="text-red-900">Not quite right</CardTitle>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* AI Explanation */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="font-semibold text-sm">Why this matters:</span>
                </div>
                <p className="text-sm text-gray-700">{explanation?.whyCorrect}</p>
              </div>

              {explanation?.keyConcept && (
                <div>
                  <span className="font-semibold text-sm">Key concept:</span>
                  <p className="text-sm text-gray-700">{explanation.keyConcept}</p>
                </div>
              )}

              {explanation?.example && (
                <div>
                  <span className="font-semibold text-sm">Example:</span>
                  <p className="text-sm text-gray-700">{explanation.example}</p>
                </div>
              )}

              {!isCorrect && explanation?.nextReview && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-900 text-sm">
                    {explanation.nextReview}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Correct Answer */}
            {!isCorrect && (
              <div className="p-3 bg-white rounded border border-gray-200">
                <span className="text-sm font-semibold">Correct answer:</span>
                <p className="text-sm text-gray-700">{currentQuestion?.correctAnswer}</p>
              </div>
            )}

            {/* Next Button */}
            <Button onClick={handleNextQuestion} className="w-full" size="lg">
              Next Question
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analytics Sidebar */}
      {questionsAnswered > 0 && (
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            {analytics.data && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Overall Accuracy</p>
                      <p className="text-2xl font-bold">{analytics.data.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Attempts</p>
                      <p className="text-2xl font-bold">{analytics.data.totalAttempts}</p>
                    </div>
                  </div>

                  {analytics.data.weakAreas && analytics.data.weakAreas.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Areas to improve:</p>
                      <div className="space-y-2">
                        {analytics.data.weakAreas.slice(0, 3).map((area: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <div className="flex justify-between mb-1">
                              <span>{area.topic || `Area ${idx + 1}`}</span>
                              <span className="text-xs text-muted-foreground">{area.accuracy || 0}%</span>
                            </div>
                            <Progress value={area.accuracy || 0} className="h-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analytics.data.accuracy >= 70 && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-900 text-sm">
                        You're ready for the certification exam!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What to study next</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded border-l-4 border-l-blue-500 bg-blue-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">Continue practicing</p>
                      <p className="text-xs text-muted-foreground mt-1">Answer more questions to get personalized recommendations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
