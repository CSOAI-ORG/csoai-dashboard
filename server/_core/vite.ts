import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

// Detect project root: in dev we're in server/_core, in prod we're in dist
const isBundled = import.meta.dirname.endsWith('/dist') || import.meta.dirname.endsWith('\\dist');
const projectRoot = isBundled
  ? path.resolve(import.meta.dirname, '..')
  : path.resolve(import.meta.dirname, '../..');

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Don't serve HTML for API routes - return 404 JSON instead
    if (url.startsWith('/api/')) {
      res.status(404).json({ error: 'API endpoint not found', path: url });
      return;
    }

    try {
      const clientTemplate = path.resolve(
        projectRoot,
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(projectRoot, "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    const url = req.originalUrl;
    
    // Don't serve HTML for API routes - return 404 JSON instead
    if (url.startsWith('/api/')) {
      res.status(404).json({ error: 'API endpoint not found', path: url });
      return;
    }
    
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
