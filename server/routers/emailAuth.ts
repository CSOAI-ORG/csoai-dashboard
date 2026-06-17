import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { router, publicProcedure } from "../_core/trpc";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { Resend } from "resend";
import { sdk } from "../_core/sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

// Initialize Resend for email sending
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Rate limiting map (in-memory, resets on server restart)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const SALT_ROUNDS = 12;

function checkRateLimit(email: string): void {
  const now = Date.now();
  const attempt = loginAttempts.get(email);

  if (attempt) {
    if (now > attempt.resetAt) {
      // Reset window
      loginAttempts.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    } else if (attempt.count >= MAX_ATTEMPTS) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Too many login attempts. Please try again in 15 minutes.",
      });
    } else {
      attempt.count++;
    }
  } else {
    loginAttempts.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
  }
}

function resetRateLimit(email: string): void {
  loginAttempts.delete(email);
}

export const emailAuthRouter = router({
  /**
   * Register new user with email/password
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z
          .string()
          .min(6, "Password must be at least 6 characters"),
        name: z.string().min(1, "Name is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password, name } = input;

      // Check if user already exists
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      // Generate unique openId for email auth users
      const openId = `email_${crypto.randomBytes(16).toString("hex")}`;

      // Create user
      const userId = await db.createUser({
        openId,
        email,
        password: passwordHash,
        name,
        loginMethod: "email",
        role: "user",
      });

      // Log the new user straight in — issue a session the same way login does,
      // so the client can land on /dashboard instead of bouncing to /login.
      const sessionToken = await sdk.createSessionToken(openId, {
        name: name || email || "",
        expiresInMs: ONE_YEAR_MS,
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return {
        success: true,
        message: "Account created successfully",
        userId,
      };
    }),

  /**
   * Login with email/password
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;

      // Check rate limit
      checkRateLimit(email);

      // Get user by email
      const user = await db.getUserByEmail(email);
      if (!user || !user.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      // Reset rate limit on successful login
      resetRateLimit(email);

      // Update last signed in
      await db.updateUserLastSignedIn(user.id);

      // Create session token using the same mechanism as OAuth
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || user.email || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    }),

  /**
   * Request password reset
   */
  requestReset: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email address"),
      })
    )
    .mutation(async ({ input }) => {
      const { email } = input;

      // Get user by email
      const user = await db.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return {
          success: true,
          message:
            "If an account exists with this email, a password reset link has been sent",
        };
      }

      // Generate reset token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store token in database
      await db.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt: expiresAt.toISOString(),
      });

      // Send password reset email
      const resetUrl = `${process.env.VITE_FRONTEND_URL || 'https://csoai.org'}/reset-password?token=${token}`;
      
      if (resend) {
        try {
          await resend.emails.send({
            from: "CEASAI <noreply@csoai.org>",
            to: email,
            subject: "Reset Your CSOAI Password",
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">CSOAI</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">AI Safety & Compliance Platform</p>
                  </div>
                  
                  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #111827; margin-top: 0;">Reset Your Password</h2>
                    
                    <p style="color: #4b5563; font-size: 16px;">
                      We received a request to reset your password for your CSOAI account. Click the button below to create a new password:
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                      <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">Reset Password</a>
                    </div>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                      Or copy and paste this link into your browser:
                    </p>
                    <p style="color: #667eea; font-size: 14px; word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 6px;">
                      ${resetUrl}
                    </p>
                    
                    <div style="margin-top: 35px; padding-top: 25px; border-top: 1px solid #e5e7eb;">
                      <p style="color: #6b7280; font-size: 13px; margin: 0;">
                        <strong>This link will expire in 1 hour.</strong>
                      </p>
                      <p style="color: #6b7280; font-size: 13px; margin: 10px 0 0 0;">
                        If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                      </p>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
                    <p>© 2026 CSOAI. All rights reserved.</p>
                    <p style="margin-top: 10px;">
                      <a href="https://csoai.org" style="color: #667eea; text-decoration: none;">Visit our website</a> |
                      <a href="https://csoai.org/help" style="color: #667eea; text-decoration: none;">Help Center</a>
                    </p>
                  </div>
                </body>
              </html>
            `,
          });
          console.log(`[EmailAuth] Password reset email sent to ${email}`);
        } catch (error) {
          console.error(`[EmailAuth] Failed to send password reset email:`, error);
          // Don't fail the request if email fails - token is still valid
        }
      } else {
        console.log(
          `[EmailAuth] Resend not configured. Password reset token for ${email}: ${token}`
        );
      }

      return {
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent",
        // TEMPORARY: Include token in response for testing (REMOVE IN PRODUCTION)
        token: process.env.NODE_ENV === "development" ? token : undefined,
      };
    }),

  /**
   * Reset password with token
   */
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Token is required"),
        newPassword: z
          .string()
          .min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const { token, newPassword } = input;

      // Get token from database
      const resetToken = await db.getPasswordResetToken(token);
      if (!resetToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token",
        });
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(resetToken.expiresAt);
      if (now > expiresAt) {
        await db.deletePasswordResetToken(resetToken.id);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset token has expired",
        });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

      // Update user password
      await db.updateUserPassword(resetToken.userId, passwordHash);

      // Delete used token
      await db.deletePasswordResetToken(resetToken.id);

      return {
        success: true,
        message: "Password reset successfully",
      };
    }),
});
