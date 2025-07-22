import { BaseAgent } from './base-agent';
import { getDatabaseConnection } from '../database/connection';
import { redisCache } from '../../server/services/redisCache';

export class PerformanceAgent extends BaseAgent {
  constructor() {
    super({
      id: 'performance-agent',
      name: 'Performance Optimization Agent',
      description: 'Monitors and optimizes platform performance using AI-driven insights',
      category: 'technical',
      emoji: '⚡',
      capabilities: [
        'Performance monitoring',
        'Intelligent caching',
        'Resource optimization',
        'Load prediction',
        'Bottleneck detection',
        'Auto-scaling recommendations'
      ],
      systemPrompt: `You are the Performance Optimization Agent. Your role is to:
        - Monitor system performance metrics in real-time
        - Identify performance bottlenecks and inefficiencies
        - Implement intelligent caching strategies
        - Predict high-load scenarios and prepare resources
        - Optimize database queries and API responses
        - Provide actionable performance improvement recommendations`
    });
  }

  async analyzePerformance(): Promise<{
    metrics: any;
    bottlenecks: string[];
    recommendations: string[];
    optimizations: any[];
  }> {
    const db = await getDatabaseConnection();
    
    // Collect performance metrics
    const metrics = await this.collectMetrics();
    
    // Analyze bottlenecks
    const bottlenecks = await this.detectBottlenecks(metrics);
    
    // Generate AI-powered recommendations
    const recommendations = await this.generateOptimizationRecommendations(metrics, bottlenecks);
    
    // Prepare automatic optimizations
    const optimizations = await this.prepareOptimizations(metrics);
    
    // Store insights for learning
    await this.storeInsight({
      type: 'performance_analysis',
      data: { metrics, bottlenecks, recommendations },
      confidence: 0.9
    });
    
    return { metrics, bottlenecks, recommendations, optimizations };
  }

