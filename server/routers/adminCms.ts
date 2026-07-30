import { Router } from 'express';
import { getDb } from '../db';
import { 
  courses, 
  trainingModules, 
  courseLessons, 
  lessonQuizzes 
} from '../../drizzle/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

const router = Router();

// ============================================================================
// COURSES MANAGEMENT
// ============================================================================

// Get all courses with module and lesson counts
router.get('/admin/cms/courses', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const allCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        regionId: courses.regionId,
        durationHours: courses.durationHours,
        level: courses.level,
        active: courses.active,
        createdAt: courses.createdAt,
        moduleCount: sql<number>`(SELECT COUNT(*) FROM training_modules WHERE courseId = ${courses.id})`,
        lessonCount: sql<number>`(SELECT COUNT(*) FROM course_lessons WHERE courseId = ${courses.id})`
      })
      .from(courses)
      .orderBy(desc(courses.createdAt));
    
    res.json(allCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get single course with full details
router.get('/admin/cms/courses/:id', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const courseId = parseInt(req.params.id);
    
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Get modules for this course
    const modules = await db
      .select()
      .from(trainingModules)
      .where(eq(trainingModules.courseId, courseId))
      .orderBy(trainingModules.orderIndex);
    
    // Get lessons for this course
    const lessons = await db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.courseId, courseId))
      .orderBy(courseLessons.orderIndex);
    
    res.json({ ...course, modules, lessons });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create new course
router.post('/admin/cms/courses', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const { title, description, regionId, framework, level, durationHours, price, active } = req.body;
    
    if (!title || !description || !regionId) {
      return res.status(400).json({ error: 'Title, description, and regionId are required' });
    }
    
    const [result] = await db.insert(courses).values({
      title,
      description,
      regionId,
      framework: framework || null,
      level: level || 'fundamentals',
      durationHours: durationHours || 40,
      price: price || 0,
      active: active !== undefined ? active : 1
    });
    
    res.json({ id: result.insertId, message: 'Course created successfully' });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course
router.put('/admin/cms/courses/:id', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const courseId = parseInt(req.params.id);
    
    const { title, description, regionId, framework, level, durationHours, price, active } = req.body;
    
    await db
      .update(courses)
      .set({
        title,
        description,
        regionId,
        framework,
        level,
        durationHours,
        price,
        active
      })
      .where(eq(courses.id, courseId));
    
    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete course
router.delete('/admin/cms/courses/:id', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const courseId = parseInt(req.params.id);
    
    // Check if course has enrollments
    const [enrollmentCount] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(sql`course_enrollments`)
      .where(sql`courseId = ${courseId}`);
    
    if (enrollmentCount && enrollmentCount.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete course with active enrollments. Deactivate instead.' 
      });
    }
    
    // Delete related data first
    await db.delete(lessonQuizzes).where(
      sql`lessonId IN (SELECT id FROM course_lessons WHERE courseId = ${courseId})`
    );
    await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));
    await db.delete(trainingModules).where(eq(trainingModules.courseId, courseId));
    await db.delete(courses).where(eq(courses.id, courseId));
    
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// ============================================================================
// MODULES MANAGEMENT
// ============================================================================

