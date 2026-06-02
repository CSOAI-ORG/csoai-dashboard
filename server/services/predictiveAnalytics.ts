/**
 * Predictive Analytics Service
 * 
 * ML-based predictions for student success rates and completion likelihood
 * Uses simple but effective statistical models for prediction
 */

import { getDb } from "../db";
import { courseEnrollments, userTrainingProgress, userTestAttempts, users } from "../../drizzle/schema";
import { eq, and, sql, gte } from "drizzle-orm";

export interface StudentPrediction {
  userId: number;
  userName: string;
  userEmail: string;
  successProbability: number; // 0-100
  completionLikelihood: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  predictedCompletionDate: string | null;
  recommendations: string[];
  features: {
    enrollmentAge: number; // days since enrollment
    progressRate: number; // progress per day
    engagementScore: number; // 0-100
    testPerformance: number; // 0-100
    activityConsistency: number; // 0-100
  };
}

export interface PredictionModel {
  weights: {
    progressRate: number;
    engagementScore: number;
    testPerformance: number;
    activityConsistency: number;
    enrollmentAge: number;
  };
  threshold: {
    high: number;
    medium: number;
  };
}

// Default model weights (can be trained with real data)
const DEFAULT_MODEL: PredictionModel = {
  weights: {
    progressRate: 0.30,
    engagementScore: 0.25,
    testPerformance: 0.25,
    activityConsistency: 0.15,
    enrollmentAge: 0.05,
  },
  threshold: {
    high: 70,
    medium: 40,
  },
};

/**
 * Calculate engagement score based on activity patterns
 */
function calculateEngagementScore(params: {
  totalLogins: number;
  daysActive: number;
  enrollmentAge: number;
  modulesStarted: number;
  modulesCompleted: number;
}): number {
  const { totalLogins, daysActive, enrollmentAge, modulesStarted, modulesCompleted } = params;

  // Normalize metrics
  const loginFrequency = enrollmentAge > 0 ? (totalLogins / enrollmentAge) * 100 : 0;
  const activityRatio = enrollmentAge > 0 ? (daysActive / enrollmentAge) * 100 : 0;
  const completionRatio = modulesStarted > 0 ? (modulesCompleted / modulesStarted) * 100 : 0;

  // Weighted average
  const engagementScore = (
    loginFrequency * 0.3 +
    activityRatio * 0.3 +
    completionRatio * 0.4
  );

  return Math.min(100, Math.max(0, engagementScore));
}

/**
 * Calculate activity consistency score
 */
function calculateConsistencyScore(activityDates: Date[]): number {
  if (activityDates.length < 2) return 50;

  // Calculate gaps between activities
  const sortedDates = activityDates.sort((a, b) => a.getTime() - b.getTime());
  const gaps: number[] = [];

  for (let i = 1; i < sortedDates.length; i++) {
    const gap = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    gaps.push(gap);
  }

  // Calculate standard deviation of gaps (lower is more consistent)
  const avgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
  const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
  const stdDev = Math.sqrt(variance);

  // Convert to consistency score (0-100, higher is better)
  // Ideal gap is 1-3 days, penalize large gaps and high variance
  const idealGap = 2;
  const gapPenalty = Math.abs(avgGap - idealGap) * 5;
  const variancePenalty = stdDev * 3;
  const consistencyScore = Math.max(0, 100 - gapPenalty - variancePenalty);

  return Math.min(100, Math.max(0, consistencyScore));
}

/**
 * Predict student success for a single user
 */
