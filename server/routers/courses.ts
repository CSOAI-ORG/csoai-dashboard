import { Router } from 'express';
import { getDb } from '../db';
import { courses, courseBundles, courseEnrollments, courseLessons, userLessonProgress } from '../../drizzle/schema';
import { eq, and, sql } from 'drizzle-orm';

const router = Router();

// Get all courses
router.get('/courses', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const allCourses = await db.select().from(courses).where(eq(courses.active, 1));
    res.json(allCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course by ID
router.get('/courses/:id', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const courseId = parseInt(req.params.id);
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Get all course bundles
router.get('/course-bundles', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const allBundles = await db.select().from(courseBundles).where(eq(courseBundles.active, 1));
    res.json(allBundles);
  } catch (error) {
    console.error('Error fetching bundles:', error);
    res.status(500).json({ error: 'Failed to fetch bundles' });
  }
});

// Get bundle by ID
router.get('/course-bundles/:id', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const bundleId = parseInt(req.params.id);
    const [bundle] = await db.select().from(courseBundles).where(eq(courseBundles.id, bundleId));
    
    if (!bundle) {
      return res.status(404).json({ error: 'Bundle not found' });
    }
    
    res.json(bundle);
  } catch (error) {
    console.error('Error fetching bundle:', error);
    res.status(500).json({ error: 'Failed to fetch bundle' });
  }
});

// Get courses with enrollment status for a user
router.get('/courses/with-enrollment/:userId', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const userId = parseInt(req.params.userId);
    
    // Get all active courses
    const allCourses = await db.select().from(courses).where(eq(courses.active, 1));
    
    // Get user's completed enrollments
    const enrollments = await db
      .select()
      .from(courseEnrollments)
      .where(and(
        eq(courseEnrollments.userId, userId),
        eq(courseEnrollments.paymentStatus, 'completed')
      ));
    
    const enrolledCourseIds = new Set(
      enrollments
        .filter(e => e.courseId)
        .map(e => e.courseId)
    );
    
    // Enrich courses with enrollment status and progress
    const enrichedCourses = await Promise.all(
      allCourses.map(async (course) => {
        const isEnrolled = enrolledCourseIds.has(course.id);
        let progress = 0;
        
        if (isEnrolled) {
          // Calculate progress percentage
          const totalLessons = await db
            .select({ count: sql<number>`count(*)` })
            .from(courseLessons)
            .where(eq(courseLessons.courseId, course.id));
          
          const completedLessons = await db
            .select({ count: sql<number>`count(*)` })
            .from(userLessonProgress)
            .where(and(
              eq(userLessonProgress.userId, userId),
              eq(userLessonProgress.courseId, course.id),
              eq(userLessonProgress.status, 'completed')
            ));
          
          const total = Number(totalLessons[0]?.count || 0);
          const completed = Number(completedLessons[0]?.count || 0);
          progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        }
        
        return {
          ...course,
          isEnrolled,
          progress,
        };
      })
    );
    
    res.json(enrichedCourses);
  } catch (error) {
    console.error('Error fetching courses with enrollment:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get bundles with enrollment status for a user
router.get('/course-bundles/with-enrollment/:userId', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const userId = parseInt(req.params.userId);
    
    // Get all active bundles
    const allBundles = await db.select().from(courseBundles).where(eq(courseBundles.active, 1));
    
    // Get user's completed enrollments
    const enrollments = await db
      .select()
      .from(courseEnrollments)
      .where(and(
        eq(courseEnrollments.userId, userId),
        eq(courseEnrollments.paymentStatus, 'completed')
      ));
    
    const enrolledBundleIds = new Set(
      enrollments
        .filter(e => e.bundleId)
        .map(e => e.bundleId)
    );
    
    // Enrich bundles with enrollment status
    const enrichedBundles = allBundles.map(bundle => ({
      ...bundle,
      isEnrolled: enrolledBundleIds.has(bundle.id),
    }));
    
    res.json(enrichedBundles);
  } catch (error) {
    console.error('Error fetching bundles with enrollment:', error);
    res.status(500).json({ error: 'Failed to fetch bundles' });
  }
});

// Get preview lessons for a course (first 2 lessons or marked as preview)
router.get('/courses/:id/preview', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const courseId = parseInt(req.params.id);
    
    // Get first 2 lessons as preview
    const previewLessons = await db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.courseId, courseId))
      .orderBy(courseLessons.moduleId, courseLessons.orderIndex)
      .limit(2);
    
    res.json(previewLessons);
  } catch (error) {
    console.error('Error fetching preview lessons:', error);
    res.status(500).json({ error: 'Failed to fetch preview lessons' });
  }
});

export default router;
