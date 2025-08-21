// Server-side performance optimizations
// 40x20s Framework - Layer 10: Infrastructure Optimization

export const performanceMiddleware = {
  // Enable compression
  compression: {
    level: 6,
    threshold: 1024,
    filter: (req: any, res: any) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return true;
    }
  },

  // Cache control headers
  cacheHeaders: (req: any, res: any, next: any) => {
    const path = req.path;
    
    // Static assets - 1 year
    if (/\.(js|css|jpg|jpeg|png|gif|ico|svg|woff|woff2)$/.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    // API responses - no cache
    else if (path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    // HTML - revalidate
    else {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    
    next();
  },

  // Timeout middleware
  timeout: (seconds = 30) => {
    return (req: any, res: any, next: any) => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(408).json({ error: 'Request timeout' });
        }
      }, seconds * 1000);
      
      res.on('finish', () => clearTimeout(timeout));
      res.on('close', () => clearTimeout(timeout));
      
      next();
    };
  },

  // Memory optimization
  memoryOptimization: () => {
    // Run garbage collection every 5 minutes
    setInterval(() => {
      if (global.gc) {
        console.log('🧹 Running garbage collection...');
        global.gc();
      }
    }, 5 * 60 * 1000);
    
    // Monitor memory usage
    setInterval(() => {
      const used = process.memoryUsage();
      const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
      
      if (heapUsedMB > 500) {
        console.warn(`⚠️ High memory usage: ${heapUsedMB}MB`);
      }
    }, 60 * 1000);
  }
};