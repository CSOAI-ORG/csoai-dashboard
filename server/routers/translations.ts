import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import {
  courseTranslations,
  moduleTranslations,
  lessonTranslations,
} from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

// Cache for translations (in-memory, can be replaced with Redis in production)
const translationCache = new Map<string, any>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function getCacheKey(type: string, id: number, language: string): string {
  return `${type}:${id}:${language}`;
}

function getFromCache(key: string): any | null {
  const cached = translationCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  translationCache.delete(key);
  return null;
}

function setInCache(key: string, data: any): void {
  translationCache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL,
  });
}

export const translationsRouter = router({
  /**
   * Get course translation by ID and language
   */
  getCourseTranslation: publicProcedure
    .input(
      z.object({
        courseId: z.number(),
        language: z.string(),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = getCacheKey('course', input.courseId, input.language);
      const cached = getFromCache(cacheKey);
      if (cached) return cached;

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const translation = await db
        .select()
        .from(courseTranslations)
        .where(
          and(
            eq(courseTranslations.courseId, input.courseId),
            eq(courseTranslations.language, input.language)
          )
        )
        .limit(1);

      if (translation.length > 0) {
        setInCache(cacheKey, translation[0]);
        return translation[0];
      }

      // Fallback to English if translation not found
      if (input.language !== 'en-US') {
        const fallback = await db
          .select()
          .from(courseTranslations)
          .where(
            and(
              eq(courseTranslations.courseId, input.courseId),
              eq(courseTranslations.language, 'en-US')
            )
          )
          .limit(1);

        if (fallback.length > 0) {
          setInCache(cacheKey, fallback[0]);
          return fallback[0];
        }
      }

      return null;
    }),

  /**
   * Get module translation by ID and language
   */
  getModuleTranslation: publicProcedure
    .input(
      z.object({
        moduleId: z.number(),
        language: z.string(),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = getCacheKey('module', input.moduleId, input.language);
      const cached = getFromCache(cacheKey);
      if (cached) return cached;

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const translation = await db
        .select()
        .from(moduleTranslations)
        .where(
          and(
            eq(moduleTranslations.moduleId, input.moduleId),
            eq(moduleTranslations.language, input.language)
          )
        )
        .limit(1);

      if (translation.length > 0) {
        setInCache(cacheKey, translation[0]);
        return translation[0];
      }

      // Fallback to English
      if (input.language !== 'en-US') {
        const fallback = await db
          .select()
          .from(moduleTranslations)
          .where(
            and(
              eq(moduleTranslations.moduleId, input.moduleId),
              eq(moduleTranslations.language, 'en-US')
            )
          )
          .limit(1);

        if (fallback.length > 0) {
          setInCache(cacheKey, fallback[0]);
          return fallback[0];
        }
      }

      return null;
    }),

  /**
   * Get lesson translation by ID and language
   */
  getLessonTranslation: publicProcedure
    .input(
      z.object({
        lessonId: z.number(),
        language: z.string(),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = getCacheKey('lesson', input.lessonId, input.language);
      const cached = getFromCache(cacheKey);
      if (cached) return cached;

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const translation = await db
        .select()
        .from(lessonTranslations)
        .where(
          and(
            eq(lessonTranslations.lessonId, input.lessonId),
            eq(lessonTranslations.language, input.language)
          )
        )
        .limit(1);

      if (translation.length > 0) {
        setInCache(cacheKey, translation[0]);
        return translation[0];
      }

      // Fallback to English
      if (input.language !== 'en-US') {
        const fallback = await db
          .select()
          .from(lessonTranslations)
          .where(
            and(
              eq(lessonTranslations.lessonId, input.lessonId),
              eq(lessonTranslations.language, 'en-US')
            )
          )
          .limit(1);

        if (fallback.length > 0) {
          setInCache(cacheKey, fallback[0]);
          return fallback[0];
        }
      }

      return null;
    }),

  /**
   * Get all available translations for a course
   */
  getCourseTranslations: publicProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db
        .select()
        .from(courseTranslations)
        .where(eq(courseTranslations.courseId, input.courseId));
    }),

  /**
   * Get all available translations for a module
   */
  getModuleTranslations: publicProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db
        .select()
        .from(moduleTranslations)
        .where(eq(moduleTranslations.moduleId, input.moduleId));
    }),

  /**
   * Get all available translations for a lesson
   */
  getLessonTranslations: publicProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db
        .select()
        .from(lessonTranslations)
        .where(eq(lessonTranslations.lessonId, input.lessonId));
    }),

  /**
   * Create or update course translation (admin only)
   */
  upsertCourseTranslation: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        language: z.string(),
        title: z.string(),
        description: z.string().optional(),
        content: z.string().optional(),
        learningObjectives: z.array(z.string()).optional(),
        duration: z.number().optional(),
        difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db
        .select()
        .from(courseTranslations)
        .where(
          and(
            eq(courseTranslations.courseId, input.courseId),
            eq(courseTranslations.language, input.language)
          )
        )
        .limit(1);

      const cacheKey = getCacheKey('course', input.courseId, input.language);
      translationCache.delete(cacheKey);

      if (existing.length > 0) {
        // Update
        return await db
          .update(courseTranslations)
          .set({
            title: input.title,
            description: input.description,
            content: input.content,
            learningObjectives: input.learningObjectives,
            duration: input.duration,
            difficulty: input.difficulty,
            isPublished: input.isPublished ? 1 : 0,
          })
          .where(eq(courseTranslations.id, existing[0].id));
      } else {
        // Insert
        return await db.insert(courseTranslations).values({
          courseId: input.courseId,
          language: input.language,
          title: input.title,
          description: input.description,
          content: input.content,
          learningObjectives: input.learningObjectives,
          duration: input.duration,
          difficulty: input.difficulty,
          isPublished: input.isPublished ? 1 : 0,
        });
      }
    }),

  /**
   * Create or update module translation (admin only)
   */
  upsertModuleTranslation: protectedProcedure
    .input(
      z.object({
        moduleId: z.number(),
        language: z.string(),
        title: z.string(),
        description: z.string().optional(),
        content: z.string().optional(),
        learningObjectives: z.array(z.string()).optional(),
        keyTakeaways: z.array(z.string()).optional(),
        duration: z.number().optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db
        .select()
        .from(moduleTranslations)
        .where(
          and(
            eq(moduleTranslations.moduleId, input.moduleId),
            eq(moduleTranslations.language, input.language)
          )
        )
        .limit(1);

      const cacheKey = getCacheKey('module', input.moduleId, input.language);
      translationCache.delete(cacheKey);

      if (existing.length > 0) {
        return await db
          .update(moduleTranslations)
          .set({
            title: input.title,
            description: input.description,
            content: input.content,
            learningObjectives: input.learningObjectives,
            keyTakeaways: input.keyTakeaways,
            duration: input.duration,
            isPublished: input.isPublished ? 1 : 0,
          })
          .where(eq(moduleTranslations.id, existing[0].id));
      } else {
        return await db.insert(moduleTranslations).values({
          moduleId: input.moduleId,
          language: input.language,
          title: input.title,
          description: input.description,
          content: input.content,
          learningObjectives: input.learningObjectives,
          keyTakeaways: input.keyTakeaways,
          duration: input.duration,
          isPublished: input.isPublished ? 1 : 0,
        });
      }
    }),

  /**
   * Create or update lesson translation (admin only)
   */
  upsertLessonTranslation: protectedProcedure
    .input(
      z.object({
        lessonId: z.number(),
        language: z.string(),
        title: z.string(),
        description: z.string().optional(),
        content: z.string().optional(),
        videoUrl: z.string().optional(),
        videoCaptions: z.string().optional(),
        resources: z
          .array(
            z.object({
              title: z.string(),
              url: z.string(),
              type: z.string(),
            })
          )
          .optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const existing = await db
        .select()
        .from(lessonTranslations)
        .where(
          and(
            eq(lessonTranslations.lessonId, input.lessonId),
            eq(lessonTranslations.language, input.language)
          )
        )
        .limit(1);

      const cacheKey = getCacheKey('lesson', input.lessonId, input.language);
      translationCache.delete(cacheKey);

      if (existing.length > 0) {
        return await db
          .update(lessonTranslations)
          .set({
            title: input.title,
            description: input.description,
            content: input.content,
            videoUrl: input.videoUrl,
            videoCaptions: input.videoCaptions,
            resources: input.resources,
            isPublished: input.isPublished ? 1 : 0,
          })
          .where(eq(lessonTranslations.id, existing[0].id));
      } else {
        return await db.insert(lessonTranslations).values({
          lessonId: input.lessonId,
          language: input.language,
          title: input.title,
          description: input.description,
          content: input.content,
          videoUrl: input.videoUrl,
          videoCaptions: input.videoCaptions,
          resources: input.resources,
          isPublished: input.isPublished ? 1 : 0,
        });
      }
    }),

  /**
   * Clear translation cache (admin only)
   */
  clearCache: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    translationCache.clear();
    return { success: true };
  }),
});
