// Server-side performance fixes for 40x20s optimization
import compression from 'compression';
import { Express } from 'express';

export function applyPerformanceFixes(app: Express) {
  // 1. Enable compression if not already enabled
  if (!app._router?.stack?.some((layer: any) => layer.name === 'compression')) {
    app.use(compression({
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      }
    }));
    console.log('✅ Applied optimization: Compression middleware');
  }

  // 2. Set cache headers for static assets
  app.use((req, res, next) => {
    const path = req.path;
    
    // Static assets - 1 year cache
    if (/\.(js|css|jpg|jpeg|png|gif|ico|svg|woff|woff2)$/.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // API responses - short cache for performance
    else if (path.startsWith('/api/posts/feed')) {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    }
    // HTML - must revalidate
    else {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    
    next();
  });
  console.log('✅ Applied optimization: Cache headers');

  // 3. Memory optimization
  const runMemoryOptimization = () => {
    if (global.gc) {
      console.log('🧹 Optimizing memory usage...');
      global.gc();
    }
    
    // Clear old cache entries
    if ((global as any).cacheService?.clearOldEntries) {
      (global as any).cacheService.clearOldEntries();
      console.log('Cleared old cache entries');
    }
  };

  // Run memory optimization every 5 minutes
  setInterval(runMemoryOptimization, 5 * 60 * 1000);
  
  // Run immediately
  runMemoryOptimization();
  console.log('✅ Applied optimization: Memory management');

  // 4. Request timeout
  app.use((req, res, next) => {
    // 30 second timeout for all requests
    req.setTimeout(30000);
    res.setTimeout(30000);
    next();
  });
  console.log('✅ Applied optimization: Request timeouts');

  // 5. Optimize JSON responses
  app.set('json spaces', 0);
  console.log('✅ Applied optimization: Compact JSON responses');

  // 6. Enable trust proxy for better performance behind reverse proxies
  app.set('trust proxy', true);
  console.log('✅ Applied optimization: Trust proxy enabled');

  // 7. Disable X-Powered-By header
  app.disable('x-powered-by');
  console.log('✅ Applied optimization: Removed unnecessary headers');

  // 8. Implement aggressive garbage collection on idle
  if (global.gc) {
    let idleTimer: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        global.gc!();
        console.log('✅ Applied optimization: Idle garbage collection');
      }, 30000); // 30 seconds of idle
    };

    app.use((req, res, next) => {
      resetIdleTimer();
      next();
    });
    
    console.log('✅ Applied optimization: Implement aggressive garbage collection');
  }

  console.log('🚀 All server-side performance optimizations applied');
}