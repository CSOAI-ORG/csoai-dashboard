/**
 * Government Portal Service
 * Provides analytics and compliance oversight for government agencies
 * EU Commission, EDPB, and national authorities
 */

import { getDb } from '../db';
import { users, userCertificates, watchdogReports, assessments } from '../../drizzle/schema';
import { eq, gte, lte, and, count } from 'drizzle-orm';

export interface GovernmentAnalytics {
  totalCertifiedAnalysts: number;
  certificationsByLevel: {
    fundamentals: number;
    professional: number;
    expert: number;
  };
  complianceReports: {
    total: number;
    byFramework: Record<string, number>;
    byStatus: Record<string, number>;
  };
  incidentMetrics: {
    totalReports: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    resolutionRate: number;
  };
  trends: {
    certifications: Array<{ date: string; count: number }>;
    incidents: Array<{ date: string; count: number }>;
    compliance: Array<{ date: string; score: number }>;
  };
}

export interface GovernmentUser {
  id: string;
  email: string;
  agencyName: string;
  jurisdiction: string;
  role: 'admin' | 'analyst' | 'viewer';
  permissions: string[];
  lastAccessedAt: Date;
  createdAt: Date;
}

/**
 * Government Portal Service
 * Manages government agency access and analytics
 */
export class GovernmentPortalService {
  /**
   * Get comprehensive analytics for government oversight
   */
  static async getAnalytics(jurisdiction?: string): Promise<GovernmentAnalytics> {
    const db = await getDb();
    if (!db) {
      return {
        totalCertifiedAnalysts: 0,
        certificationsByLevel: { fundamentals: 0, professional: 0, expert: 0 },
        complianceReports: { total: 0, byFramework: {}, byStatus: {} },
        incidentMetrics: { totalReports: 0, byCategory: {}, bySeverity: {}, resolutionRate: 0 },
        trends: { certifications: [], incidents: [], compliance: [] },
      };
    }

    try {
      // Get total certified analysts
      const certifiedAnalysts = await db.select().from(userCertificates);
      const totalCertifiedAnalysts = certifiedAnalysts.length;

      // Count by certification level
      const certificationsByLevel = {
        fundamentals: certifiedAnalysts.filter((c: any) => c.certificateType === 'basic').length,
        professional: certifiedAnalysts.filter((c: any) => c.certificateType === 'professional').length,
        expert: certifiedAnalysts.filter((c: any) => c.certificateType === 'expert').length,
      };

      // Get compliance reports (assessments)
      const allAssessments = await db.select().from(assessments);
      const complianceReports = {
        total: allAssessments.length,
        byFramework: {
          eu_ai_act: 0,
          nist_rmf: 0,
          tc260: 0,
          iso_42001: 0,
        },
        byStatus: {
          compliant: allAssessments.filter((a: any) => a.status === 'completed').length,
          under_review: allAssessments.filter((a: any) => a.status === 'in_progress').length,
          flagged: allAssessments.filter((a: any) => a.status === 'rejected').length,
          non_compliant: allAssessments.filter((a: any) => a.status === 'pending').length,
        },
      };

      // Get incident metrics
      const reports = await db.select().from(watchdogReports);
      const totalReports = reports.length;

      const byCategory: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};

      reports.forEach((r: any) => {
        const category = r.incidentType || 'other';
        const severity = r.severity || 'medium';
        byCategory[category] = (byCategory[category] || 0) + 1;
        bySeverity[severity] = (bySeverity[severity] || 0) + 1;
      });

      const resolvedReports = reports.filter((r: any) => r.status === 'resolved').length;
      const resolutionRate = totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0;

      const incidentMetrics = {
        totalReports,
        byCategory,
        bySeverity,
        resolutionRate: Math.round(resolutionRate),
      };

      // Generate trends (last 30 days)
      const certificationTrends: Array<{ date: string; count: number }> = [];
      const incidentTrends: Array<{ date: string; count: number }> = [];
      const complianceTrends: Array<{ date: string; score: number }> = [];

      for (let i = 29; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];

        const certCount = certifiedAnalysts.filter(
          (c: any) =>
            c.issuedAt &&
            c.issuedAt.split('T')[0] === dateStr,
        ).length;
        certificationTrends.push({ date: dateStr, count: certCount });

        const incidentCount = reports.filter(
          (r: any) =>
            r.createdAt &&
            r.createdAt.split('T')[0] === dateStr,
        ).length;
        incidentTrends.push({ date: dateStr, count: incidentCount });

        const dayAssessments = allAssessments.filter(
          (a: any) =>
            a.createdAt &&
            a.createdAt.split('T')[0] === dateStr,
        );
        const avgScore = dayAssessments.length > 0
          ? dayAssessments.reduce((sum: number, a: any) => sum + parseFloat(a.overallScore || '0'), 0) / dayAssessments.length
          : 0;
        complianceTrends.push({ date: dateStr, score: Math.round(avgScore) });
      }

