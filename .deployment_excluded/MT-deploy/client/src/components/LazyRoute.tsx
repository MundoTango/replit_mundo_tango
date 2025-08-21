import React, { lazy, Suspense } from 'react';
import { Route } from 'wouter';

// Life CEO Performance: Lazy loading wrapper for routes
interface LazyRouteProps {
  path: string;
  componentPath: string;
}

// Loading component with MT ocean theme
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-turquoise-50/50 via-cyan-50/50 to-white flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-turquoise-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  </div>
);

export function LazyRoute({ path, componentPath }: LazyRouteProps) {
  // Dynamically import the component
  const LazyComponent = lazy(() => import(`../pages/${componentPath}`));
  
  return (
    <Route path={path}>
      {() => (
        <Suspense fallback={<LoadingFallback />}>
          <LazyComponent />
        </Suspense>
      )}
    </Route>
  );
}

// Pre-configured lazy routes for common pages
export const LazyRoutes = {
  AdminCenter: (path: string) => <LazyRoute path={path} componentPath="AdminCenter" />,
  LifeCEOPortal: (path: string) => <LazyRoute path={path} componentPath="LifeCEOPortal" />,
  HierarchyDashboard: (path: string) => <LazyRoute path={path} componentPath="HierarchyDashboard" />,
  GlobalStatistics: (path: string) => <LazyRoute path={path} componentPath="GlobalStatistics" />,
  DatabaseSecurity: (path: string) => <LazyRoute path={path} componentPath="DatabaseSecurity" />,
  HostOnboarding: (path: string) => <LazyRoute path={path} componentPath="HostOnboarding" />,
  GuestOnboarding: (path: string) => <LazyRoute path={path} componentPath="GuestOnboarding" />,
};