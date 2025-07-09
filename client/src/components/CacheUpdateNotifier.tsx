import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { CacheMonitor, type CacheStatus } from '@/utils/cache-monitor';

export function CacheUpdateNotifier() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const monitor = CacheMonitor.getInstance();
    
    // Check cache status on mount
    monitor.checkCacheStatus().then(setCacheStatus);
    
    // Listen for cache update events
    const handleCacheUpdate = (event: CustomEvent<CacheStatus>) => {
      setCacheStatus(event.detail);
      setUpdateAvailable(true);
    };
    
    window.addEventListener('cache-update-available' as any, handleCacheUpdate);
    
    return () => {
      window.removeEventListener('cache-update-available' as any, handleCacheUpdate);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await CacheMonitor.getInstance().forceCacheUpdate();
    } catch (error) {
      console.error('Failed to update cache:', error);
      setIsUpdating(false);
    }
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Update Available
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            A new version of the app is available. Refresh to get the latest features and improvements.
          </p>
          {cacheStatus && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Current: {cacheStatus.currentVersion || 'none'}<br />
              Expected: {cacheStatus.expectedVersion}
            </p>
          )}
          <div className="mt-3 flex space-x-2">
            <Button 
              size="sm" 
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Update Now
                </>
              )}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setUpdateAvailable(false)}
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}