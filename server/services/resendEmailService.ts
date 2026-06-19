/**
 * Resend Email Service for CSOAI Platform
 * Handles all user lifecycle email notifications using Resend API
 */

import { Resend } from 'resend';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'CSOAI <noreply@csoai.org>';
const FRONTEND_URL = process.env.VITE_FRONTEND_URL || 'https://coai.manus.space';

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  to: string,
  userName: string
): Promise<EmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to CSOAI - Start Your AI Safety Journey',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header { 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white; 
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
    }
    .content { 
      padding: 40px 30px;
    }
    .content h2 {
      color: #10b981;
      font-size: 24px;
      margin-top: 0;
    }
    .cta-button {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      transition: background 0.2s;
    }
    .cta-button:hover {
      background: #059669;
    }
    .features {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .features ul {
      margin: 0;
      padding-left: 20px;
    }
    .features li {
      margin: 10px 0;
    }
    .footer { 
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #10b981;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛡️ Welcome to CSOAI</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Council of AIs - AI Safety & Compliance Platform</p>
    </div>
    
    <div class="content">
      <h2>Hi ${userName}! 👋</h2>
      
      <p>Welcome to CSOAI! We're thrilled to have you join our global community of AI Safety Analysts working to ensure AI systems are safe, compliant, and beneficial for humanity.</p>
      
      <div class="features">
        <strong>🎯 What's Next?</strong>
        <ul>
          <li><strong>Complete Training:</strong> Access 5 comprehensive modules covering EU AI Act, NIST AI RMF, and ISO 42001</li>
          <li><strong>Get Certified:</strong> Pass the 50-question certification exam (70% passing score)</li>
          <li><strong>Get to Work:</strong> Begin reviewing AI systems as a certified analyst</li>
          <li><strong>Join the Council:</strong> Participate in the 33-Agent Byzantine consensus system</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${FRONTEND_URL}/training" class="cta-button">Start Training Now →</a>
      </div>
      
      <p><strong>Why CSOAI Matters:</strong></p>
      <p>The EU AI Act enforcement deadline is August 2, 2026, and the world needs trained AI Safety Analysts. You're joining at a critical moment in AI governance history.</p>
      
      <p>Our platform combines:</p>
      <ul>
        <li>Industry-recognized certification</li>
        <li>Real-time incident monitoring (Watchdog system)</li>
        <li>SOAI-PDCA continuous improvement framework</li>
        <li>33-Agent Council for Byzantine fault-tolerant decision-making</li>
      </ul>
      
      <p>If you have any questions, our community is here to help. Check out our <a href="${FRONTEND_URL}/knowledge-base" style="color: #10b981;">Knowledge Base</a> or reach out to support.</p>
      
      <p>Let's build a safer AI future together! 🚀</p>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The CSOAI Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>CSOAI - Council of AIs</strong></p>
      <p>Operated by CEASAI Limited (Company Number: [PENDING]) | Independent Standards Body</p>
      <p>
        <a href="${FRONTEND_URL}/dashboard">Dashboard</a> • 
        <a href="${FRONTEND_URL}/training">Training</a> • 
        <a href="${FRONTEND_URL}/certification">Certification</a> • 
        <a href="${FRONTEND_URL}/watchdog">Watchdog</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px;">
        This email was sent to ${to} because you created an account on CSOAI.<br>
        <a href="${FRONTEND_URL}/settings">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[Resend] Error sending welcome email:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('[Resend] Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send welcome email',
    };
  }
}

/**
 * Send certification completion email with certificate attachment
 */
