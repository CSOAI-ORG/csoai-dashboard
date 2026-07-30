/**
 * Government Portal Authentication & Authorization Service
 * OAuth2 integration for EU Commission, EDPB, and national authorities
 * Role-based access control with audit logging
 * Note: Using in-memory storage until governmentPortalAccess table is added
 */

import crypto from 'crypto';

export interface GovernmentUser {
  id: string;
  email: string;
  agencyName: string;
  jurisdiction: 'EU' | 'EDPB' | 'US' | 'UK' | 'CA' | 'AU';
  role: 'admin' | 'analyst' | 'viewer';
  permissions: string[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// In-memory storage
interface StoredPortalAccess {
  userId: string;
  agencyName: string;
  jurisdiction: string;
  role: string;
  permissions: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  lastAccessedAt: Date;
}

const portalAccessStore = new Map<string, StoredPortalAccess>();
const auditLogsStore: AuditLog[] = [];

/**
 * Government Authentication Service
 * Manages OAuth2 flows and role-based access
 */
export class GovernmentAuthService {
  private static readonly OAUTH_PROVIDERS = {
    EU: 'https://ec.europa.eu/oauth',
    EDPB: 'https://edpb.europa.eu/oauth',
    US: 'https://login.gov',
    UK: 'https://verify.digital.cabinet-office.gov.uk',
    CA: 'https://login.canada.ca',
    AU: 'https://www.australia.gov.au/oauth',
  };

  private static readonly ROLE_PERMISSIONS = {
    admin: [
      'view_all_data',
      'export_reports',
      'manage_users',
      'view_audit_logs',
      'modify_settings',
      'issue_enforcement',
    ],
    analyst: [
      'view_compliance_data',
      'view_incidents',
      'export_reports',
      'create_assessments',
      'view_audit_logs',
    ],
    viewer: ['view_compliance_data', 'view_incidents', 'view_public_reports'],
  };

  /**
   * Generate OAuth authorization URL
   */
  static generateAuthorizationUrl(
    jurisdiction: keyof typeof this.OAUTH_PROVIDERS,
    redirectUri: string,
  ): string {
    const state = crypto.randomBytes(32).toString('hex');
    const clientId = process.env[`OAUTH_${jurisdiction}_CLIENT_ID`] || 'client-id';

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'profile email',
      state,
    });

    return `${this.OAUTH_PROVIDERS[jurisdiction]}/authorize?${params.toString()}`;
  }

  /**
   * Exchange OAuth code for access token
   */
  static async exchangeAuthorizationCode(
    jurisdiction: string,
    code: string,
    redirectUri: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    try {
      // In production, make actual OAuth token exchange request
      // For now, return mock tokens
      const accessToken = crypto.randomBytes(32).toString('hex');
      const refreshToken = crypto.randomBytes(32).toString('hex');

      return {
        accessToken,
        refreshToken,
        expiresIn: 3600, // 1 hour
      };
    } catch (error) {
      console.error('Failed to exchange authorization code:', error);
      throw new Error('Failed to exchange authorization code');
    }
  }

  /**
   * Create or update government user
   */
  static async createGovernmentUser(
    userId: string,
    email: string,
    agencyName: string,
    jurisdiction: 'EU' | 'EDPB' | 'US' | 'UK' | 'CA' | 'AU',
    role: 'admin' | 'analyst' | 'viewer',
    accessToken: string,
    refreshToken: string,
  ): Promise<GovernmentUser> {
    try {
      const permissions = this.ROLE_PERMISSIONS[role];

      const portalAccess: StoredPortalAccess = {
        userId,
        agencyName,
        jurisdiction,
        role,
        permissions: JSON.stringify(permissions),
        accessToken,
        refreshToken,
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000),
        lastAccessedAt: new Date(),
      };

      portalAccessStore.set(userId, portalAccess);

      return {
        id: userId,
        email,
        agencyName,
        jurisdiction,
        role,
        permissions,
      };
    } catch (error) {
      console.error('Failed to create government user:', error);
      throw new Error('Failed to create government user');
    }
  }

  /**
   * Verify government user access
   */
  static async verifyAccess(userId: string, requiredPermission: string): Promise<boolean> {
    try {
      const user = portalAccessStore.get(userId);

      if (!user) {
        return false;
      }

      // Check token expiration
      if (user.tokenExpiresAt && new Date() > user.tokenExpiresAt) {
        return false;
      }

      // Parse permissions
      const permissions = user.permissions ? JSON.parse(user.permissions) : [];

      return permissions.includes(requiredPermission);
    } catch (error) {
      console.error('Failed to verify access:', error);
      return false;
    }
  }

  /**
   * Log government action for audit trail
   */
  static async logAction(
    userId: string,
    action: string,
    resource: string,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const auditLog: AuditLog = {
        id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        action,
        resource,
        details,
        timestamp: new Date(),
        ipAddress,
        userAgent,
      };

      auditLogsStore.push(auditLog);
      console.log('Audit Log:', JSON.stringify(auditLog, null, 2));
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }

  /**
   * Get audit logs for a user or resource
   */
  static async getAuditLogs(
    userId?: string,
    resource?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuditLog[]> {
    try {
      let logs = [...auditLogsStore];

      if (userId) {
        logs = logs.filter(l => l.userId === userId);
      }

      if (resource) {
        logs = logs.filter(l => l.resource === resource);
      }

      if (startDate) {
        logs = logs.filter(l => l.timestamp >= startDate);
      }

      if (endDate) {
        logs = logs.filter(l => l.timestamp <= endDate);
      }

      return logs;
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      throw new Error('Failed to get audit logs');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(userId: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      const user = portalAccessStore.get(userId);

      if (!user || !user.refreshToken) {
        throw new Error('Refresh token not found');
      }

      // In production, exchange refresh token with OAuth provider
      const newAccessToken = crypto.randomBytes(32).toString('hex');

      user.accessToken = newAccessToken;
      user.tokenExpiresAt = new Date(Date.now() + 3600 * 1000);
      portalAccessStore.set(userId, user);

      return {
        accessToken: newAccessToken,
        expiresIn: 3600,
      };
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Revoke government user access
   */
  static async revokeAccess(userId: string): Promise<void> {
    try {
      const user = portalAccessStore.get(userId);
      if (user) {
        user.accessToken = null;
        user.refreshToken = null;
        user.tokenExpiresAt = new Date();
        portalAccessStore.set(userId, user);
      }

      await this.logAction(userId, 'REVOKE_ACCESS', 'government_portal', {
        reason: 'User initiated revocation',
      });
    } catch (error) {
      console.error('Failed to revoke access:', error);
      throw new Error('Failed to revoke access');
    }
  }

  /**
   * Get government user details
   */
  static async getUser(userId: string): Promise<GovernmentUser | null> {
    try {
      const user = portalAccessStore.get(userId);

      if (!user) {
        return null;
      }

      const permissions = user.permissions ? JSON.parse(user.permissions) : [];

      return {
        id: user.userId,
        email: '',
        agencyName: user.agencyName,
        jurisdiction: user.jurisdiction as any,
        role: user.role as any,
        permissions,
      };
    } catch (error) {
      console.error('Failed to get user:', error);
      throw new Error('Failed to get user');
    }
  }
}
