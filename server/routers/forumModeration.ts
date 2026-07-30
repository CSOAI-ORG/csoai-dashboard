/**
 * Forum Moderation Router
 * Handles instructor moderation tools for forum threads and posts
 */

import { z } from "zod";
import { router, protectedProcedure } from '../_core/trpc';
import { getDb } from "../db";
import { 
  forumThreads,
  forumPosts,
} from "../../drizzle/schema-courses-forums";
import { users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Check if user has instructor/admin role
 */
async function isInstructor(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user && (user.role === 'admin' || user.role === 'compliance_officer');
}

export const forumModerationRouter = router({
  /**
   * Pin/unpin a thread
   */
  togglePinThread: protectedProcedure
    .input(z.object({
      threadId: z.number(),
      isPinned: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const userId = Number(ctx.user?.id);

      // Check if user is instructor
      if (!(await isInstructor(userId))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only instructors can pin threads',
        });
      }

      const now = new Date().toISOString();

      await db
        .update(forumThreads)
        .set({ 
          isPinned: input.isPinned,
          updatedAt: now,
        })
        .where(eq(forumThreads.id, input.threadId));

      return { success: true };
    }),

  /**
   * Lock/unlock a thread
   */
  toggleLockThread: protectedProcedure
    .input(z.object({
      threadId: z.number(),
      isLocked: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const userId = Number(ctx.user?.id);

      // Check if user is instructor
      if (!(await isInstructor(userId))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only instructors can lock threads',
        });
      }

      const now = new Date().toISOString();

      await db
        .update(forumThreads)
        .set({ 
          isLocked: input.isLocked,
          updatedAt: now,
        })
        .where(eq(forumThreads.id, input.threadId));

      return { success: true };
    }),

  /**
   * Mark post as instructor response
   */
  markAsInstructorPost: protectedProcedure
    .input(z.object({
      postId: z.number(),
      isInstructorPost: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const userId = Number(ctx.user?.id);

      // Check if user is instructor
      if (!(await isInstructor(userId))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only instructors can mark instructor posts',
        });
      }

      const now = new Date().toISOString();

      await db
        .update(forumPosts)
        .set({ 
          isInstructorPost: input.isInstructorPost,
          updatedAt: now,
        })
        .where(eq(forumPosts.id, input.postId));

      return { success: true };
    }),

  /**
   * Edit any post (moderation)
   */
  moderateEditPost: protectedProcedure
    .input(z.object({
      postId: z.number(),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const userId = Number(ctx.user?.id);

      // Check if user is instructor
      if (!(await isInstructor(userId))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only instructors can moderate posts',
        });
      }

      const now = new Date().toISOString();

      await db
        .update(forumPosts)
        .set({ 
          content: input.content,
          isEdited: true,
          editedAt: now,
          updatedAt: now,
        })
        .where(eq(forumPosts.id, input.postId));

      return { success: true };
    }),

  /**
   * Delete any post (moderation)
   */
  moderateDeletePost: protectedProcedure
    .input(z.object({
      postId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const userId = Number(ctx.user?.id);

      // Check if user is instructor
      if (!(await isInstructor(userId))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only instructors can delete posts',
        });
      }

      await db
        .delete(forumPosts)
        .where(eq(forumPosts.id, input.postId));

      return { success: true };
    }),

  /**
   * Delete thread (moderation)
   */
  moderateDeleteThread: protectedProcedure
    .input(z.object({
      threadId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const userId = Number(ctx.user?.id);

      // Check if user is instructor
      if (!(await isInstructor(userId))) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only instructors can delete threads',
        });
      }

      // Delete all posts in thread first
      await db
        .delete(forumPosts)
        .where(eq(forumPosts.threadId, input.threadId));

      // Delete thread
      await db
        .delete(forumThreads)
        .where(eq(forumThreads.id, input.threadId));

      return { success: true };
    }),

  /**
   * Check if current user is instructor
   */
  checkInstructorStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = Number(ctx.user?.id);
      const isInstructorUser = await isInstructor(userId);
      
      return { isInstructor: isInstructorUser };
    }),
});
