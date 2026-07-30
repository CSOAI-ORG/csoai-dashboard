/**
 * Roadmap Automation Service
 * Handles automatic phase progression and email notifications
 */

import { getDb } from '../db';
import { notifications } from '../../drizzle/schema';
import { wsManager } from './websocketManager';
import { sendgridService } from './sendgridService';

interface RoadmapPhase {
  phase: number;
  name: string;
  actions: Array<{
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string | Date;
  }>;
  completedAt?: string | Date;
  estimatedCompletionDate?: string | Date;
}

interface RoadmapData {
  organizationId: string;
  phases: RoadmapPhase[];
  totalHours: number;
  overallProgress: number;
}

export class RoadmapAutomationService {
  constructor() {}

  /**
   * Check and auto-progress phases based on action completion
   */
  public async checkPhaseProgression(roadmap: RoadmapData, userId: number): Promise<RoadmapData> {
    const updatedRoadmap = { ...roadmap };
    let hasChanges = false;

    for (let i = 0; i < updatedRoadmap.phases.length; i++) {
      const phase = updatedRoadmap.phases[i];

      // Skip if phase already completed
      if (phase.completedAt) continue;

      // Calculate completion percentage
      const completedActions = phase.actions.filter((a: any) => a.completed).length;
      const completionPercentage = (completedActions / phase.actions.length) * 100;

      // Auto-complete phase if all actions are done
      if (completionPercentage === 100 && !phase.completedAt) {
        phase.completedAt = new Date().toISOString();
        hasChanges = true;

        // Trigger phase completion event
        await this.handlePhaseCompletion(phase, roadmap.organizationId, userId);

        // Auto-advance to next phase
        if (i + 1 < updatedRoadmap.phases.length) {
          const nextPhase = updatedRoadmap.phases[i + 1];
          if (!nextPhase.completedAt) {
            // Calculate estimated completion for next phase
            nextPhase.estimatedCompletionDate = this.calculateEstimatedCompletion(
              nextPhase.actions.length
            );
          }
        }
      }
    }

    // Update overall progress
    if (hasChanges) {
      updatedRoadmap.overallProgress = this.calculateOverallProgress(updatedRoadmap.phases);

      // Broadcast update via WebSocket
      wsManager.broadcastRoadmapUpdate(updatedRoadmap, parseInt(roadmap.organizationId));
    }

    return updatedRoadmap;
  }

  /**
   * Handle phase completion event
   */
  private async handlePhaseCompletion(
    phase: RoadmapPhase,
    organizationId: string,
    userId: number
  ): Promise<void> {
    console.log(`[Roadmap] Phase ${phase.phase} (${phase.name}) completed`);

    // Create notification
    const notification = {
      userId,
      type: 'report_update' as const,
      title: `Phase ${phase.phase} Complete: ${phase.name}`,
      message: `All actions in "${phase.name}" have been completed. Moving to the next phase.`,
      priority: 'high' as const,
      metadata: {
        phase: phase.phase,
        phaseName: phase.name,
        organizationId,
        completedAt: typeof phase.completedAt === 'string' ? phase.completedAt : phase.completedAt?.toISOString(),
      },
    };

    // Save notification to database
    const db = await getDb();
    if (db) {
      await db.insert(notifications).values(notification);
    }

    // Send email notification (placeholder - would need user email from database)
    try {
      // TODO: Get user email from database
      // await sendgridService.sendPhaseCompletionEmail({
      //   recipientEmail: userEmail,
      //   phaseName: phase.name,
      //   phaseNumber: phase.phase,
      //   completedAt: phase.completedAt!,
      //   organizationName: 'Organization Name',
      //   dashboardUrl: 'https://dashboard.example.com',
      // });
      console.log('[Roadmap] Phase completion email would be sent via SendGrid');
    } catch (error) {
      console.error('[Roadmap] Error sending phase completion email:', error);
    }

    // Broadcast notification via WebSocket
    wsManager.broadcastNotification(notification, userId);
  }

  /**
   * Mark action as completed and check for phase progression
   */
  public async completeAction(
    roadmap: RoadmapData,
    phaseIndex: number,
    actionId: string,
    userId: number
  ): Promise<RoadmapData> {
    if (phaseIndex < 0 || phaseIndex >= roadmap.phases.length) {
      throw new Error('Invalid phase index');
    }

    const phase = roadmap.phases[phaseIndex];
    const action = phase.actions.find((a: any) => a.id === actionId);

    if (!action) {
      throw new Error('Action not found');
    }

    // Mark action as completed
    action.completed = true;
    action.completedAt = new Date().toISOString();

    // Check if phase should be auto-completed
    return this.checkPhaseProgression(roadmap, userId);
  }

  /**
   * Calculate estimated completion date for a phase
   */
  private calculateEstimatedCompletion(actionCount: number): string {
    // Estimate: 2 hours per action on average
    const estimatedHours = actionCount * 2;
    const estimatedDate = new Date();
    estimatedDate.setHours(estimatedDate.getHours() + estimatedHours);
    return estimatedDate.toISOString();
  }

  /**
   * Calculate overall progress percentage
   */
  private calculateOverallProgress(phases: RoadmapPhase[]): number {
    let totalActions = 0;
    let completedActions = 0;

    phases.forEach((phase) => {
      totalActions += phase.actions.length;
      completedActions += phase.actions.filter((a: any) => a.completed).length;
    });

    return totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
  }

  /**
   * Get phase completion timeline
   */
  public getPhaseTimeline(roadmap: RoadmapData): Array<{
    phase: number;
    name: string;
    completedAt?: Date | string;
    estimatedCompletionDate?: Date | string;
    status: 'completed' | 'in_progress' | 'pending';
  }> {
    return roadmap.phases.map((phase, index) => {
      let status: 'completed' | 'in_progress' | 'pending' = 'pending';

      if (phase.completedAt) {
        status = 'completed';
      } else {
        const completedActions = phase.actions.filter((a: any) => a.completed).length;
        if (completedActions > 0) {
          status = 'in_progress';
        }
      }

      return {
        phase: phase.phase,
        name: phase.name,
        completedAt: phase.completedAt,
        estimatedCompletionDate: phase.estimatedCompletionDate,
        status,
      };
    });
  }

  /**
   * Get phase statistics
   */
  public getPhaseStats(phase: RoadmapPhase): {
    totalActions: number;
    completedActions: number;
    completionPercentage: number;
    remainingActions: number;
  } {
    const totalActions = phase.actions.length;
    const completedActions = phase.actions.filter((a: any) => a.completed).length;
    const completionPercentage = (completedActions / totalActions) * 100;
    const remainingActions = totalActions - completedActions;

    return {
      totalActions,
      completedActions,
      completionPercentage: Math.round(completionPercentage),
      remainingActions,
    };
  }
}

export const roadmapAutomation = new RoadmapAutomationService();
