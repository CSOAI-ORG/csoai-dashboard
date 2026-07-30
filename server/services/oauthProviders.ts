/**
 * OAuth Provider Integration Service
 * Handles authentication with EU eIDAS, US Login.gov, and China digital ID systems
 */

import crypto from "crypto";

export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  jurisdiction: string;
  organizationName: string;
  role: "admin" | "analyst" | "viewer";
  attributes: Record<string, unknown>;
}

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * EU eIDAS OAuth Provider
 * European Digital Identity Infrastructure
 */
export class EUeIDASProvider {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Get authorization URL for EU eIDAS
   */
  getAuthorizationUrl(state: string, nonce: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: "code",
      scope: "openid profile email",
      redirect_uri: this.redirectUri,
      state,
      nonce,
      prompt: "login"
    });

    return `https://eid.eidas.eu/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for token
   */
  async exchangeCodeForToken(code: string): Promise<OAuthToken | null> {
    try {
      const response = await fetch("https://eid.eidas.eu/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri
        }).toString()
      });

      if (!response.ok) {
        console.error("[EU eIDAS] Token exchange failed:", response.statusText);
        return null;
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        idToken: data.id_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type
      };
    } catch (error) {
      console.error("[EU eIDAS] Error exchanging code:", error);
      return null;
    }
  }

  /**
   * Get user info from EU eIDAS
   */
  async getUserInfo(accessToken: string): Promise<OAuthUser | null> {
    try {
      const response = await fetch("https://eid.eidas.eu/oauth/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        console.error("[EU eIDAS] User info request failed:", response.statusText);
        return null;
      }

      const data = await response.json();

      return {
        id: data.sub,
        email: data.email,
        name: data.name,
        jurisdiction: "eu",
        organizationName: data.organization || "EU Government",
        role: this.mapRole(data.roles),
        attributes: {
          country: data.country,
          department: data.department,
          level: data.assurance_level
        }
      };
    } catch (error) {
      console.error("[EU eIDAS] Error getting user info:", error);
      return null;
    }
  }

  /**
   * Verify ID token signature
   */
  async verifyIdToken(idToken: string): Promise<boolean> {
    try {
      // TODO: Verify JWT signature with EU eIDAS public key
      // For now, just decode and check expiration
      const parts = idToken.split(".");
      if (parts.length !== 3) return false;

      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      const now = Math.floor(Date.now() / 1000);

      return payload.exp > now;
    } catch (error) {
      console.error("[EU eIDAS] Error verifying ID token:", error);
      return false;
    }
  }

  private mapRole(roles: string[]): "admin" | "analyst" | "viewer" {
    if (roles?.includes("admin")) return "admin";
    if (roles?.includes("analyst")) return "analyst";
    return "viewer";
  }
}

/**
 * US Login.gov OAuth Provider
 * US Federal Identity Management
 */
export class USLoginGovProvider {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Get authorization URL for US Login.gov
   */
  getAuthorizationUrl(state: string, nonce: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: "code",
      scope: "openid profile email",
      redirect_uri: this.redirectUri,
      state,
      nonce,
      acr_values: "ial2 aal2" // Identity Assurance Level 2, Authentication Assurance Level 2
    });

    return `https://secure.login.gov/openid_connect/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for token
   */
  async exchangeCodeForToken(code: string): Promise<OAuthToken | null> {
    try {
      const response = await fetch("https://secure.login.gov/api/openid_connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri
        }).toString()
      });

      if (!response.ok) {
        console.error("[Login.gov] Token exchange failed:", response.statusText);
        return null;
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        idToken: data.id_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type
      };
    } catch (error) {
      console.error("[Login.gov] Error exchanging code:", error);
      return null;
    }
  }

  /**
   * Get user info from US Login.gov
   */
  async getUserInfo(accessToken: string): Promise<OAuthUser | null> {
    try {
      const response = await fetch("https://secure.login.gov/api/openid_connect/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        console.error("[Login.gov] User info request failed:", response.statusText);
        return null;
      }

      const data = await response.json();

      return {
        id: data.sub,
        email: data.email,
        name: data.name,
        jurisdiction: "us",
        organizationName: data.agency || "US Government",
        role: this.mapRole(data.roles),
        attributes: {
          agency: data.agency,
          department: data.department,
          ial: data.ial,
          aal: data.aal
        }
      };
    } catch (error) {
      console.error("[Login.gov] Error getting user info:", error);
      return null;
    }
  }

  private mapRole(roles: string[]): "admin" | "analyst" | "viewer" {
    if (roles?.includes("admin")) return "admin";
    if (roles?.includes("analyst")) return "analyst";
    return "viewer";
  }
}

/**
 * China Digital ID OAuth Provider
 * China's National Digital Identity System
 */
