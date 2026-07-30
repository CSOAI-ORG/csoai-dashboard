import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { instructorCohorts, cohortStudents, users } from "../../drizzle/schema";
import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const instructorDashboardRouter = router({
  // Get all cohorts for an instructor
  getCohorts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
    }
    const instructorId = ctx.user.id;

    const cohorts = await db
      .select({
        id: instructorCohorts.id,
        cohortName: instructorCohorts.cohortName,
        description: instructorCohorts.description,
        courseId: instructorCohorts.courseId,
        startDate: instructorCohorts.startDate,
        endDate: instructorCohorts.endDate,
        createdAt: instructorCohorts.createdAt,
        studentCount: sql<number>`(SELECT COUNT(*) FROM cohort_students WHERE cohortId = ${instructorCohorts.id})`,
      })
      .from(instructorCohorts)
      .where(eq(instructorCohorts.instructorId, instructorId))
      .orderBy(desc(instructorCohorts.createdAt));

    return cohorts;
  }),

  // Get students in a cohort with their prediction scores
  getCohortStudents: protectedProcedure
    .input(z.object({ cohortId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // First verify the cohort belongs to this instructor
      const cohort = await db
        .select()
        .from(instructorCohorts)
        .where(
          and(
            eq(instructorCohorts.id, input.cohortId),
            eq(instructorCohorts.instructorId, ctx.user.id)
          )
        )
        .limit(1);

      if (cohort.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Cohort not found or access denied' });
      }

      // Get students in the cohort
      const cohortStudentRecords = await db
        .select()
        .from(cohortStudents)
        .where(eq(cohortStudents.cohortId, input.cohortId));

      if (cohortStudentRecords.length === 0) {
        return [];
      }

      const studentIds = cohortStudentRecords.map((cs) => cs.studentId);

      // Get student details with prediction scores
      const students = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          enrolledAt: sql<string>`(SELECT enrolledAt FROM cohort_students WHERE cohortId = ${input.cohortId} AND studentId = ${users.id})`,
          status: sql<string>`(SELECT status FROM cohort_students WHERE cohortId = ${input.cohortId} AND studentId = ${users.id})`,
          // Get prediction data from student_predictions table
          predictionScore: sql<number>`(
            SELECT successProbability 
            FROM student_predictions 
            WHERE userId = ${users.id} 
            ORDER BY predictedAt DESC 
            LIMIT 1
          )`,
          riskLevel: sql<string>`(
            SELECT riskLevel 
            FROM student_predictions 
            WHERE userId = ${users.id} 
            ORDER BY predictedAt DESC 
            LIMIT 1
          )`,
          // Get progress metrics
          completedModules: sql<number>`(
            SELECT COUNT(*) 
            FROM user_training_progress 
            WHERE userId = ${users.id} AND completed = 1
          )`,
          totalModules: sql<number>`(
            SELECT COUNT(DISTINCT moduleId) 
            FROM user_training_progress 
            WHERE userId = ${users.id}
          )`,
          lastActive: sql<string>`(
            SELECT MAX(lastAccessedAt) 
            FROM user_training_progress 
            WHERE userId = ${users.id}
          )`,
        })
        .from(users)
        .where(inArray(users.id, studentIds));

      return students.map((student) => ({
        ...student,
        predictionScore: student.predictionScore ? Number(student.predictionScore) : null,
        completedModules: Number(student.completedModules) || 0,
        totalModules: Number(student.totalModules) || 0,
        progressPercentage:
          student.totalModules > 0
            ? Math.round((Number(student.completedModules) / Number(student.totalModules)) * 100)
            : 0,
      }));
    }),

  // Create a new cohort
  createCohort: protectedProcedure
    .input(
      z.object({
        cohortName: z.string().min(1),
        description: z.string().optional(),
        courseId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }
      const instructorId = ctx.user.id;

      const result = await db.insert(instructorCohorts).values({
        instructorId,
        cohortName: input.cohortName,
        description: input.description || null,
        courseId: input.courseId || null,
        startDate: input.startDate || null,
        endDate: input.endDate || null,
      });

      return { cohortId: result[0].insertId };
    }),

  // Add students to a cohort
  addStudentsToCohort: protectedProcedure
    .input(
      z.object({
        cohortId: z.number(),
        studentIds: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Verify cohort belongs to instructor
      const cohort = await db
        .select()
        .from(instructorCohorts)
        .where(
          and(
            eq(instructorCohorts.id, input.cohortId),
            eq(instructorCohorts.instructorId, ctx.user.id)
          )
        )
        .limit(1);

      if (cohort.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Cohort not found or access denied' });
      }

      // Add students (ignore duplicates)
      const values = input.studentIds.map((studentId) => ({
        cohortId: input.cohortId,
        studentId,
      }));

      for (const value of values) {
        try {
          await db.insert(cohortStudents).values(value);
        } catch (error) {
          // Ignore duplicate key errors
          console.log(`Student ${value.studentId} already in cohort`);
        }
      }

      return { success: true };
    }),

  // Bulk import students from CSV data
  bulkImportStudents: protectedProcedure
    .input(
      z.object({
        cohortId: z.number(),
        students: z.array(
          z.object({
            email: z.string().email(),
            name: z.string().min(1),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Verify cohort belongs to instructor
      const cohort = await db
        .select()
        .from(instructorCohorts)
        .where(
          and(
            eq(instructorCohorts.id, input.cohortId),
            eq(instructorCohorts.instructorId, ctx.user.id)
          )
        )
        .limit(1);

      if (cohort.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Cohort not found or access denied' });
      }

      const results = {
        success: 0,
        created: 0,
        existing: 0,
        errors: [] as { email: string; error: string }[],
      };

      // Process each student
      for (const student of input.students) {
        try {
          // Check if user exists by email
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, student.email.toLowerCase()))
            .limit(1);

          let userId: number;

          if (existingUser.length > 0) {
            // User exists
            userId = existingUser[0].id;
            results.existing++;
          } else {
            // Create new user
            const newUser = await db.insert(users).values({
              email: student.email.toLowerCase(),
              name: student.name,
              openId: `csv_import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              role: 'user',
            });
            userId = Number(newUser[0].insertId);
            results.created++;
          }

          // Add to cohort (ignore if already in cohort)
          try {
            await db.insert(cohortStudents).values({
              cohortId: input.cohortId,
              studentId: userId,
            });
            results.success++;
          } catch (error) {
            // Student already in cohort, still count as success
            results.success++;
          }
        } catch (error) {
          results.errors.push({
            email: student.email,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return results;
    }),

  // Send message to at-risk student
  sendInterventionMessage: protectedProcedure
    .input(
      z.object({
        studentId: z.number(),
        message: z.string(),
        cohortId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Verify instructor has access to this student via cohort
      const cohort = await db
        .select()
        .from(instructorCohorts)
        .where(
          and(
            eq(instructorCohorts.id, input.cohortId),
            eq(instructorCohorts.instructorId, ctx.user.id)
          )
        )
        .limit(1);

      if (cohort.length === 0) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }

      const studentInCohort = await db
        .select()
        .from(cohortStudents)
        .where(
          and(
            eq(cohortStudents.cohortId, input.cohortId),
            eq(cohortStudents.studentId, input.studentId)
          )
        )
        .limit(1);

      if (studentInCohort.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Student not in cohort' });
      }

      // TODO: Integrate with notification system to send actual message
      // For now, just log the intervention
      console.log(`Intervention message sent to student ${input.studentId}: ${input.message}`);

      return { success: true };
    }),

  // Get cohort performance metrics
  getCohortMetrics: protectedProcedure
    .input(z.object({ cohortId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Verify cohort belongs to instructor
      const cohort = await db
        .select()
        .from(instructorCohorts)
        .where(
          and(
            eq(instructorCohorts.id, input.cohortId),
            eq(instructorCohorts.instructorId, ctx.user.id)
          )
        )
        .limit(1);

      if (cohort.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Cohort not found or access denied' });
      }

      // Get cohort students
      const cohortStudentRecords = await db
        .select()
        .from(cohortStudents)
        .where(eq(cohortStudents.cohortId, input.cohortId));

      if (cohortStudentRecords.length === 0) {
        return {
          totalStudents: 0,
          atRiskStudents: 0,
          averageProgress: 0,
          averagePredictionScore: 0,
        };
      }

      const studentIds = cohortStudentRecords.map((cs) => cs.studentId);

      // Calculate metrics
      const metrics = await db
        .select({
          totalStudents: sql<number>`COUNT(DISTINCT ${users.id})`,
          atRiskStudents: sql<number>`COUNT(DISTINCT CASE WHEN sp.riskLevel IN ('high', 'critical') THEN ${users.id} END)`,
          avgProgress: sql<number>`AVG(
            (SELECT COUNT(*) FROM user_training_progress WHERE userId = ${users.id} AND completed = 1) * 100.0 /
            NULLIF((SELECT COUNT(*) FROM user_training_progress WHERE userId = ${users.id}), 0)
          )`,
          avgPredictionScore: sql<number>`AVG(sp.successProbability)`,
        })
        .from(users)
        .leftJoin(
          sql`(
            SELECT userId, successProbability, riskLevel
            FROM student_predictions sp1
            WHERE predictedAt = (
              SELECT MAX(predictedAt)
              FROM student_predictions sp2
              WHERE sp2.userId = sp1.userId
            )
          ) sp`,
          sql`sp.userId = ${users.id}`
        )
        .where(inArray(users.id, studentIds));

      const result = metrics[0];
      return {
        totalStudents: Number(result.totalStudents) || 0,
        atRiskStudents: Number(result.atRiskStudents) || 0,
        averageProgress: Math.round(Number(result.avgProgress) || 0),
        averagePredictionScore: Math.round(Number(result.avgPredictionScore) || 0),
      };
    }),
});
