import { z } from "zod";
import { router, protectedProcedure } from '../_core/trpc';
import { sendNewReplyEmail, sendSolutionMarkedEmail } from '../services/forumEmailService';
import { getDb } from "../db";
import { 
  forumThreads,
  forumPosts,
  forumPostLikes,
  forumNotifications,
  users,
  courses
} from "../../drizzle/schema";
import { eq, and, desc, sql, or, isNull, like, count, avg, sum, inArray } from "drizzle-orm";

/**
 * Extract @mentions from content
 * Returns array of usernames mentioned (without @ symbol)
 */
function extractMentions(content: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
  const mentions: string[] = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return [...new Set(mentions)]; // Remove duplicates
}

export const forumsRouter = router({
  /**
   * Search threads across courses
   */
  searchThreads: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      courseId: z.number().optional(),
      sortBy: z.enum(['recent', 'popular', 'replies']).optional().default('recent'),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let query = db
        .select({
          thread: forumThreads,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
          course: {
            id: courses.id,
            title: courses.title,
          },
        })
        .from(forumThreads)
        .leftJoin(users, eq(forumThreads.userId, users.id))
        .leftJoin(courses, eq(forumThreads.courseId, courses.id))
        .where(
          or(
            like(forumThreads.title, `%${input.query}%`),
            like(forumThreads.content, `%${input.query}%`)
          )
        )
        .$dynamic();

      // Filter by course if provided
      if (input.courseId) {
        query = query.where(eq(forumThreads.courseId, input.courseId));
      }

      // Apply sorting
      if (input.sortBy === 'recent') {
        query = query.orderBy(desc(forumThreads.lastActivityAt));
      } else if (input.sortBy === 'popular') {
        query = query.orderBy(desc(forumThreads.viewCount));
      } else if (input.sortBy === 'replies') {
        query = query.orderBy(desc(forumThreads.replyCount));
      }

      const threads = await query.limit(50);

      return threads.map(t => ({
        ...t.thread,
        author: t.user,
        course: t.course,
      }));
    }),

  /**
   * Get all threads for a course
   */
  getCourseThreads: protectedProcedure
    .input(z.object({ 
      courseId: z.number(),
      lessonId: z.number().optional(),
      sortBy: z.enum(['recent', 'popular', 'unanswered']).optional().default('recent'),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let query = db
        .select({
          thread: forumThreads,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(forumThreads)
        .leftJoin(users, eq(forumThreads.userId, users.id))
        .where(eq(forumThreads.courseId, input.courseId))
        .$dynamic();

      // Filter by lesson if provided
      if (input.lessonId) {
        query = query.where(eq(forumThreads.lessonId, input.lessonId));
      }

      // Apply sorting
      if (input.sortBy === 'recent') {
        query = query.orderBy(desc(forumThreads.lastActivityAt));
      } else if (input.sortBy === 'popular') {
        query = query.orderBy(desc(forumThreads.viewCount));
      } else if (input.sortBy === 'unanswered') {
        query = query.where(eq(forumThreads.replyCount, 0)).orderBy(desc(forumThreads.createdAt));
      }

      const threads = await query;

      return threads.map(t => ({
        ...t.thread,
        author: t.user,
      }));
    }),

  /**
   * Get a single thread with all posts
   */
  getThread: protectedProcedure
    .input(z.object({ threadId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Get thread
      const threadData = await db
        .select({
          thread: forumThreads,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
          course: {
            id: courses.id,
            title: courses.title,
          },
        })
        .from(forumThreads)
        .leftJoin(users, eq(forumThreads.userId, users.id))
        .leftJoin(courses, eq(forumThreads.courseId, courses.id))
        .where(eq(forumThreads.id, input.threadId))
        .limit(1);

      if (threadData.length === 0) {
        throw new Error('Thread not found');
      }

      // Increment view count
      await db
        .update(forumThreads)
        .set({ viewCount: sql`${forumThreads.viewCount} + 1` })
        .where(eq(forumThreads.id, input.threadId));

      // Get all posts for this thread
      const posts = await db
        .select({
          post: forumPosts,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(forumPosts)
        .leftJoin(users, eq(forumPosts.userId, users.id))
        .where(eq(forumPosts.threadId, input.threadId))
        .orderBy(forumPosts.createdAt);

      // Get user's likes (only if there are posts)
      let likedPostIds = new Set<number>();
      if (posts.length > 0) {
        const userLikes = await db
          .select()
          .from(forumPostLikes)
          .where(
            and(
              eq(forumPostLikes.userId, userId),
              inArray(forumPostLikes.postId, posts.map(p => p.post.id))
            )
          );
        likedPostIds = new Set(userLikes.map(l => l.postId));
      }

      const postsWithLikes = posts.map(p => ({
        ...p.post,
        author: p.user,
        isLikedByUser: likedPostIds.has(p.post.id),
      }));

      return {
        ...threadData[0].thread,
        author: threadData[0].user,
        course: threadData[0].course,
        posts: postsWithLikes,
      };
    }),

  /**
   * Create a new thread
   */
  createThread: protectedProcedure
    .input(z.object({
      courseId: z.number(),
      lessonId: z.number().optional(),
      title: z.string().min(5).max(255),
      content: z.string().min(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;
      const now = new Date().toISOString();

      const result = await db.insert(forumThreads).values({
        courseId: input.courseId,
        lessonId: input.lessonId || null,
        userId,
        title: input.title,
        content: input.content,
        isPinned: 0,
        isLocked: 0,
        viewCount: 0,
        replyCount: 0,
        lastActivityAt: now,
        createdAt: now,
        updatedAt: now,
      });

      const threadId = Number((result as any)[0]?.insertId ?? (result as any).insertId);
      return { 
        success: true, 
        threadId: isNaN(threadId) ? 0 : threadId,
      };
    }),

  /**
   * Create a post/reply in a thread
   */
  createPost: protectedProcedure
    .input(z.object({
      threadId: z.number(),
      content: z.string().min(1),
      parentPostId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;
      const now = new Date().toISOString();

      // Check if thread is locked
      const thread = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, input.threadId))
        .limit(1);

      if (thread.length === 0) {
        throw new Error('Thread not found');
      }

      if (thread[0].isLocked) {
        throw new Error('Thread is locked');
      }

      // Create post
      const result = await db.insert(forumPosts).values({
        threadId: input.threadId,
        userId,
        parentPostId: input.parentPostId || null,
        content: input.content,
        isEdited: 0,
        editedAt: null,
        likeCount: 0,
        isInstructorPost: 0,
        isSolution: 0,
        createdAt: now,
        updatedAt: now,
      });

      const postId = Number((result as any)[0]?.insertId ?? (result as any).insertId);
      const safePostId = isNaN(postId) ? 0 : postId;

      // Update thread reply count and last activity
      await db
        .update(forumThreads)
        .set({
          replyCount: sql`${forumThreads.replyCount} + 1`,
          lastActivityAt: now,
          updatedAt: now,
        })
        .where(eq(forumThreads.id, input.threadId));

      // Create notification for thread author (if not self)
      if (thread[0].userId !== userId) {
        await db.insert(forumNotifications).values({
          userId: thread[0].userId,
          threadId: input.threadId,
          postId: safePostId,
          type: 'reply',
          isRead: 0,
          createdAt: now,
        });

        // Send email notification
        sendNewReplyEmail({
          recipientId: thread[0].userId,
          threadId: input.threadId,
          postId: safePostId,
          type: 'new_reply',
          actorName: ctx.user.name || 'A user',
        }).catch(err => console.error('[Forums] Failed to send email:', err));
      }

      // Create notification for parent post author (if replying)
      if (input.parentPostId) {
        const parentPost = await db
          .select()
          .from(forumPosts)
          .where(eq(forumPosts.id, input.parentPostId))
          .limit(1);

        if (parentPost.length > 0 && parentPost[0].userId !== userId) {
          await db.insert(forumNotifications).values({
            userId: parentPost[0].userId,
            threadId: input.threadId,
            postId: safePostId,
            type: 'reply',
            isRead: 0,
            createdAt: now,
          });
        }
      }

      // Handle @mentions - extract and create notifications
      const mentions = extractMentions(input.content);
      if (mentions.length > 0) {
        // Find users by name (case-insensitive)
        const mentionedUsers = await db
          .select({ id: users.id, name: users.name })
          .from(users)
          .where(
            or(...mentions.map(m => sql`LOWER(${users.name}) = LOWER(${m})`))
          );

        // Create mention notifications for each mentioned user (except self)
        for (const mentionedUser of mentionedUsers) {
          if (mentionedUser.id !== userId) {
            await db.insert(forumNotifications).values({
              userId: mentionedUser.id,
              threadId: input.threadId,
              postId: safePostId,
              type: 'mention',
              isRead: 0,
              createdAt: now,
            });
          }
        }
      }

      return { 
        success: true, 
        postId: safePostId,
      };
    }),

  /**
   * Edit a post
   */
  editPost: protectedProcedure
    .input(z.object({
      postId: z.number(),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Check if user owns the post
      const post = await db
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.id, input.postId))
        .limit(1);

      if (post.length === 0) {
        throw new Error('Post not found');
      }

      if (post[0].userId !== userId) {
        throw new Error('Unauthorized');
      }

      const now = new Date().toISOString();

      await db
        .update(forumPosts)
        .set({
          content: input.content,
          isEdited: 1,
          editedAt: now,
          updatedAt: now,
        })
        .where(eq(forumPosts.id, input.postId));

      return { success: true };
    }),

  /**
   * Like/unlike a post
   */
  togglePostLike: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Check if already liked
      const existing = await db
        .select()
        .from(forumPostLikes)
        .where(
          and(
            eq(forumPostLikes.postId, input.postId),
            eq(forumPostLikes.userId, userId)
          )
        )
        .limit(1);

      const now = new Date().toISOString();

      if (existing.length > 0) {
        // Unlike
        await db
          .delete(forumPostLikes)
          .where(eq(forumPostLikes.id, existing[0].id));

        await db
          .update(forumPosts)
          .set({ likeCount: sql`${forumPosts.likeCount} - 1` })
          .where(eq(forumPosts.id, input.postId));

        return { success: true, liked: false };
      } else {
        // Like
        await db.insert(forumPostLikes).values({
          postId: input.postId,
          userId,
          createdAt: now,
        });

        await db
          .update(forumPosts)
          .set({ likeCount: sql`${forumPosts.likeCount} + 1` })
          .where(eq(forumPosts.id, input.postId));

        // Create notification for post author
        const post = await db
          .select()
          .from(forumPosts)
          .where(eq(forumPosts.id, input.postId))
          .limit(1);

        if (post.length > 0 && post[0].userId !== userId) {
          await db.insert(forumNotifications).values({
            userId: post[0].userId,
            threadId: post[0].threadId,
            postId: input.postId,
            type: 'like',
            isRead: 0,
            createdAt: now,
          });
        }

        return { success: true, liked: true };
      }
    }),

  /**
   * Mark a post as solution
   */
  markAsSolution: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Get post and thread
      const post = await db
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.id, input.postId))
        .limit(1);

      if (post.length === 0) {
        throw new Error('Post not found');
      }

      const thread = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, post[0].threadId))
        .limit(1);

      if (thread.length === 0) {
        throw new Error('Thread not found');
      }

      // Only thread author can mark solution
      if (thread[0].userId !== userId) {
        throw new Error('Only thread author can mark solution');
      }

      const now = new Date().toISOString();

      // Unmark any existing solutions
      await db
        .update(forumPosts)
        .set({ isSolution: 0 })
        .where(eq(forumPosts.threadId, post[0].threadId));

      // Mark this post as solution
      await db
        .update(forumPosts)
        .set({ isSolution: 1, updatedAt: now })
        .where(eq(forumPosts.id, input.postId));

      // Create notification for post author
      if (post[0].userId !== userId) {
        await db.insert(forumNotifications).values({
          userId: post[0].userId,
          threadId: post[0].threadId,
          postId: input.postId,
          type: 'solution_marked',
          isRead: 0,
          createdAt: now,
        });

        // Send email notification
        sendSolutionMarkedEmail({
          recipientId: post[0].userId,
          threadId: post[0].threadId,
          postId: input.postId,
          type: 'solution_marked',
          actorName: ctx.user.name || 'A user',
        }).catch(err => console.error('[Forums] Failed to send email:', err));
      }

      return { success: true };
    }),

  /**
   * Get user's notifications
   */
  getNotifications: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      const notifications = await db
        .select({
          notification: forumNotifications,
          thread: forumThreads,
          post: forumPosts,
        })
        .from(forumNotifications)
        .leftJoin(forumThreads, eq(forumNotifications.threadId, forumThreads.id))
        .leftJoin(forumPosts, eq(forumNotifications.postId, forumPosts.id))
        .where(eq(forumNotifications.userId, userId))
        .orderBy(desc(forumNotifications.createdAt))
        .limit(50);

      return notifications.map(n => ({
        ...n.notification,
        thread: n.thread,
        post: n.post,
      }));
    }),

  /**
   * Mark notification as read
   */
  markNotificationRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      await db
        .update(forumNotifications)
        .set({ isRead: 1 })
        .where(
          and(
            eq(forumNotifications.id, input.notificationId),
            eq(forumNotifications.userId, userId)
          )
        );

      return { success: true };
    }),

  /**
   * Mark all notifications as read
   */
  markAllNotificationsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      await db
        .update(forumNotifications)
        .set({ isRead: 1 })
        .where(eq(forumNotifications.userId, userId));

      return { success: true };
    }),

  /**
   * Delete a thread (only by author or admin)
   */
  deleteThread: protectedProcedure
    .input(z.object({ threadId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const userId = ctx.user.id;

      // Check if user owns the thread
      const thread = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, input.threadId))
        .limit(1);

      if (thread.length === 0) {
        throw new Error('Thread not found');
      }

      if (thread[0].userId !== userId) {
        throw new Error('Unauthorized');
      }

      // Delete all posts
      await db
        .delete(forumPosts)
        .where(eq(forumPosts.threadId, input.threadId));

      // Delete all notifications
      await db
        .delete(forumNotifications)
        .where(eq(forumNotifications.threadId, input.threadId));

      // Delete thread
      await db
        .delete(forumThreads)
        .where(eq(forumThreads.id, input.threadId));

      return { success: true };
    }),

  /**
   * Get forum analytics for instructors/admins
   */
  getForumAnalytics: protectedProcedure
    .input(z.object({
      courseId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Build date filter
      let dateFilter = sql`1=1`;
      if (input.startDate && input.endDate) {
        dateFilter = sql`${forumThreads.createdAt} BETWEEN ${input.startDate} AND ${input.endDate}`;
      }

      // Total threads
      const totalThreadsQuery = db
        .select({ count: count() })
        .from(forumThreads)
        .where(dateFilter)
        .$dynamic();

      if (input.courseId) {
        totalThreadsQuery.where(eq(forumThreads.courseId, input.courseId));
      }

      const totalThreadsResult = await totalThreadsQuery;
      const totalThreads = totalThreadsResult[0]?.count || 0;

      // Total posts
      let postsQuery = db
        .select({ count: count() })
        .from(forumPosts)
        .leftJoin(forumThreads, eq(forumPosts.threadId, forumThreads.id))
        .where(dateFilter)
        .$dynamic();

      if (input.courseId) {
        postsQuery = postsQuery.where(eq(forumThreads.courseId, input.courseId));
      }

      const totalPostsResult = await postsQuery;
      const totalPosts = totalPostsResult[0]?.count || 0;

      // Active threads (with replies)
      let activeThreadsQuery = db
        .select({ count: count() })
        .from(forumThreads)
        .where(and(dateFilter, sql`${forumThreads.replyCount} > 0`))
        .$dynamic();

      if (input.courseId) {
        activeThreadsQuery = activeThreadsQuery.where(eq(forumThreads.courseId, input.courseId));
      }

      const activeThreadsResult = await activeThreadsQuery;
      const activeThreads = activeThreadsResult[0]?.count || 0;

      // Threads with solutions
      let solvedThreadsQuery = db
        .select({ count: sql`COUNT(DISTINCT ${forumThreads.id})` })
        .from(forumThreads)
        .leftJoin(forumPosts, eq(forumPosts.threadId, forumThreads.id))
        .where(and(dateFilter, eq(forumPosts.isSolution, 1)))
        .$dynamic();

      if (input.courseId) {
        solvedThreadsQuery = solvedThreadsQuery.where(eq(forumThreads.courseId, input.courseId));
      }

      const solvedThreadsResult = await solvedThreadsQuery;
      const solvedThreads = Number(solvedThreadsResult[0]?.count) || 0;

      // Average response time (time between thread creation and first reply)
      let avgResponseQuery = db
        .select({
          avgMinutes: sql`AVG(TIMESTAMPDIFF(MINUTE, ${forumThreads.createdAt}, ${forumPosts.createdAt}))`
        })
        .from(forumThreads)
        .leftJoin(
          forumPosts,
          and(
            eq(forumPosts.threadId, forumThreads.id),
            sql`${forumPosts.id} = (SELECT MIN(id) FROM forum_posts WHERE threadId = ${forumThreads.id})`
          )
        )
        .where(dateFilter)
        .$dynamic();

      if (input.courseId) {
        avgResponseQuery = avgResponseQuery.where(eq(forumThreads.courseId, input.courseId));
      }

      const avgResponseResult = await avgResponseQuery;
      const avgResponseTimeMinutes = Number(avgResponseResult[0]?.avgMinutes) || 0;

      // Top contributors (most posts)
      let topContributorsQuery = db
        .select({
          userId: forumPosts.userId,
          userName: users.name,
          postCount: count(),
        })
        .from(forumPosts)
        .leftJoin(users, eq(forumPosts.userId, users.id))
        .leftJoin(forumThreads, eq(forumPosts.threadId, forumThreads.id))
        .where(dateFilter)
        .groupBy(forumPosts.userId, users.name)
        .orderBy(desc(count()))
        .limit(10)
        .$dynamic();

      if (input.courseId) {
        topContributorsQuery = topContributorsQuery.where(eq(forumThreads.courseId, input.courseId));
      }

      const topContributors = await topContributorsQuery;

      // Most active threads
      let mostActiveQuery = db
        .select({
          thread: forumThreads,
          author: {
            id: users.id,
            name: users.name,
          },
        })
        .from(forumThreads)
        .leftJoin(users, eq(forumThreads.userId, users.id))
        .where(dateFilter)
        .orderBy(desc(forumThreads.replyCount))
        .limit(10)
        .$dynamic();

      if (input.courseId) {
        mostActiveQuery = mostActiveQuery.where(eq(forumThreads.courseId, input.courseId));
      }

      const mostActiveThreads = await mostActiveQuery;

      return {
        totalThreads,
        totalPosts,
        activeThreads,
        solvedThreads,
        solutionRate: totalThreads > 0 ? (solvedThreads / totalThreads) * 100 : 0,
        avgResponseTimeMinutes,
        topContributors: topContributors.map(c => ({
          userId: c.userId,
          userName: c.userName,
          postCount: c.postCount,
        })),
        mostActiveThreads: mostActiveThreads.map(t => ({
          ...t.thread,
          author: t.author,
        })),
      };
    }),
});
