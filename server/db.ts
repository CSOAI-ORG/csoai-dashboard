import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../drizzle/schema";
import type { InferInsertModel } from "drizzle-orm";
type InsertUser = InferInsertModel<typeof users>;
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    // Normalize to MySQL DATETIME literal ("YYYY-MM-DD HH:MM:SS").
    // Callers pass JS `new Date().toISOString()` ("...T...Z"), which MySQL's
    // timestamp column rejects, failing the whole upsert. That failure inside
    // authenticateRequest dropped ctx.user and surfaced as "Please login
    // (10001)" on every protected procedure for email-auth users.
    const toMysqlDatetime = (v: string): string =>
      /\dT\d/.test(v) || v.endsWith("Z")
        ? new Date(v).toISOString().slice(0, 19).replace("T", " ")
        : v;

    if (user.lastSignedIn !== undefined) {
      const normalizedTs = toMysqlDatetime(user.lastSignedIn);
      values.lastSignedIn = normalizedTs;
      updateSet.lastSignedIn = normalizedTs;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Export db getter for backward compatibility with services that import { db }
export const db = {
  async getDb() { return getDb(); }
};

// TODO: add feature queries here as your schema grows.

// Email/Password Authentication Functions

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by email: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(user: InsertUser): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot create user: database not available");
  }

  const result = await db.insert(users).values(user);
  return Number(result[0].insertId);
}

export async function updateUserLastSignedIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update last signed in: database not available");
    return;
  }

  await db.update(users)
    .set({ lastSignedIn: new Date().toISOString().slice(0, 19).replace('T', ' ') })
    .where(eq(users.id, userId));
}

export async function updateUserPassword(userId: number, passwordHash: string): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot update password: database not available");
  }

  await db.update(users)
    .set({ password: passwordHash })
    .where(eq(users.id, userId));
}

export async function createPasswordResetToken(data: { userId: number; token: string; expiresAt: string }): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Cannot create reset token: database not available");
  }

  const { passwordResetTokens } = await import("../drizzle/schema");
  const result = await db.insert(passwordResetTokens).values(data);
  return Number(result[0].insertId);
}

export async function getPasswordResetToken(token: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get reset token: database not available");
    return undefined;
  }

  const { passwordResetTokens } = await import("../drizzle/schema");
  const result = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deletePasswordResetToken(tokenId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete reset token: database not available");
    return;
  }

  const { passwordResetTokens } = await import("../drizzle/schema");
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, tokenId));
}
