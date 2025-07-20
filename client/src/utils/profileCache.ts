/**
 * Profile Caching Strategy
 * Phase 8: Performance Optimization (35L Framework)
 */

import { QueryClient } from '@tanstack/react-query';

interface CacheConfig {
  staleTime: number;
  cacheTime: number;
  refetchOnWindowFocus: boolean;
  refetchOnMount: boolean;
}

// Cache configurations for different data types
export const CACHE_CONFIGS = {
  // User profile data - rarely changes
  profile: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  },
  
  // Travel details - moderate changes
  travelDetails: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: false
  },
  
  // Autocomplete data - frequently accessed
  autocomplete: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false
  },
  
  // Posts/memories - real-time updates
  posts: {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true
  }
};

// Prefetch profile data
export async function prefetchProfileData(
  queryClient: QueryClient,
  username: string
) {
  const queries = [
    {
      queryKey: ['/api/user', username],
      queryFn: () => fetch(`/api/user/${username}`).then(res => res.json()),
      ...CACHE_CONFIGS.profile
    },
    {
      queryKey: ['/api/user/travel-details'],
      queryFn: () => fetch('/api/user/travel-details').then(res => res.json()),
      ...CACHE_CONFIGS.travelDetails
    }
  ];
  
  await Promise.all(
    queries.map(query => queryClient.prefetchQuery(query))
  );
}

// Optimistic update for travel details
export function optimisticUpdateTravelDetail(
  queryClient: QueryClient,
  newDetail: any
) {
  queryClient.setQueryData(
    ['/api/user/travel-details'],
    (old: any) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: [newDetail, ...old.data]
      };
    }
  );
}

// Cache invalidation strategies
export const invalidationStrategies = {
  // Invalidate user profile and related data
  profile: (queryClient: QueryClient, username: string) => {
    queryClient.invalidateQueries({
      queryKey: ['/api/user', username]
    });
  },
  
  // Invalidate travel details
  travelDetails: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({
      queryKey: ['/api/user/travel-details']
    });
  },
  
  // Smart invalidation for posts
  posts: (queryClient: QueryClient, userId: number) => {
    // Only invalidate user's posts, not all posts
    queryClient.invalidateQueries({
      queryKey: ['/api/posts'],
      predicate: (query) => {
        const data = query.state.data as any;
        return data?.userId === userId;
      }
    });
  }
};

// Local storage cache for static data
class LocalStorageCache {
  private prefix = 'mt_cache_';
  
  set(key: string, data: any, ttl: number) {
    const item = {
      data,
      expiry: Date.now() + ttl,
      version: 1
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
  }
  
  get(key: string) {
    const itemStr = localStorage.getItem(this.prefix + key);
    if (!itemStr) return null;
    
    try {
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }
      return item.data;
    } catch {
      return null;
    }
  }
  
  clear(pattern?: string) {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        if (!pattern || key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      }
    });
  }
}

export const localCache = new LocalStorageCache();

// Service worker cache for images
export async function cacheProfileImages(urls: string[]) {
  if ('caches' in window) {
    const cache = await caches.open('profile-images-v1');
    await cache.addAll(urls.filter(url => url && url.length > 0));
  }
}

// Memory cache for autocomplete results
class MemoryCache<T> {
  private cache = new Map<string, { data: T; expiry: number }>();
  
  set(key: string, data: T, ttl: number) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  clear() {
    this.cache.clear();
  }
}

export const autocompleteCache = new MemoryCache<any[]>();