import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  // Check direct protocol
  if (req.protocol === "https") return true;
  
  // Check x-forwarded-proto header (common in proxied environments)
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (forwardedProto) {
    const protoList = Array.isArray(forwardedProto)
      ? forwardedProto
      : forwardedProto.split(",");
    if (protoList.some(proto => proto.trim().toLowerCase() === "https")) {
      return true;
    }
  }
  
  // Check CF-Visitor header (Cloudflare)
  const cfVisitor = req.headers["cf-visitor"];
  if (cfVisitor) {
    try {
      const visitor = typeof cfVisitor === "string" ? JSON.parse(cfVisitor) : cfVisitor;
      if (visitor.scheme === "https") return true;
    } catch {
      // Ignore parse errors
    }
  }
  
  // Check X-Forwarded-SSL header
  const forwardedSsl = req.headers["x-forwarded-ssl"];
  if (forwardedSsl === "on") return true;
  
  // Check Front-End-Https header (Microsoft)
  const frontEndHttps = req.headers["front-end-https"];
  if (frontEndHttps === "on") return true;
  
  return false;
}

function isLocalhost(req: Request): boolean {
  const hostname = req.hostname || req.headers.host?.split(":")[0] || "";
  return LOCAL_HOSTS.has(hostname) || hostname.endsWith(".localhost");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const secure = isSecureRequest(req);
  const localhost = isLocalhost(req);
  
  // For production (HTTPS), use sameSite: "lax" for better mobile compatibility
  // sameSite: "none" requires secure: true and can cause issues on some mobile browsers
  // sameSite: "lax" works better for same-site navigation (like redirects after login)
  
  // Use "lax" for production - it allows cookies on same-site navigation
  // and top-level navigations (like clicking a link or redirect)
  // This is more compatible with mobile browsers, especially Safari
  const sameSite: "lax" | "strict" | "none" = localhost ? "lax" : "lax";

  return {
    httpOnly: true,
    path: "/",
    sameSite,
    secure: secure || !localhost, // Always secure in production
  };
}
