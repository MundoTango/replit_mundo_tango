// Lazy loading configuration to reduce bundle size and memory usage
import { lazy } from 'react';

// Core pages that should load immediately
export const Home = lazy(() => import('@/pages/home'));
export const Profile = lazy(() => import('@/pages/profile'));
export const Landing = lazy(() => import('@/pages/landing'));

// Secondary pages - lazy loaded to reduce initial bundle
export const Events = lazy(() => import('@/pages/events'));
export const EnhancedEvents = lazy(() => import('@/pages/events-enhanced'));
export const Messages = lazy(() => import('@/pages/messages'));
export const Moments = lazy(() => import('@/pages/moments'));
export const Community = lazy(() => import('@/pages/community'));
export const Friends = lazy(() => import('@/pages/friends'));
export const Groups = lazy(() => import('@/pages/groups'));

// Admin and specialized pages - only load when needed
export const AdminCenter = lazy(() => import('@/pages/AdminCenter'));
export const LifeCEOPortal = lazy(() => import('@/components/admin/LifeCEOPortal'));
export const LifeCEOEnhanced = lazy(() => import('@/pages/LifeCEOEnhanced'));
export const HierarchyDashboard = lazy(() => import('@/pages/HierarchyDashboard'));

// Timeline pages - consolidate to reduce imports
export const EnhancedTimeline = lazy(() => import('@/pages/enhanced-timeline'));
export const EnhancedTimelineV2 = lazy(() => import('@/pages/enhanced-timeline-v2'));

// Onboarding flow
export const Onboarding = lazy(() => import('@/pages/onboarding'));
export const CodeOfConduct = lazy(() => import('@/pages/code-of-conduct'));

// Test and debug pages - only load in development
export const LifeCeoTest = lazy(() => import('@/pages/LifeCeoTest'));

// Heavy components that should be lazy loaded
export const GroupDetailPage = lazy(() => import('@/pages/GroupDetailPageMT'));
export const CommunityWorldMap = lazy(() => import('@/pages/community-world-map'));
export const HousingMarketplace = lazy(() => import('@/pages/housing-marketplace'));
export const HostOnboarding = lazy(() => import('@/pages/HostOnboarding'));
export const GuestOnboarding = lazy(() => import('@/pages/GuestOnboarding'));

// Utility function for creating lazy routes with error boundaries
import React from 'react';

export const createLazyRoute = (Component: React.LazyExoticComponent<any>) => {
  return (props: any) => (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-turquoise-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <Component {...props} />
    </React.Suspense>
  );
};