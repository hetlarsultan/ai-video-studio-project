import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
// @ts-ignore - vite.config is not typed
const viteConfig = {} as any;

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const clientDir = path.resolve(
    import.meta.dirname,
    "..",
    "..",
    "client"
  );

  const vite = await createViteServer({
    ...viteConfig,
    root: clientDir,
    configFile: false,
    server: serverOptions,
    appType: "custom",
    resolve: {
      alias: {
        "@": path.resolve(clientDir, "src"),
        "@shared": path.resolve(import.meta.dirname, "..", "..", "shared"),
      },
    },
  });

  // Serve static files from client/public BEFORE Vite middlewares
  const publicDir = path.resolve(
    import.meta.dirname,
    "..",
    "..",
    "client",
    "public"
  );
  app.use(express.static(publicDir));
  
  app.use(vite.middlewares);
  
  // Render index.html for navigation requests only
  // Skip API routes, source files, Vite assets, and static files
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    
    // Skip non-HTML requests
    if (
      url.includes("/@") || // Vite internal
      url.includes("/node_modules/") ||
      url.includes("/ffmpeg/") ||
      url.includes("/manifest.json") ||
      url.includes("/favicon") ||
      url.includes(".js") ||
      url.includes(".css") ||
      url.includes(".json") ||
      url.includes(".png") ||
      url.includes(".svg") ||
      url.includes(".woff") ||
      url.includes(".woff2") ||
      url.startsWith("/api/")
    ) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
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
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
