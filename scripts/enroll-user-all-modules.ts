import { getDb } from '../server/db';
import { courseEnrollments, courses, courseBundles } from '../drizzle/schema';
import { eq, and, inArray } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  if (!db) {
    console.log('No DB connection');
    return;
  }
  
  const userId = 1;
  
  // The 7 paid module IDs
  const moduleIds = [100001, 100002, 100003, 100004, 100005, 100006, 100007];
  
  // First, delete orphan enrollments (courses that don't exist)
  console.log('Cleaning up orphan enrollments...');
  const orphanIds = [1, 2, 5, 12]; // Course IDs that don't exist
  await db.delete(courseEnrollments)
    .where(and(
      eq(courseEnrollments.userId, userId),
      inArray(courseEnrollments.courseId, orphanIds)
    ));
  console.log('Deleted orphan enrollments');
  
  // Delete duplicate enrollments for course 100001 (keep only one)
  console.log('Cleaning up duplicate enrollments...');
  const duplicates = await db.select()
    .from(courseEnrollments)
    .where(and(
      eq(courseEnrollments.userId, userId),
      eq(courseEnrollments.courseId, 100001)
    ));
  
  if (duplicates.length > 1) {
    // Keep the first one, delete the rest
    const toDelete = duplicates.slice(1).map(d => d.id);
    for (const id of toDelete) {
      await db.delete(courseEnrollments).where(eq(courseEnrollments.id, id));
    }
    console.log(`Deleted ${toDelete.length} duplicate enrollments for course 100001`);
  }
  
  // Check existing enrollments
  const existingEnrollments = await db.select()
    .from(courseEnrollments)
    .where(eq(courseEnrollments.userId, userId));
  
  const enrolledCourseIds = new Set(existingEnrollments.map(e => e.courseId));
  console.log('Currently enrolled in:', [...enrolledCourseIds]);
  
  // Enroll in missing modules
  for (const courseId of moduleIds) {
    if (!enrolledCourseIds.has(courseId)) {
      console.log(`Enrolling user ${userId} in course ${courseId}...`);
      await db.insert(courseEnrollments).values({
        userId,
        courseId,
        enrollmentType: 'course',
        status: 'enrolled',
        paymentStatus: 'completed',
        progress: 0,
        amountPaid: 0,
      });
      console.log(`Enrolled in course ${courseId}`);
    } else {
      console.log(`Already enrolled in course ${courseId}`);
    }
  }
  
  // Check if bundles table exists and add bundles
  try {
    // First check if bundles exist
    const existingBundles = await db.select().from(courseBundles);
    console.log('Existing bundles:', existingBundles.length);
    
    // If no bundles, create them
    if (existingBundles.length === 0) {
      console.log('Creating bundles...');
      await db.insert(courseBundles).values([
        {
          id: 200001,
          title: 'Complete AI Safety Professional Bundle',
          description: 'All 7 modules for comprehensive AI safety certification',
          price: 199900,
          discountedPrice: 149900,
          courseIds: JSON.stringify([100001, 100002, 100003, 100004, 100005, 100006, 100007]),
        },
        {
          id: 200002,
          title: 'Enterprise Compliance Bundle',
          description: 'EU AI Act + NIST AI RMF + ISO 42001 for enterprise compliance',
          price: 129900,
          discountedPrice: 99900,
          courseIds: JSON.stringify([100001, 100002, 100006]),
        }
      ]);
      console.log('Created 2 bundles');
    }
  } catch (e) {
    console.log('Bundles table may not exist or error:', e);
  }
  
  // Verify final state
  const finalEnrollments = await db
    .select({
      enrollmentId: courseEnrollments.id,
      courseId: courseEnrollments.courseId,
      courseTitle: courses.title,
      status: courseEnrollments.status,
    })
    .from(courseEnrollments)
    .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
    .where(eq(courseEnrollments.userId, userId));
  
  console.log('\n=== Final Enrollments for User 1 ===');
  finalEnrollments.forEach(e => {
    console.log(`Course ${e.courseId}: ${e.courseTitle} (${e.status})`);
  });
  console.log(`Total: ${finalEnrollments.length} enrollments`);
  
  process.exit(0);
}

main().catch(console.error);