export async function predictStudentSuccess(userId: number): Promise<StudentPrediction | null> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get user info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return null;

    // Get enrollments
    const enrollments = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId));

    if (enrollments.length === 0) return null;

    // Get training progress
    const trainingProgress = await db
      .select()
      .from(userTrainingProgress)
      .where(eq(userTrainingProgress.userId, userId));

    // Get test attempts
    const testAttempts = await db
      .select()
      .from(userTestAttempts)
      .where(eq(userTestAttempts.userId, userId));

    // Calculate features
    const now = new Date();
    const firstEnrollment = enrollments.reduce((earliest, e) => {
      const enrolledAt = new Date(e.enrolledAt);
      return enrolledAt < earliest ? enrolledAt : earliest;
    }, new Date(enrollments[0].enrolledAt));

    const enrollmentAge = Math.floor((now.getTime() - firstEnrollment.getTime()) / (1000 * 60 * 60 * 24));
    
    // Progress rate
    const avgProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length;
    const progressRate = enrollmentAge > 0 ? avgProgress / enrollmentAge : 0;

    // Engagement score
    const modulesStarted = trainingProgress.filter(p => (p.progressPercent || 0) > 0).length;
    const modulesCompleted = trainingProgress.filter(p => p.status === 'completed').length;
    const engagementScore = calculateEngagementScore({
      totalLogins: 10, // Would track this in real implementation
      daysActive: trainingProgress.length,
      enrollmentAge,
      modulesStarted,
      modulesCompleted,
    });

    // Test performance
    const passedTests = testAttempts.filter(t => t.passed).length;
    const avgTestScore = testAttempts.length > 0
      ? testAttempts.reduce((sum, t) => sum + (parseFloat(t.percentScore || '0')), 0) / testAttempts.length
      : 0;
    const testPerformance = testAttempts.length > 0 ? avgTestScore : 50;

    // Activity consistency
    const activityDates = [
      ...enrollments.map(e => new Date(e.enrolledAt)),
      ...trainingProgress.filter(p => p.startedAt).map(p => new Date(p.startedAt as string)),
      ...testAttempts.map(t => new Date(t.createdAt)),
    ];
    const activityConsistency = calculateConsistencyScore(activityDates);

    // Calculate success probability using model
    const features = {
      enrollmentAge,
      progressRate: Math.min(100, progressRate * 100),
      engagementScore,
      testPerformance,
      activityConsistency,
    };

    const successProbability = (
      features.progressRate * DEFAULT_MODEL.weights.progressRate +
      features.engagementScore * DEFAULT_MODEL.weights.engagementScore +
      features.testPerformance * DEFAULT_MODEL.weights.testPerformance +
      features.activityConsistency * DEFAULT_MODEL.weights.activityConsistency -
      (enrollmentAge > 90 ? 10 : 0) // Penalty for long enrollment without completion
    );

    // Calculate completion likelihood
    const completionLikelihood = Math.min(100, (
      avgProgress * 0.4 +
      features.engagementScore * 0.3 +
      features.activityConsistency * 0.3
    ));

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (successProbability >= DEFAULT_MODEL.threshold.high) {
      riskLevel = 'low';
    } else if (successProbability >= DEFAULT_MODEL.threshold.medium) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (features.progressRate < 0.5) {
      recommendations.push("Increase study pace to maintain momentum");
    }
    if (features.engagementScore < 50) {
      recommendations.push("Log in more frequently to stay engaged");
    }
    if (features.testPerformance < 60) {
      recommendations.push("Review course materials before attempting tests");
    }
    if (features.activityConsistency < 50) {
      recommendations.push("Establish a consistent study schedule");
    }
    if (enrollmentAge > 60 && avgProgress < 50) {
      recommendations.push("Consider setting shorter-term goals to accelerate progress");
    }
    if (recommendations.length === 0) {
      recommendations.push("Keep up the great work! You're on track for success");
    }

    // Predict completion date
    let predictedCompletionDate: string | null = null;
    if (progressRate > 0 && avgProgress < 100) {
      const remainingProgress = 100 - avgProgress;
      const daysToComplete = remainingProgress / progressRate;
      const completionDate = new Date(now.getTime() + daysToComplete * 24 * 60 * 60 * 1000);
      predictedCompletionDate = completionDate.toISOString().split('T')[0];
    }

    return {
      userId,
      userName: user.name || 'Unknown',
      userEmail: user.email || '',
      successProbability: Math.round(Math.min(100, Math.max(0, successProbability))),
      completionLikelihood: Math.round(Math.min(100, Math.max(0, completionLikelihood))),
      riskLevel,
      predictedCompletionDate,
      recommendations,
      features,
    };
  } catch (error) {
    console.error('Error predicting student success:', error);
    return null;
  }
}

/**
 * Batch predict success for multiple students
 */
export async function batchPredictStudentSuccess(userIds: number[]): Promise<StudentPrediction[]> {
  const predictions: StudentPrediction[] = [];

  for (const userId of userIds) {
    const prediction = await predictStudentSuccess(userId);
    if (prediction) {
      predictions.push(prediction);
    }
  }

  return predictions;
}

/**
 * Get at-risk students who need intervention
 */
export async function getAtRiskStudents(threshold: number = 40): Promise<StudentPrediction[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get all active enrollments
    const activeEnrollments = await db
      .select({
        userId: courseEnrollments.userId,
      })
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.status, 'enrolled'),
          sql`${courseEnrollments.progress} < 100`
        )
      )
      .groupBy(courseEnrollments.userId);

    const userIds = activeEnrollments.map(e => e.userId);
    const predictions = await batchPredictStudentSuccess(userIds);

    // Filter at-risk students
    return predictions.filter(p => p.successProbability < threshold);
  } catch (error) {
    console.error('Error getting at-risk students:', error);
    return [];
  }
}

/**
 * Calculate aggregate prediction statistics
 */
export async function getAggregateStatistics(): Promise<{
  totalStudents: number;
  avgSuccessProbability: number;
  avgCompletionLikelihood: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get all enrolled students
    const enrolledStudents = await db
      .select({
        userId: courseEnrollments.userId,
      })
      .from(courseEnrollments)
      .groupBy(courseEnrollments.userId);

    const userIds = enrolledStudents.map(e => e.userId);
    const predictions = await batchPredictStudentSuccess(userIds);

    const totalStudents = predictions.length;
    const avgSuccessProbability = predictions.reduce((sum, p) => sum + p.successProbability, 0) / totalStudents || 0;
    const avgCompletionLikelihood = predictions.reduce((sum, p) => sum + p.completionLikelihood, 0) / totalStudents || 0;

    const riskDistribution = {
      low: predictions.filter(p => p.riskLevel === 'low').length,
      medium: predictions.filter(p => p.riskLevel === 'medium').length,
      high: predictions.filter(p => p.riskLevel === 'high').length,
    };

    return {
      totalStudents,
      avgSuccessProbability: Math.round(avgSuccessProbability),
      avgCompletionLikelihood: Math.round(avgCompletionLikelihood),
      riskDistribution,
    };
  } catch (error) {
    console.error('Error calculating aggregate statistics:', error);
    return {
      totalStudents: 0,
      avgSuccessProbability: 0,
      avgCompletionLikelihood: 0,
      riskDistribution: { low: 0, medium: 0, high: 0 },
    };
  }
}
