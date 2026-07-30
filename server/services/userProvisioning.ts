/**
 * User Provisioning Service
 * Handles JWT token validation, user creation, and jurisdiction-specific provisioning
 */

import jwt from "jsonwebtoken";
import crypto from "crypto";

export interface ProvisionedUser {
  id: string;
  email: string;
  name: string;
  jurisdiction: string;
  organizationName: string;
  role: "admin" | "analyst" | "viewer";
  attributes: Record<string, unknown>;
  createdAt: string | Date;
  lastLogin: string | Date;
  isActive: boolean;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  jurisdiction: string;
  role: string;
  organizationName: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

/**
 * Token Validator
 * Validates JWT tokens from OAuth providers
 */
export class TokenValidator {
  private jwtSecret: string;
  private tokenExpiry: number = 3600; // 1 hour

  constructor(jwtSecret?: string) {
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET || "default-secret-change-in-production";
  }

  /**
   * Generate JWT token for authenticated user
   */
  generateToken(user: Omit<ProvisionedUser, "createdAt" | "lastLogin" | "isActive">): string {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      jurisdiction: user.jurisdiction,
      role: user.role,
      organizationName: user.organizationName,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.tokenExpiry,
      iss: "csoai-government-portal",
      aud: "csoai-api"
    };

    return jwt.sign(payload, this.jwtSecret, {
      algorithm: "HS256",
      expiresIn: this.tokenExpiry
    });
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, {
        algorithms: ["HS256"],
        issuer: "csoai-government-portal",
        audience: "csoai-api"
      });

      return decoded as JWTPayload;
    } catch (error) {
      console.error("[TokenValidator] Token verification failed:", error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const payload = this.verifyToken(token);
    if (!payload) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp <= now;
  }

  /**
   * Refresh token (issue new token with extended expiry)
   */
  refreshToken(token: string): string | null {
    const payload = this.verifyToken(token);
    if (!payload) return null;

    // Create new token with same payload but new expiry
    const newPayload: JWTPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.tokenExpiry
    };

    return jwt.sign(newPayload, this.jwtSecret, {
      algorithm: "HS256",
      expiresIn: this.tokenExpiry
    });
  }
}

/**
 * User Provisioning Service
 * Handles user creation and jurisdiction-specific setup
 */
export class UserProvisioningService {
  private tokenValidator: TokenValidator;
  // TODO: Replace with actual database queries
  private users: Map<string, ProvisionedUser> = new Map();

  constructor(tokenValidator?: TokenValidator) {
    this.tokenValidator = tokenValidator || new TokenValidator();
  }

  /**
   * Provision new user from OAuth provider
   */
  async provisionUser(oauthUser: {
    id: string;
    email: string;
    name: string;
    jurisdiction: string;
    organizationName: string;
    role: "admin" | "analyst" | "viewer";
    attributes: Record<string, unknown>;
  }): Promise<ProvisionedUser> {
    const now = new Date().toISOString();

    // Check if user already exists
    const existingUser = await this.getUserByEmail(oauthUser.email, oauthUser.jurisdiction);
    if (existingUser) {
      // Update last login
      existingUser.lastLogin = now;
      this.users.set(oauthUser.id, existingUser);
      return existingUser;
    }

    // Create new user
    const newUser: ProvisionedUser = {
      id: oauthUser.id,
      email: oauthUser.email,
      name: oauthUser.name,
      jurisdiction: oauthUser.jurisdiction,
      organizationName: oauthUser.organizationName,
      role: oauthUser.role,
      attributes: oauthUser.attributes,
      createdAt: now,
      lastLogin: now,
      isActive: true
    };

    // TODO: Insert into database
    // await db.insert(governmentUsers).values(newUser);

    // Apply jurisdiction-specific provisioning
    await this.applyJurisdictionProvisioning(newUser);

    this.users.set(oauthUser.id, newUser);
    return newUser;
  }

  /**
   * Apply jurisdiction-specific provisioning rules
   */
  private async applyJurisdictionProvisioning(user: ProvisionedUser): Promise<void> {
    switch (user.jurisdiction) {
      case "eu":
        await this.provisionEUUser(user);
        break;
      case "us":
        await this.provisionUSUser(user);
        break;
      case "china":
        await this.provisionChinaUser(user);
        break;
      default:
        console.warn(`[UserProvisioning] Unknown jurisdiction: ${user.jurisdiction}`);
    }
  }

