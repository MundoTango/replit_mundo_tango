import NodeCache from 'node-cache';
import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';

interface CacheConfig {
  type: 'memory' | 'redis' | 'lru';
  redisUrl?: string;
  ttl?: number; // Default TTL in seconds
  maxSize?: number; // For LRU cache
  checkPeriod?: number; // For node-cache cleanup
}

interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<boolean>;
  del(key: string): Promise<boolean>;
  flush(): Promise<boolean>;
  mget<T>(keys: string[]): Promise<(T | null)[]>;
  mset(items: { key: string; value: any; ttl?: number }[]): Promise<boolean>;
  has(key: string): Promise<boolean>;
  ttl(key: string): Promise<number>;
}

// In-memory cache using node-cache
class MemoryCacheService implements CacheService {
  private cache: NodeCache;

  constructor(config: CacheConfig) {
    this.cache = new NodeCache({
      stdTTL: config.ttl || 600, // 10 minutes default
      checkperiod: config.checkPeriod || 120, // Check for expired keys every 2 minutes
      useClones: false, // Better performance, but be careful with object mutations
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = this.cache.get<T>(key);
      return value || null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      return this.cache.set(key, value, ttl || 0);
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      return this.cache.del(key) > 0;
    } catch (error) {
      console.error('Cache del error:', error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    try {
      this.cache.flushAll();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return keys.map(key => this.cache.get<T>(key) || null);
  }

  async mset(items: { key: string; value: any; ttl?: number }[]): Promise<boolean> {
    try {
      items.forEach(item => {
        this.cache.set(item.key, item.value, item.ttl || 0);
      });
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  async ttl(key: string): Promise<number> {
    return this.cache.getTtl(key) || 0;
  }
}

// Redis cache service
class RedisCacheService implements CacheService {
  private redis: Redis;
  private defaultTTL: number;

  constructor(config: CacheConfig) {
    this.redis = new Redis(config.redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
    this.defaultTTL = config.ttl || 600;

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl || this.defaultTTL) {
        await this.redis.setex(key, ttl || this.defaultTTL, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    try {
      await this.redis.flushdb();
      return true;
    } catch (error) {
      console.error('Redis flush error:', error);
      return false;
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      console.error('Redis mget error:', error);
      return keys.map(() => null);
    }
  }

  async mset(items: { key: string; value: any; ttl?: number }[]): Promise<boolean> {
    try {
      const pipeline = this.redis.pipeline();
      items.forEach(item => {
        const serialized = JSON.stringify(item.value);
        if (item.ttl || this.defaultTTL) {
          pipeline.setex(item.key, item.ttl || this.defaultTTL, serialized);
        } else {
          pipeline.set(item.key, serialized);
        }
      });
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Redis mset error:', error);
      return false;
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const exists = await this.redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error('Redis has error:', error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      console.error('Redis ttl error:', error);
      return 0;
    }
  }
}

// LRU cache service for bounded memory usage
class LRUCacheService implements CacheService {
  private cache: LRUCache<string, any>;
  private defaultTTL: number;

  constructor(config: CacheConfig) {
    this.cache = new LRUCache({
      max: config.maxSize || 1000, // Maximum number of items
      ttl: (config.ttl || 600) * 1000, // Convert to milliseconds
      updateAgeOnGet: true, // Refresh TTL on access
      updateAgeOnHas: false,
    });
    this.defaultTTL = config.ttl || 600;
  }

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get(key) || null;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      this.cache.set(key, value, { 
        ttl: (ttl || this.defaultTTL) * 1000 
      });
      return true;
    } catch (error) {
      console.error('LRU set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async flush(): Promise<boolean> {
    this.cache.clear();
    return true;
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return keys.map(key => this.cache.get(key) || null);
  }

  async mset(items: { key: string; value: any; ttl?: number }[]): Promise<boolean> {
    try {
      items.forEach(item => {
        this.cache.set(item.key, item.value, {
          ttl: (item.ttl || this.defaultTTL) * 1000
        });
      });
      return true;
    } catch (error) {
      console.error('LRU mset error:', error);
      return false;
    }
  }

  async has(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  async ttl(key: string): Promise<number> {
    const remaining = this.cache.getRemainingTTL(key);
    return remaining ? Math.floor(remaining / 1000) : 0;
  }
}

// Factory to create appropriate cache service
export function createCacheService(config?: CacheConfig): CacheService {
  const cacheConfig: CacheConfig = config || {
    type: process.env.CACHE_TYPE as any || 'memory',
    redisUrl: process.env.REDIS_URL,
    ttl: parseInt(process.env.CACHE_TTL || '600'),
    maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
  };

  switch (cacheConfig.type) {
    case 'redis':
      if (!cacheConfig.redisUrl && !process.env.REDIS_URL) {
        console.warn('Redis URL not provided, falling back to memory cache');
        return new MemoryCacheService(cacheConfig);
      }
      return new RedisCacheService(cacheConfig);
    
    case 'lru':
      return new LRUCacheService(cacheConfig);
    
    case 'memory':
    default:
      return new MemoryCacheService(cacheConfig);
  }
}

// Singleton cache instance
let cacheInstance: CacheService | null = null;

export function getCache(): CacheService {
  if (!cacheInstance) {
    cacheInstance = createCacheService();
  }
  return cacheInstance;
}

// Cache key generators for common patterns
export const cacheKeys = {
  // Tenant cache keys
  tenant: (slug: string) => `tenant:${slug}`,
  tenantById: (id: string) => `tenant:id:${id}`,
  tenantUser: (tenantId: string, userId: string) => `tenant:${tenantId}:user:${userId}`,
  
  // User cache keys
  user: (userId: string) => `user:${userId}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  userRoles: (userId: string) => `user:${userId}:roles`,
  userTenants: (userId: string) => `user:${userId}:tenants`,
  
  // Content cache keys
  post: (postId: string) => `post:${postId}`,
  event: (eventId: string) => `event:${eventId}`,
  memory: (memoryId: string) => `memory:${memoryId}`,
  
  // Feed cache keys
  feed: (userId: string, page: number) => `feed:${userId}:${page}`,
  tenantFeed: (tenantId: string, page: number) => `tenant:${tenantId}:feed:${page}`,
  
  // Statistics cache keys
  stats: (type: string) => `stats:${type}`,
  tenantStats: (tenantId: string) => `tenant:${tenantId}:stats`,
  
  // Query result cache keys
  query: (queryHash: string) => `query:${queryHash}`,
};

// Cache decorators for methods
export function Cacheable(keyGenerator: (...args: any[]) => string, ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache = getCache();
      const key = keyGenerator(...args);
      
      // Check cache first
      const cached = await cache.get(key);
      if (cached !== null) {
        console.log(`Cache hit for key: ${key}`);
        return cached;
      }
      
      // Call original method
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      if (result !== null && result !== undefined) {
        await cache.set(key, result, ttl);
      }
      
      return result;
    };
    
    return descriptor;
  };
}

// Cache invalidation helper
export async function invalidateCache(patterns: string[]): Promise<void> {
  const cache = getCache();
  
  // For Redis, we could use pattern matching
  // For now, we'll need to track keys manually
  for (const pattern of patterns) {
    await cache.del(pattern);
  }
}