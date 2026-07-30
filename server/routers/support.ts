import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Admin email to receive support requests
const ADMIN_EMAIL = 'support@csoai.org';

export const supportRouter = router({
  /**
   * Submit a human support request
   * Sends an email to the admin with chat history
   */
  submitHumanRequest: publicProcedure
    .input(
      z.object({
        email: z.string().email('Invalid email address'),
        message: z.string().optional(),
        chatHistory: z.array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
            timestamp: z.string(),
          })
        ).optional(),
        userId: z.number().optional(),
        userName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { email, message, chatHistory, userId, userName } = input;

      // Format chat history for email
      const chatHistoryHtml = chatHistory
        ? chatHistory
            .map(
              (msg) =>
                `<div style="margin-bottom: 12px; padding: 10px; background: ${
                  msg.role === 'user' ? '#e8f5e9' : '#f5f5f5'
                }; border-radius: 8px;">
                  <strong style="color: ${msg.role === 'user' ? '#2e7d32' : '#666'};">
                    ${msg.role === 'user' ? 'User' : 'AI Assistant'}
                  </strong>
                  <span style="color: #999; font-size: 12px; margin-left: 10px;">
                    ${new Date(msg.timestamp).toLocaleString()}
                  </span>
                  <p style="margin: 8px 0 0 0; white-space: pre-wrap;">${msg.content}</p>
                </div>`
            )
            .join('')
        : '<p>No chat history available</p>';

      if (resend) {
        try {
          // Send email to admin
          await resend.emails.send({
            from: 'CSOAI Support <noreply@csoai.org>',
            to: ADMIN_EMAIL,
            replyTo: email,
            subject: `[Human Support Request] from ${email}`,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Human Support Request</h1>
                  </div>
                  
                  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                    <h2 style="color: #111827; margin-top: 0; border-bottom: 2px solid #10b981; padding-bottom: 10px;">
                      Request Details
                    </h2>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold; width: 120px;">Email:</td>
                        <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
                      </tr>
                      ${userName ? `
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Name:</td>
                        <td style="padding: 8px 0;">${userName}</td>
                      </tr>
                      ` : ''}
                      ${userId ? `
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold;">User ID:</td>
                        <td style="padding: 8px 0;">${userId}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Submitted:</td>
                        <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
                      </tr>
                    </table>
                    
                    ${message ? `
                    <h3 style="color: #111827; margin-top: 20px;">Additional Message:</h3>
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981;">
                      <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                    </div>
                    ` : ''}
                    
                    <h3 style="color: #111827; margin-top: 30px;">Chat History:</h3>
                    <div style="max-height: 500px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
                      ${chatHistoryHtml}
                    </div>
                    
                    <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                      <p style="margin: 0; font-weight: bold; color: #92400e;">Action Required:</p>
                      <p style="margin: 8px 0 0 0; color: #92400e;">
                        Please respond to this user within 2-4 hours. Reply directly to this email to contact them.
                      </p>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; border-radius: 0 0 10px 10px;">
                    <p>This is an automated message from the CSOAI Support System</p>
                  </div>
                </body>
              </html>
            `,
          });

          // Send confirmation email to user
          await resend.emails.send({
            from: 'CSOAI Support <noreply@csoai.org>',
            to: email,
            subject: 'We received your support request - CSOAI',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">CSOAI</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Support Request Received</p>
                  </div>
                  
                  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #111827; margin-top: 0;">We've Got Your Request!</h2>
                    
                    <p style="color: #4b5563; font-size: 16px;">
                      Thank you for reaching out to our support team. We've received your request and a member of our team will get back to you shortly.
                    </p>
                    
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0;">
                      <h3 style="color: #166534; margin: 0 0 10px 0;">What happens next?</h3>
                      <ul style="color: #166534; margin: 0; padding-left: 20px;">
                        <li>Our team will review your request</li>
                        <li>You'll receive a response within 2-4 hours during business hours</li>
                        <li>Urgent issues are escalated immediately</li>
                      </ul>
                    </div>
                    
                    <p style="color: #4b5563; font-size: 16px;">
                      In the meantime, you might find answers in our <a href="https://csoai.org/faq" style="color: #10b981;">FAQ section</a> or <a href="https://csoai.org/help-center" style="color: #10b981;">Help Center</a>.
                    </p>
                    
                    <div style="margin-top: 35px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 13px; margin: 0;">
                        If you have additional information to add, simply reply to this email.
                      </p>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
                    <p>© 2026 CSOAI. All rights reserved.</p>
                    <p style="margin-top: 10px;">
                      <a href="https://csoai.org" style="color: #10b981; text-decoration: none;">Visit our website</a> |
                      <a href="https://csoai.org/support" style="color: #10b981; text-decoration: none;">Support Center</a>
                    </p>
                  </div>
                </body>
              </html>
            `,
          });

          console.log(`[Support] Human support request submitted from ${email}`);
        } catch (error) {
          console.error(`[Support] Failed to send support request email:`, error);
          throw new Error('Failed to submit support request. Please try again or email support@csoai.org directly.');
        }
      } else {
        console.log(`[Support] Resend not configured. Support request from ${email}:`, message);
      }

      return {
        success: true,
        message: 'Your support request has been submitted. Our team will contact you within 2-4 hours.',
      };
    }),
});
