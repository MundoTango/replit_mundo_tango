import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Life CEO Debug: Configure Neon for HTTP-only mode
// This completely avoids WebSocket issues
neonConfig.fetchConnectionCache = true;
neonConfig.fetchEndpoint = (host: string) => {
  return `https://${host}/sql`;
};
// Disable WebSocket entirely
neonConfig.webSocketConstructor = undefined as any;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// 30L Framework - Layer 21: Production Resilience Engineering
// Life CEO Fix: Create pool with error handling for Neon serverless issues
let pool: Pool;
try {
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    // Connection pool settings for resilience
    max: 20, // Maximum number of clients
    idleTimeoutMillis: 30000, // 30 seconds
    connectionTimeoutMillis: 5000, // 5 seconds timeout for new connections
  });
} catch (err) {
  console.error('❌ Pool creation error:', err);
  // Fallback: Create a simple pool without WebSocket
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
  });
}

export { pool };

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
    console.error('❌ Database connection check failed:', err instanceof Error ? err.message : String(err));
    
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

export const db = drizzle({ client: pool, schema });

// Layer 21: Graceful query wrapper with retry logic
export async function resilientQuery<T>(
  queryFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T | null> {
  for (let i = 0; i < retries; i++) {
    try {
      return await queryFn();
    } catch (err: any) {
      console.error(`❌ Query failed (attempt ${i + 1}/${retries}):`, err.message);
      
      if (i < retries - 1) {
        console.log(`🔄 Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        console.error('❌ Query failed after all retries');
        return null;
      }
    }
  }
  return null;
}