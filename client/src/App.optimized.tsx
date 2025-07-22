import React, { useEffect, Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from "@/contexts/socket-context";
import { AuthProvider } from "@/contexts/auth-context";
import { TenantProvider } from "@/contexts/TenantContext";
import { useAuth } from "@/hooks/useAuth";
import { initAnalytics, analytics } from "@/lib/analytics";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import ThemeManager from "@/components/theme/ThemeManager";
import { performanceOptimizations } from "@/lib/performance-optimizations";
import { usePerformanceOptimization } from "@/hooks/usePerformanceOptimization";
import { lifeCeoPerformance } from "@/lib/life-ceo-performance";
import { setupGlobalErrorHandlers, setupQueryErrorHandling } from "@/lib/global-error-handler";
import { MicroInteractionProvider } from "@/components/MicroInteractionProvider";
import BuildOptimizer from "@/lib/build-optimizations";

// Critical components that load immediately
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import LifeCeoTest from "@/pages/LifeCeoTest";

// Lazy loaded components to reduce bundle size
const Home = lazy(() => import("@/pages/home"));
const Profile = lazy(() => import("@/pages/profile"));
const Events = lazy(() => import("@/pages/events"));
const Messages = lazy(() => import("@/pages/messages"));
const Moments = lazy(() => import("@/pages/moments"));
const Community = lazy(() => import("@/pages/community"));
const Friends = lazy(() => import("@/pages/friends"));
const Groups = lazy(() => import("@/pages/groups"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const CodeOfConduct = lazy(() => import("@/pages/code-of-conduct"));

// Admin and specialized pages - only load when needed
const AdminCenter = lazy(() => import("@/pages/AdminCenter"));
const LifeCEOPortal = lazy(() => import("@/components/admin/LifeCEOPortal"));
const LifeCEOEnhanced = lazy(() => import("@/pages/LifeCEOEnhanced"));

// Timeline pages
const EnhancedTimelineV2 = lazy(() => import("@/pages/enhanced-timeline-v2"));

// Heavy components
const GroupDetailPage = lazy(() => import("@/pages/GroupDetailPageMT"));
const CommunityWorldMap = lazy(() => import("@/pages/community-world-map"));

// Loading component
const LoadingFallback = ({ message = "Loading..." }: { message?: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-turquoise-50 to-cyan-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-500 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>Something went wrong</h1>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  console.log("Router state:", { isLoading, isAuthenticated });

  const [authTimeout, setAuthTimeout] = React.useState(false);
  
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.log('Auth loading timeout - proceeding without auth');
        setAuthTimeout(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Only show loading if auth is taking less than 3 seconds
  if (isLoading && !authTimeout) {
    return <LoadingFallback message="Loading application..." />;
  }

  console.log("Life CEO: Bypassing auth for performance debugging");
  console.log("Showing main app");

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          {/* Critical routes */}
          <Route path="/life-ceo-test" component={LifeCeoTest} />
          <Route path="/" component={Landing} />
          
          {/* Lazy loaded routes */}
          <Route path="/home">
            <Suspense fallback={<LoadingFallback message="Loading home..." />}>
              <Home />
            </Suspense>
          </Route>
          
          <Route path="/profile">
            <Suspense fallback={<LoadingFallback message="Loading profile..." />}>
              <Profile />
            </Suspense>
          </Route>
          
          <Route path="/enhanced-timeline">
            <Suspense fallback={<LoadingFallback message="Loading timeline..." />}>
              <EnhancedTimelineV2 />
            </Suspense>
          </Route>
          
          <Route path="/events">
            <Suspense fallback={<LoadingFallback message="Loading events..." />}>
              <Events />
            </Suspense>
          </Route>
          
          <Route path="/messages">
            <Suspense fallback={<LoadingFallback message="Loading messages..." />}>
              <Messages />
            </Suspense>
          </Route>
          
          <Route path="/moments">
            <Suspense fallback={<LoadingFallback message="Loading moments..." />}>
              <Moments />
            </Suspense>
          </Route>
          
          <Route path="/community">
            <Suspense fallback={<LoadingFallback message="Loading community..." />}>
              <Community />
            </Suspense>
          </Route>
          
          <Route path="/community-world-map">
            <Suspense fallback={<LoadingFallback message="Loading map..." />}>
              <CommunityWorldMap />
            </Suspense>
          </Route>
          
          <Route path="/friends">
            <Suspense fallback={<LoadingFallback message="Loading friends..." />}>
              <Friends />
            </Suspense>
          </Route>
          
          <Route path="/groups">
            <Suspense fallback={<LoadingFallback message="Loading groups..." />}>
              <Groups />
            </Suspense>
          </Route>
          
          <Route path="/groups/:slug">
            <Suspense fallback={<LoadingFallback message="Loading group..." />}>
              <GroupDetailPage />
            </Suspense>
          </Route>
          
          <Route path="/onboarding">
            <Suspense fallback={<LoadingFallback message="Loading onboarding..." />}>
              <Onboarding />
            </Suspense>
          </Route>
          
          <Route path="/code-of-conduct">
            <Suspense fallback={<LoadingFallback message="Loading terms..." />}>
              <CodeOfConduct />
            </Suspense>
          </Route>
          
          <Route path="/admin">
            <Suspense fallback={<LoadingFallback message="Loading admin..." />}>
              <AdminCenter />
            </Suspense>
          </Route>
          
          <Route path="/life-ceo">
            <Suspense fallback={<LoadingFallback message="Loading Life CEO..." />}>
              <LifeCEOEnhanced />
            </Suspense>
          </Route>
          
          {/* Fallback */}
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize build optimizations
    BuildOptimizer.optimize();
    
    // Initialize analytics
    initAnalytics();
    
    // Setup global error handling
    setupGlobalErrorHandlers();
    setupQueryErrorHandling(queryClient);
    
    // Initialize performance optimizations
    performanceOptimizations.init();
    lifeCeoPerformance.init();
    
    console.log("⚡ Life CEO Performance Optimizer initialized");
  }, []);

  // Performance optimization hook
  usePerformanceOptimization();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <TenantProvider>
              <AuthProvider>
                <SocketProvider>
                  <MicroInteractionProvider>
                    <Router />
                    <Toaster />
                    <ThemeManager />
                  </MicroInteractionProvider>
                </SocketProvider>
              </AuthProvider>
            </TenantProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}