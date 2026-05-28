// Vercel Serverless Entry Point for CSOAI Dashboard
import "dotenv/config";
import * as Sentry from "@sentry/node";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import { handleStripeWebhook } from "../server/stripe/webhookHandler";
import { generatePDCATemplate } from "../server/utils/pdcaTemplateGenerator";
import watchdogApiRouter from "../server/routes/watchdog-api";
import coursesRouter from "../server/routers/courses";
import couponsRouter from "../server/routers/coupons";
import enrollmentRouter from "../server/routers/enrollment";
import { startHealthMonitoring } from "../server/services/healthMonitoring";
import path from "path";
import fs from "fs";

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    release: process.env.npm_package_version || '1.0.0',
    tracesSampleRate: 0.1,
  });
}

let appReady = false;
let expressApp: express.Express;

async function buildApp(): Promise<express.Express> {
  if (appReady && expressApp) {
    return expressApp;
  }

  const app = express();

  if (SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
  }

  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.use((req, res, next) => {
    const origin = req.get('origin') || req.get('referer')?.split('/').slice(0, 3).join('/');
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  registerOAuthRoutes(app);
  app.use("/api/watchdog", watchdogApiRouter);
  app.use("/api", coursesRouter);
  app.use("/api", couponsRouter);
  app.use("/api", enrollmentRouter);
  app.get("/api/download-template/:templateId", (req, res) => {
    generatePDCATemplate(req.params.templateId, res);
  });
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    if (SENTRY_DSN) {
      Sentry.captureException(err, { tags: { url: req.url, method: req.method } });
    }
    res.status(err.status || 500).json({
      error: err.message || 'Internal server error',
      status: err.status || 500
    });
  });

  const distPublicPath = path.resolve(process.cwd(), "dist", "public");
  if (fs.existsSync(distPublicPath)) {
    app.use(express.static(distPublicPath));
    app.use("*", (req, res) => {
      if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
        return;
      }
      res.sendFile(path.resolve(distPublicPath, "index.html"));
    });
  } else {
    app.get("*", (req, res) => {
      res.status(503).json({ error: 'Build not ready. Run pnpm run build first.' });
    });
  }

  expressApp = app;
  appReady = true;

  try {
    startHealthMonitoring();
  } catch (e) {
    console.log('Health monitoring not started:', e);
  }

  return app;
}

export default async function handler(req: any, res: any) {
  const app = await buildApp();
  return app(req, res);
}
