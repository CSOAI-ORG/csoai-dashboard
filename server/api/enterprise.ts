import { Router, Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import type {
  ComplianceCheckResponse,
  AuditResponse,
  WebhookSubscription,
} from "../../shared/types";
import { authenticateEnterprise } from "./enterpriseAuth";
import { getDb } from "../db";
import { aiSystems, assessments, frameworks } from "../../drizzle/schema";

const router = Router();

router.use(authenticateEnterprise);

// ============================================================================
// COMPLIANCE CHECK ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/compliance/status/:systemId
 * Get compliance status for a specific AI system owned by the API key user.
 */
router.get("/compliance/status/:systemId", async (req: Request, res: Response) => {
  try {
    const systemId = parseInt(req.params.systemId, 10);
    const { userId } = req.enterprise!;

    if (Number.isNaN(systemId)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_REQUEST", message: "systemId must be an integer" },
        timestamp: new Date().toISOString(),
      });
    }

    const db = await getDb();
    if (!db) {
      return res.status(503).json({
        success: false,
        error: { code: "SERVICE_UNAVAILABLE", message: "Database unavailable" },
        timestamp: new Date().toISOString(),
      });
    }

    const [system] = await db
      .select({
        id: aiSystems.id,
        name: aiSystems.name,
        status: aiSystems.status,
        riskLevel: aiSystems.riskLevel,
        lastAssessmentDate: aiSystems.lastAssessmentDate,
      })
      .from(aiSystems)
      .where(and(eq(aiSystems.id, systemId), eq(aiSystems.userId, userId)))
      .limit(1);

    if (!system) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "AI system not found" },
        timestamp: new Date().toISOString(),
      });
    }

    const assessmentRows = await db
      .select({
        overallScore: assessments.overallScore,
        frameworkName: frameworks.name,
        frameworkCode: frameworks.code,
        completedAt: assessments.completedAt,
      })
      .from(assessments)
      .leftJoin(frameworks, eq(assessments.frameworkId, frameworks.id))
      .where(eq(assessments.aiSystemId, systemId));

    const frameworkScores: Record<string, number> = {};
    let overallScore = 0;
    const issues: ComplianceCheckResponse["issues"] = [];

    for (const a of assessmentRows) {
      const slug = a.frameworkCode || "unknown";
      const score = a.overallScore ? Number(a.overallScore) : 0;
      frameworkScores[slug] = score;
      overallScore = Math.max(overallScore, score);

      if (score < 70) {
        issues.push({
          framework: a.frameworkName || slug,
          issue: `${a.frameworkName || slug} score below threshold`,
          severity: score < 50 ? "high" : "medium",
          recommendation: `Complete remaining ${a.frameworkName || slug} controls and re-run the assessment.`,
        });
      }
    }

    const status = overallScore >= 80 ? "compliant" : overallScore >= 50 ? "under-review" : "non-compliant";
    const lastAudit = system.lastAssessmentDate ? new Date(system.lastAssessmentDate) : "";
    const nextAuditDue = system.lastAssessmentDate
      ? new Date(new Date(system.lastAssessmentDate).getTime() + 90 * 24 * 60 * 60 * 1000)
      : "";

    const response: ComplianceCheckResponse = {
      systemId: String(system.id),
      complianceScore: overallScore,
      status,
      lastAudit,
      nextAuditDue,
      frameworks: {
        euAiAct: frameworkScores["eu-ai-act"] ?? frameworkScores["EU_AI_ACT"] ?? 0,
        nistRmf: frameworkScores["nist-rmf"] ?? frameworkScores["NIST_AI_RMF"] ?? 0,
        iso42001: frameworkScores["iso-42001"] ?? frameworkScores["ISO_42001"] ?? 0,
        tc260: frameworkScores["tc260"] ?? frameworkScores["TC260"] ?? 0,
      },
      issues,
    };

    res.json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Enterprise API] compliance/status error:", error);
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch compliance status" },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/v1/requirements/active
 * Get all active compliance requirements (placeholder).
 */
router.get("/requirements/active", async (req: Request, res: Response) => {
  try {
    const requirements = [
      {
        id: "req_001",
        framework: "EU AI Act",
        requirement: "Human-in-the-loop override capability",
        priority: "high",
        effectiveDate: new Date("2025-03-01"),
      },
      {
        id: "req_002",
        framework: "NIST RMF",
        requirement: "Risk management documentation",
        priority: "medium",
        effectiveDate: new Date("2025-01-01"),
      },
    ];

    res.json({
      success: true,
      data: { requirements },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch requirements" },
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// AUDIT REQUEST ENDPOINTS
// ============================================================================

router.post("/audits/request", async (req: Request, res: Response) => {
  try {
    const { systemId, reason, priority } = req.body;

    if (!systemId || !reason) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_REQUEST", message: "Missing required fields: systemId, reason" },
        timestamp: new Date().toISOString(),
      });
    }

    const auditResponse: AuditResponse = {
      auditId: `audit_${Date.now()}`,
      systemId,
      status: "scheduled",
      estimatedCompletion: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      assignedAnalyst: "analyst_123",
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: auditResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to request audit" },
      timestamp: new Date().toISOString(),
    });
  }
});

router.get("/audits/:auditId", async (req: Request, res: Response) => {
  try {
    const { auditId } = req.params;

    const audit = {
      auditId,
      systemId: "sys_12345",
      status: "in-progress",
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedAnalyst: "analyst_123",
      progress: 65,
      findings: [],
    };

    res.json({
      success: true,
      data: audit,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch audit details" },
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// WEBHOOK ENDPOINTS
// ============================================================================

router.post("/webhooks/subscribe", async (req: Request, res: Response) => {
  try {
    const { url, events } = req.body;

    if (!url || !events || !Array.isArray(events)) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_REQUEST", message: "Missing required fields: url, events (array)" },
        timestamp: new Date().toISOString(),
      });
    }

    const subscription: WebhookSubscription = {
      id: `webhook_${Date.now()}`,
      companyId: `user_${req.enterprise!.userId}`,
      url,
      events,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      data: subscription,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to subscribe to webhooks" },
      timestamp: new Date().toISOString(),
    });
  }
});

router.get("/webhooks", async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: { webhooks: [] },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch webhooks" },
      timestamp: new Date().toISOString(),
    });
  }
});

router.delete("/webhooks/:webhookId", async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: { message: "Webhook subscription deleted" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to delete webhook" },
      timestamp: new Date().toISOString(),
    });
  }
});

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

router.get("/analytics/compliance-trend", async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const trend = {
      period: `last_${days}_days`,
      data: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), score: 85 },
        { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), score: 88 },
        { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), score: 90 },
        { date: new Date().toISOString(), score: 92 },
      ],
    };

    res.json({
      success: true,
      data: trend,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Failed to fetch compliance trend" },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
