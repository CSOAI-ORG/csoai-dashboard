/**
 * Audit Trail & Compliance Export Service
 * Immutable audit logs for compliance decisions and regulatory export formats
 */

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: 'compliance_decision' | 'assessment' | 'certification' | 'webhook' | 'onboarding' | 'system';
  entityId: string;
  changes: Record<string, { before: any; after: any }>;
  timestamp: string | Date;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  metadata: Record<string, any>;
}

export interface ComplianceExportData {
  organizationName: string;
  exportDate: string | Date;
  exportedBy: string;
  systems: Array<{
    id: string;
    name: string;
    type: string;
    riskLevel: string;
    complianceScore: number;
    certificationLevel: string;
    lastAssessment: string | Date;
    controls: Array<{
      id: string;
      name: string;
      status: 'compliant' | 'partial' | 'non-compliant';
      evidence?: string[];
    }>;
  }>;
  auditLog: AuditLogEntry[];
  certifications: Array<{
    id: string;
    systemId: string;
    level: string;
    issuedDate: string | Date;
    expiryDate: string | Date;
    issuer: string;
  }>;
  assessments: Array<{
    id: string;
    systemId: string;
    framework: string;
    score: number;
    date: string | Date;
    assessor: string;
    findings: string[];
  }>;
}

/**
 * Audit Trail Service
 */
export class AuditTrailService {
  /**
   * Create audit log entry
   */
  static createAuditLogEntry(
    userId: string,
    action: string,
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    changes: Record<string, { before: any; after: any }>,
    ipAddress: string,
    userAgent: string,
    status: 'success' | 'failure' = 'success',
    errorMessage?: string,
    metadata: Record<string, any> = {}
  ): AuditLogEntry {
    return {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      entityType,
      entityId,
      changes,
      timestamp: new Date()?.toString() || new Date().toISOString(),
      ipAddress,
      userAgent,
      status,
      errorMessage,
      metadata,
    };
  }

  /**
   * Log compliance decision
   */
  static logComplianceDecision(
    userId: string,
    systemId: string,
    decision: string,
    score: number,
    previousScore: number,
    ipAddress: string,
    userAgent: string
  ): AuditLogEntry {
    return this.createAuditLogEntry(
      userId,
      'COMPLIANCE_DECISION',
      'compliance_decision',
      systemId,
      {
        score: { before: previousScore, after: score },
        decision: { before: null, after: decision },
      },
      ipAddress,
      userAgent,
      'success',
      undefined,
      { decisionType: decision }
    );
  }

  /**
   * Log assessment completion
   */
  static logAssessmentCompletion(
    userId: string,
    systemId: string,
    framework: string,
    score: number,
    controlsAssessed: number,
    ipAddress: string,
    userAgent: string
  ): AuditLogEntry {
    return this.createAuditLogEntry(
      userId,
      'ASSESSMENT_COMPLETED',
      'assessment',
      systemId,
      {
        framework: { before: null, after: framework },
        score: { before: null, after: score },
      },
      ipAddress,
      userAgent,
      'success',
      undefined,
      { framework, controlsAssessed, score }
    );
  }

  /**
   * Log certification issuance
   */
  static logCertificationIssuance(
    userId: string,
    systemId: string,
    certificationLevel: string,
    expiryDate: Date,
    ipAddress: string,
    userAgent: string
  ): AuditLogEntry {
    return this.createAuditLogEntry(
      userId,
      'CERTIFICATION_ISSUED',
      'certification',
      systemId,
      {
        level: { before: null, after: certificationLevel },
        expiryDate: { before: null, after: expiryDate },
      },
      ipAddress,
      userAgent,
      'success',
      undefined,
      { certificationLevel, expiryDate }
    );
  }

