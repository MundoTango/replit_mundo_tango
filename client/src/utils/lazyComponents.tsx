/**
 * Lazy Loading Components with Code Splitting
 * Phase 8: Performance Optimization (35L Framework)
 */

import React, { lazy, Suspense, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component with MT ocean theme
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Loader2 className="w-8 h-8 animate-spin text-turquoise-500" />
  </div>
);

// Error boundary for lazy loaded components
class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-4">
          <p className="text-red-500 mb-2">Failed to load component</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-turquoise-500 text-white rounded hover:bg-turquoise-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper for lazy loaded components
export function withLazyLoading<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): React.ComponentType<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFunc);

  return (props: React.ComponentProps<T>) => (
    <LazyErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyErrorBoundary>
  );
}

// Preload component before rendering
export function preloadComponent(
  importFunc: () => Promise<{ default: ComponentType<any> }>
): void {
  importFunc();
}

// Lazy load profile components
export const LazyTravelDetailsComponent = withLazyLoading(
  () => import('@/components/profile/TravelDetailsComponent')
);

export const LazyProfileMemoryPostModal = withLazyLoading(
  () => import('@/components/profile/ProfileMemoryPostModal')
);

export const LazyAddTravelDetailModal = withLazyLoading(
  () => import('@/components/profile/AddTravelDetailModal')
);

// Lazy load heavy components
export const LazyBeautifulPostCreator = withLazyLoading(
  () => import('@/components/BeautifulPostCreator')
);

export const LazyEnhancedTimelineV2 = withLazyLoading(
  () => import('@/pages/enhanced-timeline-v2')
);

export const LazyFramework35LDashboard = withLazyLoading(
  () => import('@/components/admin/Framework35LDashboard')
);

// Route-based code splitting
export const LazyRoutes = {
  Profile: withLazyLoading(() => import('@/pages/profile')),
  AdminCenter: withLazyLoading(() => import('@/pages/admin-center')),
  CommunityWorldMap: withLazyLoading(() => import('@/pages/community-world-map')),
  Groups: withLazyLoading(() => import('@/pages/groups')),
  LifeCEO: withLazyLoading(() => import('@/pages/life-ceo')),
  EnhancedTimeline: withLazyLoading(() => import('@/pages/enhanced-timeline-v2')),
};

// Utility to preload routes on hover
export function useRoutePreloader() {
  const preloadRoute = (routeName: keyof typeof LazyRoutes) => {
    switch (routeName) {
      case 'Profile':
        import('@/pages/profile');
        break;
      case 'AdminCenter':
        import('@/pages/admin-center');
        break;
      case 'CommunityWorldMap':
        import('@/pages/community-world-map');
        break;
      case 'Groups':
        import('@/pages/groups');
        break;
      case 'LifeCEO':
        import('@/pages/life-ceo');
        break;
      case 'EnhancedTimeline':
        import('@/pages/enhanced-timeline-v2');
        break;
    }
  };

  return { preloadRoute };
}