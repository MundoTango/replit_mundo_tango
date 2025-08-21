/**
 * Console cleanup utility
 * Hides internal framework references from browser console
 * Security requirement: ESA LIFE CEO 56x21 must not appear in production logs
 */

export function initializeConsoleCleanup(): void {
  if (typeof window === 'undefined') return;
  
  // Only apply in production
  const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost';
  
  if (!isProduction) {
    console.log('Console cleanup: Development mode - bypassed');
    return;
  }

  // Store original console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug
  };

  // Filter function to remove sensitive framework references
  const filterMessage = (args: any[]): any[] => {
    return args.map(arg => {
      if (typeof arg === 'string') {
        // Remove ESA framework references
        return arg
          .replace(/ESA[\s-]*(LIFE[\s-]*CEO)?[\s-]*\d+x\d+/gi, '[Framework]')
          .replace(/\[ESA[^\]]*\]/gi, '[Framework]')
          .replace(/56x21/gi, '')
          .replace(/44x21/gi, '')
          .replace(/41x21/gi, '')
          .replace(/Enhanced Service Architecture/gi, 'Service');
      }
      return arg;
    });
  };

  // Override console methods
  ['log', 'error', 'warn', 'info', 'debug'].forEach(method => {
    (console as any)[method] = function(...args: any[]) {
      const filtered = filterMessage(args);
      (originalConsole as any)[method].apply(console, filtered);
    };
  });

  // Clean up any existing console output
  if (console.clear) {
    console.clear();
  }

  // Prevent framework detection through error stack traces
  const originalError = Error;
  (window as any).Error = class extends originalError {
    constructor(message?: string) {
      const cleanMessage = message ? 
        message.replace(/ESA[\s-]*(LIFE[\s-]*CEO)?[\s-]*\d+x\d+/gi, '[Framework]') : 
        message;
      super(cleanMessage);
      
      // Clean stack trace
      if (this.stack) {
        this.stack = this.stack.replace(/ESA[\s-]*(LIFE[\s-]*CEO)?[\s-]*\d+x\d+/gi, '[Framework]');
      }
    }
  };
}

// Auto-initialize on module load
if (typeof window !== 'undefined') {
  initializeConsoleCleanup();
}