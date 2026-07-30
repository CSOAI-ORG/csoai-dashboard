/**
 * Certificate Automation Service
 * 
 * Automatically generates and emails certificates when students pass exams
 */

import { getDb } from "../db";
import { userCertificates, users, certificationTests, userTestAttempts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { generateCertificatePDFV2 } from "../utils/certificateGeneratorV2";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface CertificateGenerationData {
  userId: number;
  testId: number;
  attemptId: number;
  certificateNumber: string;
  score: number;
  percentScore: number;
}

/**
 * Generate certificate PDF and send via email
 */
export async function generateAndEmailCertificate(data: CertificateGenerationData): Promise<{
  success: boolean;
  certificateId?: string;
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Get user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    // Get test details
    const [test] = await db
      .select()
      .from(certificationTests)
      .where(eq(certificationTests.id, data.testId))
      .limit(1);

    if (!test) {
      throw new Error("Test not found");
    }

    // Get attempt details
    const [attempt] = await db
      .select()
      .from(userTestAttempts)
      .where(eq(userTestAttempts.id, data.attemptId))
      .limit(1);

    if (!attempt) {
      throw new Error("Test attempt not found");
    }

    // Generate certificate PDF
    const verificationUrl = `${process.env.VITE_FRONTEND_URL || 'https://coai-dashboard.manus.space'}/verify-certificate/${data.certificateNumber}`;
    
    const pdfBuffer = await generateCertificatePDFV2({
      certificateId: data.certificateNumber,
      studentName: user.name || 'Student',
      courseName: test.title || 'AI Safety Analyst Certification',
      framework: 'CEASAI',
      completionDate: attempt.completedAt ? new Date(attempt.completedAt) : new Date(),
      verificationUrl,
      examScore: data.percentScore,
      certificationLevel: data.percentScore >= 90 ? 'Expert' : data.percentScore >= 80 ? 'Professional' : 'Foundation',
    });

    // Send email with certificate attachment
    if (!user.email) {
      console.warn('User has no email address, skipping email');
      return {
        success: true,
        certificateId: data.certificateNumber,
      };
    }

    const emailResult = await sendCertificateEmail({
      to: user.email,
      userName: user.name || 'Student',
      certificateNumber: data.certificateNumber,
      courseName: test.title || 'AI Safety Analyst Certification',
      score: data.percentScore,
      verificationUrl,
      pdfBuffer,
    });

    if (!emailResult.success) {
      console.error('Failed to send certificate email:', emailResult.error);
      // Don't throw error - certificate is still generated even if email fails
    }

    return {
      success: true,
      certificateId: data.certificateNumber,
    };
  } catch (error) {
    console.error('Error in generateAndEmailCertificate:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send certificate via email with PDF attachment
 */
async function sendCertificateEmail(params: {
  to: string;
  userName: string;
  certificateNumber: string;
  courseName: string;
  score: number;
  verificationUrl: string;
  pdfBuffer: Buffer;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    const { to, userName, certificateNumber, courseName, score, verificationUrl, pdfBuffer } = params;

    // Create email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your CEASAI Certificate</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #11885a 0%, #0d6b44 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
    <p style="color: #e0f2e9; margin: 10px 0 0 0; font-size: 16px;">You've earned your CEASAI Certificate</p>
  </div>
  
  <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Dear ${userName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Congratulations on successfully completing the <strong>${courseName}</strong> certification exam with a score of <strong>${score}%</strong>!
    </p>
    
    <div style="background: #f9fafb; border-left: 4px solid #11885a; padding: 20px; margin: 30px 0; border-radius: 4px;">
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">Certificate Number</p>
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: #11885a; font-family: monospace;">${certificateNumber}</p>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your official certificate is attached to this email as a PDF. You can also verify your certificate online at any time using the link below:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verificationUrl}" style="display: inline-block; background: #11885a; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Verify Certificate Online
      </a>
    </div>
    
    <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 20px; margin: 30px 0; border-radius: 6px;">
      <h3 style="margin: 0 0 10px 0; color: #11885a; font-size: 16px;">What's Next?</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151;">
        <li style="margin-bottom: 8px;">Share your achievement on LinkedIn and social media</li>
        <li style="margin-bottom: 8px;">Add your certification to your professional profile</li>
        <li style="margin-bottom: 8px;">Access the Analyst Workbench to start reviewing AI safety cases</li>
        <li style="margin-bottom: 8px;">Join our community of certified AI Safety Analysts</li>
      </ul>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for your commitment to AI safety and ethical AI development. We're excited to have you as part of the CEASAI community!
    </p>
    
    <p style="font-size: 16px; margin-bottom: 5px;">Best regards,</p>
    <p style="font-size: 16px; margin-top: 0; font-weight: 600; color: #11885a;">The CEASAI Team</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
    <p style="margin: 0 0 10px 0;">
      <a href="${process.env.VITE_FRONTEND_URL || 'https://coai-dashboard.manus.space'}" style="color: #11885a; text-decoration: none;">CSOAI Dashboard</a> | 
      <a href="${process.env.VITE_FRONTEND_URL || 'https://coai-dashboard.manus.space'}/about" style="color: #11885a; text-decoration: none;">About CEASAI</a>
    </p>
    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
      This is an automated message. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
    `.trim();

    // Send email with attachment
    const result = await resend.emails.send({
      from: 'CEASAI Certification <noreply@coai.manus.space>',
      to,
      subject: `🎓 Your CEASAI Certificate - ${certificateNumber}`,
      html: emailHtml,
      attachments: [
        {
          filename: `CEASAI-Certificate-${certificateNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    console.log('Certificate email sent:', result);
    return { success: true };
  } catch (error) {
    console.error('Error sending certificate email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch generate and email certificates for multiple users
 */
export async function batchGenerateAndEmailCertificates(
  certificates: CertificateGenerationData[]
): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const cert of certificates) {
    const result = await generateAndEmailCertificate(cert);
    if (result.success) {
      results.success++;
    } else {
      results.failed++;
      results.errors.push(`${cert.certificateNumber}: ${result.error}`);
    }
  }

  return results;
}
