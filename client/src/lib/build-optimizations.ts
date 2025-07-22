// Build optimization utilities specifically for deployment memory issues
import { initializeMemoryOptimization } from './memory-optimizer';

// Critical pages that should be included in the main bundle
export const CRITICAL_ROUTES = [
  '/',
  '/home',
  '/landing',
  '/onboarding',
  '/life-ceo-test'
];

// Development-only routes that should be excluded in production
export const DEV_ONLY_ROUTES = [
  '/test-modal',
  '/modal-debug-test',
  '/test-admin-page',
  '/route-test',
  '/timeline-test',
  '/timeline-minimal',
  '/timeline-debug',
  '/simple-test',
  '/fix-modal-test',
  '/navigation-test',
  '/test-app',
  '/performance-test',
  '/city-auto-creation-test'
];

// Bundle splitting configuration
export const BUNDLE_CONFIG = {
  // Core framework chunks
  vendor: ['react', 'react-dom', 'wouter'],
  
  // UI components chunk
  ui: [
    '@radix-ui/react-dialog',
    '@radix-ui/react-dropdown-menu',
    '@radix-ui/react-tabs',
    '@radix-ui/react-toast'
  ],
  
  // Maps and heavy components
  maps: [
    '@googlemaps/js-api-loader',
    'leaflet',
    'react-leaflet'
  ],
  
  // Utilities
  utils: ['date-fns', 'lodash', 'clsx', 'tailwind-merge'],
  
  // Admin and specialized features
  admin: [
    '@/pages/AdminCenter',
    '@/components/admin/LifeCEOPortal'
  ]
};

// Memory optimization for build process
export class BuildOptimizer {
  static optimize() {
    // Initialize memory management
    initializeMemoryOptimization();
    
    // Reduce console logging in production
    if (import.meta.env.PROD) {
      this.disableNonEssentialLogging();
    }
    
    // Optimize for build environment
    if (import.meta.env.VITE_BUILD_OPTIMIZE) {
      this.enableBuildOptimizations();
    }
  }
  
  private static disableNonEssentialLogging() {
    // Keep errors and warnings, disable debug logs
    const originalLog = console.log;
    console.log = (...args) => {
      // Only log critical messages in production
      if (args[0]?.includes?.('🚨') || args[0]?.includes?.('Critical')) {
        originalLog(...args);
      }
    };
  }
  
  private static enableBuildOptimizations() {
    // Set build-specific optimizations
    if (typeof window !== 'undefined') {
      (window as any).__BUILD_OPTIMIZATION__ = true;
      
      // Disable heavy animations during build
      document.documentElement.style.setProperty('--transition-duration', '0ms');
      document.documentElement.style.setProperty('--animation-duration', '0ms');
    }
  }
  
  static shouldLoadRoute(route: string): boolean {
    // Don't load dev routes in production
    if (import.meta.env.PROD && DEV_ONLY_ROUTES.includes(route)) {
      return false;
    }
    
    return true;
  }
}

// Environment-specific configuration
export const ENV_CONFIG = {
  development: {
    enableDevTools: true,
    enableHotReload: true,
    loadAllRoutes: true
  },
  production: {
    enableDevTools: false,
    enableHotReload: false,
    loadAllRoutes: false,
    // Limit concurrent chunks to reduce memory usage
    maxConcurrentChunks: 3
  }
};

export default BuildOptimizer;