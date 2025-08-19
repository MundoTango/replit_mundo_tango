// ESA LIFE CEO 56x21 - Console cleanup utility
// Filters out noise from browser console for cleaner debugging

export class ESAConsoleFix {
  private originalWarn = console.warn;
  private originalError = console.error;
  private originalLog = console.log;
  
  // Patterns to filter out (CSP warnings, external scripts, etc)
  private filterPatterns = [
    /Report Only.*Content Security Policy/i,
    /stallwart.*failed ping/i,
    /LaunchDarkly/i,
    /Unrecognized feature:/i,
    /Error while parsing.*sandbox/i,
    /Banner not shown.*beforeinstallpromptevent/i,
    /attached_assets.*404/i,
    /public\/offline\.html/i,
    /Failed to execute.*MutationObserver/i
  ];
  
  constructor() {
    this.install();
  }
  
  install() {
    // Override console.warn
    console.warn = (...args) => {
      const message = args.join(' ');
      if (!this.shouldFilter(message)) {
        this.originalWarn.apply(console, args);
      }
    };
    
    // Override console.error  
    console.error = (...args) => {
      const message = args.join(' ');
      if (!this.shouldFilter(message)) {
        this.originalError.apply(console, args);
      }
    };
    
    // Override console.log to hide framework references
    console.log = (...args) => {
      const message = args.join(' ');
      // Filter out ESA framework references from production
      if (!message.includes('ESA LIFE CEO') && !message.includes('56x21')) {
        this.originalLog.apply(console, args);
      }
    };
  }
  
  private shouldFilter(message: string): boolean {
    return this.filterPatterns.some(pattern => pattern.test(message));
  }
  
  // Method to temporarily disable filtering for debugging
  disable() {
    console.warn = this.originalWarn;
    console.error = this.originalError;
    console.log = this.originalLog;
  }
}

// Auto-install on import
export const esaConsoleFix = new ESAConsoleFix();