// Get all modules for a course
router.get('/admin/cms/courses/:courseId/modules', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const courseId = parseInt(req.params.courseId);
    
    const modules = await db
      .select({
        id: trainingModules.id,
        courseId: trainingModules.courseId,
        code: trainingModules.code,
        title: trainingModules.title,
        description: trainingModules.description,
        content: trainingModules.content,
        orderIndex: trainingModules.orderIndex,
        createdAt: trainingModules.createdAt,
        lessonCount: sql<number>`(SELECT COUNT(*) FROM course_lessons WHERE moduleId = ${trainingModules.id})`
      })
      .from(trainingModules)
      .where(eq(trainingModules.courseId, courseId))
      .orderBy(trainingModules.orderIndex);
    
    res.json(modules);
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Create new module
router.post('/admin/cms/modules', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const { courseId, code, title, description, content, orderIndex } = req.body;
    
    if (!courseId || !code || !title) {
      return res.status(400).json({ error: 'Course ID, code, and title are required' });
    }
    
    const [result] = await db.insert(trainingModules).values({
      courseId,
      code,
      title,
      description: description || '',
      content: content || '',
      orderIndex: orderIndex !== undefined ? orderIndex : 0
    });
    
    res.json({ id: result.insertId, message: 'Module created successfully' });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

// Update module
router.put('/admin/cms/modules/:id', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const moduleId = parseInt(req.params.id);
    
    const { code, title, description, content, orderIndex } = req.body;
    
    await db
      .update(trainingModules)
      .set({
        code,
        title,
        description,
        content,
        orderIndex
      })
      .where(eq(trainingModules.id, moduleId));
    
    res.json({ message: 'Module updated successfully' });
  } catch (error) {
    console.error('Error updating module:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

// Delete module
router.delete('/admin/cms/modules/:id', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const moduleId = parseInt(req.params.id);
    
    // Delete related lessons and quizzes first
    await db.delete(lessonQuizzes).where(
      sql`lessonId IN (SELECT id FROM course_lessons WHERE moduleId = ${moduleId})`
    );
    await db.delete(courseLessons).where(eq(courseLessons.moduleId, moduleId));
    await db.delete(trainingModules).where(eq(trainingModules.id, moduleId));
    
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Error deleting module:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

// ============================================================================
// LESSONS MANAGEMENT
// ============================================================================

// Get all lessons for a course
router.get('/admin/cms/courses/:courseId/lessons', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const courseId = parseInt(req.params.courseId);
    
    const lessons = await db
      .select({
        id: courseLessons.id,
        courseId: courseLessons.courseId,
        moduleId: courseLessons.moduleId,
        lessonKey: courseLessons.lessonKey,
        title: courseLessons.title,
        type: courseLessons.type,
        duration: courseLessons.duration,
        videoUrl: courseLessons.videoUrl,
        content: courseLessons.content,
        orderIndex: courseLessons.orderIndex,
        createdAt: courseLessons.createdAt,
        quizCount: sql<number>`(SELECT COUNT(*) FROM lesson_quizzes WHERE lessonId = ${courseLessons.id})`
      })
      .from(courseLessons)
      .where(eq(courseLessons.courseId, courseId))
      .orderBy(courseLessons.orderIndex);
    
    res.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// Get single lesson with quizzes
router.get('/admin/cms/lessons/:id', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const lessonId = parseInt(req.params.id);
    
    const [lesson] = await db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.id, lessonId));
    
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    
    const quizzes = await db
      .select()
      .from(lessonQuizzes)
      .where(eq(lessonQuizzes.lessonId, lessonId))
      .orderBy(lessonQuizzes.orderIndex);
    
    res.json({ ...lesson, quizzes });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// Create new lesson
router.post('/admin/cms/lessons', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const { 
      courseId, 
      moduleId, 
      lessonKey, 
      title, 
      type, 
      duration, 
      videoUrl, 
      content, 
      orderIndex 
    } = req.body;
    
    if (!courseId || !moduleId || !lessonKey || !title) {
      return res.status(400).json({ 
        error: 'Course ID, module ID, lesson key, and title are required' 
      });
    }
    
    const [result] = await db.insert(courseLessons).values({
      courseId,
      moduleId,
      lessonKey,
      title,
      type: type || 'reading',
      duration: duration || '15 min',
      videoUrl: videoUrl || null,
      content: content || '',
      orderIndex: orderIndex !== undefined ? orderIndex : 0
    });
    
    res.json({ id: result.insertId, message: 'Lesson created successfully' });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// Update lesson
router.put('/admin/cms/lessons/:id', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const lessonId = parseInt(req.params.id);
    
    const { 
      lessonKey, 
      title, 
      type, 
      duration, 
      videoUrl, 
      content, 
      orderIndex 
    } = req.body;
    
    await db
      .update(courseLessons)
      .set({
        lessonKey,
        title,
        type,
        duration,
        videoUrl,
        content,
        orderIndex
      })
      .where(eq(courseLessons.id, lessonId));
    
    res.json({ message: 'Lesson updated successfully' });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// Delete lesson
router.delete('/admin/cms/lessons/:id', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const lessonId = parseInt(req.params.id);
    
    // Delete related quizzes first
    await db.delete(lessonQuizzes).where(eq(lessonQuizzes.lessonId, lessonId));
    await db.delete(courseLessons).where(eq(courseLessons.id, lessonId));
    
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// ============================================================================
// QUIZZES MANAGEMENT
// ============================================================================

// Get all quizzes for a lesson
router.get('/admin/cms/lessons/:lessonId/quizzes', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const lessonId = parseInt(req.params.lessonId);
    
    const quizzes = await db
      .select()
      .from(lessonQuizzes)
      .where(eq(lessonQuizzes.lessonId, lessonId))
      .orderBy(lessonQuizzes.orderIndex);
    
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Create new quiz
router.post('/admin/cms/quizzes', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    
    const { lessonId, question, options, correctAnswer, explanation, orderIndex } = req.body;
    
    if (!lessonId || !question || !options || correctAnswer === undefined) {
      return res.status(400).json({ 
        error: 'Lesson ID, question, options, and correct answer are required' 
      });
    }
    
    const [result] = await db.insert(lessonQuizzes).values({
      lessonId,
      question,
      options: Array.isArray(options) ? options : JSON.parse(options),
      correctAnswer,
      explanation: explanation || '',
      orderIndex: orderIndex !== undefined ? orderIndex : 0
    });
    
    res.json({ id: result.insertId, message: 'Quiz created successfully' });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Update quiz
router.put('/admin/cms/quizzes/:id', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const quizId = parseInt(req.params.id);
    
    const { question, options, correctAnswer, explanation, orderIndex } = req.body;
    
    await db
      .update(lessonQuizzes)
      .set({
        question,
        options: Array.isArray(options) ? options : JSON.parse(options),
        correctAnswer,
        explanation,
        orderIndex
      })
      .where(eq(lessonQuizzes.id, quizId));
    
    res.json({ message: 'Quiz updated successfully' });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// Delete quiz
router.delete('/admin/cms/quizzes/:id', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const quizId = parseInt(req.params.id);
    
    await db.delete(lessonQuizzes).where(eq(lessonQuizzes.id, quizId));
    
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// ============================================================================
// BULK OPERATIONS
// ============================================================================

// Reorder lessons within a course
router.post('/admin/cms/courses/:courseId/lessons/reorder', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const courseId = parseInt(req.params.courseId);
    const { lessonIds } = req.body; // Array of lesson IDs in new order
    
    if (!Array.isArray(lessonIds)) {
      return res.status(400).json({ error: 'lessonIds must be an array' });
    }
    
    // Update order index for each lesson
    for (let i = 0; i < lessonIds.length; i++) {
      await db
        .update(courseLessons)
        .set({ orderIndex: i })
        .where(and(
          eq(courseLessons.id, lessonIds[i]),
          eq(courseLessons.courseId, courseId)
        ));
    }
    
    res.json({ message: 'Lessons reordered successfully' });
  } catch (error) {
    console.error('Error reordering lessons:', error);
    res.status(500).json({ error: 'Failed to reorder lessons' });
  }
});

// Reorder quizzes within a lesson
router.post('/admin/cms/lessons/:lessonId/quizzes/reorder', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');
    const lessonId = parseInt(req.params.lessonId);
    const { quizIds } = req.body; // Array of quiz IDs in new order
    
    if (!Array.isArray(quizIds)) {
      return res.status(400).json({ error: 'quizIds must be an array' });
    }
    
    // Update order index for each quiz
    for (let i = 0; i < quizIds.length; i++) {
      await db
        .update(lessonQuizzes)
        .set({ orderIndex: i })
        .where(and(
          eq(lessonQuizzes.id, quizIds[i]),
          eq(lessonQuizzes.lessonId, lessonId)
        ));
    }
    
    res.json({ message: 'Quizzes reordered successfully' });
  } catch (error) {
    console.error('Error reordering quizzes:', error);
    res.status(500).json({ error: 'Failed to reorder quizzes' });
  }
});

export default router;