  /**
   * Log webhook event
   */
  static logWebhookEvent(
    userId: string,
    subscriptionId: string,
    eventType: string,
    deliveryStatus: 'success' | 'failure',
    httpStatus?: number,
    errorMessage?: string,
    ipAddress: string = '0.0.0.0',
    userAgent: string = 'system'
  ): AuditLogEntry {
    return this.createAuditLogEntry(
      userId,
      'WEBHOOK_DELIVERY',
      'webhook',
      subscriptionId,
      {
        eventType: { before: null, after: eventType },
        status: { before: null, after: deliveryStatus },
      },
      ipAddress,
      userAgent,
      deliveryStatus === 'success' ? 'success' : 'failure',
      errorMessage,
      { eventType, httpStatus, deliveryStatus }
    );
  }

  /**
   * Log onboarding progress
   */
  static logOnboardingProgress(
    userId: string,
    sessionId: string,
    step: number,
    completed: boolean,
    ipAddress: string,
    userAgent: string
  ): AuditLogEntry {
    return this.createAuditLogEntry(
      userId,
      'ONBOARDING_STEP',
      'onboarding',
      sessionId,
      {
        step: { before: step - 1, after: step },
        completed: { before: false, after: completed },
      },
      ipAddress,
      userAgent,
      'success',
      undefined,
      { step, completed }
    );
  }

  /**
   * Log system registration
   */
  static logSystemRegistration(
    userId: string,
    systemId: string,
    systemName: string,
    systemType: string,
    ipAddress: string,
    userAgent: string
  ): AuditLogEntry {
    return this.createAuditLogEntry(
      userId,
      'SYSTEM_REGISTERED',
      'system',
      systemId,
      {
        name: { before: null, after: systemName },
        type: { before: null, after: systemType },
      },
      ipAddress,
      userAgent,
      'success',
      undefined,
      { systemName, systemType }
    );
  }

  /**
   * Filter audit logs by criteria
   */
  static filterAuditLogs(
    logs: AuditLogEntry[],
    filters: {
      userId?: string;
      action?: string;
      entityType?: string;
      startDate?: Date;
      endDate?: Date;
      status?: 'success' | 'failure';
    }
  ): AuditLogEntry[] {
    return logs.filter((log) => {
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.entityType && log.entityType !== filters.entityType) return false;
      if (filters.status && log.status !== filters.status) return false;
      if (filters.startDate && log.timestamp < filters.startDate) return false;
      if (filters.endDate && log.timestamp > filters.endDate) return false;
      return true;
    });
  }

  /**
   * Generate audit report
   */
  static generateAuditReport(
    logs: AuditLogEntry[],
    startDate: Date,
    endDate: Date
  ): {
    period: { start: Date; end: Date };
    totalEntries: number;
    successfulActions: number;
    failedActions: number;
    actionBreakdown: Record<string, number>;
    entityTypeBreakdown: Record<string, number>;
    topUsers: Array<{ userId: string; actionCount: number }>;
  } {
    const filteredLogs = this.filterAuditLogs(logs, { startDate, endDate });

    const actionBreakdown: Record<string, number> = {};
    const entityTypeBreakdown: Record<string, number> = {};
    const userActions: Record<string, number> = {};

    filteredLogs.forEach((log) => {
      actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
      entityTypeBreakdown[log.entityType] = (entityTypeBreakdown[log.entityType] || 0) + 1;
      userActions[log.userId] = (userActions[log.userId] || 0) + 1;
    });

    const topUsers = Object.entries(userActions)
      .map(([userId, actionCount]) => ({ userId, actionCount }))
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 10);

    const successfulActions = filteredLogs.filter((l) => l.status === 'success').length;
    const failedActions = filteredLogs.filter((l) => l.status === 'failure').length;

    return {
      period: { start: startDate, end: endDate },
      totalEntries: filteredLogs.length,
      successfulActions,
      failedActions,
      actionBreakdown,
      entityTypeBreakdown,
      topUsers,
    };
  }
}

/**
 * Compliance Export Service
 */
