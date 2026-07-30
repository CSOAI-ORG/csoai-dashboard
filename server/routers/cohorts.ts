import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { cohorts, students, cohortCourses, studentCohortHistory } from "../../drizzle/schema";
import { eq, and, like, or, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const cohortsRouter = router({
  // List all cohorts with optional filtering
  list: protectedProcedure
    .input(z.object({
      status: z.enum(['active', 'archived', 'draft']).optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const conditions = [];
      
      if (input.status) {
        conditions.push(eq(cohorts.status, input.status));
      }
      
      if (input.search) {
        conditions.push(
          or(
            like(cohorts.name, `%${input.search}%`),
            like(cohorts.code, `%${input.search}%`),
            like(cohorts.description, `%${input.search}%`)
          )
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalCount] = await Promise.all([
        db.select()
          .from(cohorts)
          .where(where)
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(desc(cohorts.createdAt)),
        db.select({ count: sql<number>`count(*)` })
          .from(cohorts)
          .where(where)
          .then(result => Number(result[0].count))
      ]);

      return {
        items,
        total: totalCount,
        hasMore: input.offset + items.length < totalCount,
      };
    }),

  // Get cohort by ID with stats
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const cohort = await db.select()
        .from(cohorts)
        .where(eq(cohorts.id, input.id))
        .limit(1);

      if (!cohort || cohort.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Cohort not found',
        });
      }

      // Get student count
      const studentCount = await db.select({ count: sql<number>`count(*)` })
        .from(students)
        .where(eq(students.cohortId, input.id))
        .then(result => Number(result[0].count));

      // Get course count
      const courseCount = await db.select({ count: sql<number>`count(*)` })
        .from(cohortCourses)
        .where(eq(cohortCourses.cohortId, input.id))
        .then(result => Number(result[0].count));

      return {
        ...cohort[0],
        stats: {
          studentCount,
          courseCount,
        },
      };
    }),

  // Create new cohort
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      code: z.string().min(1).max(50),
      status: z.enum(['active', 'archived', 'draft']).default('active'),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      capacity: z.number().optional(),
      instructorId: z.number().optional(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Check if code already exists
      const existing = await db.select()
        .from(cohorts)
        .where(eq(cohorts.code, input.code))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Cohort code already exists',
        });
      }

      const result = await db.insert(cohorts).values({
        ...input,
        createdBy: ctx.user.id,
      });

      return {
        id: Number(result[0].insertId),
        success: true,
      };
    }),

  // Update cohort
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      code: z.string().min(1).max(50).optional(),
      status: z.enum(['active', 'archived', 'draft']).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      capacity: z.number().optional(),
      instructorId: z.number().optional(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const { id, ...updateData } = input;

      // Check if cohort exists
      const existing = await db.select()
        .from(cohorts)
        .where(eq(cohorts.id, id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Cohort not found',
        });
      }

      // If updating code, check for conflicts
      if (updateData.code) {
        const codeConflict = await db.select()
          .from(cohorts)
          .where(and(
            eq(cohorts.code, updateData.code),
            sql`${cohorts.id} != ${id}`
          ))
          .limit(1);

        if (codeConflict.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Cohort code already exists',
          });
        }
      }

      await db.update(cohorts)
        .set(updateData)
        .where(eq(cohorts.id, id));

      return { success: true };
    }),

  // Delete cohort
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Check if cohort has students
      const studentCount = await db.select({ count: sql<number>`count(*)` })
        .from(students)
        .where(eq(students.cohortId, input.id))
        .then(result => Number(result[0].count));

      if (studentCount > 0) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Cannot delete cohort with enrolled students. Please reassign students first.',
        });
      }

      await db.delete(cohorts)
        .where(eq(cohorts.id, input.id));

      return { success: true };
    }),

  // Get cohort students
  getStudents: protectedProcedure
    .input(z.object({
      cohortId: z.number(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const items = await db.select()
        .from(students)
        .where(eq(students.cohortId, input.cohortId))
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(students.enrollmentDate));

      const totalCount = await db.select({ count: sql<number>`count(*)` })
        .from(students)
        .where(eq(students.cohortId, input.cohortId))
        .then(result => Number(result[0].count));

      return {
        items,
        total: totalCount,
        hasMore: input.offset + items.length < totalCount,
      };
    }),

  // Bulk assign students to cohort
  bulkAssignStudents: protectedProcedure
    .input(z.object({
      cohortId: z.number(),
      studentIds: z.array(z.number()),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      // Verify cohort exists
      const cohort = await db.select()
        .from(cohorts)
        .where(eq(cohorts.id, input.cohortId))
        .limit(1);

      if (cohort.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Cohort not found',
        });
      }

      // Update students
      for (const studentId of input.studentIds) {
        await db.update(students)
          .set({ cohortId: input.cohortId })
          .where(eq(students.id, studentId));

        // Record in history
        await db.insert(studentCohortHistory).values({
          studentId,
          cohortId: input.cohortId,
          startDate: new Date().toISOString(),
          status: 'active',
        });
      }

      // Update cohort enrollment count
      const newCount = await db.select({ count: sql<number>`count(*)` })
        .from(students)
        .where(eq(students.cohortId, input.cohortId))
        .then(result => Number(result[0].count));

      await db.update(cohorts)
        .set({ currentEnrollment: newCount })
        .where(eq(cohorts.id, input.cohortId));

      return { 
        success: true,
        assignedCount: input.studentIds.length,
      };
    }),

  // Get cohort statistics
  getStats: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
      }

      const totalCohorts = await db.select({ count: sql<number>`count(*)` })
        .from(cohorts)
        .then(result => Number(result[0].count));

      const activeCohorts = await db.select({ count: sql<number>`count(*)` })
        .from(cohorts)
        .where(eq(cohorts.status, 'active'))
        .then(result => Number(result[0].count));

      const totalStudents = await db.select({ count: sql<number>`count(*)` })
        .from(students)
        .then(result => Number(result[0].count));

      const activeStudents = await db.select({ count: sql<number>`count(*)` })
        .from(students)
        .where(eq(students.status, 'active'))
        .then(result => Number(result[0].count));

      return {
        totalCohorts,
        activeCohorts,
        totalStudents,
        activeStudents,
      };
    }),
});
