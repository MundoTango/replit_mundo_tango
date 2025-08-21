import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// Create cache instances with different TTLs
const shortCache = new NodeCache({ stdTTL: 60 }); // 1 minute
const mediumCache = new NodeCache({ stdTTL: 300 }); // 5 minutes
const longCache = new NodeCache({ stdTTL: 900 }); // 15 minutes

type CacheOptions = {
  ttl?: 'short' | 'medium' | 'long';
  keyGenerator?: (req: Request) => string;
  invalidatePattern?: string;
};

export function cacheMiddleware(options: CacheOptions = {}) {
  const { ttl = 'medium', keyGenerator } = options;
  
  const cache = ttl === 'short' ? shortCache : ttl === 'long' ? longCache : mediumCache;
  
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generate cache key
    const key = keyGenerator ? keyGenerator(req) : `${req.originalUrl}:${req.user?.id || 'anonymous'}`;
    
    // Try to get from cache
    const cachedData = cache.get(key);
    if (cachedData) {
      console.log(`Cache hit for: ${key}`);
      return res.json(cachedData);
    }
    
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to cache the response
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, data);
        console.log(`Cached response for: ${key}`);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
}

// Cache invalidation helper
export function invalidateCache(pattern?: string) {
  if (pattern) {
    const keys = shortCache.keys().concat(mediumCache.keys(), longCache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        shortCache.del(key);
        mediumCache.del(key);
        longCache.del(key);
        console.log(`Invalidated cache for: ${key}`);
      }
    });
  } else {
    shortCache.flushAll();
    mediumCache.flushAll();
    longCache.flushAll();
    console.log('All caches cleared');
  }
}

// Middleware to invalidate cache after mutations
export function invalidateCacheAfter(patterns: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function(data: any) {
      // Only invalidate on successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach(pattern => invalidateCache(pattern));
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}