/**
 * Email Service for CSOAI Platform
 * Handles sending emails with PDF attachments
 */

import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

// Email configuration from environment
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "noreply@coai.app";

// For development/demo, use ethereal email (fake SMTP)
let transporter: Transporter | null = null;
let testAccount: { user: string; pass: string } | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporter) return transporter;

  // Check if real SMTP credentials are configured
  if (SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    return transporter;
  }

  // Use ethereal for testing (creates a test account)
  if (!testAccount) {
    testAccount = await nodemailer.createTestAccount();
  }

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

/**
 * Send an email with optional attachments
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  try {
    const transport = await getTransporter();

    const mailOptions = {
      from: SMTP_FROM,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments?.map((att) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      })),
    };

    const info = await transport.sendMail(mailOptions);

    // Get preview URL for ethereal test emails
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl ? String(previewUrl) : undefined,
    };
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

/**
 * Send a PDCA cycle report via email
 */
export async function sendPDCAReport(
  recipientEmail: string,
  cycleNumber: number,
  aiSystemName: string,
  pdfBuffer: Buffer
): Promise<EmailResult> {
  const subject = `CSOAI PDCA Cycle Report - Cycle #${cycleNumber}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .highlight { color: #3b82f6; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>CSOAI</h1>
        <p>Council of AIs - AI Safety & Compliance Platform</p>
      </div>
      <div class="content">
        <h2>PDCA Cycle Report</h2>
        <p>Hello,</p>
        <p>Please find attached the PDCA (Plan-Do-Check-Act) cycle report for:</p>
        <ul>
          <li><strong>Cycle Number:</strong> <span class="highlight">#${cycleNumber}</span></li>
          <li><strong>AI System:</strong> <span class="highlight">${aiSystemName}</span></li>
        </ul>
        <p>This report contains detailed information about all phases of the continuous improvement cycle, including:</p>
        <ul>
          <li>Executive Summary</li>
          <li>Plan Phase - Objectives and problem identification</li>
          <li>Do Phase - Implementation details</li>
          <li>Check Phase - Results analysis</li>
          <li>Act Phase - Improvements and standardization</li>
          <li>Timeline visualization</li>
        </ul>
        <p>If you have any questions about this report, please contact your organization's AI compliance team.</p>
        <p>Best regards,<br>The CSOAI Team</p>
      </div>
      <div class="footer">
        <p>This email was sent from the CSOAI Platform - Council of AIs</p>
        <p>AI Safety, Compliance, and Continuous Improvement</p>
      </div>
    </body>
    </html>
  `;

  const text = `
CSOAI PDCA Cycle Report

Cycle Number: #${cycleNumber}
AI System: ${aiSystemName}

Please find attached the PDCA cycle report containing:
- Executive Summary
- Plan Phase details
- Do Phase details
- Check Phase details
- Act Phase details
- Timeline visualization

Best regards,
The CSOAI Team
  `.trim();

  return sendEmail({
    to: recipientEmail,
    subject,
    html,
    text,
    attachments: [
      {
        filename: `PDCA-Cycle-${cycleNumber}-Report.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}


/**
 * Send an email with attachments (generic version)
 */
export async function sendEmailWithAttachment(options: {
  to: string;
  subject: string;
  html: string;
  attachments: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}): Promise<EmailResult> {
  return sendEmail({
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  });
}