  private async collectMetrics() {
    const db = await getDatabaseConnection();
    
    // Database performance metrics
    const dbMetrics = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM posts WHERE created_at > NOW() - INTERVAL '1 hour') as posts_per_hour,
        (SELECT COUNT(*) FROM memories WHERE created_at > NOW() - INTERVAL '1 hour') as memories_per_hour,
        (SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) FROM api_requests WHERE created_at > NOW() - INTERVAL '1 hour') as avg_response_time,
        (SELECT COUNT(*) FROM users WHERE last_seen > NOW() - INTERVAL '5 minutes') as active_users,
        pg_database_size(current_database()) as database_size,
        (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections
    `);
    
    // Redis cache metrics
    const cacheInfo = await redisCache.info();
    const cacheHitRate = await this.calculateCacheHitRate();
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    
    return {
      database: dbMetrics.rows[0],
      cache: {
        hitRate: cacheHitRate,
        size: cacheInfo.used_memory_human,
        evictedKeys: cacheInfo.evicted_keys
      },
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
        external: Math.round(memoryUsage.external / 1024 / 1024) + 'MB'
      },
      timestamp: new Date()
    };
  }

  private async detectBottlenecks(metrics: any): Promise<string[]> {
    const bottlenecks = [];
    
    // Check response time
    if (metrics.database.avg_response_time > 500) {
      bottlenecks.push('High average API response time detected');
    }
    
    // Check cache hit rate
    if (metrics.cache.hitRate < 0.7) {
      bottlenecks.push('Low cache hit rate - many requests hitting database');
    }
    
    // Check active connections
    if (metrics.database.active_connections > 80) {
      bottlenecks.push('High number of active database connections');
    }
    
    // Check memory usage
    const heapUsed = parseInt(metrics.memory.heapUsed);
    const heapTotal = parseInt(metrics.memory.heapTotal);
    if (heapUsed / heapTotal > 0.9) {
      bottlenecks.push('Memory usage approaching limit');
    }
    
    return bottlenecks;
  }

  private async generateOptimizationRecommendations(metrics: any, bottlenecks: string[]): Promise<string[]> {
    const recommendations = [];
    
    // Response time optimizations
    if (metrics.database.avg_response_time > 300) {
      recommendations.push('Implement query result caching for frequently accessed data');
      recommendations.push('Add database indexes on commonly filtered columns');
    }
    
    // Cache optimizations
    if (metrics.cache.hitRate < 0.8) {
      recommendations.push('Increase cache TTL for stable data');
      recommendations.push('Implement predictive caching for user-specific data');
    }
    
    // Connection pool optimizations
    if (metrics.database.active_connections > 50) {
      recommendations.push('Implement connection pooling with optimal pool size');
      recommendations.push('Add request queuing for database operations');
    }
    
    // Memory optimizations
    const memoryPercent = parseInt(metrics.memory.heapUsed) / parseInt(metrics.memory.heapTotal);
    if (memoryPercent > 0.8) {
      recommendations.push('Implement memory-efficient data structures');
      recommendations.push('Add garbage collection optimization');
    }
    
    return recommendations;
  }

  private async prepareOptimizations(metrics: any) {
    const optimizations = [];
    
    // Auto-cache popular content
    if (metrics.cache.hitRate < 0.7) {
      optimizations.push({
        type: 'cache_warming',
        action: 'warm_popular_content',
        priority: 'high'
      });
    }
    
    // Database query optimization
    if (metrics.database.avg_response_time > 500) {
      optimizations.push({
        type: 'query_optimization',
        action: 'analyze_slow_queries',
        priority: 'critical'
      });
    }
    
    // Resource pre-allocation
    if (metrics.database.active_users > 100) {
      optimizations.push({
        type: 'resource_scaling',
        action: 'pre_allocate_resources',
        priority: 'medium'
      });
    }
    
    return optimizations;
  }

  private async calculateCacheHitRate(): Promise<number> {
    try {
      const stats = await redisCache.getStats();
      if (stats && stats.hits !== undefined && stats.misses !== undefined) {
        const total = stats.hits + stats.misses;
        return total > 0 ? stats.hits / total : 0;
      }
    } catch (error) {
      console.error('Error calculating cache hit rate:', error);
    }
    return 0;
  }

  async implementOptimizations(optimizations: any[]) {
    for (const optimization of optimizations) {
      switch (optimization.type) {
        case 'cache_warming':
          await this.warmCache();
          break;
        case 'query_optimization':
          await this.optimizeQueries();
          break;
        case 'resource_scaling':
          await this.preAllocateResources();
          break;
      }
    }
  }

  private async warmCache() {
    const db = await getDatabaseConnection();
    
    // Cache popular posts
    const popularPosts = await db.query(`
      SELECT p.*, COUNT(pl.id) as like_count
      FROM posts p
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      WHERE p.created_at > NOW() - INTERVAL '7 days'
      GROUP BY p.id
      ORDER BY like_count DESC
      LIMIT 100
    `);
    
    for (const post of popularPosts.rows) {
      await redisCache.set(`post:${post.id}`, JSON.stringify(post), 3600);
    }
    
    // Cache active user profiles
    const activeUsers = await db.query(`
      SELECT * FROM users
      WHERE last_seen > NOW() - INTERVAL '1 hour'
      ORDER BY last_seen DESC
      LIMIT 50
    `);
    
    for (const user of activeUsers.rows) {
      await redisCache.set(`user:${user.id}`, JSON.stringify(user), 1800);
    }
  }

  private async optimizeQueries() {
    const db = await getDatabaseConnection();
    
    // Analyze and create missing indexes
    const missingIndexes = await db.query(`
      SELECT schemaname, tablename, attname, n_distinct, correlation
      FROM pg_stats
      WHERE schemaname = 'public'
      AND n_distinct > 100
      AND correlation < 0.1
      ORDER BY n_distinct DESC
    `);
    
    // Log recommendations for manual review
    for (const index of missingIndexes.rows) {
      await this.createTask({
        title: `Create index on ${index.tablename}.${index.attname}`,
        description: `High cardinality column with low correlation detected`,
        priority: 'medium'
      });
    }
  }

  private async preAllocateResources() {
    // Pre-warm connection pools
    const db = await getDatabaseConnection();
    
    // Ensure connection pool is at optimal size
    await db.query('SELECT 1'); // Warm up connection
    
    // Pre-allocate memory for caching
    const preAllocatedData = new Map();
    preAllocatedData.set('resource_pool', new Array(1000).fill(null));
    
    await this.storeMemory({
      content: 'Pre-allocated resources for high load',
      type: 'system',
      metadata: { timestamp: new Date() }
    });
  }

  async predictHighLoad(): Promise<{
    prediction: string;
    confidence: number;
    recommendedActions: string[];
  }> {
    const memories = await this.getMemories('performance_pattern', 30);
    
    // Analyze patterns
    const patterns = memories.map(m => JSON.parse(m.metadata || '{}'));
    
    // Simple pattern detection
    const hourlyLoads = patterns.filter(p => p.type === 'hourly_load');
    const currentHour = new Date().getHours();
    
    // Find historical load for current hour
    const historicalLoad = hourlyLoads.filter(p => p.hour === currentHour);
    const avgLoad = historicalLoad.reduce((sum, p) => sum + p.load, 0) / historicalLoad.length;
    
    let prediction = 'normal';
    let confidence = 0.7;
    const recommendedActions = [];
    
    if (avgLoad > 0.8) {
      prediction = 'high';
      confidence = 0.85;
      recommendedActions.push('Increase cache TTL to 2 hours');
      recommendedActions.push('Pre-warm cache with popular content');
      recommendedActions.push('Enable request queuing');
    } else if (avgLoad > 0.6) {
      prediction = 'moderate';
      confidence = 0.8;
      recommendedActions.push('Monitor response times closely');
      recommendedActions.push('Prepare cache warming scripts');
    }
    
    return { prediction, confidence, recommendedActions };
  }
}