  /**
   * EU-specific provisioning
   */
  private async provisionEUUser(user: ProvisionedUser): Promise<void> {
    console.log(`[UserProvisioning] Provisioning EU user: ${user.email}`);

    // EU-specific setup:
    // 1. Enable GDPR data protection
    // 2. Set data residency to EU
    // 3. Enable audit logging
    // 4. Set compliance with EU AI Act

    // TODO: Create user profile with EU settings
    // TODO: Grant access to EU compliance dashboard
    // TODO: Subscribe to EU regulatory updates
  }

  /**
   * US-specific provisioning
   */
  private async provisionUSUser(user: ProvisionedUser): Promise<void> {
    console.log(`[UserProvisioning] Provisioning US user: ${user.email}`);

    // US-specific setup:
    // 1. Enable NIST compliance monitoring
    // 2. Set data residency to US
    // 3. Enable FedRAMP compliance
    // 4. Configure government contractor access

    // TODO: Create user profile with US settings
    // TODO: Grant access to US compliance dashboard
    // TODO: Subscribe to US regulatory updates
  }

  /**
   * China-specific provisioning
   */
  private async provisionChinaUser(user: ProvisionedUser): Promise<void> {
    console.log(`[UserProvisioning] Provisioning China user: ${user.email}`);

    // China-specific setup:
    // 1. Enable TC260 compliance monitoring
    // 2. Set data residency to China
    // 3. Enable content security monitoring
    // 4. Configure government oversight access

    // TODO: Create user profile with China settings
    // TODO: Grant access to China compliance dashboard
    // TODO: Subscribe to China regulatory updates
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ProvisionedUser | null> {
    // TODO: Query database
    return this.users.get(userId) || null;
  }

  /**
   * Get user by email and jurisdiction
   */
  async getUserByEmail(email: string, jurisdiction: string): Promise<ProvisionedUser | null> {
    // TODO: Query database with email and jurisdiction filter
    const usersArray = Array.from(this.users.values());
    for (const user of usersArray) {
      if (user.email === email && user.jurisdiction === jurisdiction) {
        return user;
      }
    }
    return null;
  }

  /**
   * Update user role
   */
  async updateUserRole(
    userId: string,
    newRole: "admin" | "analyst" | "viewer"
  ): Promise<ProvisionedUser | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;

    user.role = newRole;
    // TODO: Update in database
    this.users.set(userId, user);
    return user;
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) return false;

    user.isActive = false;
    // TODO: Update in database
    this.users.set(userId, user);
    return true;
  }

  /**
   * Get all users for jurisdiction
   */
  async getUsersByJurisdiction(jurisdiction: string): Promise<ProvisionedUser[]> {
    // TODO: Query database
    const users: ProvisionedUser[] = [];
    const usersArray = Array.from(this.users.values());
    for (const user of usersArray) {
      if (user.jurisdiction === jurisdiction) {
        users.push(user);
      }
    }
    return users;
  }

  /**
   * Get all users for organization
   */
  async getUsersByOrganization(organizationName: string): Promise<ProvisionedUser[]> {
    // TODO: Query database
    const users: ProvisionedUser[] = [];
    const usersArray = Array.from(this.users.values());
    for (const user of usersArray) {
      if (user.organizationName === organizationName) {
        users.push(user);
      }
    }
    return users;
  }
}

/**
 * Session Manager
 * Manages user sessions and token lifecycle
 */
export class SessionManager {
  private tokenValidator: TokenValidator;
  private sessions: Map<string, { token: string; expiresAt: string }> = new Map();

  constructor(tokenValidator?: TokenValidator) {
    this.tokenValidator = tokenValidator || new TokenValidator();
  }

  /**
   * Create new session
   */
  createSession(userId: string, token: string): string {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    this.sessions.set(sessionId, { token, expiresAt });

    // TODO: Store in database or Redis
    console.log(`[SessionManager] Created session ${sessionId} for user ${userId}`);

    return sessionId;
  }

  /**
   * Validate session
   */
  validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Check if session is expired
    if (session.expiresAt < new Date().toISOString()) {
      this.sessions.delete(sessionId);
      return false;
    }

    // Check if token is valid
    return this.tokenValidator.verifyToken(session.token) !== null;
  }

  /**
   * Get token from session
   */
  getToken(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (session.expiresAt < new Date().toISOString()) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session.token;
  }

  /**
   * Revoke session
   */
  revokeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = new Date().toISOString();
    const sessionsArray = Array.from(this.sessions.entries());
    for (const [sessionId, session] of sessionsArray) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Export singletons
export const tokenValidator = new TokenValidator();
export const userProvisioningService = new UserProvisioningService(tokenValidator);
export const sessionManager = new SessionManager(tokenValidator);
