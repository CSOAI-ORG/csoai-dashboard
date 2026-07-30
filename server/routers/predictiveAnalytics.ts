import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  predictStudentSuccess,
  batchPredictStudentSuccess,
  getAtRiskStudents,
  getAggregateStatistics,
} from "../services/predictiveAnalytics";

export const predictiveAnalyticsRouter = router({
  // Get prediction for a single student
  getPrediction: protectedProcedure
    .input(
      z.object({
        userId: z.number().optional(), // If not provided, use current user
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = input.userId || ctx.user.id;
      return await predictStudentSuccess(userId);
    }),

  // Get predictions for multiple students (admin only)
  getBatchPredictions: protectedProcedure
    .input(
      z.object({
        userIds: z.array(z.number()),
      })
    )
    .query(async ({ input }) => {
      return await batchPredictStudentSuccess(input.userIds);
    }),

  // Get at-risk students who need intervention
  getAtRiskStudents: protectedProcedure
    .input(
      z.object({
        threshold: z.number().min(0).max(100).default(40),
      })
    )
    .query(async ({ input }) => {
      return await getAtRiskStudents(input.threshold);
    }),

  // Get aggregate prediction statistics
  getStatistics: protectedProcedure.query(async () => {
    return await getAggregateStatistics();
  }),

  // Get recommendations for a student
  getRecommendations: protectedProcedure
    .input(
      z.object({
        userId: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = input.userId || ctx.user.id;
      const prediction = await predictStudentSuccess(userId);
      
      if (!prediction) {
        return {
          recommendations: ["Start by enrolling in a course to get personalized recommendations"],
          riskLevel: 'medium' as const,
        };
      }

      return {
        recommendations: prediction.recommendations,
        riskLevel: prediction.riskLevel,
        successProbability: prediction.successProbability,
        completionLikelihood: prediction.completionLikelihood,
      };
    }),
});
