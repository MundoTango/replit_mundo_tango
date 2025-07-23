// 30L Framework - Layer 23: Business Continuity
// Database health monitoring and recovery utilities

import { sql } from '../db';

export interface DatabaseHealth {
  isHealthy: boolean;
  connectionCount: number;
  idleCount: number;
  waitingCount: number;
  lastError?: string;
  lastChecked: Date;
}

let lastHealth: DatabaseHealth = {
  isHealthy: false,
  connectionCount: 0,
  idleCount: 0,
  waitingCount: 0,
  lastChecked: new Date()
};

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    // Test query
    await sql`SELECT 1`;
    
    // HTTP connections don't have pool stats
    const health: DatabaseHealth = {
      isHealthy: true,
      connectionCount: 1, // HTTP connection
      idleCount: 0,
      waitingCount: 0,
      lastChecked: new Date()
    };
    
    lastHealth = health;
    return health;
  } catch (err: any) {
    const health: DatabaseHealth = {
      isHealthy: false,
      connectionCount: 0,
      idleCount: 0,
      waitingCount: 0,
      lastError: err.message,
      lastChecked: new Date()
    };
    
    lastHealth = health;
    return health;
  }
}

export function getLastDatabaseHealth(): DatabaseHealth {
  return lastHealth;
}

// Circuit breaker pattern for database operations
export class DatabaseCircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private readonly threshold = 5,
    private readonly timeout = 60000, // 1 minute
    private readonly resetTimeout = 30000 // 30 seconds
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      const now = Date.now();
      if (now - this.lastFailTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is OPEN - database operations temporarily disabled');
      }
    }
    
    try {
      const result = await operation();
      
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
        console.log('✅ Circuit breaker CLOSED - database operations restored');
      }
      
      return result;
    } catch (err) {
      this.failures++;
      this.lastFailTime = Date.now();
      
      if (this.failures >= this.threshold) {
        this.state = 'open';
        console.error(`❌ Circuit breaker OPEN - ${this.failures} consecutive failures`);
      }
      
      throw err;
    }
  }
  
  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailTime: this.lastFailTime
    };
  }
}

export const dbCircuitBreaker = new DatabaseCircuitBreaker();