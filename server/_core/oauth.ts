import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Login endpoint - redirects to OAuth authorization URL
  app.get("/api/auth/login", (req: Request, res: Response) => {
    const signup = req.query.signup === 'true';
    const ref = req.query.ref as string | undefined;
    // Don't double-encode: URLSearchParams already encodes values
    const redirectUri = `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/api/oauth/callback`;
    const state = btoa(redirectUri);
    
    const params = new URLSearchParams({
      client_id: process.env.VITE_FRONTEND_FORGE_API_KEY || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope: 'openid profile email',
    });
    
    const authUrl = `${process.env.VITE_OAUTH_PORTAL_URL || 'https://oauth.example.com'}/authorize?${params.toString()}`;
    res.redirect(302, authUrl);
  });

  // OAuth login endpoint - same as /api/auth/login but with query params support
  app.get("/api/oauth/login", (req: Request, res: Response) => {
    const signup = req.query.signup === 'true';
    const ref = req.query.ref as string | undefined;
    // Don't double-encode: URLSearchParams already encodes values
    const redirectUri = `${process.env.VITE_FRONTEND_URL || 'http://localhost:3000'}/api/oauth/callback`;
    const state = btoa(redirectUri);
    
    const params = new URLSearchParams({
      client_id: process.env.VITE_FRONTEND_FORGE_API_KEY || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      state,
      scope: 'openid profile email',
    });
    
    if (signup) {
      params.append('signup', 'true');
    }
    
    if (ref) {
      params.append('ref', ref);
    }
    
    const authUrl = `${process.env.VITE_OAUTH_PORTAL_URL || 'https://oauth.example.com'}/authorize?${params.toString()}`;
    res.redirect(302, authUrl);
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const returnTo = getQueryParam(req, "return_to");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date().toISOString(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Redirect to original page if return_to is provided, otherwise dashboard
      // Validate return_to is a relative path to prevent open redirect
      let redirectUrl = "/dashboard";
      if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
        redirectUrl = returnTo;
      }
      
      res.redirect(302, redirectUrl);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