export class ComplianceExportService {
  /**
   * Generate PDF export
   */
  static generatePDFExport(data: ComplianceExportData): Buffer {
    // This would use pdfkit or similar library
    // For now, returning a placeholder
    const content = this.generateExportContent(data);
    return Buffer.from(content);
  }

  /**
   * Generate XML export (for regulatory submission)
   */
  static generateXMLExport(data: ComplianceExportData): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<ComplianceReport>\n';
    xml += `  <Organization>${this.escapeXml(data.organizationName)}</Organization>\n`;
    xml += `  <ExportDate>${typeof data.exportDate === 'string' ? data.exportDate : data.exportDate?.toString() || new Date().toISOString()}</ExportDate>\n`;
    xml += `  <ExportedBy>${this.escapeXml(data.exportedBy)}</ExportedBy>\n`;

    xml += '  <Systems>\n';
    data.systems.forEach((system) => {
      xml += '    <System>\n';
      xml += `      <ID>${this.escapeXml(system.id)}</ID>\n`;
      xml += `      <Name>${this.escapeXml(system.name)}</Name>\n`;
      xml += `      <Type>${this.escapeXml(system.type)}</Type>\n`;
      xml += `      <RiskLevel>${this.escapeXml(system.riskLevel)}</RiskLevel>\n`;
      xml += `      <ComplianceScore>${system.complianceScore}</ComplianceScore>\n`;
      xml += `      <CertificationLevel>${this.escapeXml(system.certificationLevel)}</CertificationLevel>\n`;
      xml += `      <LastAssessment>${typeof system.lastAssessment === 'string' ? system.lastAssessment : system.lastAssessment?.toString() || new Date().toISOString()}</LastAssessment>\n`;

      xml += '      <Controls>\n';
      system.controls.forEach((control) => {
        xml += '        <Control>\n';
        xml += `          <ID>${this.escapeXml(control.id)}</ID>\n`;
        xml += `          <Name>${this.escapeXml(control.name)}</Name>\n`;
        xml += `          <Status>${this.escapeXml(control.status)}</Status>\n`;
        xml += '          <Evidence>\n';
        (control.evidence || []).forEach((evidence) => {
          xml += `            <Item>${this.escapeXml(evidence)}</Item>\n`;
        });
        xml += '          </Evidence>\n';
        xml += '        </Control>\n';
      });
      xml += '      </Controls>\n';

      xml += '    </System>\n';
    });
    xml += '  </Systems>\n';

    xml += '  <Certifications>\n';
    data.certifications.forEach((cert) => {
      xml += '    <Certification>\n';
      xml += `      <ID>${this.escapeXml(cert.id)}</ID>\n`;
      xml += `      <SystemID>${this.escapeXml(cert.systemId)}</SystemID>\n`;
      xml += `      <Level>${this.escapeXml(cert.level)}</Level>\n`;
      xml += `      <IssuedDate>${typeof cert.issuedDate === 'string' ? cert.issuedDate : cert.issuedDate?.toString() || new Date().toISOString()}</IssuedDate>\n`;
      xml += `      <ExpiryDate>${typeof cert.expiryDate === 'string' ? cert.expiryDate : cert.expiryDate?.toString() || new Date().toISOString()}</ExpiryDate>\n`;
      xml += `      <Issuer>${this.escapeXml(cert.issuer)}</Issuer>\n`;
      xml += '    </Certification>\n';
    });
    xml += '  </Certifications>\n';

    xml += '  <AuditLog>\n';
    data.auditLog.slice(0, 100).forEach((entry) => {
      xml += '    <Entry>\n';
      xml += `      <ID>${this.escapeXml(entry.id)}</ID>\n`;
      xml += `      <UserID>${this.escapeXml(entry.userId)}</UserID>\n`;
      xml += `      <Action>${this.escapeXml(entry.action)}</Action>\n`;
      xml += `      <Timestamp>${entry.timestamp?.toString() || new Date().toISOString()}</Timestamp>\n`;
      xml += `      <Status>${this.escapeXml(entry.status)}</Status>\n`;
      xml += '    </Entry>\n';
    });
    xml += '  </AuditLog>\n';

