import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

// Life CEO Debug: Configure Neon for HTTP-only mode (no WebSocket)
// This completely avoids WebSocket issues in Replit environment
neonConfig.fetchConnectionCache = true;
neonConfig.fetchEndpoint = (host: string) => {
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}/sql`;
};

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Life CEO: Create HTTP-only connection function
const sql = neon(process.env.DATABASE_URL!);

// Export the SQL function for direct queries
export { sql };

// Layer 21: Connection health check
let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds

async function checkConnection() {
  try {
    // Life CEO: Use HTTP connection for health check
    await sql`SELECT 1`;
    if (!isConnected) {
      console.log('✅ Database connection established via HTTP');
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

// Life CEO: Initialize drizzle with HTTP connection
export const db = drizzle(sql, { schema });

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