export async function sendCertificationEmail(
  to: string,
  userName: string,
  certificateId: string,
  courseName: string,
  score: number,
  certificatePdf?: Buffer
): Promise<EmailResult> {
  try {
    const attachments = certificatePdf ? [{
      filename: `CSOAI-Certificate-${certificateId}.pdf`,
      content: certificatePdf,
    }] : [];

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `🎉 Congratulations! You're Now a Certified AI Safety Analyst`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header { 
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white; 
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 36px;
      font-weight: 700;
    }
    .celebration {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content { 
      padding: 40px 30px;
    }
    .certificate-box {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border: 2px solid #10b981;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .certificate-box h2 {
      color: #10b981;
      margin: 0 0 15px 0;
      font-size: 28px;
    }
    .certificate-id {
      font-family: 'Courier New', monospace;
      font-size: 18px;
      font-weight: bold;
      color: #059669;
      background: white;
      padding: 12px 20px;
      border-radius: 6px;
      display: inline-block;
      margin: 10px 0;
    }
    .score-badge {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 8px 20px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 18px;
      margin: 15px 0;
    }
    .cta-button {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 10px;
      transition: background 0.2s;
    }
    .cta-button:hover {
      background: #059669;
    }
    .cta-button.secondary {
      background: white;
      color: #10b981;
      border: 2px solid #10b981;
    }
    .next-steps {
      background: #f8f9fa;
      padding: 25px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .next-steps h3 {
      color: #10b981;
      margin-top: 0;
    }
    .next-steps ul {
      margin: 0;
      padding-left: 20px;
    }
    .next-steps li {
      margin: 12px 0;
    }
    .footer { 
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #10b981;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="celebration">🎉🏆🎉</div>
      <h1>Congratulations!</h1>
      <p style="margin: 10px 0 0 0; font-size: 20px; opacity: 0.95;">You're Now a Certified AI Safety Analyst</p>
    </div>
    
    <div class="content">
      <p><strong>Hi ${userName},</strong></p>
      
      <p>Fantastic news! You've successfully passed the CSOAI certification exam and earned your official AI Safety Analyst certification. This is a significant achievement that demonstrates your expertise in AI safety frameworks and compliance.</p>
      
      <div class="certificate-box">
        <h2>🛡️ Official Certificate</h2>
        <p><strong>${courseName}</strong></p>
        <div class="score-badge">Score: ${score}%</div>
        <p style="margin: 20px 0 10px 0; font-size: 14px; color: #6b7280;">Certificate ID:</p>
        <div class="certificate-id">${certificateId}</div>
        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          ${certificatePdf ? '📎 Your certificate is attached to this email' : ''}
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${FRONTEND_URL}/certificates" class="cta-button">View Certificate →</a>
        <a href="${FRONTEND_URL}/verify-certificate/${certificateId}" class="cta-button secondary">Verify Certificate</a>
      </div>
      
      <div class="next-steps">
        <h3>🚀 What's Next?</h3>
        <ul>
          <li><strong>Get to Work:</strong> Access the Analyst Workbench to review AI safety cases</li>
          <li><strong>Share Your Achievement:</strong> Add your certification to LinkedIn and your resume</li>
          <li><strong>Join the Council:</strong> Participate in the 33-Agent Byzantine consensus system for critical decisions</li>
          <li><strong>Monitor Incidents:</strong> Use the Watchdog system to report and track AI safety incidents</li>
          <li><strong>Build Your Reputation:</strong> Complete reviews to climb the analyst leaderboard</li>
        </ul>
      </div>
      
      <p><strong>Certificate Verification:</strong></p>
      <p>Your certificate can be verified by anyone using the certificate ID above. Employers and organizations can visit our verification page to confirm your credentials instantly.</p>

      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
        <p style="margin: 0;"><strong>⚡ Urgent:</strong> The EU AI Act enforcement deadline is August 2, 2026. Enterprises are actively seeking certified analysts. Start reviewing cases now!</p>
      </div>
      
      <p>Welcome to the global community of AI Safety Analysts. Together, we're building a safer AI future for humanity.</p>
      
      <p style="margin-top: 30px;">
        Congratulations again,<br>
        <strong>The CSOAI Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>CSOAI - Council of AIs</strong></p>
      <p>Operated by CEASAI Limited (Company Number: [PENDING]) | Independent Standards Body</p>
      <p>
        <a href="${FRONTEND_URL}/workbench">Analyst Workbench</a> • 
        <a href="${FRONTEND_URL}/certificates">My Certificates</a> • 
        <a href="${FRONTEND_URL}/watchdog">Watchdog</a> • 
        <a href="${FRONTEND_URL}/knowledge-base">Knowledge Base</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px;">
        This email was sent to ${to}.<br>
        <a href="${FRONTEND_URL}/settings">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
      attachments,
    });

    if (error) {
      console.error('[Resend] Error sending certification email:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('[Resend] Error sending certification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send certification email',
    };
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  to: string,
  userName: string,
  plan: string,
  amount: number,
  currency: string,
  billingPeriod: 'monthly' | 'yearly',
  invoiceUrl?: string
): Promise<EmailResult> {
  try {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Payment Confirmed - ${plan} Plan Subscription`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header { 
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white; 
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
    }
    .content { 
      padding: 40px 30px;
    }
    .payment-summary {
      background: #f0f9ff;
      border: 2px solid #3b82f6;
      border-radius: 12px;
      padding: 25px;
      margin: 25px 0;
    }
    .payment-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e0f2fe;
    }
    .payment-row:last-child {
      border-bottom: none;
      font-weight: 700;
      font-size: 18px;
      color: #3b82f6;
      padding-top: 15px;
    }
    .cta-button {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 10px;
      transition: background 0.2s;
    }
    .cta-button:hover {
      background: #2563eb;
    }
    .features-list {
      background: #f8f9fa;
      padding: 20px 25px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .features-list ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .features-list li {
      margin: 8px 0;
    }
    .footer { 
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Confirmed</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Thank you for subscribing to CSOAI</p>
    </div>
    
    <div class="content">
      <p><strong>Hi ${userName},</strong></p>
      
      <p>Your payment has been successfully processed! You now have full access to all ${plan} plan features.</p>
      
      <div class="payment-summary">
        <h3 style="margin-top: 0; color: #3b82f6;">Payment Summary</h3>
        <div class="payment-row">
          <span>Plan:</span>
          <strong>${plan}</strong>
        </div>
        <div class="payment-row">
          <span>Billing Period:</span>
          <strong>${billingPeriod === 'yearly' ? 'Annual' : 'Monthly'}</strong>
        </div>
        <div class="payment-row">
          <span>Amount Paid:</span>
          <strong>${formattedAmount}</strong>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${FRONTEND_URL}/dashboard" class="cta-button">Go to Dashboard →</a>
        ${invoiceUrl ? `<a href="${invoiceUrl}" class="cta-button" style="background: white; color: #3b82f6; border: 2px solid #3b82f6;">View Invoice</a>` : ''}
      </div>
      
      <div class="features-list">
        <h3 style="margin-top: 0; color: #3b82f6;">What's Included in Your ${plan} Plan:</h3>
        <ul>
          ${plan === 'Pro' ? `
            <li>Unlimited AI system registrations</li>
            <li>Advanced compliance assessments</li>
            <li>Priority support</li>
            <li>API access with higher rate limits</li>
            <li>Custom PDCA cycle templates</li>
            <li>Detailed analytics and reporting</li>
          ` : plan === 'Enterprise' ? `
            <li>Everything in Pro, plus:</li>
            <li>Unlimited team members</li>
            <li>Dedicated account manager</li>
            <li>Custom integrations</li>
            <li>SLA guarantees</li>
            <li>White-label options</li>
            <li>Advanced security features</li>
          ` : `
            <li>5 AI system registrations</li>
            <li>Basic compliance tracking</li>
            <li>Community support</li>
            <li>Access to training materials</li>
            <li>Watchdog incident reporting</li>
          `}
        </ul>
      </div>
      
      <p><strong>Billing Information:</strong></p>
      <p>Your subscription will automatically renew on ${billingPeriod === 'yearly' ? 'the same date next year' : 'the same date next month'}. You can manage your subscription, update payment methods, or cancel anytime from your billing settings.</p>
      
      <p><strong>Need Help?</strong></p>
      <p>If you have any questions about your subscription or need assistance, our support team is here to help:</p>
      <ul>
        <li>Visit our <a href="${FRONTEND_URL}/knowledge-base" style="color: #3b82f6;">Knowledge Base</a></li>
        <li>Check out <a href="${FRONTEND_URL}/api-docs" style="color: #3b82f6;">API Documentation</a></li>
        <li>Contact support via the dashboard</li>
      </ul>
      
      <p>Thank you for choosing CSOAI to manage your AI safety and compliance needs!</p>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The CSOAI Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>CSOAI - Council of AIs</strong></p>
      <p>Operated by CEASAI Limited (Company Number: [PENDING]) | Independent Standards Body</p>
      <p>
        <a href="${FRONTEND_URL}/dashboard">Dashboard</a> • 
        <a href="${FRONTEND_URL}/settings/billing">Billing Settings</a> • 
        <a href="${FRONTEND_URL}/api-docs">API Docs</a> • 
        <a href="${FRONTEND_URL}/knowledge-base">Help Center</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px;">
        This email was sent to ${to}.<br>
        <a href="${FRONTEND_URL}/settings">Manage email preferences</a> • 
        <a href="${FRONTEND_URL}/settings/billing">Manage subscription</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[Resend] Error sending payment confirmation email:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('[Resend] Error sending payment confirmation email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send payment confirmation email',
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  userName: string,
  resetToken: string
): Promise<EmailResult> {
  try {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset Your CSOAI Password',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6; 
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header { 
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white; 
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
    }
    .content { 
      padding: 40px 30px;
    }
    .cta-button {
      display: inline-block;
      background: #6366f1;
      color: white;
      padding: 14px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      transition: background 0.2s;
    }
    .cta-button:hover {
      background: #4f46e5;
    }
    .warning-box {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .footer { 
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #6366f1;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Password Reset</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.95;">Reset your CSOAI account password</p>
    </div>
    
    <div class="content">
      <p><strong>Hi ${userName},</strong></p>
      
      <p>We received a request to reset your CSOAI account password. Click the button below to create a new password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" class="cta-button">Reset Password →</a>
      </div>
      
      <p>Or copy and paste this link into your browser:</p>
      <p style="background: #f8f9fa; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 14px; color: #6b7280;">
        ${resetUrl}
      </p>
      
      <div class="warning-box">
        <p style="margin: 0;"><strong>⚠️ Security Notice:</strong></p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>This link expires in 1 hour</li>
          <li>If you didn't request this reset, please ignore this email</li>
          <li>Your password will not change unless you click the link above</li>
        </ul>
      </div>
      
      <p><strong>Didn't request a password reset?</strong></p>
      <p>If you didn't request this password reset, you can safely ignore this email. Your account is secure and your password has not been changed.</p>
      
      <p>For security reasons, we recommend:</p>
      <ul>
        <li>Using a unique, strong password for your CSOAI account</li>
        <li>Enabling two-factor authentication (if available)</li>
        <li>Never sharing your password with anyone</li>
      </ul>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>The CSOAI Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>CSOAI - Council of AIs</strong></p>
      <p>Operated by CEASAI Limited (Company Number: [PENDING]) | Independent Standards Body</p>
      <p>
        <a href="${FRONTEND_URL}/login">Sign In</a> • 
        <a href="${FRONTEND_URL}/knowledge-base">Help Center</a> • 
        <a href="${FRONTEND_URL}/contact">Contact Support</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px;">
        This email was sent to ${to}.<br>
        If you have concerns about your account security, please contact support immediately.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[Resend] Error sending password reset email:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('[Resend] Error sending password reset email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send password reset email',
    };
  }
}
