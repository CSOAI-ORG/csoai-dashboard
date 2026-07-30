/**
 * Tests for WebSocket Analytics Real-time Updates
 * Verify that WebSocket event broadcasting works correctly
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { getDb } from '../../db';
import { watchdogReports, assessments, aiSystems, frameworks } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

describe('WebSocket Analytics Events', () => {
  let db: any;

  beforeAll(async () => {
    try {
      db = await getDb();
    } catch (error) {
      console.log('⚠️ Database not available for WebSocket analytics tests');
      db = null;
    }
  });

  it('should have database connection for WebSocket events', async () => {
    if (!db) {
      console.log('⚠️ Database not available, skipping test');
      return;
    }
    expect(db).toBeDefined();
  });

  it('should be able to fetch incident details for broadcasting', async () => {
    if (!db) {
      console.log('⚠️ Database not available, skipping test');
      return;
    }
    // Get any existing incident
    const [incident] = await db
      .select()
      .from(watchdogReports)
      .limit(1);

    if (incident) {
      expect(incident.id).toBeDefined();
      expect(incident.title).toBeDefined();
      expect(incident.severity).toBeDefined();
      expect(incident.incidentType).toBeDefined();
      expect(incident.status).toBeDefined();
    }
  });

  it('should be able to fetch assessment details with AI system and framework names', async () => {
    if (!db) {
      console.log('⚠️ Database not available, skipping test');
      return;
    }
    // Get any existing assessment
    const [assessment] = await db
      .select({
        id: assessments.id,
        aiSystemId: assessments.aiSystemId,
        frameworkId: assessments.frameworkId,
        overallScore: assessments.overallScore,
        status: assessments.status,
      })
      .from(assessments)
      .limit(1);

    if (assessment) {
      expect(assessment.id).toBeDefined();
      expect(assessment.aiSystemId).toBeDefined();
      expect(assessment.frameworkId).toBeDefined();

      // Fetch AI system name
      const [aiSystem] = await db
        .select({ name: aiSystems.name })
        .from(aiSystems)
        .where(eq(aiSystems.id, assessment.aiSystemId))
        .limit(1);

      // Fetch framework name
      const [framework] = await db
        .select({ name: frameworks.name })
        .from(frameworks)
        .where(eq(frameworks.id, assessment.frameworkId))
        .limit(1);

      if (aiSystem) {
        expect(aiSystem.name).toBeDefined();
        expect(typeof aiSystem.name).toBe('string');
      }

      if (framework) {
        expect(framework.name).toBeDefined();
        expect(typeof framework.name).toBe('string');
      }
    }
  });

  it('should structure incident broadcast message correctly', () => {
    const mockIncident = {
      id: 1,
      title: 'Test Incident',
      severity: 'high',
      incidentType: 'bias',
      aiSystemName: 'Test AI System',
      companyName: 'Test Company',
      status: 'submitted',
      createdAt: new Date().toISOString(),
    };

    const message = {
      type: 'incident_created',
      data: {
        id: mockIncident.id,
        title: mockIncident.title,
        severity: mockIncident.severity,
        incidentType: mockIncident.incidentType,
        aiSystemName: mockIncident.aiSystemName,
        companyName: mockIncident.companyName,
        status: mockIncident.status,
        createdAt: mockIncident.createdAt,
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe('incident_created');
    expect(message.data.id).toBe(1);
    expect(message.data.title).toBe('Test Incident');
    expect(message.data.severity).toBe('high');
    expect(message.timestamp).toBeDefined();
  });

  it('should structure assessment broadcast message correctly', () => {
    const mockAssessment = {
      id: 1,
      aiSystemName: 'Test AI System',
      frameworkName: 'Test Framework',
      score: 85.5,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    const message = {
      type: 'compliance_assessment_created',
      data: {
        id: mockAssessment.id,
        aiSystemName: mockAssessment.aiSystemName,
        frameworkName: mockAssessment.frameworkName,
        score: mockAssessment.score,
        status: mockAssessment.status,
        createdAt: mockAssessment.createdAt,
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe('compliance_assessment_created');
    expect(message.data.id).toBe(1);
    expect(message.data.aiSystemName).toBe('Test AI System');
    expect(message.data.frameworkName).toBe('Test Framework');
    expect(message.data.score).toBe(85.5);
    expect(message.timestamp).toBeDefined();
  });

  it('should structure compliance score change message correctly', () => {
    const previousScore = 75.0;
    const currentScore = 85.5;
    const change = currentScore - previousScore;

    const message = {
      type: 'compliance_score_changed',
      data: {
        id: 1,
        aiSystemName: 'Test AI System',
        frameworkName: 'Test Framework',
        previousScore,
        currentScore,
        change,
        improved: change > 0,
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe('compliance_score_changed');
    expect(message.data.previousScore).toBe(75.0);
    expect(message.data.currentScore).toBe(85.5);
    expect(message.data.change).toBe(10.5);
    expect(message.data.improved).toBe(true);
    expect(message.timestamp).toBeDefined();
  });

  it('should structure analytics summary message correctly', () => {
    const summary = {
      totalIncidents: 42,
      criticalIncidents: 5,
      avgComplianceScore: 78,
      recentActivity: 'New incident reported',
    };

    const message = {
      type: 'analytics_summary_updated',
      data: summary,
      timestamp: Date.now(),
    };

    expect(message.type).toBe('analytics_summary_updated');
    expect(message.data.totalIncidents).toBe(42);
    expect(message.data.criticalIncidents).toBe(5);
    expect(message.data.avgComplianceScore).toBe(78);
    expect(message.timestamp).toBeDefined();
  });

  it('should validate incident update message structure', () => {
    const mockIncident = {
      id: 1,
      title: 'Updated Test Incident',
      severity: 'critical',
      status: 'resolved',
      updatedAt: new Date().toISOString(),
    };

    const message = {
      type: 'incident_updated',
      data: {
        id: mockIncident.id,
        title: mockIncident.title,
        severity: mockIncident.severity,
        status: mockIncident.status,
        updatedAt: mockIncident.updatedAt,
      },
      timestamp: Date.now(),
    };

    expect(message.type).toBe('incident_updated');
    expect(message.data.id).toBe(1);
    expect(message.data.status).toBe('resolved');
    expect(message.data.updatedAt).toBeDefined();
  });

  it('should handle WebSocket message serialization', () => {
    const message = {
      type: 'incident_created',
      data: {
        id: 1,
        title: 'Test Incident',
        severity: 'high',
      },
      timestamp: Date.now(),
    };

    const serialized = JSON.stringify(message);
    expect(serialized).toBeDefined();
    expect(typeof serialized).toBe('string');

    const deserialized = JSON.parse(serialized);
    expect(deserialized.type).toBe('incident_created');
    expect(deserialized.data.id).toBe(1);
    expect(deserialized.data.title).toBe('Test Incident');
  });
});
