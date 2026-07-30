import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import governmentRouter from "./api/government.js";
import enterpriseRouter from "./api/enterprise.js";
import watchdogIncidentsRouter from "./api/watchdog-incidents.js";
import badgesRouter from "./api/badges.js";
import adminCmsRouter from "./routers/adminCms.js";
import { initializeWebSocketServer } from "./websocket/server.js";
import { registerOAuthRoutes } from "./_core/oauth.js";
import { initializeDigestScheduler } from "./services/digestScheduler.js";
import { setWebSocketServer } from "./websocket/analyticsEvents.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Store server reference for WebSocket
  (app as any).server = server;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Register OAuth routes
  registerOAuthRoutes(app);

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use("/api/government", governmentRouter);
  app.use("/api/v1", enterpriseRouter);
  app.use("/api/watchdog", watchdogIncidentsRouter);
  app.use("/api/badges", badgesRouter);
  app.use("/api", adminCmsRouter);
  
  // tRPC routes (if available)
  try {
    const { appRouter } = await import("./routers.js");
    const { createContext } = await import("./_core/context.js");
    const { createExpressMiddleware } = await import("@trpc/server/adapters/express");
    app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
    console.log("✅ tRPC router mounted at /api/trpc");
  } catch (e) {
    console.error("❌ tRPC router failed to load:", e);
  }

  // API Documentation
  app.get("/api/docs", (_req, res) => {
    res.json({
      version: "1.0.0",
      title: "CSOAI API",
      description: "Global AI Safety Governance Platform"
    });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  // Initialize WebSocket server
  const wss = initializeWebSocketServer(server);
  console.log('WebSocket server initialized');
  
  // Set WebSocket server for analytics events
  setWebSocketServer(wss);
  console.log('Analytics WebSocket events initialized');
  
  // Initialize digest scheduler
  initializeDigestScheduler();
  console.log('Digest scheduler initialized');

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`WebSocket server available at ws://localhost:${port}/ws`);
  });
}

startServer().catch(console.error);