export class ChinaDigitalIDProvider {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Get authorization URL for China Digital ID
   */
  getAuthorizationUrl(state: string, nonce: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: "code",
      scope: "openid profile email",
      redirect_uri: this.redirectUri,
      state,
      nonce,
      response_mode: "query"
    });

    return `https://id.china.gov.cn/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for token
   */
  async exchangeCodeForToken(code: string): Promise<OAuthToken | null> {
    try {
      const response = await fetch("https://id.china.gov.cn/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri
        }).toString()
      });

      if (!response.ok) {
        console.error("[China Digital ID] Token exchange failed:", response.statusText);
        return null;
      }

      const data = await response.json();

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        idToken: data.id_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type
      };
    } catch (error) {
      console.error("[China Digital ID] Error exchanging code:", error);
      return null;
    }
  }

  /**
   * Get user info from China Digital ID
   */
  async getUserInfo(accessToken: string): Promise<OAuthUser | null> {
    try {
      const response = await fetch("https://id.china.gov.cn/oauth/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        console.error("[China Digital ID] User info request failed:", response.statusText);
        return null;
      }

      const data = await response.json();

      return {
        id: data.sub,
        email: data.email,
        name: data.name,
        jurisdiction: "china",
        organizationName: data.organization || "China Government",
        role: this.mapRole(data.roles),
        attributes: {
          province: data.province,
          department: data.department,
          certLevel: data.cert_level
        }
      };
    } catch (error) {
      console.error("[China Digital ID] Error getting user info:", error);
      return null;
    }
  }

  private mapRole(roles: string[]): "admin" | "analyst" | "viewer" {
    if (roles?.includes("admin")) return "admin";
    if (roles?.includes("analyst")) return "analyst";
    return "viewer";
  }
}

/**
 * OAuth Provider Factory
 */
export class OAuthProviderFactory {
  private providers: Map<string, EUeIDASProvider | USLoginGovProvider | ChinaDigitalIDProvider> =
    new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // EU eIDAS
    const euProvider = new EUeIDASProvider(
      process.env.EU_OAUTH_CLIENT_ID || "",
      process.env.EU_OAUTH_CLIENT_SECRET || "",
      `${process.env.API_BASE_URL || "http://localhost:3000"}/api/government/auth/callback/eu`
    );
    this.providers.set("eu", euProvider);

    // US Login.gov
    const usProvider = new USLoginGovProvider(
      process.env.US_OAUTH_CLIENT_ID || "",
      process.env.US_OAUTH_CLIENT_SECRET || "",
      `${process.env.API_BASE_URL || "http://localhost:3000"}/api/government/auth/callback/us`
    );
    this.providers.set("us", usProvider);

    // China Digital ID
    const chinaProvider = new ChinaDigitalIDProvider(
      process.env.CHINA_OAUTH_CLIENT_ID || "",
      process.env.CHINA_OAUTH_CLIENT_SECRET || "",
      `${process.env.API_BASE_URL || "http://localhost:3000"}/api/government/auth/callback/china`
    );
    this.providers.set("china", chinaProvider);

    console.log("[OAuthProviderFactory] Initialized OAuth providers for EU, US, and China");
  }

  /**
   * Get provider by jurisdiction
   */
  getProvider(
    jurisdiction: string
  ): EUeIDASProvider | USLoginGovProvider | ChinaDigitalIDProvider | null {
    return this.providers.get(jurisdiction) || null;
  }

  /**
   * Get authorization URL
   */
  getAuthorizationUrl(jurisdiction: string, state: string, nonce: string): string | null {
    const provider = this.getProvider(jurisdiction);
    if (!provider) return null;

    if (provider instanceof EUeIDASProvider) {
      return provider.getAuthorizationUrl(state, nonce);
    } else if (provider instanceof USLoginGovProvider) {
      return provider.getAuthorizationUrl(state, nonce);
    } else if (provider instanceof ChinaDigitalIDProvider) {
      return provider.getAuthorizationUrl(state, nonce);
    }

    return null;
  }

  /**
   * Exchange code for token
   */
  async exchangeCodeForToken(jurisdiction: string, code: string): Promise<OAuthToken | null> {
    const provider = this.getProvider(jurisdiction);
    if (!provider) return null;

    if (provider instanceof EUeIDASProvider) {
      return provider.exchangeCodeForToken(code);
    } else if (provider instanceof USLoginGovProvider) {
      return provider.exchangeCodeForToken(code);
    } else if (provider instanceof ChinaDigitalIDProvider) {
      return provider.exchangeCodeForToken(code);
    }

    return null;
  }

  /**
   * Get user info
   */
  async getUserInfo(jurisdiction: string, accessToken: string): Promise<OAuthUser | null> {
    const provider = this.getProvider(jurisdiction);
    if (!provider) return null;

    if (provider instanceof EUeIDASProvider) {
      return provider.getUserInfo(accessToken);
    } else if (provider instanceof USLoginGovProvider) {
      return provider.getUserInfo(accessToken);
    } else if (provider instanceof ChinaDigitalIDProvider) {
      return provider.getUserInfo(accessToken);
    }

    return null;
  }
}

// Export singleton instance
export const oauthProviderFactory = new OAuthProviderFactory();
