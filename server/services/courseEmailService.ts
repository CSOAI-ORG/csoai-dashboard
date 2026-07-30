/**
 * Course Email Notification Service
 * Handles sending emails for enrollment confirmations and course completions
 */

import { sendEmail } from '../emailService';

export interface EnrollmentEmailData {
  userEmail: string;
  userName: string;
  courseName: string;
  courseDescription?: string;
  enrollmentDate: string;
  isFree: boolean;
  amountPaid?: number;
  couponCode?: string;
}

export interface CompletionEmailData {
  userEmail: string;
  userName: string;
  courseName: string;
  completionDate: string;
  score?: number;
  certificateUrl?: string;
}

/**
 * Send enrollment confirmation email
 */
export async function sendEnrollmentConfirmationEmail(data: EnrollmentEmailData) {
  const { userEmail, userName, courseName, courseDescription, enrollmentDate, isFree, amountPaid, couponCode } = data;
  
  const subject = `Enrollment Confirmed: ${courseName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to ${courseName}!</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Hi ${userName},
        </p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Congratulations! You have successfully enrolled in <strong>${courseName}</strong>.
        </p>
        
        ${courseDescription ? `
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              ${courseDescription}
            </p>
          </div>
        ` : ''}
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #111827; font-size: 18px;">Enrollment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Enrollment Date:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500; text-align: right;">
                ${new Date(enrollmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </td>
            </tr>
            ${!isFree && amountPaid ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Amount Paid:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 500; text-align: right;">
                  £${(amountPaid / 100).toFixed(2)}
                </td>
              </tr>
            ` : ''}
            ${isFree && couponCode ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Promo Code Used:</td>
                <td style="padding: 8px 0; color: #10b981; font-weight: 500; text-align: right;">
                  ${couponCode}
                </td>
              </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Status:</td>
              <td style="padding: 8px 0; color: #10b981; font-weight: 500; text-align: right;">
                ${isFree ? '✓ Free Enrollment' : '✓ Payment Confirmed'}
              </td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/my-courses" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Start Learning Now
          </a>
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>💡 Pro Tip:</strong> Access your course anytime from the "My Courses" page in your dashboard.
          </p>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          If you have any questions, feel free to reach out to our support team.
        </p>
        
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
          Best regards,<br>
          <strong>The CSOAI Team</strong>
        </p>
      </div>
    </div>
  `;
  
  const text = `
Hi ${userName},

Congratulations! You have successfully enrolled in ${courseName}.

${courseDescription ? `About this course:\n${courseDescription}\n\n` : ''}

Enrollment Details:
- Enrollment Date: ${new Date(enrollmentDate).toLocaleDateString('en-GB')}
${!isFree && amountPaid ? `- Amount Paid: £${(amountPaid / 100).toFixed(2)}` : ''}
${isFree && couponCode ? `- Promo Code Used: ${couponCode}` : ''}
- Status: ${isFree ? 'Free Enrollment' : 'Payment Confirmed'}

Start learning now: ${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/my-courses

Best regards,
The CSOAI Team
  `.trim();
  
  return sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send course completion certificate email
 */
export async function sendCompletionCertificateEmail(data: CompletionEmailData) {
  const { userEmail, userName, courseName, completionDate, score, certificateUrl } = data;
  
  const subject = `🎓 Course Completed: ${courseName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <div style="font-size: 48px; margin-bottom: 10px;">🎓</div>
        <h1 style="margin: 0; font-size: 28px;">Congratulations!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You've completed the course</p>
      </div>
      
      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Hi ${userName},
        </p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          We're thrilled to inform you that you have successfully completed <strong>${courseName}</strong>! 🎉
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #111827; font-size: 18px;">Completion Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Course Name:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500; text-align: right;">
                ${courseName}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Completion Date:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 500; text-align: right;">
                ${new Date(completionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </td>
            </tr>
            ${score !== undefined ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Final Score:</td>
                <td style="padding: 8px 0; color: #10b981; font-weight: 600; text-align: right; font-size: 18px;">
                  ${score}%
                </td>
              </tr>
            ` : ''}
          </table>
        </div>
        
        ${certificateUrl ? `
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; border: 2px solid #f59e0b;">
            <div style="font-size: 32px; margin-bottom: 10px;">📜</div>
            <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px;">Your Certificate is Ready!</h3>
            <a href="${certificateUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Download Certificate
            </a>
          </div>
        ` : ''}
        
        <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>🚀 What's Next?</strong> Continue your learning journey by exploring more courses in your dashboard.
          </p>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          We're proud of your achievement and look forward to supporting your continued growth!
        </p>
        
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
          Best regards,<br>
          <strong>The CSOAI Team</strong>
        </p>
      </div>
    </div>
  `;
  
  const text = `
Hi ${userName},

Congratulations! You have successfully completed ${courseName}! 🎉

Completion Details:
- Course Name: ${courseName}
- Completion Date: ${new Date(completionDate).toLocaleDateString('en-GB')}
${score !== undefined ? `- Final Score: ${score}%` : ''}

${certificateUrl ? `Download your certificate: ${certificateUrl}\n\n` : ''}

Continue your learning journey by exploring more courses in your dashboard.

Best regards,
The CSOAI Team
  `.trim();
  
  return sendEmail({
    to: userEmail,
    subject,
    html,
    text,
  });
}
