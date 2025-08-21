import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;

// Performance-optimized database configuration
export const createOptimizedPool = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  // Create connection pool with optimized settings
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Connection pool configuration for performance
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait for a connection
    // Statement timeout to prevent long-running queries
    statement_timeout: 30000, // 30 seconds
    // Idle in transaction session timeout
    idle_in_transaction_session_timeout: 60000, // 60 seconds
  });

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
  });

  // Log pool statistics periodically (every 5 minutes in production)
  if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
      const poolStats = {
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
      };
      console.log('Database pool stats:', poolStats);
    }, 300000); // 5 minutes
  }

  return pool;
};

// Create optimized Drizzle instance
export const createOptimizedDb = () => {
  const pool = createOptimizedPool();
  
  // Create Drizzle instance with query logging in development
  const db = drizzle({ 
    client: pool, 
    schema,
    logger: process.env.NODE_ENV === 'development'
  });

  return { db, pool };
};

// Query optimization helpers
export const queryOptimizations = {
  // Use for read-heavy operations
  readReplica: () => {
    // In future, this could connect to a read replica
    // For now, returns the main DB with read-optimized settings
    return createOptimizedDb().db;
  },

  // Batch insert helper
  batchInsert: async <T>(
    db: any,
    table: any,
    records: T[],
    batchSize: number = 1000
  ) => {
    const results = [];
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const result = await db.insert(table).values(batch).returning();
      results.push(...result);
    }
    return results;
  },

  // Pagination helper with cursor-based pagination
  cursorPaginate: (
    query: any,
    cursorColumn: string,
    lastCursor: any,
    limit: number = 20
  ) => {
    if (lastCursor) {
      return query.where(sql`${cursorColumn} > ${lastCursor}`).limit(limit);
    }
    return query.limit(limit);
  },

  // Cache key generator for query results
  generateCacheKey: (prefix: string, params: Record<string, any>) => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join(':');
    return `${prefix}:${sortedParams}`;
  }
};

// Connection health check
export const checkDatabaseHealth = async (pool: Pool) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT 1');
    client.release();
    return { healthy: true, latency: result.rowCount };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { healthy: false, error: error.message };
  }
};