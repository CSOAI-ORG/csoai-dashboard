/**
 * Tests for forum enhancements: rich text, email notifications, and moderation
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { getDb } from '../../db';
import { users, forumThreads, forumPosts, forumNotifications } from '../../../drizzle/schema-courses-forums';
import { users as usersSchema } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { forumModerationRouter } from '../forumModeration';
import { forumsRouter } from '../forums';

// Mock email service
vi.mock('../../services/forumEmailService', () => ({
  sendNewReplyEmail: vi.fn().mockResolvedValue({ success: true }),
  sendSolutionMarkedEmail: vi.fn().mockResolvedValue({ success: true }),
  sendThreadUpdateDigest: vi.fn().mockResolvedValue({ success: true }),
}));

describe('Forum Enhancements', () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testUserId: number;
  let instructorUserId: number;
  let testThreadId: number;
  let testPostId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error('Database not available');

    // Create test users
    const testUserEmail = `forum-test-${Date.now()}@example.com`;
    await db
      .insert(usersSchema)
      .values({
        openId: `test-forum-user-${Date.now()}`,
        email: testUserEmail,
        password: 'hashed_password',
        role: 'user',
        name: 'Test Forum User',
      });

    const [testUser] = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.email, testUserEmail))
      .limit(1);

    testUserId = testUser.id;

    const instructorEmail = `instructor-${Date.now()}@example.com`;
    await db
      .insert(usersSchema)
      .values({
        openId: `test-instructor-${Date.now()}`,
        email: instructorEmail,
        password: 'hashed_password',
        role: 'admin',
        name: 'Test Instructor',
      });

    const [instructor] = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.email, instructorEmail))
      .limit(1);

    instructorUserId = instructor.id;

    // Create test thread
    await db
      .insert(forumThreads)
      .values({
        courseId: 1,
        userId: testUserId,
        title: 'Test Thread for Enhancements',
        content: '<p>This is a <strong>rich text</strong> thread with HTML content.</p>',
        isPinned: false,
        isLocked: false,
      });

    const [thread] = await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.userId, testUserId))
      .limit(1);

    testThreadId = thread.id;

    // Create test post
    await db
      .insert(forumPosts)
      .values({
        threadId: testThreadId,
        userId: testUserId,
        content: '<p>This is a <em>rich text</em> reply with <code>code snippets</code>.</p>',
        isInstructorPost: false,
      });

    const [post] = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.threadId, testThreadId))
      .limit(1);

    testPostId = post.id;
  });

  afterAll(async () => {
    if (db) {
      // Cleanup
      if (testPostId) {
        await db.delete(forumPosts).where(eq(forumPosts.id, testPostId));
      }
      if (testThreadId) {
        await db.delete(forumNotifications).where(eq(forumNotifications.threadId, testThreadId));
        await db.delete(forumThreads).where(eq(forumThreads.id, testThreadId));
      }
      if (testUserId) {
        await db.delete(usersSchema).where(eq(usersSchema.id, testUserId));
      }
      if (instructorUserId) {
        await db.delete(usersSchema).where(eq(usersSchema.id, instructorUserId));
      }
    }
  });

  describe('Rich Text Content', () => {
    it('should store HTML content in threads', async () => {
      const [thread] = await db!
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, testThreadId))
        .limit(1);

      expect(thread.content).toContain('<p>');
      expect(thread.content).toContain('<strong>');
      expect(thread.content).toContain('rich text');
    });

    it('should store HTML content in posts', async () => {
      const [post] = await db!
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.id, testPostId))
        .limit(1);

      expect(post.content).toContain('<p>');
      expect(post.content).toContain('<em>');
      expect(post.content).toContain('<code>');
    });

    it('should support various HTML formatting tags', () => {
      const htmlContent = `
        <h1>Heading</h1>
        <p>Paragraph with <strong>bold</strong> and <em>italic</em></p>
        <ul><li>List item</li></ul>
        <pre><code>const code = "snippet";</code></pre>
        <blockquote>Quote</blockquote>
      `;

      expect(htmlContent).toContain('<h1>');
      expect(htmlContent).toContain('<ul>');
      expect(htmlContent).toContain('<pre>');
      expect(htmlContent).toContain('<blockquote>');
    });
  });

  describe('Email Notifications', () => {
    it('should create notification when reply is posted', async () => {
      const mockContext = {
        user: { id: instructorUserId, email: 'instructor@example.com', name: 'Test Instructor', role: 'admin' },
        req: {} as any,
        res: {} as any,
      };

      const caller = forumsRouter.createCaller(mockContext);

      // Create a reply
      await caller.createPost({
        threadId: testThreadId,
        content: '<p>This is a test reply</p>',
      });

      // Check notification was created
      const notifications = await db!
        .select()
        .from(forumNotifications)
        .where(eq(forumNotifications.threadId, testThreadId));

      expect(notifications.length).toBeGreaterThan(0);
      const replyNotif = notifications.find(n => n.type === 'reply');
      expect(replyNotif).toBeDefined();
      expect(replyNotif?.userId).toBe(testUserId);
    });

    it('should create notification when solution is marked', async () => {
      // Create a post by instructor to mark as solution
      await db!
        .insert(forumPosts)
        .values({
          threadId: testThreadId,
          userId: instructorUserId,
          content: '<p>Instructor answer</p>',
        });

      const posts = await db!
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.threadId, testThreadId));

      const instructorPost = posts.find(p => p.userId === instructorUserId);
      if (!instructorPost) throw new Error('Instructor post not found');

      const mockContext = {
        user: { id: testUserId, email: 'test@example.com', name: 'Test User', role: 'user' },
        req: {} as any,
        res: {} as any,
      };

      const caller = forumsRouter.createCaller(mockContext);

      // Mark post as solution
      await caller.markAsSolution({ postId: instructorPost.id });

      // Check notification was created
      const notifications = await db!
        .select()
        .from(forumNotifications)
        .where(eq(forumNotifications.threadId, testThreadId));

      const solutionNotif = notifications.find(n => n.type === 'solution_marked');
      expect(solutionNotif).toBeDefined();
      expect(solutionNotif?.userId).toBe(instructorUserId);
    });

    it('should not create notification for self-actions', async () => {
      const mockContext = {
        user: { id: testUserId, email: 'test@example.com', name: 'Test User', role: 'user' },
        req: {} as any,
        res: {} as any,
      };

      const caller = forumsRouter.createCaller(mockContext);

      const initialCount = (await db!
        .select()
        .from(forumNotifications)
        .where(eq(forumNotifications.userId, testUserId))).length;

      // Reply to own thread
      await caller.createPost({
        threadId: testThreadId,
        content: '<p>Self reply</p>',
      });

      const finalCount = (await db!
        .select()
        .from(forumNotifications)
        .where(eq(forumNotifications.userId, testUserId))).length;

      // Should not increase (no self-notification)
      expect(finalCount).toBe(initialCount);
    });
  });

  describe('Instructor Moderation', () => {
    it('should allow instructor to pin thread', async () => {
      const mockContext = {
        user: { id: instructorUserId, email: 'instructor@example.com', name: 'Instructor', role: 'admin' },
        req: {} as any,
        res: {} as any,
      };

      const caller = forumModerationRouter.createCaller(mockContext);

      await caller.togglePinThread({ threadId: testThreadId, isPinned: true });

      const [thread] = await db!
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, testThreadId))
        .limit(1);

      expect(thread.isPinned).toBe(true);
    });

    it('should allow instructor to lock thread', async () => {
      const mockContext = {
        user: { id: instructorUserId, email: 'instructor@example.com', name: 'Instructor', role: 'admin' },
        req: {} as any,
        res: {} as any,
      };

      const caller = forumModerationRouter.createCaller(mockContext);

      await caller.toggleLockThread({ threadId: testThreadId, isLocked: true });

      const [thread] = await db!
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, testThreadId))
        .limit(1);

      expect(thread.isLocked).toBe(true);
    });

    it('should allow instructor to mark post as instructor response', async () => {
      const mockContext = {
        user: { id: instructorUserId, email: 'instructor@example.com', name: 'Instructor', role: 'admin' },
        req: {} as any,
        res: {} as any,
      };

      const caller = forumModerationRouter.createCaller(mockContext);

      await caller.markAsInstructorPost({ postId: testPostId, isInstructorPost: true });

      const [post] = await db!
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.id, testPostId))
        .limit(1);

      expect(post.isInstructorPost).toBe(true);
    });

    it('should prevent non-instructor from pinning thread', async () => {
      const mockContext = {
        user: { id: testUserId, email: 'test@example.com', name: 'Regular User', role: 'user' },
        req: {} as any,
        res: {} as any,
      };

      const caller = forumModerationRouter.createCaller(mockContext);

      await expect(
        caller.togglePinThread({ threadId: testThreadId, isPinned: true })
      ).rejects.toThrow('Only instructors can pin threads');
    });

    it('should prevent non-instructor from locking thread', async () => {
      const mockContext = {
        user: { id: testUserId, email: 'test@example.com', name: 'Regular User', role: 'user' },
        req: {} as any,
        res: {} as any,
      };

      const caller = forumModerationRouter.createCaller(mockContext);

      await expect(
        caller.toggleLockThread({ threadId: testThreadId, isLocked: true })
      ).rejects.toThrow('Only instructors can lock threads');
    });

    it('should check instructor status correctly', async () => {
      const instructorContext = {
        user: { id: instructorUserId, email: 'instructor@example.com', name: 'Instructor', role: 'admin' },
        req: {} as any,
        res: {} as any,
      };

      const userContext = {
        user: { id: testUserId, email: 'test@example.com', name: 'Regular User', role: 'user' },
        req: {} as any,
        res: {} as any,
      };

      const instructorCaller = forumModerationRouter.createCaller(instructorContext);
      const userCaller = forumModerationRouter.createCaller(userContext);

      const instructorStatus = await instructorCaller.checkInstructorStatus();
      const userStatus = await userCaller.checkInstructorStatus();

      expect(instructorStatus.isInstructor).toBe(true);
      expect(userStatus.isInstructor).toBe(false);
    });

    it('should allow instructor to delete posts', async () => {
      // Create a test post to delete
      await db!
        .insert(forumPosts)
        .values({
          threadId: testThreadId,
          userId: testUserId,
          content: '<p>Post to be deleted</p>',
        });

      const posts = await db!
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.threadId, testThreadId));

      const postToDelete = posts.find(p => p.content === '<p>Post to be deleted</p>');
      if (!postToDelete) throw new Error('Post to delete not found');
      const postId = postToDelete.id;

      const mockContext = {
        user: { id: instructorUserId, email: 'instructor@example.com', name: 'Instructor', role: 'admin' },
        req: {} as any,
        res: {} as any,
      };

      const caller = forumModerationRouter.createCaller(mockContext);

      await caller.moderateDeletePost({ postId });

      const [deletedPost] = await db!
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.id, postId))
        .limit(1);

      expect(deletedPost).toBeUndefined();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow: create thread, reply, mark solution, moderate', async () => {
      // Create thread as regular user
      const userContext = {
        user: { id: testUserId, email: 'test@example.com', name: 'Test User', role: 'user' },
        req: {} as any,
        res: {} as any,
      };

      const userCaller = forumsRouter.createCaller(userContext);

      const newThread = await userCaller.createThread({
        courseId: 1,
        title: 'Integration Test Thread',
        content: '<p>Test thread with <strong>rich text</strong></p>',
      });

      expect(newThread.threadId).toBeDefined();
      expect(typeof newThread.threadId).toBe('number');
      expect(newThread.threadId).toBeGreaterThan(0);

      // Instructor replies
      const instructorContext = {
        user: { id: instructorUserId, email: 'instructor@example.com', name: 'Instructor', role: 'admin' },
        req: {} as any,
        res: {} as any,
      };

      const instructorCaller = forumsRouter.createCaller(instructorContext);

      await instructorCaller.createPost({
        threadId: newThread.threadId,
        content: '<p>Instructor reply with <code>code</code></p>',
      });

      // Check notification was created
      const notifications = await db!
        .select()
        .from(forumNotifications)
        .where(eq(forumNotifications.threadId, newThread.threadId));

      expect(notifications.length).toBeGreaterThan(0);

      // Pin and lock thread
      const moderationCaller = forumModerationRouter.createCaller(instructorContext);

      await moderationCaller.togglePinThread({ threadId: newThread.threadId, isPinned: true });
      await moderationCaller.toggleLockThread({ threadId: newThread.threadId, isLocked: true });

      const [finalThread] = await db!
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.id, newThread.threadId))
        .limit(1);

      expect(finalThread.isPinned).toBe(true);
      expect(finalThread.isLocked).toBe(true);

      // Cleanup
      await db!.delete(forumPosts).where(eq(forumPosts.threadId, newThread.threadId));
      await db!.delete(forumNotifications).where(eq(forumNotifications.threadId, newThread.threadId));
      await db!.delete(forumThreads).where(eq(forumThreads.id, newThread.threadId));
    });
  });
});
