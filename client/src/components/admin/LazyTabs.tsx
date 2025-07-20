// Lazy loading wrapper for Admin Center tabs
import React, { Suspense, lazy } from 'react';

// Loading component for tabs
const TabLoader = () => (
  <div className="flex items-center justify-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-turquoise-500 border-t-transparent"></div>
  </div>
);

// Lazy load heavy components
export const LazyProjectTracker = lazy(() => import('./ProjectTrackerDashboard'));
export const LazyCompliance = lazy(() => import('./AutomatedComplianceMonitor'));
export const LazyFramework = lazy(() => import('./Framework35LDashboard'));
export const LazyPerformance = lazy(() => import('./PerformanceMonitor'));

// Wrapper component for lazy tabs
export const LazyTab: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<TabLoader />}>
    {children}
  </Suspense>
);