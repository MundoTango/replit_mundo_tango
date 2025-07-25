import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// 40x20s Framework - Layer 21: Production Resilience Engineering
// Use standard PostgreSQL connection to avoid Neon WebSocket issues
console.log('🔄 Initializing database connection...');

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // 40x20s Phase 3 Optimized Connection Pool Settings
  max: 50, // Increased from 20 for high concurrency
  min: 10, // Minimum pool size for faster response
  idleTimeoutMillis: 10000, // Reduced to 10 seconds for faster recycling
  connectionTimeoutMillis: 2000, // Reduced to 2 seconds for faster failures
  statement_timeout: 5000, // 5 second query timeout
  query_timeout: 5000, // 5 second query timeout
  // Connection string optimizations
  application_name: 'mundo-tango-40x20s',
  // SSL configuration for Replit database
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Layer 21: Error handling for pool
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err.message);
  // Don't crash the app - Layer 23: Business Continuity
});

// Layer 21: Connection health check
let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

async function checkConnection() {
  try {
    await pool.query('SELECT 1');
    if (!isConnected) {
      console.log('✅ Database connection restored');
      isConnected = true;
      connectionRetries = 0;
    }
    return true;
  } catch (err) {
    isConnected = false;
    console.error('❌ Database connection check failed:', err.message);
    
    if (connectionRetries < MAX_RETRIES) {
      connectionRetries++;
      console.log(`🔄 Retrying database connection (${connectionRetries}/${MAX_RETRIES})...`);
      setTimeout(checkConnection, RETRY_DELAY);
    } else {
      console.error('❌ Max database connection retries reached');
    }
    return false;
  }
}

// Initial connection check
checkConnection();

// Periodic health check every 30 seconds
setInterval(checkConnection, 30000);

export const db = drizzle(pool, { schema });

// Layer 21: Graceful query wrapper with retry logic
export async function resilientQuery<T>(
  queryFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      return await queryFn();
    } catch (err) {
      console.error(`❌ Query attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`🔄 Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error('❌ All query retries exhausted');
        return null;
      }
    }
  }
  return null;
}

// 40x20s Framework - Export pool for direct usage if needed
export { pool };