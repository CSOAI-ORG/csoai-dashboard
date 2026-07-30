import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { eq, and, gt } from "drizzle-orm";
import { getDb } from "../db";
import { apiKeys, users } from "../../drizzle/schema";

export interface EnterpriseApiContext {
  apiKeyId: number;
  userId: number;
  tier: "free" | "pro" | "enterprise";
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      enterprise?: EnterpriseApiContext;
    }
  }
}

function hashKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/**
 * Express middleware that validates an API key against the database.
 * Expects `X-API-Key` header with a key of the form `coai_<64 hex chars>`.
 * On success, attaches `req.enterprise` with the key context.
 */
export async function authenticateEnterprise(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const rawKey = req.headers["x-api-key"] as string | undefined;

  if (!rawKey) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Missing API key" },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (!rawKey.startsWith("coai_") || rawKey.length !== 69) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid API key format" },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const db = await getDb();
  if (!db) {
    res.status(503).json({
      success: false,
      error: { code: "SERVICE_UNAVAILABLE", message: "Database unavailable" },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const keyHash = hashKey(rawKey);
  const now = new Date();

  const [keyRow] = await db
    .select({
      id: apiKeys.id,
      userId: apiKeys.userId,
      tier: apiKeys.tier,
      permissions: apiKeys.permissions,
      expiresAt: apiKeys.expiresAt,
      isActive: apiKeys.isActive,
    })
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.keyHash, keyHash),
        eq(apiKeys.isActive, 1),
        // Not expired (expiresAt IS NULL OR expiresAt > NOW)
      )
    )
    .limit(1);

  if (!keyRow) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid or revoked API key" },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (keyRow.expiresAt && new Date(keyRow.expiresAt) <= now) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "API key expired" },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Touch lastUsedAt asynchronously; don't block the request.
  db.update(apiKeys)
    .set({ lastUsedAt: now.toISOString().slice(0, 19).replace("T", " ") })
    .where(eq(apiKeys.id, keyRow.id))
    .then(() => {})
    .catch((err) => console.error("[Enterprise API] Failed to update lastUsedAt:", err));

  const permissions: string[] = Array.isArray(keyRow.permissions)
    ? (keyRow.permissions as string[])
    : [];

  req.enterprise = {
    apiKeyId: keyRow.id,
    userId: keyRow.userId,
    tier: keyRow.tier as EnterpriseApiContext["tier"],
    permissions,
  };

  next();
}
