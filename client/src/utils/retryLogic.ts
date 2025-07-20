// Production Resilience Layer 21 - Retry Logic Utilities

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryOn?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number) => void;
}

/**
 * Exponential backoff retry wrapper for API calls
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryOn = (error) => {
      // Retry on network errors or 5xx server errors
      if (!error.response) return true; // Network error
      const status = error.response?.status || error.status;
      return status >= 500 && status < 600;
    },
    onRetry = (error, attempt) => {
      console.warn(`Retry attempt ${attempt}:`, error.message);
    }
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !retryOn(error)) {
        throw error;
      }

      onRetry(error, attempt + 1);
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Circuit breaker pattern for preventing cascading failures
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private readonly threshold = 5,
    private readonly timeout = 60000, // 1 minute
    private readonly halfOpenRetries = 2
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
        this.failures = this.threshold - this.halfOpenRetries;
      } else {
        throw new Error('Circuit breaker is open - service temporarily unavailable');
      }
    }

    try {
      const result = await fn();
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.threshold) {
        this.state = 'open';
      }
      
      throw error;
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
}

/**
 * Debounced retry for user actions
 */
export function createDebouncedRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay = 300
): T {
  let timeoutId: NodeJS.Timeout | null = null;
  let activePromise: Promise<any> | null = null;

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          activePromise = fn(...args);
          const result = await activePromise;
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          activePromise = null;
        }
      }, delay);
    });
  }) as T;
}

/**
 * Timeout wrapper with fallback
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  fallback?: T
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    return await Promise.race([fn(), timeoutPromise]);
  } catch (error: any) {
    if (error.message.includes('timed out') && fallback !== undefined) {
      console.warn('Operation timed out, using fallback value');
      return fallback;
    }
    throw error;
  }
}