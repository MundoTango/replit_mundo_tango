// Comprehensive Monitoring and Logging System for Enhanced Posts
// Implements query performance tracking, security monitoring, and analytics

interface QueryMetrics {
  operation: string;
  duration: number;
  table: string;
  userId?: number;
  timestamp: Date;
  rowsAffected?: number;
  success: boolean;
  error?: string;
}

interface SecurityEvent {
  type: 'auth_failure' | 'rls_violation' | 'suspicious_activity' | 'rate_limit_exceeded';
  userId?: number;
  ipAddress: string;
  userAgent: string;
  details: any;
  timestamp: Date;
}

class EnhancedMonitoringService {
  private queryMetrics: QueryMetrics[] = [];
  private securityEvents: SecurityEvent[] = [];
  private slowQueryThreshold = 100; // milliseconds

  // Track database query performance
  trackQuery(operation: string, table: string, startTime: number, userId?: number, error?: Error) {
    const duration = Date.now() - startTime;
    const isSlowQuery = duration > this.slowQueryThreshold;
    
    const metric: QueryMetrics = {
      operation,
      duration,
      table,
      userId,
      timestamp: new Date(),
      success: !error,
      error: error?.message
    };

    this.queryMetrics.push(metric);

    // Log slow queries for optimization
    if (isSlowQuery) {
      console.warn(`🐌 Slow Query Detected: ${operation} on ${table} took ${duration}ms`, {
        userId,
        error: error?.message
      });
    }

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Query: ${operation} (${table}) - ${duration}ms`, {
        success: !error,
        userId
      });
    }
  }

  // Track security events
  trackSecurityEvent(type: SecurityEvent['type'], req: any, details: any) {
    const event: SecurityEvent = {
      type,
      userId: req.user?.id,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || 'unknown',
      details,
      timestamp: new Date()
    };

    this.securityEvents.push(event);

    // Alert on critical security events
    if (type === 'rls_violation' || type === 'suspicious_activity') {
      console.error(`🚨 Security Alert: ${type}`, event);
    }
  }

  // Get query performance analytics
  getQueryAnalytics(timeframe: string = '1h') {
    const cutoff = this.getTimeframeCutoff(timeframe);
    const recentMetrics = this.queryMetrics.filter(m => m.timestamp >= cutoff);

    const analytics = {
      totalQueries: recentMetrics.length,
      averageDuration: recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length || 0,
      slowQueries: recentMetrics.filter(m => m.duration > this.slowQueryThreshold).length,
      errorRate: recentMetrics.filter(m => !m.success).length / recentMetrics.length || 0,
      topSlowQueries: recentMetrics
        .filter(m => m.duration > this.slowQueryThreshold)
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10),
      queryByTable: this.groupByTable(recentMetrics),
      queryByOperation: this.groupByOperation(recentMetrics)
    };

    return analytics;
  }

  // Get security event summary
  getSecuritySummary(timeframe: string = '24h') {
    const cutoff = this.getTimeframeCutoff(timeframe);
    const recentEvents = this.securityEvents.filter(e => e.timestamp >= cutoff);

    return {
      totalEvents: recentEvents.length,
      eventsByType: this.groupSecurityEventsByType(recentEvents),
      suspiciousIPs: this.getSuspiciousIPs(recentEvents),
      recentAlerts: recentEvents
        .filter(e => e.type === 'rls_violation' || e.type === 'suspicious_activity')
        .slice(0, 20)
    };
  }

  private getTimeframeCutoff(timeframe: string): Date {
    const now = new Date();
    const multiplier = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30
    }[timeframe] || 1;

    return new Date(now.getTime() - (multiplier * 60 * 60 * 1000));
  }

  private groupByTable(metrics: QueryMetrics[]) {
    const grouped: { [table: string]: { count: number; avgDuration: number } } = {};
    
    metrics.forEach(m => {
      if (!grouped[m.table]) {
        grouped[m.table] = { count: 0, avgDuration: 0 };
      }
      grouped[m.table].count++;
      grouped[m.table].avgDuration = 
        (grouped[m.table].avgDuration * (grouped[m.table].count - 1) + m.duration) / grouped[m.table].count;
    });

    return grouped;
  }

  private groupByOperation(metrics: QueryMetrics[]) {
    const grouped: { [operation: string]: { count: number; avgDuration: number } } = {};
    
    metrics.forEach(m => {
      if (!grouped[m.operation]) {
        grouped[m.operation] = { count: 0, avgDuration: 0 };
      }
      grouped[m.operation].count++;
      grouped[m.operation].avgDuration = 
        (grouped[m.operation].avgDuration * (grouped[m.operation].count - 1) + m.duration) / grouped[m.operation].count;
    });

    return grouped;
  }

  private groupSecurityEventsByType(events: SecurityEvent[]) {
    const grouped: { [type: string]: number } = {};
    events.forEach(e => {
      grouped[e.type] = (grouped[e.type] || 0) + 1;
    });
    return grouped;
  }

  private getSuspiciousIPs(events: SecurityEvent[]): string[] {
    const ipCounts: { [ip: string]: number } = {};
    
    events.forEach(e => {
      if (e.type === 'auth_failure' || e.type === 'suspicious_activity') {
        ipCounts[e.ipAddress] = (ipCounts[e.ipAddress] || 0) + 1;
      }
    });

    return Object.entries(ipCounts)
      .filter(([_, count]) => count > 5)
      .map(([ip, _]) => ip);
  }

  // Clean up old metrics to prevent memory leaks
  cleanup() {
    const cutoff = new Date(Date.now() - (24 * 60 * 60 * 1000)); // Keep 24 hours
    this.queryMetrics = this.queryMetrics.filter(m => m.timestamp >= cutoff);
    this.securityEvents = this.securityEvents.filter(e => e.timestamp >= cutoff);
  }
}

// Enhanced middleware for request monitoring
export function createMonitoringMiddleware(monitoringService: EnhancedMonitoringService) {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // Track request start
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      // Log slow API requests
      if (duration > 1000) {
        console.warn(`🐌 Slow API Request: ${req.method} ${req.path} took ${duration}ms`);
      }

      // Track security events
      if (res.statusCode === 401 || res.statusCode === 403) {
        monitoringService.trackSecurityEvent('auth_failure', req, {
          statusCode: res.statusCode,
          path: req.path,
          method: req.method
        });
      }
    });

    next();
  };
}

// Rate limiting middleware with monitoring
export function createRateLimitingMiddleware(monitoringService: EnhancedMonitoringService) {
  const requests = new Map<string, { count: number; resetTime: number }>();
  const WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_REQUESTS = 100; // per minute per IP

  return (req: any, res: any, next: any) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    // Clean up old entries
    for (const [ip, data] of requests.entries()) {
      if (data.resetTime < windowStart) {
        requests.delete(ip);
      }
    }

    const current = requests.get(key) || { count: 0, resetTime: now + WINDOW_MS };
    
    if (current.count >= MAX_REQUESTS) {
      monitoringService.trackSecurityEvent('rate_limit_exceeded', req, {
        requestCount: current.count,
        limit: MAX_REQUESTS
      });

      return res.status(429).json({
        code: 429,
        message: 'Rate limit exceeded. Please try again later.',
        data: null
      });
    }

    current.count++;
    requests.set(key, current);
    next();
  };
}

export const monitoringService = new EnhancedMonitoringService();

// Set up periodic cleanup
setInterval(() => {
  monitoringService.cleanup();
}, 60 * 60 * 1000); // Clean up every hour