/**
 * Workflow Builder Router Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { appRouter } from '../../routers';
import { getDb } from '../../db';
import { emailWorkflows } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('Workflow Builder Router', () => {
  const mockUser = {
    id: 1,
    openId: 'test-user',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin' as const,
  };

  const mockContext = {
    user: mockUser,
    req: {} as any,
    res: {} as any,
  };

  beforeEach(async () => {
    // Clean up test data
    const db = await getDb();
    if (db) {
      await db.delete(emailWorkflows).where(eq(emailWorkflows.userId, mockUser.id));
    }
  });

  describe('createWorkflow', () => {
    it('should create a new workflow', async () => {
      const caller = appRouter.createCaller(mockContext);

      const result = await caller.workflowBuilder.createWorkflow({
        name: 'Welcome Email Series',
        description: 'Automated welcome emails for new students',
        triggerType: 'cohort_join',
        workflowData: {
          nodes: [
            { id: 'trigger-1', type: 'trigger', position: { x: 0, y: 0 }, data: { label: 'Student joins cohort' } },
            { id: 'email-1', type: 'sendEmail', position: { x: 200, y: 0 }, data: { label: 'Send welcome email' } },
          ],
          edges: [{ id: 'e1', source: 'trigger-1', target: 'email-1' }],
        },
        isActive: false,
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeGreaterThan(0);
    });

    it('should fail without a name', async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.workflowBuilder.createWorkflow({
          name: '',
          triggerType: 'manual',
          workflowData: { nodes: [], edges: [] },
          isActive: false,
        })
      ).rejects.toThrow();
    });
  });

  describe('getWorkflows', () => {
    it('should return all workflows for the user', async () => {
      const caller = appRouter.createCaller(mockContext);

      // Create test workflows
      await caller.workflowBuilder.createWorkflow({
        name: 'Workflow 1',
        triggerType: 'manual',
        workflowData: { nodes: [], edges: [] },
        isActive: false,
      });

      await caller.workflowBuilder.createWorkflow({
        name: 'Workflow 2',
        triggerType: 'enrollment',
        workflowData: { nodes: [], edges: [] },
        isActive: true,
      });

      const workflows = await caller.workflowBuilder.getWorkflows();

      expect(workflows).toHaveLength(2);
      expect(workflows.some(w => w.name === 'Workflow 1')).toBe(true);
      expect(workflows.some(w => w.name === 'Workflow 2')).toBe(true);
    });
  });

  describe('updateWorkflow', () => {
    it('should update workflow properties', async () => {
      const caller = appRouter.createCaller(mockContext);

      const created = await caller.workflowBuilder.createWorkflow({
        name: 'Original Name',
        triggerType: 'manual',
        workflowData: { nodes: [], edges: [] },
        isActive: false,
      });

      await caller.workflowBuilder.updateWorkflow({
        id: created.id,
        name: 'Updated Name',
        description: 'New description',
        isActive: true,
      });

      const workflows = await caller.workflowBuilder.getWorkflows();
      const updated = workflows.find(w => w.id === created.id);

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('New description');
      expect(!!updated?.isActive).toBe(true);
    });
  });

  describe('deleteWorkflow', () => {
    it('should delete a workflow', async () => {
      const caller = appRouter.createCaller(mockContext);

      const created = await caller.workflowBuilder.createWorkflow({
        name: 'To Be Deleted',
        triggerType: 'manual',
        workflowData: { nodes: [], edges: [] },
        isActive: false,
      });

      await caller.workflowBuilder.deleteWorkflow({ id: created.id });

      const workflows = await caller.workflowBuilder.getWorkflows();
      const deleted = workflows.find(w => w.id === created.id);

      expect(deleted).toBeUndefined();
    });
  });

  describe('toggleWorkflow', () => {
    it('should toggle workflow active status', async () => {
      const caller = appRouter.createCaller(mockContext);

      const created = await caller.workflowBuilder.createWorkflow({
        name: 'Toggle Test',
        triggerType: 'manual',
        workflowData: { nodes: [], edges: [] },
        isActive: false,
      });

      // Activate
      await caller.workflowBuilder.toggleWorkflow({ id: created.id, isActive: true });
      let workflows = await caller.workflowBuilder.getWorkflows();
      let workflow = workflows.find(w => w.id === created.id);
      expect(workflow?.isActive).toBeTruthy();

      // Deactivate
      await caller.workflowBuilder.toggleWorkflow({ id: created.id, isActive: false });
      workflows = await caller.workflowBuilder.getWorkflows();
      workflow = workflows.find(w => w.id === created.id);
      expect(workflow?.isActive).toBeFalsy();
    });
  });
});
