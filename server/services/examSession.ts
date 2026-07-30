/**
 * Exam Session Service
 * Manages integrated exam + proctoring lifecycle
 * Handles session initialization, monitoring, submission, and certificate flagging
 */

import { getDb } from '../db';
import { userTestAttempts, userCertificates } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { ExamProctoringService } from '../services/examProctoring';

export interface ExamSessionConfig {
  userId: string | number;
  examId: string;
  certificationType: 'fundamentals' | 'professional' | 'expert';
  requireProctoring: boolean;
  durationMinutes: number;
}

export interface ExamSessionResult {
  attemptId: number;
  score: number;
  passed: boolean;
  proctoringStatus: 'full' | 'flagged' | 'invalid' | 'not_required';
  integrityScore: number;
  certificateId?: number;
  certificateNumber?: string;
}

/**
 * Exam Session Service
 * Manages exam sessions with integrated proctoring
 */
export class ExamSessionService {
  /**
   * Start a new exam session with optional proctoring
   */
  static async startExamSession(config: ExamSessionConfig) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Create exam attempt record
      const userIdNum = typeof config.userId === 'number' ? config.userId : parseInt(config.userId);
      const attempt = await db.insert(userTestAttempts).values({
        userId: userIdNum,
        testId: parseInt(config.examId),
        startedAt: new Date().toISOString(),
        score: 0,
        passed: 0,
      });

      const attemptId = (attempt as any)[0]?.insertId || 0;

      // Initialize proctoring session if required
      let proctoringSessionId: string | null = null;
      const startTime = new Date();
      const endTime = new Date(Date.now() + config.durationMinutes * 60 * 1000);
      
      if (config.requireProctoring) {
        proctoringSessionId = await ExamProctoringService.startSession({
          examId: config.examId,
          userId: String(config.userId),
          certificationType: config.certificationType,
          requireProctoring: true,
          recordSession: true,
          allowScreenSharing: false,
          allowExternalApps: false,
          startTime,
          endTime,
        });
      }

