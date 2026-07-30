import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from '../../routers';
import { getDb } from '../../db';
import { users, courses, forumThreads, forumPosts } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { createMockContext } from './testHelpers';

describe('Forums Router', () => {
  let testUserId: number;
  let testCourseId: number;
  let testThreadId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    // Create test user
    const userResult = await db.insert(users).values({
      openId: `test-openid-forum-${Date.now()}`,
      name: 'Test User Forum',
      email: `test-forum-${Date.now()}@example.com`,
      password: 'hashed_password',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    testUserId = Number((userResult as any)[0]?.insertId ?? (userResult as any).insertId);

    // Create test course
    const courseResult = await db.insert(courses).values({
      regionId: 1,
      title: 'Test Course for Forums',
      description: 'Test course description',
      framework: 'EU AI Act',
      level: 'fundamentals',
      durationHours: 10,
      price: 0,
      modules: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    testCourseId = Number((courseResult as any)[0]?.insertId ?? (courseResult as any).insertId);
  });

  it('should create a new thread', async () => {
    const caller = appRouter.createCaller(createMockContext({
      id: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    }));

    const result = await caller.forums.createThread({
      courseId: testCourseId,
      title: 'Test Discussion Thread',
      content: 'This is a test thread content for discussion.',
    });

    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('threadId');
    testThreadId = result.threadId;
  });

  it('should get course threads', async () => {
    const caller = appRouter.createCaller(createMockContext({
      id: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    }));

    const result = await caller.forums.getCourseThreads({
      courseId: testCourseId,
      sortBy: 'recent',
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).toHaveProperty('content');
  });

  it('should get thread details', async () => {
    const caller = appRouter.createCaller(createMockContext({
      id: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    }));

    const result = await caller.forums.getThread({ threadId: testThreadId });

    expect(result).toBeDefined();
    expect(result.id).toBe(testThreadId);
    expect(result.title).toBe('Test Discussion Thread');
    expect(result).toHaveProperty('posts');
  });

  it('should create a post in thread', async () => {
    const caller = appRouter.createCaller(createMockContext({
      id: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    }));

    const result = await caller.forums.createPost({
      threadId: testThreadId,
      content: 'This is a test reply to the thread.',
    });

    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('postId');

    // Verify post was created
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const posts = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.threadId, testThreadId));

    expect(posts.length).toBeGreaterThan(0);
  });

  it('should toggle post like', async () => {
    const caller = appRouter.createCaller(createMockContext({
      id: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    }));

    // Get a post to like
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const posts = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.threadId, testThreadId))
      .limit(1);

    if (posts.length === 0) {
      throw new Error('No posts found to test like');
    }

    const postId = posts[0].id;

    // Like the post
    const result = await caller.forums.togglePostLike({ postId });

    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('liked');
  });

  it('should filter threads by sort option', async () => {
    const caller = appRouter.createCaller(createMockContext({
      id: testUserId,
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    }));

    // Test different sort options
    const recentThreads = await caller.forums.getCourseThreads({
      courseId: testCourseId,
      sortBy: 'recent',
    });

    const popularThreads = await caller.forums.getCourseThreads({
      courseId: testCourseId,
      sortBy: 'popular',
    });

    expect(Array.isArray(recentThreads)).toBe(true);
    expect(Array.isArray(popularThreads)).toBe(true);
  });
});
