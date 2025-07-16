import express, { type Request, Response, NextFunction } from "express";
import * as pathModule from "path";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Enable compression for all responses
app.use(compression({
  level: 6, // Balance between speed and compression ratio
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Compress all responses except already compressed content
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Smart caching strategy based on content type
app.use((req, res, next) => {
  // Static assets should be cached
  if (req.path.match(/\.(js|css|jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
  } 
  // API responses - cache based on endpoint
  else if (req.path.startsWith('/api/')) {
    if (req.path.includes('/auth/') || req.path.includes('/notifications/')) {
      // Auth and notifications should not be cached
      res.setHeader('Cache-Control', 'no-store');
    } else if (req.method === 'GET') {
      // Cache GET requests for 5 minutes
      res.setHeader('Cache-Control', 'private, max-age=300');
    } else {
      // Don't cache POST/PUT/DELETE
      res.setHeader('Cache-Control', 'no-store');
    }
  }
  // HTML pages - short cache for development
  else {
    res.setHeader('Cache-Control', 'no-cache');
  }
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'))

// Serve service worker files
app.get('/service-worker-workbox.js', (req, res) => {
  res.sendFile(pathModule.join(process.cwd(), 'client/service-worker-workbox.js'));
});

(async () => {
  // 30L Framework - Layer 23: Business Continuity
  // Initialize with database resilience
  try {
    // Test database connection before starting services
    const { pool } = await import('./db');
    await pool.query('SELECT 1');
    console.log('✅ Database connection established');
  } catch (err) {
    console.error('❌ Initial database connection failed:', err.message);
    console.log('⚠️  Starting server in degraded mode - some features may be unavailable');
  }
  
  // Disabled compliance monitoring for performance - will be initialized on-demand
  // try {
  //   const { automatedComplianceMonitor, initializeComplianceAuditTable } = await import('./services/automatedComplianceMonitor');
  //     await initializeComplianceAuditTable();
  //   await automatedComplianceMonitor.startAutomatedMonitoring();
  // } catch (err) {
  //   console.error('⚠️  Compliance monitoring initialization failed:', err.message);
  //   // Continue without compliance monitoring
  // }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    console.error(err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Disabled GDPR Compliance Monitoring for performance - will be initialized on-demand
    // try {
    //   import('../compliance/monitoring/complianceMonitor').then(({ complianceMonitor }) => {
    //     complianceMonitor.startMonitoring();
    //     console.log('🔒 Compliance monitoring system initialized');
    //   }).catch(error => {
    //     console.warn('⚠️ Compliance monitoring initialization failed:', error.message);
    //   });
    // } catch (error) {
    //   console.warn('⚠️ Compliance monitoring not available');
    // }
  });
})();
