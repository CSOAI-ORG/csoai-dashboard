import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { appRouter } from '../routers';
import type { TrpcContext } from '../_core/context';
import { getDb } from '../db';
const db = getDb();
import { emailTemplates } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

function createTestContext(): TrpcContext {
  return {
    user: {
      id: 1,
      email: 'admin@test.com',
      name: 'Admin User',
      role: 'admin',
      openId: 'test_admin',
      brand: 'councilof.ai',
      password: null,
      loginMethod: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSignedIn: new Date().toISOString(),
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionTier: 'free',
      subscriptionStatus: 'none',
      foundingMember: 0,
      referralCode: null,
      payoutFrequency: 'monthly',
      lastPayoutDate: null,
      stripeConnectAccountId: null,
    },
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext['res'],
  };
}

describe('Email Templates Router', () => {
  const ctx = createTestContext();
  const caller = appRouter.createCaller(ctx);
  let testTemplateId: number;

  beforeAll(async () => {
    // Clean up any existing test data
    await db.delete(emailTemplates).where(eq(emailTemplates.key, 'test-template'));
  });

  afterAll(async () => {
    // Clean up test data
    if (testTemplateId) {
      await db.delete(emailTemplates).where(eq(emailTemplates.id, testTemplateId));
    }
  });

  describe('create', () => {
    it('should create a new email template', async () => {
      const result = await caller.emailTemplates.create({
        name: 'Test Welcome Email',
        key: 'test-template',
        subject: 'Welcome {{firstName}}!',
        htmlContent: '<h1>Welcome {{firstName}} {{lastName}}</h1><p>Your email is {{email}}</p>',
        textContent: 'Welcome {{firstName}} {{lastName}}! Your email is {{email}}',
        category: 'welcome',
        status: 'active',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Test Welcome Email');
      expect(result.key).toBe('test-template');
      expect(result.category).toBe('welcome');
      expect(result.status).toBe('active');
      
      testTemplateId = result.id;
    });

    it('should fail to create template with duplicate key', async () => {
      await expect(
        caller.emailTemplates.create({
          name: 'Duplicate Template',
          key: 'test-template', // Same key
          subject: 'Test',
          htmlContent: '<p>Test</p>',
          textContent: 'Test',
          category: 'notification',
          status: 'active',
        })
      ).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list all templates', async () => {
      const result = await caller.emailTemplates.list({});

      expect(result).toBeDefined();
      expect(result.templates).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThan(0);
      
      const testTemplate = result.templates.find(t => t.key === 'test-template');
      expect(testTemplate).toBeDefined();
    });

    it('should filter templates by category', async () => {
      const result = await caller.emailTemplates.list({ category: 'welcome' });

      expect(result.templates.every(t => t.category === 'welcome')).toBe(true);
    });

    it('should filter templates by status', async () => {
      const result = await caller.emailTemplates.list({ status: 'active' });

      expect(result.templates.every(t => t.status === 'active')).toBe(true);
    });

    it('should search templates by name', async () => {
      const result = await caller.emailTemplates.list({ search: 'Test Welcome' });

      expect(result.templates.length).toBeGreaterThan(0);
      expect(result.templates.some(t => t.name.includes('Test Welcome'))).toBe(true);
    });
  });

  describe('getById', () => {
    it('should get template by id', async () => {
      const result = await caller.emailTemplates.getById({ id: testTemplateId });

      expect(result).toBeDefined();
      expect(result.id).toBe(testTemplateId);
      expect(result.name).toBe('Test Welcome Email');
      expect(result.key).toBe('test-template');
    });

    it('should throw error for non-existent template', async () => {
      await expect(
        caller.emailTemplates.getById({ id: 999999 })
      ).rejects.toThrow('Template not found');
    });
  });

  describe('getByKey', () => {
    it('should get template by key', async () => {
      const result = await caller.emailTemplates.getByKey({ key: 'test-template' });

      expect(result).toBeDefined();
      expect(result.id).toBe(testTemplateId);
      expect(result.key).toBe('test-template');
    });

    it('should throw error for non-existent key', async () => {
      await expect(
        caller.emailTemplates.getByKey({ key: 'non-existent-key' })
      ).rejects.toThrow('Template not found');
    });
  });

  describe('update', () => {
    it('should update template details', async () => {
      const result = await caller.emailTemplates.update({
        id: testTemplateId,
        name: 'Updated Welcome Email',
        subject: 'Hello {{firstName}}!',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Welcome Email');
      expect(result.subject).toBe('Hello {{firstName}}!');
      expect(result.key).toBe('test-template'); // Unchanged
    });
  });

  describe('validateMergeTags', () => {
    it('should validate merge tags in template', async () => {
      const result = await caller.emailTemplates.validateMergeTags({
        subject: 'Hello {{firstName}}!',
        htmlContent: '<p>Welcome {{firstName}} {{lastName}}</p>',
        textContent: 'Welcome {{firstName}} {{lastName}}',
      });

      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
      expect(result.tags).toContain('firstName');
      expect(result.tags).toContain('lastName');
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid merge tags', async () => {
      const result = await caller.emailTemplates.validateMergeTags({
        subject: 'Hello {{firstName}!', // Missing closing brace
        htmlContent: '<p>Welcome {{invalidTag}}</p>',
        textContent: 'Test',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('preview', () => {
    it('should preview template with sample data', async () => {
      const result = await caller.emailTemplates.preview({
        id: testTemplateId,
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
        },
      });

      expect(result).toBeDefined();
      expect(result.subject).toContain('John');
      expect(result.htmlContent).toContain('John');
      expect(result.htmlContent).toContain('Doe');
      expect(result.textContent).toContain('John');
      expect(result.textContent).toContain('Doe');
    });
  });

  describe('duplicate', () => {
    it('should duplicate an existing template', async () => {
      const result = await caller.emailTemplates.duplicate({
        id: testTemplateId,
        newName: 'Copy of Welcome Email',
        newKey: 'test-template-copy',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Copy of Welcome Email');
      expect(result.key).toBe('test-template-copy');
      expect(result.subject).toBe('Hello {{firstName}}!'); // Same as original
      
      // Clean up the duplicate
      await db.delete(emailTemplates).where(eq(emailTemplates.id, result.id));
    });
  });

  describe('delete', () => {
    it('should delete template', async () => {
      const result = await caller.emailTemplates.delete({ id: testTemplateId });

      expect(result.success).toBe(true);
      
      // Verify template was deleted
      await expect(
        caller.emailTemplates.getById({ id: testTemplateId })
      ).rejects.toThrow('Template not found');
      
      testTemplateId = 0; // Prevent cleanup from trying to delete again
    });
  });
});
