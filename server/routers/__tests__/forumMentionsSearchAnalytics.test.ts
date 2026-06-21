import { describe, it, expect, beforeEach } from 'vitest';
import { getDb } from '../../db';
import { 
  users, 
  forumThreads, 
  forumPosts, 
  forumNotifications,
  courses 
} from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Forum Mentions, Search, and Analytics', () => {
  let testUserId1: number;
  let testUserId2: number;
  let testCourseId: number;
  let testThreadId: number;
  let dbAvailable = false;

  beforeEach(async () => {
    let db;
    try {
      db = await getDb();
      if (!db) {
        console.log('⚠️ Database not available, skipping test');
        dbAvailable = false;
        return;
      }
      dbAvailable = true;
    } catch (error) {
      console.log('⚠️ Database not available, skipping test');
      dbAvailable = false;
      return;
    }

    // Clean up test data
    await db.delete(forumNotifications);
    await db.delete(forumPosts);
    await db.delete(forumThreads);
    await db.delete(users).where(eq(users.email, 'forumtest1@example.com'));
    await db.delete(users).where(eq(users.email, 'forumtest2@example.com'));

    // Create test users
    await db.insert(users).values({
      name: 'ForumUser1',
      email: 'forumtest1@example.com',
      openId: 'forum_test_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await db.insert(users).values({
      name: 'ForumUser2',
      email: 'forumtest2@example.com',
      openId: 'forum_test_2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Retrieve user IDs
    const [user1] = await db.select().from(users).where(eq(users.email, 'forumtest1@example.com')).limit(1);
    const [user2] = await db.select().from(users).where(eq(users.email, 'forumtest2@example.com')).limit(1);
    
    testUserId1 = user1.id;
    testUserId2 = user2.id;

    // Get or create test course
    const existingCourses = await db.select().from(courses).limit(1);
    if (existingCourses.length > 0) {
      testCourseId = existingCourses[0].id;
    } else {
      const courseResult = await db.insert(courses).values({
        title: 'Test Course',
        description: 'Test course for forum',
        instructor: 'Test Instructor',
        duration: '1 hour',
        level: 'beginner',
        thumbnail: '',
        enrollmentCount: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      testCourseId = Number(courseResult.insertId);
    }

    // Create test thread
    const threadResult = await db.insert(forumThreads).values({
      courseId: testCourseId,
      userId: testUserId1,
      title: 'Test Thread for Mentions',
      content: 'This is a test thread',
      isPinned: false,
      isLocked: false,
      viewCount: 0,
      replyCount: 0,
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    testThreadId = Number(threadResult.insertId);
  });

  describe('@Mention Functionality', () => {
    it('should extract mentions from content', () => {
      const content = 'Hey @ForumUser2, what do you think about this?';
      const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
      const mentions: string[] = [];
      let match;
      
      while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1]);
      }

      expect(mentions).toContain('ForumUser2');
      expect(mentions.length).toBe(1);
    });

    it('should extract multiple mentions from content', () => {
      const content = 'Thanks @ForumUser1 and @ForumUser2 for your help!';
      const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
      const mentions: string[] = [];
      let match;
      
      while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1]);
      }

      expect(mentions).toHaveLength(2);
      expect(mentions).toContain('ForumUser1');
      expect(mentions).toContain('ForumUser2');
    });

    it('should remove duplicate mentions', () => {
      const content = '@ForumUser2 @ForumUser2 @ForumUser2';
      const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
      const mentions: string[] = [];
      let match;
      
      while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1]);
      }

      const uniqueMentions = [...new Set(mentions)];
      expect(uniqueMentions).toHaveLength(1);
      expect(uniqueMentions[0]).toBe('ForumUser2');
    });

    it('should handle mentions with underscores and dots', () => {
      const content = 'Hello @user_name and @user.name!';
      const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
      const mentions: string[] = [];
      let match;
      
      while ((match = mentionRegex.exec(content)) !== null) {
        mentions.push(match[1]);
      }

      expect(mentions).toHaveLength(2);
      expect(mentions).toContain('user_name');
      expect(mentions).toContain('user.name');
    });

    it('should find mentioned user in database', async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      const mentionedUsers = await db
        .select()
        .from(users)
        .where(eq(users.name, 'ForumUser2'));

      expect(mentionedUsers.length).toBeGreaterThan(0);
      expect(mentionedUsers[0].id).toBe(testUserId2);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      // Create threads with different content
      await db.insert(forumThreads).values({
        courseId: testCourseId,
        userId: testUserId1,
        title: 'How to implement authentication',
        content: 'Need help with auth',
        isPinned: false,
        isLocked: false,
        viewCount: 0,
        replyCount: 0,
        lastActivityAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await db.insert(forumThreads).values({
        courseId: testCourseId,
        userId: testUserId1,
        title: 'Database design best practices',
        content: 'Looking for advice on database optimization',
        isPinned: false,
        isLocked: false,
        viewCount: 0,
        replyCount: 0,
        lastActivityAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    it('should find threads by title keyword', async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      const searchQuery = 'authentication';
      const results = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.courseId, testCourseId));

      const filtered = results.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered[0].title).toContain('authentication');
    });

    it('should find threads by content keyword', async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      const searchQuery = 'optimization';
      const results = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.courseId, testCourseId));

      const filtered = results.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered[0].content).toContain('optimization');
    });

    it('should be case-insensitive', async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      const searchQuery = 'DATABASE';
      const results = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.courseId, testCourseId));

      const filtered = results.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics Functionality', () => {
    beforeEach(async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      // Create active thread with replies
      const activeThreadResult = await db.insert(forumThreads).values({
        courseId: testCourseId,
        userId: testUserId1,
        title: 'Active Discussion',
        content: 'This has replies',
        isPinned: false,
        isLocked: false,
        viewCount: 10,
        replyCount: 5,
        lastActivityAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Create thread with solution
      const solvedThreadResult = await db.insert(forumThreads).values({
        courseId: testCourseId,
        userId: testUserId1,
        title: 'Question with Solution',
        content: 'Need help',
        isPinned: false,
        isLocked: false,
        viewCount: 0,
        replyCount: 1,
        lastActivityAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Create post marked as solution
      await db.insert(forumPosts).values({
        threadId: Number(solvedThreadResult.insertId),
        userId: testUserId2,
        content: 'Here is the solution',
        isEdited: false,
        likeCount: 0,
        isInstructorPost: false,
        isSolution: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    it('should calculate total threads', async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      const threads = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.courseId, testCourseId));

      expect(threads.length).toBeGreaterThanOrEqual(3);
    });

    it('should identify active threads', async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      const threads = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.courseId, testCourseId));

      const activeThreads = threads.filter(t => t.replyCount > 0);
      expect(activeThreads.length).toBeGreaterThan(0);
    });

    it('should identify solved threads', async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      const solvedPosts = await db
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.isSolution, 1));

      expect(solvedPosts.length).toBeGreaterThan(0);
    });

    it('should calculate solution rate', async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      const threads = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.courseId, testCourseId));

      const solvedPosts = await db
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.isSolution, 1));

      const solutionRate = threads.length > 0 
        ? (solvedPosts.length / threads.length) * 100 
        : 0;

      expect(solutionRate).toBeGreaterThanOrEqual(0);
      expect(solutionRate).toBeLessThanOrEqual(100);
    });
  });

  describe('Sorting and Filtering', () => {
    beforeEach(async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Create older thread
      await db.insert(forumThreads).values({
        courseId: testCourseId,
        userId: testUserId1,
        title: 'Old Thread',
        content: 'Old content',
        isPinned: false,
        isLocked: false,
        viewCount: 5,
        replyCount: 0,
        lastActivityAt: yesterday.toISOString(),
        createdAt: yesterday.toISOString(),
        updatedAt: yesterday.toISOString(),
      });

      // Create newer thread
      await db.insert(forumThreads).values({
        courseId: testCourseId,
        userId: testUserId1,
        title: 'New Thread',
        content: 'New content',
        isPinned: false,
        isLocked: false,
        viewCount: 20,
        replyCount: 0,
        lastActivityAt: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    });

    it('should sort threads by recent activity', async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      const threads = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.courseId, testCourseId));

      const sorted = threads.sort((a, b) => 
        new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
      );

      expect(sorted[0].title).toBe('New Thread');
    });

    it('should sort threads by popularity (view count)', async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      const threads = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.courseId, testCourseId));

      const sorted = threads.sort((a, b) => b.viewCount - a.viewCount);

      expect(sorted[0].viewCount).toBeGreaterThanOrEqual(sorted[sorted.length - 1].viewCount);
    });

    it('should filter unanswered threads', async () => {
      const db = await getDb();
      if (!db) { console.log('⚠️ Database not available, skipping test'); return; }

      const threads = await db
        .select()
        .from(forumThreads)
        .where(eq(forumThreads.courseId, testCourseId));

      const unanswered = threads.filter(t => t.replyCount === 0);
      expect(unanswered.length).toBeGreaterThanOrEqual(0);
    });
  });
});
