import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { users, userCohorts, cohorts, courseEnrollments, courses, userTrainingProgress, userCertificates, trainingModules } from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

// ============================================
// CSV EXPORT ROUTER
// ============================================

export const csvExportRouter = router({
  // Export cohort students to CSV
  exportCohortStudents: protectedProcedure
    .input(z.object({
      cohortId: z.number(),
      includeProgress: z.boolean().default(true),
      includeCertificates: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get cohort info
      const [cohort] = await db
        .select()
        .from(cohorts)
        .where(eq(cohorts.id, input.cohortId))
        .limit(1);

      if (!cohort) {
        throw new Error('Cohort not found');
      }

      // Get all students in cohort with enrollment data
      const studentEnrollments = await db
        .select({
          userId: users.id,
          userName: users.name,
          userEmail: users.email,
          enrollmentId: courseEnrollments.id,
          enrollmentStatus: courseEnrollments.status,
          enrolledAt: courseEnrollments.enrolledAt,
          completedAt: courseEnrollments.completedAt,
          courseId: courses.id,
          courseTitle: courses.title,
        })
        .from(courseEnrollments)
        .innerJoin(users, eq(courseEnrollments.userId, users.id))
        .leftJoin(courses, eq(courseEnrollments.courseId, courses.id));

      // Get progress data if requested
      let progressData: Map<number, any> = new Map();
      if (input.includeProgress) {
        const userIds = [...new Set(studentEnrollments.map((e: any) => e.userId))];
        if (userIds.length > 0) {
          const progress = await db
            .select({
              userId: userTrainingProgress.userId,
              moduleId: userTrainingProgress.moduleId,
              moduleTitle: trainingModules.title,
              status: userTrainingProgress.status,
              completedAt: userTrainingProgress.completedAt,
            })
            .from(userTrainingProgress)
            .leftJoin(trainingModules, eq(userTrainingProgress.moduleId, trainingModules.id))
            .where(inArray(userTrainingProgress.userId, userIds));

          // Group by user
          progress.forEach((p: any) => {
            if (!progressData.has(p.userId)) {
              progressData.set(p.userId, []);
            }
            progressData.get(p.userId)!.push(p);
          });
        }
      }

      // Get certificate data if requested
      let certificateData: Map<number, any> = new Map();
      if (input.includeCertificates) {
        const userIds = [...new Set(studentEnrollments.map((e: any) => e.userId))];
        if (userIds.length > 0) {
          const certificates = await db
            .select()
            .from(userCertificates)
            .where(inArray(userCertificates.userId, userIds));

          // Group by user
          certificates.forEach((cert: any) => {
            if (!certificateData.has(cert.userId)) {
              certificateData.set(cert.userId, []);
            }
            certificateData.get(cert.userId)!.push(cert);
          });
        }
      }

      // Build CSV data
      const csvRows: string[][] = [];
      
      // Header row
      const headers = [
        'User ID',
        'Name',
        'Email',
        'Enrollment Status',
        'Enrolled At',
        'Completed At',
        'Course Name',
      ];

      if (input.includeProgress) {
        headers.push('Modules Completed', 'Modules In Progress');
      }

      if (input.includeCertificates) {
        headers.push('Certificates Earned', 'Latest Certificate');
      }

      csvRows.push(headers);

      // Data rows - group by user
      const userMap = new Map<number, typeof studentEnrollments>();
      studentEnrollments.forEach((enrollment: any) => {
        if (!userMap.has(enrollment.userId)) {
          userMap.set(enrollment.userId, []);
        }
        (userMap.get(enrollment.userId) as any[])!.push(enrollment);
      });

      userMap.forEach((enrollments: any, userId: number) => {
        const firstEnrollment = enrollments[0];
        const row: string[] = [
          userId.toString(),
          firstEnrollment.userName || '',
          firstEnrollment.userEmail || '',
          firstEnrollment.enrollmentStatus || '',
          firstEnrollment.enrolledAt || '',
          firstEnrollment.completedAt || '',
          enrollments.map((e: any) => e.courseTitle).filter(Boolean).join('; '),
        ];

        if (input.includeProgress) {
          const userProgress = progressData.get(userId) || [];
          const completed = userProgress.filter((p: any) => p.status === 'completed').length;
          const inProgress = userProgress.filter((p: any) => p.status === 'in_progress').length;

          row.push(completed.toString(), inProgress.toString());
        }

        if (input.includeCertificates) {
          const userCerts = certificateData.get(userId) || [];
          const certCount = userCerts.length;
          const latestCert = userCerts.length > 0
            ? userCerts.sort((a: any, b: any) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())[0]
            : null;

          row.push(
            certCount.toString(),
            latestCert ? `${latestCert.certificateNumber} (${latestCert.issuedAt})` : ''
          );
        }

        csvRows.push(row);
      });

      // Convert to CSV string
      const csvContent = csvRows
        .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return {
        filename: `cohort-${cohort.name?.replace(/[^a-z0-9]/gi, '-') || 'export'}-${new Date().toISOString().split('T')[0]}.csv`,
        content: csvContent,
        rowCount: csvRows.length - 1, // Exclude header
      };
    }),

  // Export all students (admin only)
  exportAllStudents: protectedProcedure
    .input(z.object({
      filters: z.object({
        status: z.string().optional(),
        cohortIds: z.array(z.number()).optional(),
        enrolledAfter: z.string().optional(),
        enrolledBefore: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get all students with enrollment data
      const studentData = await db
        .select({
          userId: users.id,
          userName: users.name,
          userEmail: users.email,
          userCreatedAt: users.createdAt,
          cohortId: cohorts.id,
          cohortName: cohorts.name,
          enrollmentStatus: courseEnrollments.status,
          enrolledAt: courseEnrollments.enrolledAt,
          completedAt: courseEnrollments.completedAt,
          courseId: courses.id,
          courseTitle: courses.title,
        })
        .from(users)
        .leftJoin(courseEnrollments, eq(users.id, courseEnrollments.userId))
        .leftJoin(userCohorts, eq(users.id, userCohorts.userId))
        .leftJoin(cohorts, eq(userCohorts.cohortId, cohorts.id))
        .leftJoin(courses, eq(courseEnrollments.courseId, courses.id));

      // Build CSV
      const csvRows: string[][] = [];
      
      csvRows.push([
        'User ID',
        'Name',
        'Email',
        'Created At',
        'Cohort',
        'Course',
        'Enrollment Status',
        'Enrolled At',
        'Completed At',
      ]);

      studentData.forEach((student: any) => {
        csvRows.push([
          student.userId.toString(),
          student.userName || '',
          student.userEmail || '',
          student.userCreatedAt || '',
          student.cohortName || '',
          student.courseTitle || '',
          student.enrollmentStatus || '',
          student.enrolledAt || '',
          student.completedAt || '',
        ]);
      });

      const csvContent = csvRows
        .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return {
        filename: `all-students-${new Date().toISOString().split('T')[0]}.csv`,
        content: csvContent,
        rowCount: csvRows.length - 1,
      };
    }),

  // Export student progress report
  exportStudentProgress: protectedProcedure
    .input(z.object({
      userIds: z.array(z.number()).optional(),
      cohortId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let targetUserIds: number[] = [];

      if (input.userIds && input.userIds.length > 0) {
        targetUserIds = input.userIds;
      } else if (input.cohortId) {
        // Get all users in cohort
        const cohortUsers = await db
          .select({ userId: userCohorts.userId })
          .from(userCohorts)
          .where(eq(userCohorts.id, input.cohortId));
        
        targetUserIds = [...new Set(cohortUsers.map((e: any) => e.userId))];
      } else {
        throw new Error('Must provide either userIds or cohortId');
      }

      if (targetUserIds.length === 0) {
        return {
          filename: `student-progress-${new Date().toISOString().split('T')[0]}.csv`,
          content: '',
          rowCount: 0,
        };
      }

      // Get user info
      const usersData = await db
        .select()
        .from(users)
        .where(inArray(users.id, targetUserIds));

      // Get progress data
      const progressData = await db
        .select({
          userId: userTrainingProgress.userId,
          moduleId: userTrainingProgress.moduleId,
          moduleTitle: trainingModules.title,
          status: userTrainingProgress.status,
          startedAt: userTrainingProgress.startedAt,
          completedAt: userTrainingProgress.completedAt,
        })
        .from(userTrainingProgress)
        .innerJoin(trainingModules, eq(userTrainingProgress.moduleId, trainingModules.id))
        .where(inArray(userTrainingProgress.userId, targetUserIds));

      // Build CSV
      const csvRows: string[][] = [];
      
      csvRows.push([
        'User ID',
        'User Name',
        'User Email',
        'Module Name',
        'Status',
        'Started At',
        'Completed At',
      ]);

      progressData.forEach((progress: any) => {
        const user = usersData.find((u: any) => u.id === progress.userId);
        csvRows.push([
          progress.userId.toString(),
          user?.name || '',
          user?.email || '',
          progress.moduleTitle || '',
          progress.status || '',
          progress.startedAt || '',
          progress.completedAt || '',
        ]);
      });

      const csvContent = csvRows
        .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return {
        filename: `student-progress-${new Date().toISOString().split('T')[0]}.csv`,
        content: csvContent,
        rowCount: csvRows.length - 1,
      };
    }),
});
