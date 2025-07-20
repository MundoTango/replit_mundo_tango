import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cacheService';

// 40x20s Framework - Layer 10 (Deployment & Infrastructure) 
// Automatic caching middleware for GET requests

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
}

export function cacheMiddleware(options: CacheOptions = {}) {
  const { ttl = 300, keyGenerator } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator 
      ? keyGenerator(req)
      : `cache:${req.originalUrl || req.url}`;

    try {
      // Check cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        console.log(`💾 Cache hit: ${cacheKey}`);
        return res.json(cached);
      }
    } catch (error) {
      console.error('Cache middleware error:', error);
      // Continue without cache on error
    }

    // Store original json method
    const originalJson = res.json;
    
    // Override json method to cache response
    res.json = function(data: any) {
      // Cache the response asynchronously
      cacheService.set(cacheKey, data, ttl).catch(err => {
        console.error('Failed to cache response:', err);
      });
      
      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
}

// Pre-configured middleware for common endpoints
export const apiCache = {
  // Cache for 5 minutes
  standard: cacheMiddleware({ ttl: 300 }),
  
  // Cache for 1 minute (for frequently changing data)
  short: cacheMiddleware({ ttl: 60 }),
  
  // Cache for 30 minutes (for relatively static data)
  long: cacheMiddleware({ ttl: 1800 }),
  
  // Cache for 1 hour (for very static data)
  veryLong: cacheMiddleware({ ttl: 3600 })
};