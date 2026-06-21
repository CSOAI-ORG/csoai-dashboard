import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { students, cohorts, studentCohortHistory } from "../../drizzle/schema";
import { eq, and, like, or, desc, sql, isNull } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const studentsRouter = router({
  // List all students with filtering
  list: protectedProcedure
    .input(z.object({
      cohortId: z.number().optional(),
      status: z.enum(['active', 'inactive', 'graduated', 'withdrawn', 'suspended']).optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const conditions: any[] = [];
      
      if (input.cohortId) {
        conditions.push(eq(students.cohortId, input.cohortId));
      }
      
      if (input.status) {
        conditions.push(eq(students.status, input.status));
      }
      
      if (input.search) {
        conditions.push(
          or(
            like(students.firstName, `%${input.search}%`),
            like(students.lastName, `%${input.search}%`),
            like(students.email, `%${input.search}%`),
            like(students.studentNumber, `%${input.search}%`)
          )
        );
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [items, totalCount] = await Promise.all([
        db.select({
          student: students,
          cohort: cohorts,
        })
          .from(students)
          .leftJoin(cohorts, eq(students.cohortId, cohorts.id))
          .where(where)
          .limit(input.limit)
          .offset(input.offset)
          .orderBy(desc(students.enrollmentDate)),
        db.select({ count: sql<number>`count(*)` })
          .from(students)
          .where(where)
          .then((result: any) => Number(result[0].count))
      ]);

      return {
        items: items.map((row: any) => ({
          ...row.student,
          cohort: row.cohort,
        })),
        total: totalCount,
        hasMore: input.offset + items.length < totalCount,
      };
    }),

  // Get student by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const result = await db.select({
        student: students,
        cohort: cohorts,
      })
        .from(students)
        .leftJoin(cohorts, eq(students.cohortId, cohorts.id))
        .where(eq(students.id, input.id))
        .limit(1);

      if (!result || result.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Student not found',
        });
      }

      // Get cohort history
      const history = await db.select({
        history: studentCohortHistory,
        cohort: cohorts,
      })
        .from(studentCohortHistory)
        .leftJoin(cohorts, eq(studentCohortHistory.cohortId, cohorts.id))
        .where(eq(studentCohortHistory.studentId, input.id))
        .orderBy(desc(studentCohortHistory.startDate));

      return {
        ...result[0].student,
        cohort: result[0].cohort,
        cohortHistory: history.map((h: any) => ({
          ...h.history,
          cohort: h.cohort,
        })),
      };
    }),

  // Create new student
  create: protectedProcedure
    .input(z.object({
      userId: z.number(),
      cohortId: z.number().optional(),
      studentNumber: z.string().optional(),
      firstName: z.string().min(1).max(100),
      lastName: z.string().min(1).max(100),
      email: z.string().email().max(255),
      phone: z.string().max(50).optional(),
      status: z.enum(['active', 'inactive', 'graduated', 'withdrawn', 'suspended']).default('active'),
      gpa: z.string().max(10).optional(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      // Check if email already exists
      const existing = await db.select()
        .from(students)
        .where(eq(students.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Student with this email already exists',
        });
      }

      const result = await db.insert(students).values(input as any);

      // If assigned to cohort, record in history
      if (input.cohortId) {
        await db.insert(studentCohortHistory).values({
          studentId: Number((result as any)[0].insertId),
          cohortId: input.cohortId,
          startDate: new Date().toISOString(),
          status: 'active',
        });

        // Update cohort enrollment count
        const cohortStudentCount = await db.select({ count: sql<number>`count(*)` })
          .from(students)
          .where(eq(students.cohortId, input.cohortId))
          .then((result: any) => Number(result[0].count));

        await db.update(cohorts)
          .set({ currentEnrollment: cohortStudentCount })
          .where(eq(cohorts.id, input.cohortId));
      }

      return {
        id: Number((result as any)[0].insertId),
        success: true,
      };
    }),

  // Update student
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      cohortId: z.number().optional().nullable(),
      studentNumber: z.string().optional(),
      firstName: z.string().min(1).max(100).optional(),
      lastName: z.string().min(1).max(100).optional(),
      email: z.string().email().max(255).optional(),
      phone: z.string().max(50).optional(),
      status: z.enum(['active', 'inactive', 'graduated', 'withdrawn', 'suspended']).optional(),
      gpa: z.string().max(10).optional(),
      graduationDate: z.string().optional().nullable(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const { id, ...updateData } = input;

      // Check if student exists
      const existing = await db.select()
        .from(students)
        .where(eq(students.id, id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Student not found',
        });
      }

      // If email is being updated, check for conflicts
      if (updateData.email) {
        const emailConflict = await db.select()
          .from(students)
          .where(and(
            eq(students.email, updateData.email),
            sql`${students.id} != ${id}`
          ))
          .limit(1);

        if (emailConflict.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Student with this email already exists',
          });
        }
      }

      // If cohort is being changed, record in history
      if (updateData.cohortId !== undefined && updateData.cohortId !== existing[0].cohortId) {
        // End previous cohort assignment
        if (existing[0].cohortId) {
          await db.update(studentCohortHistory)
            .set({
              endDate: new Date().toISOString(),
              status: 'completed',
            })
            .where(and(
              eq(studentCohortHistory.studentId, id),
              eq(studentCohortHistory.cohortId, existing[0].cohortId),
              isNull(studentCohortHistory.endDate)
            ));

          // Update old cohort enrollment count
          const oldCohortCount = await db.select({ count: sql<number>`count(*)` })
            .from(students)
            .where(eq(students.cohortId, existing[0].cohortId))
            .then((result: any) => Number(result[0].count));

          await db.update(cohorts)
            .set({ currentEnrollment: Math.max(0, oldCohortCount - 1) })
            .where(eq(cohorts.id, existing[0].cohortId));
        }

        // Start new cohort assignment
        if (updateData.cohortId) {
          await db.insert(studentCohortHistory).values({
            studentId: id,
            cohortId: updateData.cohortId,
            startDate: new Date().toISOString(),
            status: 'active',
          });

          // Update new cohort enrollment count
          const newCohortCount = await db.select({ count: sql<number>`count(*)` })
            .from(students)
            .where(eq(students.cohortId, updateData.cohortId))
            .then((result: any) => Number(result[0].count));

          await db.update(cohorts)
            .set({ currentEnrollment: newCohortCount + 1 })
            .where(eq(cohorts.id, updateData.cohortId));
        }
      }

      await db.update(students)
        .set(updateData as any)
        .where(eq(students.id, id));

      return { success: true };
    }),

  // Delete student
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const student = await db.select()
        .from(students)
        .where(eq(students.id, input.id))
        .limit(1);

      if (student.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Student not found',
        });
      }

      // Update cohort enrollment count if student was in a cohort
      if (student[0].cohortId) {
        const cohortStudentCount = await db.select({ count: sql<number>`count(*)` })
          .from(students)
          .where(eq(students.cohortId, student[0].cohortId))
          .then((result: any) => Number(result[0].count));

        await db.update(cohorts)
          .set({ currentEnrollment: Math.max(0, cohortStudentCount - 1) })
          .where(eq(cohorts.id, student[0].cohortId));
      }

      await db.delete(students)
        .where(eq(students.id, input.id));

      return { success: true };
    }),

  // Bulk operations
  bulkUpdateStatus: protectedProcedure
    .input(z.object({
      studentIds: z.array(z.number()),
      status: z.enum(['active', 'inactive', 'graduated', 'withdrawn', 'suspended']),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      for (const studentId of input.studentIds) {
        await db.update(students)
          .set({ status: input.status })
          .where(eq(students.id, studentId));
      }

      return {
        success: true,
        updatedCount: input.studentIds.length,
      };
    }),

  // Get students without cohort assignment
  getUnassigned: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const items = await db.select()
        .from(students)
        .where(isNull(students.cohortId))
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(students.enrollmentDate));

      const totalCount = await db.select({ count: sql<number>`count(*)` })
        .from(students)
        .where(isNull(students.cohortId))
        .then((result: any) => Number(result[0].count));

      return {
        items,
        total: totalCount,
        hasMore: input.offset + items.length < totalCount,
      };
    }),

  // Export students data (returns data for CSV/Excel export)
  export: protectedProcedure
    .input(z.object({
      cohortId: z.number().optional(),
      status: z.enum(['active', 'inactive', 'graduated', 'withdrawn', 'suspended']).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const conditions: any[] = [];
      
      if (input.cohortId) {
        conditions.push(eq(students.cohortId, input.cohortId));
      }
      
      if (input.status) {
        conditions.push(eq(students.status, input.status));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db.select({
        student: students,
        cohort: cohorts,
      })
        .from(students)
        .leftJoin(cohorts, eq(students.cohortId, cohorts.id))
        .where(where)
        .orderBy(desc(students.enrollmentDate));

      return items.map((row: any) => ({
        studentNumber: row.student.studentNumber || '',
        firstName: row.student.firstName,
        lastName: row.student.lastName,
        email: row.student.email,
        phone: row.student.phone || '',
        status: row.student.status,
        cohort: row.cohort?.name || 'Unassigned',
        cohortCode: row.cohort?.code || '',
        gpa: row.student.gpa || '',
        totalCredits: row.student.totalCredits,
        enrollmentDate: row.student.enrollmentDate,
        graduationDate: row.student.graduationDate || '',
      }));
    }),

  // Export students to CSV
  exportToCSV: protectedProcedure
    .input(z.object({ cohortId: z.number().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      const conditions: any[] = [];
      if (input.cohortId) {
        conditions.push(eq(students.cohortId, input.cohortId));
      }
      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const items = await db.select({
        student: students,
        cohort: cohorts,
      })
        .from(students)
        .leftJoin(cohorts, eq(students.cohortId, cohorts.id))
        .where(where)
        .orderBy(desc(students.enrollmentDate));

      const headers = ['Student Number', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Cohort', 'GPA', 'Total Credits', 'Enrollment Date'];
      const rows = items.map((row: any) => [
        row.student.studentNumber || '',
        row.student.firstName,
        row.student.lastName,
        row.student.email,
        row.student.phone || '',
        row.student.status,
        row.cohort?.name || 'Unassigned',
        row.student.gpa || '',
        row.student.totalCredits || '',
        row.student.enrollmentDate || '',
      ]);

      const escape = (val: any) => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csv = [headers.join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n');
      return { csv };
    }),

  // Bulk create students from import
  bulkCreate: protectedProcedure
    .input(z.object({
      students: z.array(z.object({
        name: z.string().min(1),
        email: z.string().email(),
        cohortId: z.number().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });

      let createdCount = 0;
      for (const s of input.students) {
        const existing = await db.select()
          .from(students)
          .where(eq(students.email, s.email))
          .limit(1);

        if (existing.length > 0) continue;

        await db.insert(students).values({
          firstName: s.name,
          lastName: '',
          email: s.email,
          cohortId: s.cohortId,
          status: 'active',
        } as any);
        createdCount++;
      }

      return { success: true, createdCount };
    }),
});
