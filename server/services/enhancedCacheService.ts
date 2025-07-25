// 40x20s Framework - Enhanced Cache Service for Phase 3 Performance
// Layer 10: Infrastructure & Layer 21: Performance Optimization

import Redis from 'ioredis';
import { performance } from 'perf_hooks';

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  errors: number;
  avgGetTime: number;
  avgSetTime: number;
  hitRate: number;
}

class EnhancedCacheService {
  private redis: Redis | null = null;
  private memoryCache: Map<string, { data: any; expiry: number }> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    errors: 0,
    avgGetTime: 0,
    avgSetTime: 0,
    hitRate: 0
  };
  private getTimes: number[] = [];
  private setTimes: number[] = [];
  private connected = false;
  private connectionPool: Redis[] = [];
  private currentPoolIndex = 0;

  constructor() {
    this.initializeRedis();
    this.startStatsReporting();
  }

  private async initializeRedis() {
    // Check if Redis is disabled
    if (process.env.DISABLE_REDIS === 'true') {
      console.log('ℹ️ Redis disabled, using optimized in-memory cache');
      return;
    }

    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      const poolSize = parseInt(process.env.REDIS_POOL_SIZE || '5');
      
      // Create connection pool for better performance
      for (let i = 0; i < poolSize; i++) {
        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          enableOfflineQueue: true,
          lazyConnect: false,
          retryStrategy: (times) => Math.min(times * 50, 2000),
          reconnectOnError: () => true,
          // Performance optimizations
          enableAutoPipelining: true,
        });

        redis.on('connect', () => {
          if (i === 0) console.log('✅ Enhanced Redis cache connected with connection pooling');
          this.connected = true;
        });

        redis.on('error', (err) => {
          console.error(`Redis connection ${i} error:`, err.message);
          this.stats.errors++;
        });

        this.connectionPool.push(redis);
      }

      this.redis = this.connectionPool[0];
      
      // Test connection
      await this.redis.ping();
      console.log(`🚀 Redis connection pool ready with ${poolSize} connections`);
    } catch (error: any) {
      console.log('⚠️ Redis not available, using optimized in-memory cache');
      this.connectionPool.forEach(conn => conn.disconnect());
      this.connectionPool = [];
      this.redis = null;
      this.connected = false;
    }
  }

  // Get next connection from pool (round-robin)
  private getConnection(): Redis | null {
    if (!this.connected || this.connectionPool.length === 0) return null;
    
    this.currentPoolIndex = (this.currentPoolIndex + 1) % this.connectionPool.length;
    return this.connectionPool[this.currentPoolIndex];
  }

  // Optimized cache get with performance tracking
  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    
    try {
      // Try Redis first if available
      const redis = this.getConnection();
      if (redis) {
        const data = await redis.get(key);
        if (data) {
          this.stats.hits++;
          this.trackGetTime(performance.now() - startTime);
          return JSON.parse(data);
        }
      }
    } catch (error: any) {
      this.stats.errors++;
      console.error('Redis get error:', error.message);
    }

    // Fallback to memory cache
    const cached = this.memoryCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      this.stats.hits++;
      this.trackGetTime(performance.now() - startTime);
      return cached.data;
    }
    
    this.stats.misses++;
    this.trackGetTime(performance.now() - startTime);
    return null;
  }

  // Batch get for improved performance
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const startTime = performance.now();
    const results: (T | null)[] = new Array(keys.length).fill(null);
    
    try {
      const redis = this.getConnection();
      if (redis) {
        const values = await redis.mget(...keys);
        values.forEach((value, index) => {
          if (value) {
            results[index] = JSON.parse(value);
            this.stats.hits++;
          } else {
            this.stats.misses++;
          }
        });
      }
    } catch (error: any) {
      this.stats.errors++;
      console.error('Redis mget error:', error.message);
    }

    // Fallback to memory cache for missing values
    keys.forEach((key, index) => {
      if (!results[index]) {
        const cached = this.memoryCache.get(key);
        if (cached && cached.expiry > Date.now()) {
          results[index] = cached.data;
          this.stats.hits++;
        }
      }
    });

    this.trackGetTime(performance.now() - startTime);
    return results;
  }

  // Optimized cache set with write-through strategy
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    const startTime = performance.now();
    
    // Always set in memory cache first for immediate availability
    this.memoryCache.set(key, {
      data: value,
      expiry: Date.now() + (ttl * 1000)
    });

    try {
      const redis = this.getConnection();
      if (redis) {
        // Use pipelining for better performance
        await redis.setex(key, ttl, JSON.stringify(value));
      }
    } catch (error: any) {
      this.stats.errors++;
      console.error('Redis set error:', error.message);
    }

    this.stats.sets++;
    this.trackSetTime(performance.now() - startTime);

    // Clean up memory cache if too large
    if (this.memoryCache.size > 10000) {
      this.cleanupMemoryCache();
    }
  }

  // Batch set for improved performance
  async mset(items: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    const startTime = performance.now();
    
    // Set all in memory cache first
    items.forEach(({ key, value, ttl = 300 }) => {
      this.memoryCache.set(key, {
        data: value,
        expiry: Date.now() + (ttl * 1000)
      });
    });

    try {
      const redis = this.getConnection();
      if (redis) {
        const pipeline = redis.pipeline();
        items.forEach(({ key, value, ttl = 300 }) => {
          pipeline.setex(key, ttl, JSON.stringify(value));
        });
        await pipeline.exec();
      }
    } catch (error: any) {
      this.stats.errors++;
      console.error('Redis mset error:', error.message);
    }

    this.stats.sets += items.length;
    this.trackSetTime(performance.now() - startTime);
  }

  // Delete cache entry
  async del(key: string | string[]): Promise<void> {
    const keys = Array.isArray(key) ? key : [key];
    
    // Delete from memory cache
    keys.forEach(k => this.memoryCache.delete(k));

    try {
      const redis = this.getConnection();
      if (redis && keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error: any) {
      this.stats.errors++;
      console.error('Redis del error:', error.message);
    }
  }

  // Clear cache by pattern with scan for better performance
  async clearPattern(pattern: string): Promise<void> {
    // Clear from memory cache
    const keysToDelete: string[] = [];
    this.memoryCache.forEach((_, key) => {
      if (key.match(pattern.replace('*', '.*'))) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.memoryCache.delete(key));

    try {
      const redis = this.getConnection();
      if (redis) {
        const stream = redis.scanStream({
          match: pattern,
          count: 100
        });
        
        const pipeline = redis.pipeline();
        let count = 0;
        
        stream.on('data', (keys) => {
          keys.forEach((key: string) => {
            pipeline.del(key);
            count++;
            
            // Execute pipeline every 1000 keys
            if (count % 1000 === 0) {
              pipeline.exec();
              // Create a new pipeline for the next batch
              pipeline = redis.pipeline();
            }
          });
        });
        
        stream.on('end', () => {
          if (count % 1000 !== 0) {
            pipeline.exec();
          }
        });
      }
    } catch (error: any) {
      this.stats.errors++;
      console.error('Redis clearPattern error:', error.message);
    }
  }

  // Get cache statistics
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    this.stats.avgGetTime = this.getTimes.length > 0 
      ? this.getTimes.reduce((a, b) => a + b, 0) / this.getTimes.length 
      : 0;
    this.stats.avgSetTime = this.setTimes.length > 0 
      ? this.setTimes.reduce((a, b) => a + b, 0) / this.setTimes.length 
      : 0;
    
    return { ...this.stats };
  }

  // Track performance metrics
  private trackGetTime(time: number) {
    this.getTimes.push(time);
    if (this.getTimes.length > 1000) {
      this.getTimes = this.getTimes.slice(-500);
    }
  }

  private trackSetTime(time: number) {
    this.setTimes.push(time);
    if (this.setTimes.length > 1000) {
      this.setTimes = this.setTimes.slice(-500);
    }
  }

  // Clean up expired entries from memory cache
  private cleanupMemoryCache() {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.memoryCache.forEach((value, key) => {
      if (value.expiry < now) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.memoryCache.delete(key));
    
    // If still too large, remove oldest entries
    if (this.memoryCache.size > 8000) {
      const entries = Array.from(this.memoryCache.entries())
        .sort((a, b) => a[1].expiry - b[1].expiry);
      
      const toRemove = entries.slice(0, 2000);
      toRemove.forEach(([key]) => this.memoryCache.delete(key));
    }
  }

  // Start periodic stats reporting
  private startStatsReporting() {
    setInterval(() => {
      const stats = this.getStats();
      if (stats.hits + stats.misses > 0) {
        console.log(`📊 Cache Stats - Hit Rate: ${stats.hitRate.toFixed(1)}%, Avg Get: ${stats.avgGetTime.toFixed(2)}ms, Avg Set: ${stats.avgSetTime.toFixed(2)}ms`);
      }
    }, 30000); // Every 30 seconds
  }

  // Graceful shutdown
  async shutdown() {
    console.log('Shutting down cache service...');
    this.connectionPool.forEach(conn => conn.disconnect());
  }
}

// Export singleton instance
export const enhancedCache = new EnhancedCacheService();

// Helper functions for common cache patterns
export async function getCache<T>(key: string): Promise<T | null> {
  return enhancedCache.get<T>(key);
}

export async function setCache(key: string, value: any, ttl: number = 300): Promise<void> {
  return enhancedCache.set(key, value, ttl);
}

export async function invalidateCache(patterns: string | string[]): Promise<void> {
  const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
  for (const pattern of patternsArray) {
    await enhancedCache.clearPattern(pattern);
  }
}

export function getCacheStats(): CacheStats {
  return enhancedCache.getStats();
}