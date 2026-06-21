import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";
import { persistAuditLog } from "../services/auditTrail";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const publicProcedure = t.procedure;

// Procedure paths that mutate data but should not be audit-logged
// (auth flows create too much noise and credentials must not be captured).
const AUDIT_EXCLUDED_PATHS = new Set([
  "emailAuth.login",
  "emailAuth.signup",
  "emailAuth.requestReset",
  "emailAuth.resetPassword",
  "oauth.callback",
  "oauth.login",
]);

/**
 * Audit middleware: persists a row to audit_logs for every authenticated
 * mutation that changes state. Queries and excluded auth paths are skipped.
 */
const auditMiddleware = t.middleware(async (opts) => {
  const start = Date.now();
  const result = await opts.next();
  const durationMs = Date.now() - start;

  if (opts.type !== "mutation") return result;
  if (AUDIT_EXCLUDED_PATHS.has(opts.path)) return result;

  const userId = opts.ctx.user?.id ?? null;
  // Skip anonymous mutations unless they are security-sensitive.
  if (!userId && !opts.path.startsWith("watchdog")) return result;

  // Redact obvious credential fields before logging.
  const rawInput = (opts as any).rawInput as Record<string, any> | undefined;
  const safeInput = rawInput
    ? Object.fromEntries(
        Object.entries(rawInput).map(([key, value]) => {
          const lower = key.toLowerCase();
          if (lower.includes("password") || lower.includes("secret") || lower.includes("token")) {
            return [key, "[REDACTED]"];
          }
          return [key, value];
        })
      )
    : undefined;

  const ipAddress =
    (opts.ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    opts.ctx.req.socket?.remoteAddress ||
    "unknown";

  // Best-effort persistence; never throw.
  await persistAuditLog({
    userId: userId ?? undefined,
    action: opts.path,
    entityType: opts.path.split(".")[0] || "unknown",
    details: {
      ok: result.ok,
      durationMs,
      input: safeInput,
    },
    ipAddress,
  });

  return result;
});

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser).use(auditMiddleware);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
).use(auditMiddleware);