    xml += '</ComplianceReport>\n';
    return xml;
  }

  /**
   * Generate JSON export
   */
  static generateJSONExport(data: ComplianceExportData): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Generate CSV export for systems
   */
  static generateCSVExport(data: ComplianceExportData): string {
    let csv = 'System ID,System Name,Type,Risk Level,Compliance Score,Certification Level,Last Assessment\n';

    data.systems.forEach((system) => {
      csv += `"${this.escapeCsv(system.id)}","${this.escapeCsv(system.name)}","${this.escapeCsv(system.type)}","${this.escapeCsv(system.riskLevel)}",${system.complianceScore},"${this.escapeCsv(system.certificationLevel)}","${typeof system.lastAssessment === 'string' ? system.lastAssessment : system.lastAssessment?.toString() || new Date().toISOString()}"\n`;
    });

    return csv;
  }

  /**
   * Generate export content as text
   */
  private static generateExportContent(data: ComplianceExportData): string {
    let content = 'COMPLIANCE REPORT\n';
    content += '='.repeat(80) + '\n\n';

    content += `Organization: ${data.organizationName}\n`;
    content += `Export Date: ${typeof data.exportDate === 'string' ? data.exportDate : data.exportDate?.toString() || new Date().toISOString()}\n`;
    content += `Exported By: ${data.exportedBy}\n\n`;

    content += 'SYSTEMS\n';
    content += '-'.repeat(80) + '\n';
    data.systems.forEach((system) => {
      content += `\nSystem: ${system.name} (${system.id})\n`;
      content += `  Type: ${system.type}\n`;
      content += `  Risk Level: ${system.riskLevel}\n`;
      content += `  Compliance Score: ${system.complianceScore}%\n`;
      content += `  Certification Level: ${system.certificationLevel}\n`;
      content += `  Last Assessment: ${typeof system.lastAssessment === 'string' ? system.lastAssessment : system.lastAssessment?.toString() || new Date().toISOString()}\n`;
      content += `  Controls:\n`;
      system.controls.forEach((control) => {
        content += `    - ${control.name}: ${control.status}\n`;
      });
    });

    content += '\n\nCERTIFICATIONS\n';
    content += '-'.repeat(80) + '\n';
    data.certifications.forEach((cert) => {
      content += `${cert.level} - System ${cert.systemId} (Issued: ${typeof cert.issuedDate === 'string' ? cert.issuedDate : cert.issuedDate?.toString() || new Date().toISOString()}, Expires: ${typeof cert.expiryDate === 'string' ? cert.expiryDate : cert.expiryDate?.toString() || new Date().toISOString()})\n`;
    });

    return content;
  }

  /**
   * Escape XML special characters
   */
  private static escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Escape CSV special characters
   */
  private static escapeCsv(str: string): string {
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return str.replace(/"/g, '""');
    }
    return str;
  }
}

import { getDb } from "../db";
import { auditLogs } from "../../drizzle/schema";

export interface PersistableAuditLog {
  userId?: number | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  details?: Record<string, any>;
  ipAddress?: string;
}

/**
 * Persist an audit log entry to the database.
 * Failures are logged but never thrown so audit cannot break user flows.
 */
export async function persistAuditLog(entry: PersistableAuditLog): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Audit] Database unavailable; skipping audit log persistence");
      return;
    }
    await db.insert(auditLogs).values({
      userId: entry.userId ?? null,
      action: entry.action.slice(0, 100),
      entityType: entry.entityType.slice(0, 100),
      entityId: entry.entityId ?? null,
      details: entry.details ? JSON.stringify(entry.details) : null,
      ipAddress: entry.ipAddress?.slice(0, 45) ?? null,
    });
  } catch (error) {
    console.error("[Audit] Failed to persist audit log:", error);
  }
}
