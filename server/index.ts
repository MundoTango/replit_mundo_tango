import express, { type Request, Response, NextFunction } from "express";
import * as pathModule from "path";
import compression from "compression";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initSentry } from "./lib/sentry";
import { initializeBullMQ } from "./lib/bullmq-config";
import { register } from "./lib/prometheus-metrics";
import { initializeElasticsearch } from "./lib/elasticsearch-config";
import { initializeFeatureFlags } from "./lib/feature-flags";
import { sessionTimeoutMiddleware } from "./middleware/sessionTimeout";
import { shouldBlockIP } from "./security/suspiciousLogin";

const app = express();

// Initialize Sentry error tracking
initSentry(app);

// Prometheus metrics register is already initialized on import

// [SECURITY] Apply Helmet.js security headers - CRITICAL for preventing attacks
// Temporarily relaxed for development debugging
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://*.googleapis.com", "https://*.gstatic.com", "https://plausible.io"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://*.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "wss:", "https:", "http://localhost:*"],
        fontSrc: ["'self'", "https://*.gstatic.com"],
        frameSrc: ["'self'", "https://*.google.com"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
} else {
  // Development mode - disable CSP to allow Vite HMR and dev scripts
  app.use(helmet({
    contentSecurityPolicy: false,
    hsts: false
  }));
  console.log('⚠️  CSP disabled for development - DO NOT use in production!');
}

// [SECURITY] IP blocking middleware - Block suspicious IPs
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  if (shouldBlockIP(ip)) {
    console.log(`[SECURITY] Blocked request from IP: ${ip}`);
    return res.status(429).json({ 
      message: 'Too many failed attempts. Your IP has been temporarily blocked.' 
    });
  }
  next();
});

// [SECURITY] Session timeout middleware - Auto logout inactive users
app.use(sessionTimeoutMiddleware);

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

// LIFE CEO 40x20s DEBUG: Serve test page explicitly
app.get('/test.html', (req, res) => {
  console.log('🔍 Life CEO Debug: Serving test.html');
  res.sendFile(pathModule.join(process.cwd(), 'client/public/test.html'));
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
  
  // Initialize automated compliance monitoring with error handling
  try {
    const { automatedComplianceMonitor, initializeComplianceAuditTable } = await import('./services/automatedComplianceMonitor');
      await initializeComplianceAuditTable();
    await automatedComplianceMonitor.startAutomatedMonitoring();
  } catch (err) {
    console.error('⚠️  Compliance monitoring initialization failed:', err.message);
    // Continue without compliance monitoring
  }

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
    
    // Initialize performance tools
    Promise.all([
      initializeBullMQ(),
      initializeElasticsearch(),
      initializeFeatureFlags()
    ]).then(results => {
      console.log('🚀 Performance tools initialization complete:', results);
    }).catch(error => {
      console.warn('⚠️ Some performance tools failed to initialize:', error);
    });
    
    // Initialize GDPR Compliance Monitoring
    try {
      import('../compliance/monitoring/complianceMonitor').then(({ complianceMonitor }) => {
        complianceMonitor.startMonitoring();
        console.log('🔒 Compliance monitoring system initialized');
      }).catch(error => {
        console.warn('⚠️ Compliance monitoring initialization failed:', error.message);
      });
    } catch (error) {
      console.warn('⚠️ Compliance monitoring not available');
    }

    // Initialize Automatic Project Tracking
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
  });
})();
