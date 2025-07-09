/**
 * Runtime Cache Monitor
 * Monitors service worker cache version and alerts on mismatches
 */

export interface CacheStatus {
  currentVersion: string | null;
  expectedVersion: string;
  isValid: boolean;
  lastChecked: Date;
}

export class CacheMonitor {
  private static instance: CacheMonitor;
  private expectedVersion = 'life-ceo-v5'; // Must match service-worker.js
  private checkInterval: NodeJS.Timeout | null = null;
  
  private constructor() {}
  
  static getInstance(): CacheMonitor {
    if (!CacheMonitor.instance) {
      CacheMonitor.instance = new CacheMonitor();
    }
    return CacheMonitor.instance;
  }
  
  async getCurrentCacheVersion(): Promise<string | null> {
    if (!('caches' in window)) return null;
    
    try {
      const cacheNames = await caches.keys();
      const lifeCeoCaches = cacheNames.filter(name => name.startsWith('life-ceo-'));
      return lifeCeoCaches.length > 0 ? lifeCeoCaches[0] : null;
    } catch (error) {
      console.error('Failed to get cache version:', error);
      return null;
    }
  }
  
  async checkCacheStatus(): Promise<CacheStatus> {
    const currentVersion = await this.getCurrentCacheVersion();
    
    const status: CacheStatus = {
      currentVersion,
      expectedVersion: this.expectedVersion,
      isValid: currentVersion === this.expectedVersion,
      lastChecked: new Date()
    };
    
    if (!status.isValid) {
      this.handleCacheMismatch(status);
    }
    
    return status;
  }
  
  private handleCacheMismatch(status: CacheStatus) {
    console.warn('Cache version mismatch detected:', status);
    
    // Show user notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Update Available', {
        body: 'A new version is available. Please refresh to update.',
        icon: '/icon-192x192.png'
      });
    }
    
    // Dispatch custom event for UI handling
    window.dispatchEvent(new CustomEvent('cache-update-available', { 
      detail: status 
    }));
  }
  
  async forceCacheUpdate(): Promise<void> {
    if ('serviceWorker' in navigator) {
      // Unregister all service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Reload
      window.location.reload();
    }
  }
  
  startMonitoring(intervalMs = 300000): void { // Check every 5 minutes
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    // Initial check
    this.checkCacheStatus();
    
    // Set up interval
    this.checkInterval = setInterval(() => {
      this.checkCacheStatus();
    }, intervalMs);
  }
  
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
  
  // Update expected version (call this when deploying new version)
  updateExpectedVersion(version: string): void {
    this.expectedVersion = version;
  }
}

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  CacheMonitor.getInstance().startMonitoring();
}