/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";


// Government Portal Types
export interface GovernmentPortalUser {
  id: string;
  email: string;
  jurisdiction: string; // EU, US, China, etc.
  role: "admin" | "analyst" | "viewer";
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ComplianceRequirement {
  id: string;
  framework: "EU AI Act" | "NIST RMF" | "ISO 42001" | "TC260";
  requirement: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
  effectiveDate: Date | string;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  version: number;
}

export interface ComplianceUpdate {
  id: string;
  requirementId: string;
  previousVersion: number;
  newVersion: number;
  changeDescription: string;
  publishedAt: Date | string;
  effectiveDate: Date | string;
  jurisdiction: string[];
}

export interface ComplianceStatus {
  systemId: string;
  companyId: string;
  complianceScore: number; // 0-100
  status: "compliant" | "non-compliant" | "under-review" | "flagged";
  lastAudit: Date | string;
  nextAuditDue: Date | string;
  frameworks: Record<string, number>;
  updatedAt: Date | string;
}

export interface EnforcementAction {
  id: string;
  systemId: string;
  companyId: string;
  reason: string;
  severity: "critical" | "high" | "medium" | "low";
  action: "warning" | "audit-required" | "monitoring" | "suspension" | "shutdown";
  issuedBy: string;
  issuedAt: Date | string;
  dueDate?: Date | string;
  status: "open" | "in-progress" | "resolved" | "escalated";
  updatedAt: Date | string;
}

export interface WatchdogIncident {
  id: string;
  type: "bias-detection" | "privacy-violation" | "safety-failure" | "transparency-issue" | "autonomy-concern";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  affectedSystemId?: string;
  affectedCompanyId?: string;
  reportedAt: Date | string;
  reportedBy: string;
  status: "open" | "investigating" | "resolved" | "dismissed";
  updatedAt: Date | string;
}

// Enterprise Integration Types
export interface EnterpriseAPIKey {
  id: string;
  companyId: string;
  key: string; // Hashed
  name: string;
  permissions: string[];
  rateLimit: number; // requests per minute
  createdAt: Date | string;
  lastUsedAt?: Date | string;
  expiresAt?: Date | string;
  isActive: boolean;
}

export interface ComplianceCheckRequest {
  systemId: string;
  framework?: "EU AI Act" | "NIST RMF" | "ISO 42001" | "TC260" | "all";
  includeHistory?: boolean;
}

export interface ComplianceCheckResponse {
  systemId: string;
  complianceScore: number;
  status: "compliant" | "non-compliant" | "under-review";
  lastAudit: Date | string;
  nextAuditDue: Date | string;
  frameworks: {
    euAiAct: number;
    nistRmf: number;
    iso42001: number;
    tc260: number;
  };
  issues?: {
    framework: string;
    issue: string;
    severity: string;
    recommendation: string;
  }[];
}

export interface AuditRequest {
  systemId: string;
  reason: string;
  priority: "high" | "medium" | "low";
  framework?: string;
}

export interface AuditResponse {
  auditId: string;
  systemId: string;
  status: "scheduled" | "in-progress" | "completed" | "failed";
  estimatedCompletion: Date | string;
  assignedAnalyst?: string;
  createdAt: Date | string;
}

export interface WebhookEvent {
  eventId: string;
  eventType: "compliance.requirement.updated" | "compliance.score.changed" | "audit.required" | "enforcement.action" | "incident.reported";
  timestamp: Date | string;
  data: Record<string, unknown>;
  companyId: string;
}

export interface WebhookSubscription {
  id: string;
  companyId: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string | Date;
  lastTriggeredAt?: string | Date;
}

// Government Portal Analytics
export interface ComplianceStatistics {
  totalSystems: number;
  compliantSystems: number;
  nonCompliantSystems: number;
  underReviewSystems: number;
  flaggedSystems: number;
  complianceRate: number;
  byFramework: {
    euAiAct: number;
    nistRmf: number;
    iso42001: number;
    tc260: number;
  };
  byIndustry: Record<string, number>;
  byRegion: Record<string, number>;
  timestamp: string | Date;
}

export interface EnforcementStatistics {
  totalActions: number;
  openActions: number;
  resolvedActions: number;
  escalatedActions: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  byAction: {
    warning: number;
    auditRequired: number;
    monitoring: number;
    suspension: number;
    shutdown: number;
  };
  timestamp: string | Date;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string | Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
