import app, { serverPromise } from "./app.js"; // Add extension here too!
import { setupVite, serveStatic } from "./vite.js"; // Add extension
import { log } from "./logger.js";

// This file is the entry point for LOCAL development and production server (non-serverless)
(async () => {
  const server = await serverPromise;

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5001 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5001', 10);
  server.listen({
    port,
    host: "0.0.0.0"
  }, () => {
    log(`✅ Serving on http://localhost:${port}`);
  });
})();
