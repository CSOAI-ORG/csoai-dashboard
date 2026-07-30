import { Request, Response, NextFunction } from "express";

/**
 * Government Portal Authentication Middleware
 * Handles OAuth 2.0 authentication and jurisdiction-based access control
 */

export interface AuthenticatedGovernmentRequest extends Request {
  government?: {
    userId: string;
    email: string;
    jurisdiction: string;
    role: "admin" | "analyst" | "viewer";
    organizationName: string;
  };
}

/**
 * OAuth 2.0 Token Payload
 */
export interface OAuthTokenPayload {
  sub: string; // User ID
  email: string;
  jurisdiction: string;
  role: "admin" | "analyst" | "viewer";
  organizationName: string;
  iat: number;
  exp: number;
}

/**
 * Verify government portal authentication
 * Checks for valid OAuth token in Authorization header
 */
export const verifyGovernmentAuth = (
  req: AuthenticatedGovernmentRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid authorization header"
        }
      });
      return;
    }

    const token = authHeader.substring(7);

    // TODO: Verify JWT token with OAuth provider
    // For now, parse token and extract claims
    const decoded = parseToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired token"
        }
      });
      return;
    }

    // Attach government user info to request
    req.government = {
      userId: decoded.sub,
      email: decoded.email,
      jurisdiction: decoded.jurisdiction,
      role: decoded.role,
      organizationName: decoded.organizationName
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "AUTH_ERROR",
        message: "Authentication error"
      }
    });
  }
};

/**
 * Verify jurisdiction access
 * Ensures user can only access their jurisdiction's data
 */
export const verifyJurisdictionAccess = (allowedJurisdictions: string[]) => {
  return (
    req: AuthenticatedGovernmentRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.government) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Government authentication required"
        }
      });
      return;
    }

    if (!allowedJurisdictions.includes(req.government.jurisdiction)) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Access denied for jurisdiction: ${req.government.jurisdiction}`
        }
      });
      return;
    }

    next();
  };
};

/**
 * Verify role-based access
 * Ensures user has required role
 */
export const verifyRole = (requiredRoles: string[]) => {
  return (
    req: AuthenticatedGovernmentRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.government) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Government authentication required"
        }
      });
      return;
    }

    if (!requiredRoles.includes(req.government.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Insufficient permissions. Required role: ${requiredRoles.join(", ")}`
        }
      });
      return;
    }

    next();
  };
};

/**
 * Log government action for audit trail
 */
export const logGovernmentAction = async (
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  changes?: Record<string, unknown>
): Promise<void> => {
  try {
    console.log(`[AuditLog] User ${userId} performed ${action} on ${entityType} ${entityId}`);

    // TODO: Insert into compliance_audit_trail table
    // const auditEntry = await db.insert(complianceAuditTrail).values({
    //   action,
    //   entityType,
    //   entityId,
    //   changedBy: userId,
    //   newValue: changes,
    //   timestamp: new Date().toISOString()
    // });

    console.log(`[AuditLog] Audit entry created`);
  } catch (error) {
    console.error("[AuditLog] Error logging action:", error);
  }
};

/**
 * Parse JWT token (simplified - in production use proper JWT library)
 */
function parseToken(token: string): OAuthTokenPayload | null {
  try {
    // In production, verify signature with OAuth provider's public key
    // For now, just decode the payload
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload as OAuthTokenPayload;
  } catch (error) {
    console.error("[Auth] Error parsing token:", error);
    return null;
  }
}

/**
 * OAuth 2.0 Configuration
 * Configure with your OAuth provider
 */
export const oauthConfig = {
  // EU Government Portal
  eu: {
    provider: "EU Digital Identity",
    clientId: process.env.EU_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.EU_OAUTH_CLIENT_SECRET || "",
    authorizationUrl: "https://eu-identity.example.com/oauth/authorize",
    tokenUrl: "https://eu-identity.example.com/oauth/token",
    userInfoUrl: "https://eu-identity.example.com/oauth/userinfo",
    redirectUri: `${process.env.API_BASE_URL || "http://localhost:3000"}/api/government/auth/callback`
  },

  // US Government Portal
  us: {
    provider: "US Federal Identity",
    clientId: process.env.US_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.US_OAUTH_CLIENT_SECRET || "",
    authorizationUrl: "https://us-identity.example.com/oauth/authorize",
    tokenUrl: "https://us-identity.example.com/oauth/token",
    userInfoUrl: "https://us-identity.example.com/oauth/userinfo",
    redirectUri: `${process.env.API_BASE_URL || "http://localhost:3000"}/api/government/auth/callback`
  },

  // China Government Portal
  china: {
    provider: "China Digital Identity",
    clientId: process.env.CHINA_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.CHINA_OAUTH_CLIENT_SECRET || "",
    authorizationUrl: "https://china-identity.example.com/oauth/authorize",
    tokenUrl: "https://china-identity.example.com/oauth/token",
    userInfoUrl: "https://china-identity.example.com/oauth/userinfo",
    redirectUri: `${process.env.API_BASE_URL || "http://localhost:3000"}/api/government/auth/callback`
  }
};

/**
 * Generate OAuth authorization URL
 */
export const generateAuthorizationUrl = (jurisdiction: string, state: string): string => {
  const config = oauthConfig[jurisdiction as keyof typeof oauthConfig];

  if (!config) {
    throw new Error(`Unknown jurisdiction: ${jurisdiction}`);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "openid profile email",
    state
  });

  return `${config.authorizationUrl}?${params.toString()}`;
};

/**
 * Exchange authorization code for access token
 */
export const exchangeCodeForToken = async (
  jurisdiction: string,
  code: string
): Promise<{ accessToken: string; expiresIn: number } | null> => {
  try {
    const config = oauthConfig[jurisdiction as keyof typeof oauthConfig];

    if (!config) {
      throw new Error(`Unknown jurisdiction: ${jurisdiction}`);
    }

    const response = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri
      }).toString()
    });

    if (!response.ok) {
      console.error("[Auth] Token exchange failed:", response.statusText);
      return null;
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in
    };
  } catch (error) {
    console.error("[Auth] Error exchanging code for token:", error);
    return null;
  }
};

/**
 * Get user info from OAuth provider
 */
export const getUserInfo = async (
  jurisdiction: string,
  accessToken: string
): Promise<OAuthTokenPayload | null> => {
  try {
    const config = oauthConfig[jurisdiction as keyof typeof oauthConfig];

    if (!config) {
      throw new Error(`Unknown jurisdiction: ${jurisdiction}`);
    }

    const response = await fetch(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      console.error("[Auth] User info request failed:", response.statusText);
      return null;
    }

    const data = await response.json();

    return {
      sub: data.sub,
      email: data.email,
      jurisdiction,
      role: data.role || "viewer",
      organizationName: data.organization_name || "",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
  } catch (error) {
    console.error("[Auth] Error getting user info:", error);
    return null;
  }
};
