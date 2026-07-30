import "dotenv/config";
import * as Sentry from "@sentry/node";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook } from "../stripe/webhookHandler";
import { generatePDCATemplate } from "../utils/pdcaTemplateGenerator";
import watchdogApiRouter from "../routes/watchdog-api";
import coursesRouter from "../routers/courses";
import couponsRouter from "../routers/coupons";
import enrollmentRouter from "../routers/enrollment";
import { startHealthMonitoring } from "../services/healthMonitoring";

// Initialize Sentry for backend error tracking
const SENTRY_DSN = process.env.SENTRY_DSN;

// Error categories for Sentry alerting
const ERROR_CATEGORIES = {
  // Critical errors that should trigger immediate alerts
  CRITICAL: ['database', 'stripe', 'payment', 'authentication_system'],
  // High priority errors that need attention within hours
  HIGH: ['api_error', 'validation', 'rate_limit'],
  // Medium priority - review daily
  MEDIUM: ['user_error', 'configuration'],
  // Low priority - expected behavior, filtered but logged
  LOW: ['user_action', 'network', 'expected'],
};

// Helper to categorize errors for alerting
function categorizeError(error: Error | unknown, errorMessage: string): { 
  category: string; 
  priority: 'critical' | 'high' | 'medium' | 'low';
  shouldAlert: boolean;
} {
  // Database errors - CRITICAL
  if (errorMessage.includes('Database') || errorMessage.includes('ECONNREFUSED') && errorMessage.includes('3306')) {
    return { category: 'database', priority: 'critical', shouldAlert: true };
  }
  
  // Stripe/Payment errors - CRITICAL
  if (errorMessage.includes('Stripe') || errorMessage.includes('payment') || errorMessage.includes('checkout')) {
    // Exclude expected payment errors
    if (!errorMessage.includes('Payment plan not available')) {
      return { category: 'payment', priority: 'critical', shouldAlert: true };
    }
  }
  
  // Rate limiting triggered - HIGH (potential abuse)
  if (errorMessage.includes('rate limit') || errorMessage.includes('Too many')) {
    return { category: 'rate_limit', priority: 'high', shouldAlert: true };
  }
  
  // API errors - HIGH
  if (errorMessage.includes('API') || errorMessage.includes('Internal server error')) {
    return { category: 'api_error', priority: 'high', shouldAlert: true };
  }
  
  // Validation errors - MEDIUM
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return { category: 'validation', priority: 'medium', shouldAlert: false };
  }
  
  // Expected user errors - LOW (filtered)
  if (errorMessage.includes('Please login') || 
      errorMessage.includes('UNAUTHORIZED') || 
      errorMessage.includes('FORBIDDEN') ||
      errorMessage.includes('do not have required permission')) {
    return { category: 'user_action', priority: 'low', shouldAlert: false };
  }
  
  // Network errors - LOW (filtered)
  if (errorMessage.includes('ECONNRESET') || 
      errorMessage.includes('ETIMEDOUT') || 
      errorMessage.includes('ECONNREFUSED')) {
    return { category: 'network', priority: 'low', shouldAlert: false };
  }
  
  // Default - MEDIUM priority for unknown errors
  return { category: 'unknown', priority: 'medium', shouldAlert: true };
}

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '1.0.0',
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Filter and categorize errors before sending
    beforeSend(event, hint) {
      const error = hint.originalException;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Categorize the error
      const { category, priority, shouldAlert } = categorizeError(error, errorMessage);
      
      // Add category and priority as tags for Sentry alerting rules
      event.tags = {
        ...event.tags,
        error_category: category,
        error_priority: priority,
        should_alert: shouldAlert ? 'true' : 'false',
      };
      
      // Add fingerprint for better grouping
      event.fingerprint = [category, errorMessage.slice(0, 100)];
      
      // Filter out low priority errors in production to reduce noise
      if (priority === 'low' && process.env.NODE_ENV === 'production') {
        // Still log locally but don't send to Sentry
        console.log(`[Sentry Filtered] ${category}: ${errorMessage}`);
        return null;
      }
      
      // Ignore specific expected errors
      // Connection reset errors - network issues, not bugs
      if (error instanceof Error && error.message.includes('ECONNRESET')) {
        return null;
      }
      
      // Expected user errors - unauthenticated access attempts
      if (errorMessage.includes('Please login') || errorMessage.includes('10001')) {
        return null;
      }
      
      // Permission denied errors - expected for non-admin users
      if (errorMessage.includes('do not have required permission') || errorMessage.includes('10002')) {
        return null;
      }
      
      // Payment plan not available errors - expected for misconfigured courses
      if (errorMessage.includes('Payment plan not available')) {
        return null;
      }
      
      // TRPC unauthorized/forbidden errors - expected for unauthenticated users
      if (errorMessage.includes('UNAUTHORIZED') || errorMessage.includes('FORBIDDEN')) {
        return null;
      }
      
      // Network timeout errors
      if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ECONNREFUSED')) {
        return null;
      }
      
      // Safari Array.from polyfill errors - already handled client-side
      if (errorMessage.includes('Array.from') || errorMessage.includes('streamdown') || errorMessage.includes('shiki')) {
        return null;
      }
      
      return event;
    },
  });
  
  console.log('[Sentry] Backend error tracking initialized');
  console.log('[Sentry] Alert categories configured: CRITICAL (database, payment), HIGH (api, rate_limit), MEDIUM (validation, unknown)');
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Sentry request handler - must be first middleware
  if (SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
  }
  
  // Stripe webhook needs raw body - MUST be before express.json()
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // CORS headers for OAuth routes - MUST be before registerOAuthRoutes
  app.use((req, res, next) => {
    const origin = req.get('origin') || req.get('referer')?.split('/').slice(0, 3).join('/');
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Credentials", "true");
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Public Watchdog API
  app.use("/api/watchdog", watchdogApiRouter);
  
  // Courses API
  app.use("/api", coursesRouter);
  
  // Coupons API
  app.use("/api", couponsRouter);
  
  // Enrollment API
  app.use("/api", enrollmentRouter);
  
  // PDF template download endpoint
  app.get("/api/download-template/:templateId", (req, res) => {
    const { templateId } = req.params;
    generatePDCATemplate(templateId, res);
  });
  
  // tRPC API with CORS
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // Error handling middleware with Sentry
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    
    // Report to Sentry with additional context
    if (SENTRY_DSN) {
      const errorMessage = err.message || String(err);
      const { category, priority } = categorizeError(err, errorMessage);
      
      Sentry.captureException(err, {
        tags: {
          url: req.url,
          method: req.method,
          error_category: category,
          error_priority: priority,
        },
        extra: {
          body: req.body,
          query: req.query,
          params: req.params,
          userAgent: req.get('user-agent'),
          ip: req.ip,
        },
      });
    }
    
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      status: err.status || 500
    });
  });
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Start automated health monitoring
    startHealthMonitoring();
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  if (SENTRY_DSN) {
    Sentry.captureException(err);
  }
  process.exit(1);
});
