import { getDb } from '../server/db';
import { courseEnrollments, courses } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  if (!db) {
    console.log('No DB');
    return;
  }
  
  const enrollments = await db
    .select({
      enrollmentId: courseEnrollments.id,
      userId: courseEnrollments.userId,
      courseId: courseEnrollments.courseId,
      courseTitle: courses.title,
      framework: courses.framework,
      status: courseEnrollments.status,
      paymentStatus: courseEnrollments.paymentStatus,
      enrolledAt: courseEnrollments.enrolledAt,
    })
    .from(courseEnrollments)
    .leftJoin(courses, eq(courseEnrollments.courseId, courses.id));
    
  console.log('All Enrollments:');
  enrollments.forEach(e => {
    console.log(`ID: ${e.enrollmentId}, User: ${e.userId}, Course: ${e.courseId} (${e.courseTitle}), Framework: ${e.framework}, Status: ${e.status}, Payment: ${e.paymentStatus}`);
  });
  
  process.exit(0);
}

main().catch(console.error);
