// Layer 23: Business Continuity - Data Persistence and Recovery

interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  version: string;
}

interface BackupOptions {
  maxAge?: number; // milliseconds
  version?: string;
  compress?: boolean;
}

class BusinessContinuityManager {
  private readonly DB_NAME = 'MundoTangoOffline';
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;
  private readonly STORE_NAME = 'offlineData';
  
  constructor() {
    this.initializeDB();
  }

  // Initialize IndexedDB for offline storage
  private async initializeDB(): Promise<void> {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported - offline features disabled');
      return;
    }

    try {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB');
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('version', 'version', { unique: false });
        }
      };
    } catch (error) {
      console.error('IndexedDB initialization failed:', error);
    }
  }

  // Save data for offline access
  async saveOfflineData(key: string, data: any, options: BackupOptions = {}): Promise<void> {
    if (!this.db) return;

    const { version = '1.0', compress = false } = options;
    
    try {
      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      const cachedData: CachedData = {
        key,
        data: compress ? this.compressData(data) : data,
        timestamp: Date.now(),
        version
      };
      
      const request = store.put(cachedData);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to save offline data'));
      });
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }

  // Retrieve offline data
  async getOfflineData(key: string, options: BackupOptions = {}): Promise<any> {
    if (!this.db) return null;

    const { maxAge = 7 * 24 * 60 * 60 * 1000 } = options; // 7 days default
    
    try {
      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(key);
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result as CachedData;
          
          if (!result) {
            resolve(null);
            return;
          }
          
          // Check if data is expired
          if (Date.now() - result.timestamp > maxAge) {
            this.deleteOfflineData(key);
            resolve(null);
            return;
          }
          
          resolve(result.data);
        };
        
        request.onerror = () => reject(new Error('Failed to retrieve offline data'));
      });
    } catch (error) {
      console.error('Error retrieving offline data:', error);
      return null;
    }
  }

  // Delete expired offline data
  private async deleteOfflineData(key: string): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      store.delete(key);
    } catch (error) {
      console.error('Error deleting offline data:', error);
    }
  }

  // Clean up old data
  async cleanupOfflineData(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const index = store.index('timestamp');
      const cutoffTime = Date.now() - maxAge;
      
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        }
      };
    } catch (error) {
      console.error('Error cleaning up offline data:', error);
    }
  }

  // Simple data compression (for demo - in production use proper compression)
  private compressData(data: any): string {
    return JSON.stringify(data);
  }

  // Export all offline data (for backup)
  async exportOfflineData(): Promise<any[]> {
    if (!this.db) return [];

    try {
      const transaction = this.db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error('Failed to export offline data'));
      });
    } catch (error) {
      console.error('Error exporting offline data:', error);
      return [];
    }
  }

  // Import offline data (for restore)
  async importOfflineData(data: CachedData[]): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      for (const item of data) {
        store.put(item);
      }
      
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(new Error('Failed to import offline data'));
      });
    } catch (error) {
      console.error('Error importing offline data:', error);
    }
  }
}

// Singleton instance
export const businessContinuity = new BusinessContinuityManager();

// Helper function to save profile data offline
export async function saveProfileOffline(userId: number, profileData: any): Promise<void> {
  await businessContinuity.saveOfflineData(`profile_${userId}`, profileData, {
    version: '2.0',
    compress: true
  });
}

// Helper function to get offline profile data
export async function getProfileOffline(userId: number): Promise<any> {
  return await businessContinuity.getOfflineData(`profile_${userId}`);
}

// Auto-save critical data periodically
export function enableAutoBackup(interval: number = 5 * 60 * 1000): void { // 5 minutes
  setInterval(async () => {
    // Get current user data from localStorage or session
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      
      // Save critical data offline
      await businessContinuity.saveOfflineData('lastBackup', {
        user,
        timestamp: Date.now(),
        url: window.location.href
      });
    }
    
    // Cleanup old data
    await businessContinuity.cleanupOfflineData();
  }, interval);
}

// Recovery mode detection
export function isInRecoveryMode(): boolean {
  const recoveryFlag = sessionStorage.getItem('recoveryMode');
  return recoveryFlag === 'true';
}

// Enable recovery mode
export function enableRecoveryMode(): void {
  sessionStorage.setItem('recoveryMode', 'true');
  
  // Notify user
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Recovery Mode Activated', {
      body: 'Using cached data while we restore connection',
      icon: '/favicon.ico'
    });
  }
}