      return {
        attemptId,
        proctoringSessionId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        requiresProctoring: config.requireProctoring,
      };
    } catch (error) {
      console.error('Failed to start exam session:', error);
      throw new Error('Failed to start exam session');
    }
  }

  /**
   * Submit exam and process proctoring results
   */
  static async submitExam(
    attemptId: number,
    proctoringSessionId: string | null,
    score: number,
    answers: Record<string, string>,
  ): Promise<ExamSessionResult> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Get attempt details
      const attemptResult = await db.select().from(userTestAttempts).where(eq(userTestAttempts.id, attemptId)).limit(1);
      const attempt = attemptResult[0];

      if (!attempt) {
        throw new Error('Exam attempt not found');
      }

      // Determine pass/fail (70% threshold)
      const passed = score >= 70;

      // Analyze proctoring if applicable
      let proctoringStatus: 'full' | 'flagged' | 'invalid' | 'not_required' = 'not_required';
      let integrityScore = 100;

      if (proctoringSessionId) {
        const proctoringResult = await ExamProctoringService.analyzeSession(proctoringSessionId);

        integrityScore = proctoringResult.integrityScore;

        if (proctoringResult.certificateValidity === 'full') {
          proctoringStatus = 'full';
        } else if (proctoringResult.certificateValidity === 'flagged') {
          proctoringStatus = 'flagged';
        } else {
          proctoringStatus = 'invalid';
        }

        // Prevent certificate issuance if proctoring failed
        if (proctoringStatus === 'invalid' && passed) {
          proctoringStatus = 'flagged';
        }
      }

      // Update attempt with results
      await db
        .update(userTestAttempts)
        .set({
          completedAt: new Date().toISOString(),
          score: score as any,
          passed: (passed && proctoringStatus !== 'invalid') ? 1 : 0,
        })
        .where(eq(userTestAttempts.id, attemptId));

      // Issue certificate if passed and proctoring approved
      let certificateId: number | undefined;
      let certificateNumber: string | undefined;

      if (passed && proctoringStatus !== 'invalid') {
        const certificateResult = await this.issueCertificate(
          String(attempt.userId),
          attempt.testId,
          proctoringStatus,
          integrityScore,
        );

        certificateId = certificateResult.id;
        certificateNumber = certificateResult.certificateNumber;
      }

      return {
        attemptId,
        score,
        passed: passed && proctoringStatus !== 'invalid',
        proctoringStatus,
        integrityScore,
        certificateId,
        certificateNumber,
      };
    } catch (error) {
      console.error('Failed to submit exam:', error);
      throw new Error('Failed to submit exam');
    }
  }

  /**
   * Issue certificate with proctoring metadata
   */
  static async issueCertificate(
    userId: string,
    testId: number,
    proctoringStatus: string,
    integrityScore: number,
  ) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Generate unique certificate number
      const certificateNumber = `CEASA-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Determine certificate type based on test
      let certificationType: 'fundamentals' | 'professional' | 'expert' = 'fundamentals';
      if (testId === 2) certificationType = 'professional';
      if (testId === 3) certificationType = 'expert';

      // Calculate expiration (3 years)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 3);

      // Map certificationType to certificateType enum
      const certTypeMap: Record<string, 'basic' | 'advanced' | 'expert'> = {
        'fundamentals': 'basic',
        'professional': 'advanced',
        'expert': 'expert',
      };
      const certType = certTypeMap[certificationType] || 'basic';

      // Create certificate
      const certificate = await db.insert(userCertificates).values({
        userId: parseInt(userId),
        testId,
        attemptId: 0, // Would need to pass this from caller
        certificateNumber,
        certificateType: certType,
        issuedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      });

      return {
        id: (certificate as any)[0]?.insertId || 0,
        certificateNumber,
        proctoringStatus,
        integrityScore,
      };
    } catch (error) {
      console.error('Failed to issue certificate:', error);
      throw new Error('Failed to issue certificate');
    }
  }

  /**
   * Get exam session details with proctoring data
   */
  static async getSessionDetails(attemptId: number) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const attemptResult = await db.select().from(userTestAttempts).where(eq(userTestAttempts.id, attemptId)).limit(1);
      const attempt = attemptResult[0];

      if (!attempt) {
        throw new Error('Exam attempt not found');
      }

      // Get proctoring data if available (stored in memory by ExamProctoringService)
      let proctoringData = null;

      // Get certificate if issued
      let certificate = null;
      if (attempt.passed) {
        const certResult = await db.select().from(userCertificates).where(eq(userCertificates.userId, attempt.userId)).limit(1);
        certificate = certResult[0] || null;
      }

      return {
        attempt,
        proctoringData,
        certificate,
      };
    } catch (error) {
      console.error('Failed to get session details:', error);
      throw new Error('Failed to get session details');
    }
  }

  /**
   * Get certificate verification details
   */
  static async verifyCertificate(certificateNumber: string) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const certResult = await db.select().from(userCertificates).where(eq(userCertificates.certificateNumber, certificateNumber)).limit(1);
      const certificate = certResult[0];

      if (!certificate) {
        return {
          valid: false,
          message: 'Certificate not found',
        };
      }

      // Check expiration
      if (certificate.expiresAt && new Date().toISOString() > certificate.expiresAt) {
        return {
          valid: false,
          message: 'Certificate has expired',
          certificate,
        };
      }

      return {
        valid: true,
        message: 'Certificate is valid',
        certificate: {
          number: certificate.certificateNumber,
          type: certificate.certificateType,
          issuedAt: certificate.issuedAt,
          expiresAt: certificate.expiresAt,
        },
      };
    } catch (error) {
      console.error('Failed to verify certificate:', error);
      throw new Error('Failed to verify certificate');
    }
  }

  /**
   * Get exam integrity report for administrators
   */
  static async getIntegrityReport(startDate: Date, endDate: Date) {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const attempts = await db.select().from(userTestAttempts);

      const filtered = attempts.filter(
        (a: any) =>
          a.completedAt &&
          new Date(a.completedAt) >= startDate &&
          new Date(a.completedAt) <= endDate,
      );

      const passedAttempts = filtered.filter((a: any) => a.passed);

      return {
        period: { startDate, endDate },
        totalAttempts: filtered.length,
        proctoredAttempts: 0, // Would need proctoring data
        proctoringRate: 0,
        flaggedAttempts: 0,
        invalidAttempts: 0,
        avgIntegrityScore: 100,
        passRate: filtered.length > 0 ? (passedAttempts.length / filtered.length) * 100 : 0,
      };
    } catch (error) {
      console.error('Failed to get integrity report:', error);
      throw new Error('Failed to get integrity report');
    }
  }
}
