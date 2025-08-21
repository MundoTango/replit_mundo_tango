// Onboarding Retry Service with Exponential Backoff
// Implements resilient retry logic for failed operations

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: any) => void;
}

export class OnboardingRetryService {
  private defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    onRetry: (attempt, error) => {
      console.log(`⚠️ Retry attempt ${attempt} after error:`, error.message);
    }
  };

  async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    options?: RetryOptions
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    let lastError: any;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        console.log(`🔄 Attempting ${operationName} (attempt ${attempt}/${opts.maxAttempts})`);
        const result = await operation();
        
        if (attempt > 1) {
          console.log(`✅ ${operationName} succeeded after ${attempt} attempts`);
        }
        
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === opts.maxAttempts) {
          console.error(`❌ ${operationName} failed after ${opts.maxAttempts} attempts`);
          break;
        }

        opts.onRetry(attempt, error);
        
        // Calculate exponential backoff delay
        const delay = Math.min(
          opts.initialDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
          opts.maxDelay
        );
        
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await this.sleep(delay);
      }
    }

    throw new Error(`${operationName} failed after ${opts.maxAttempts} attempts: ${lastError.message}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Circuit breaker pattern for preventing cascading failures
  createCircuitBreaker(threshold: number = 5, resetTimeout: number = 60000) {
    let failures = 0;
    let lastFailureTime = 0;
    let isOpen = false;

    return {
      async execute<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
        // Check if circuit should be reset
        if (isOpen && Date.now() - lastFailureTime > resetTimeout) {
          console.log(`🔧 Resetting circuit breaker for ${operationName}`);
          failures = 0;
          isOpen = false;
        }

        // If circuit is open, fail fast
        if (isOpen) {
          throw new Error(`Circuit breaker is open for ${operationName}`);
        }

        try {
          const result = await operation();
          // Reset failures on success
          if (failures > 0) {
            console.log(`✅ ${operationName} recovered, resetting failure count`);
            failures = 0;
          }
          return result;
        } catch (error) {
          failures++;
          lastFailureTime = Date.now();

          if (failures >= threshold) {
            isOpen = true;
            console.error(`🚨 Circuit breaker opened for ${operationName} after ${failures} failures`);
          }

          throw error;
        }
      },

      getStatus() {
        return {
          isOpen,
          failures,
          lastFailureTime
        };
      }
    };
  }
}

export const onboardingRetryService = new OnboardingRetryService();