      return {
        totalCertifiedAnalysts,
        certificationsByLevel,
        complianceReports,
        incidentMetrics,
        trends: {
          certifications: certificationTrends,
          incidents: incidentTrends,
          compliance: complianceTrends,
        },
      };
    } catch (error) {
      console.error('Error getting government analytics:', error);
      return {
        totalCertifiedAnalysts: 0,
        certificationsByLevel: { fundamentals: 0, professional: 0, expert: 0 },
        complianceReports: { total: 0, byFramework: {}, byStatus: {} },
        incidentMetrics: { totalReports: 0, byCategory: {}, bySeverity: {}, resolutionRate: 0 },
        trends: { certifications: [], incidents: [], compliance: [] },
      };
    }
  }

  /**
   * Get list of certified analysts for verification
   */
  static async getCertifiedAnalysts(filters?: {
    level?: string;
    jurisdiction?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const certificates = await db.select().from(userCertificates);
      
      let filtered = certificates;
      
      if (filters?.level) {
        filtered = filtered.filter((c: any) => c.certificateType === filters.level);
      }
      
      if (filters?.startDate) {
        filtered = filtered.filter((c: any) => 
          new Date(c.issuedAt) >= filters.startDate!
        );
      }
      
      if (filters?.endDate) {
        filtered = filtered.filter((c: any) => 
          new Date(c.issuedAt) <= filters.endDate!
        );
      }

      return filtered.map((c: any) => ({
        certificateNumber: c.certificateNumber,
        certificateType: c.certificateType,
        issuedAt: c.issuedAt,
        expiresAt: c.expiresAt,
        userId: c.userId,
      }));
    } catch (error) {
      console.error('Error getting certified analysts:', error);
      return [];
    }
  }

  /**
   * Verify a certificate by its number
   */
  static async verifyCertificate(certificateNumber: string): Promise<{
    valid: boolean;
    certificate?: any;
    message: string;
  }> {
    const db = await getDb();
    if (!db) return { valid: false, message: 'Database not available' };

    try {
      const [certificate] = await db
        .select()
        .from(userCertificates)
        .where(eq(userCertificates.certificateNumber, certificateNumber));

      if (!certificate) {
        return { valid: false, message: 'Certificate not found' };
      }

      const now = new Date();
      const expiresAt = certificate.expiresAt ? new Date(certificate.expiresAt) : null;
      
      if (expiresAt && expiresAt < now) {
        return { 
          valid: false, 
          certificate,
          message: 'Certificate has expired' 
        };
      }

      return {
        valid: true,
        certificate: {
          certificateNumber: certificate.certificateNumber,
          certificateType: certificate.certificateType,
          issuedAt: certificate.issuedAt,
          expiresAt: certificate.expiresAt,
        },
        message: 'Certificate is valid',
      };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      return { valid: false, message: 'Error verifying certificate' };
    }
  }

  /**
   * Get incident reports for oversight
   */
  static async getIncidentReports(filters?: {
    status?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const reports = await db.select().from(watchdogReports);
      
      let filtered = reports;
      
      if (filters?.status) {
        filtered = filtered.filter((r: any) => r.status === filters.status);
      }
      
      if (filters?.severity) {
        filtered = filtered.filter((r: any) => r.severity === filters.severity);
      }
      
      if (filters?.startDate) {
        filtered = filtered.filter((r: any) => 
          new Date(r.createdAt) >= filters.startDate!
        );
      }
      
      if (filters?.endDate) {
        filtered = filtered.filter((r: any) => 
          new Date(r.createdAt) <= filters.endDate!
        );
      }

      return filtered.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        incidentType: r.incidentType,
        severity: r.severity,
        status: r.status,
        createdAt: r.createdAt,
        aiSystemName: r.aiSystemName,
        companyName: r.companyName,
      }));
    } catch (error) {
      console.error('Error getting incident reports:', error);
      return [];
    }
  }
}
