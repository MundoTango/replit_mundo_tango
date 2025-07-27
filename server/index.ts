import express, { type Request, Response, NextFunction } from "express";
import * as pathModule from "path";
import compression from "compression";
import { Server as SocketServer } from 'socket.io';
import { createServer as createHttpServer } from 'http';
// Load environment variables first, before any other imports that might use them
import dotenv from "dotenv";
dotenv.config();

import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initSentry } from "./lib/sentry";
// Removed static import of initializeBullMQ to prevent Redis connections on startup
import { register } from "./lib/prometheus-metrics";
import { initializeElasticsearch } from "./lib/elasticsearch-config";
import { initializeFeatureFlags } from "./lib/feature-flags";
import { logger, phase1Logger, phase4Logger, logLearning } from "./lib/logger";
import { setupSwagger } from "./lib/swagger-config";
import { 
  contentSecurityPolicy, 
  securityHeaders, 
  sanitizeInput,
  csrfProtection,
  sessionSecurityConfig 
} from "./middleware/security";

const app = express();

// 40x20s Framework - Layer 21: Production Resilience
// Add process-level error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  logger.fatal({ error, stack: error.stack }, 'Uncaught Exception');
  // Don't exit - keep the server running
});

process.on('unhandledRejection', (reason, promise) => {
  // Better error logging for unhandled rejections
  const errorDetails = {
    reason: reason instanceof Error ? {
      message: reason.message,
      stack: reason.stack,
      name: reason.name
    } : reason,
    promise: String(promise)
  };
  logger.fatal(errorDetails, 'Unhandled Rejection');
  // Log to console for visibility
  console.error('Unhandled Promise Rejection:', reason);
  // Don't exit - keep the server running
});

// Initialize Sentry error tracking
initSentry(app);

// Prometheus metrics register is already initialized on import

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

// Add support for Brotli compression headers
app.use((req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (acceptEncoding.includes('br')) {
    res.setHeader('Vary', 'Accept-Encoding');
  }
  next();
});

// HTTP/2 Server Push hints
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/enhanced-timeline') {
    res.setHeader('Link', [
      '</src/index.css>; rel=preload; as=style',
      '</api/auth/user>; rel=preload; as=fetch; crossorigin',
      '</api/posts/feed>; rel=preload; as=fetch; crossorigin'
    ].join(', '));
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add aggressive no-cache headers to prevent caching issues
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
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
    phase1Logger.info('Database connection established');
  } catch (err) {
    phase1Logger.error({ error: err }, 'Initial database connection failed');
    phase1Logger.warn('Starting server in degraded mode - some features may be unavailable');
  }
  
  // Initialize automated compliance monitoring with error handling
  try {
    const { automatedComplianceMonitor, initializeComplianceAuditTable } = await import('./services/automatedComplianceMonitor');
      await initializeComplianceAuditTable();
    await automatedComplianceMonitor.startAutomatedMonitoring();
  } catch (err) {
    logger.warn({ error: err }, 'Compliance monitoring initialization failed');
    // Continue without compliance monitoring
  }

  const server = await registerRoutes(app);

  // Initialize WebSocket service
  const { initializeWebSocket } = await import('./services/websocketService');
  const websocketService = initializeWebSocket(server);
  logger.info('WebSocket service initialized');

  // Setup OpenAPI documentation
  setupSwagger(app);
  phase4Logger.info('OpenAPI documentation available at /api-docs');

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    logger.error({ error: err }, 'Express error handler');
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
    logger.info({ port }, `Server listening on port ${port}`);
    logLearning('Open source tools integration successful', 0.95);
    
    // Initialize performance tools
    const performanceInitPromises = [];
    
    // Only initialize BullMQ if Redis is enabled
    if (process.env.DISABLE_REDIS !== 'true') {
      performanceInitPromises.push(
        import('./lib/bullmq-config').then(({ initializeBullMQ }) => initializeBullMQ())
      );
    } else {
      console.log('⚠️ BullMQ skipped - Redis is disabled');
    }
    
    performanceInitPromises.push(initializeElasticsearch());
    performanceInitPromises.push(initializeFeatureFlags());
    
    Promise.all(performanceInitPromises).then(results => {
      phase4Logger.info({ results }, 'Performance tools initialization complete');
    }).catch(error => {
      phase4Logger.warn({ error }, 'Some performance tools failed to initialize');
    });
    
    // Initialize GDPR Compliance Monitoring
    try {
      import('../compliance/monitoring/complianceMonitor').then(({ complianceMonitor }) => {
        complianceMonitor.startMonitoring();
        logger.info('Compliance monitoring system initialized');
      }).catch(error => {
        logger.warn({ error }, 'Compliance monitoring initialization failed');
      });
    } catch (error) {
      logger.warn({ error }, 'Compliance monitoring not available');
    }

    // Initialize Automatic Project Tracking
    // TEMPORARILY DISABLED: Debugging restart issue
    /*
    try {
      import('../scripts/watch-project-updates').then(({ ProjectDataWatcher }) => {
        const watcher = new ProjectDataWatcher();
        watcher.start();
        console.log('📊 Automatic project tracking initialized');
      }).catch(error => {
        console.warn('⚠️ Project tracking initialization failed:', error.message);
      });
    } catch (error) {
      console.warn('⚠️ Project tracking not available');
    }
    */
  });
  
  // Apply performance fixes from 40x20s optimization
  import('./lib/performance-fixes.js').then(({ applyPerformanceFixes }) => {
    applyPerformanceFixes(app);
  }).catch(error => {
    console.warn('⚠️ Performance fixes could not be applied:', error);
  });
})();
