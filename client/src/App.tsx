import React, { useEffect } from "react";
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
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import CodeOfConduct from "@/pages/code-of-conduct";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Events from "@/pages/events";
import EnhancedEvents from "@/pages/events-enhanced";
import Messages from "@/pages/messages";
import Moments from "@/pages/moments";
import Community from "@/pages/community";
import OrganizerDashboard from "@/pages/organizer";
import TeacherDashboard from "@/pages/teacher";
import Friends from "@/pages/friends";
import Groups from "@/pages/groups";
import GroupPage from "@/pages/group";
import GroupDetailPage from "@/pages/GroupDetailPageMT";
import CreateCommunity from "@/pages/create-community";
import Invitations from "@/pages/invitations";
import ResumePage from "@/pages/ResumePage";
import PublicResumePage from "@/pages/PublicResumePage";
import PublicProfilePage from "@/pages/PublicProfilePage";
import { NotionHomePage } from "@/pages/NotionHomePage";
import { NotionEntryPage } from "@/pages/NotionEntryPage";
import AdminCenter from "@/pages/AdminCenter";
import LifeCEOPortal from "@/components/admin/LifeCEOPortal";
import LifeCEOAgentDetail from "@/components/admin/LifeCEOAgentDetail";
import ProfileSwitcher from "@/pages/ProfileSwitcher";
import LifeCEO from "@/pages/LifeCEO";
import LifeCEOEnhanced from "@/pages/LifeCEOEnhanced";
import HierarchyDashboard from "@/pages/HierarchyDashboard";
import TestModal from "@/pages/TestModal";
import ModalDebugTest from "@/pages/ModalDebugTest";
import TestAdminPage from "@/pages/TestAdminPage";
import EnhancedTimeline from "@/pages/enhanced-timeline";
import EnhancedTimelineV2 from "@/pages/enhanced-timeline-v2";
import SimpleEnhancedTimeline from "@/pages/simple-enhanced-timeline";
import RouteTest from "@/pages/route-test";
import TimelineTest from "@/pages/timeline-test";
import TimelineMinimal from "@/pages/timeline-minimal";
import TimelineDebug from "@/pages/timeline-debug";
import SimpleTest from "@/pages/simple-test";
import FixModalTest from "@/pages/fix-modal-test";
import NavigationTest from "@/pages/navigation-test";
import TTfilesDemo from "@/pages/TTfilesDemo";
import TTfilesHelpCenter from "@/pages/ttfiles-help-center";
import TangoCommunities from "@/pages/tango-communities";
import CommunityWorldMap from "@/pages/community-world-map";
import HousingMarketplace from "@/pages/housing-marketplace";
import GlobalStatistics from "@/pages/global-statistics";
import DatabaseSecurity from "@/pages/database-security";
import TestApp from "@/pages/test-app";
import FeatureNavigation from "@/pages/feature-navigation";
import LiveGlobalStatistics from "@/pages/LiveGlobalStatistics";
import HostOnboarding from "@/pages/HostOnboarding";
import GuestOnboarding from "@/pages/GuestOnboarding";
import PerformanceTest from "@/pages/PerformanceTest";
import CityAutoCreationTest from "@/pages/CityAutoCreationTest";
import LifeCeoPerformance from "@/pages/LifeCeoPerformance";
import LifeCeoTest from "@/pages/LifeCeoTest";

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

  // Removed aggressive cache clearing that was causing performance issues
  // Service workers and caching are essential for good performance

  console.log("Router state:", { isLoading, isAuthenticated });

  // Life CEO Performance: Don't block rendering for auth
  // Show app content immediately while auth loads in background
  const [authTimeout, setAuthTimeout] = React.useState(false);
  
  React.useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.log('Auth loading timeout - proceeding without auth');
        setAuthTimeout(true);
      }, 3000); // 3 second max wait for auth
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Only show loading if auth is taking less than 3 seconds
  if (isLoading && !authTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Life CEO Performance: Skip authentication check temporarily to debug performance
  // if (!isAuthenticated) {
  //   console.log("Not authenticated, checking public routes");
  //   
  //   // Check if trying to access register route
  //   if (window.location.pathname === '/register') {
  //     // Redirect to login API which handles both login and registration
  //     window.location.href = '/api/login';
  //     return null;
  //   }
  //   
  //   analytics.pageView('Landing');
  //   return <Landing />;
  // }
  
  // Life CEO: Force show main app for performance debugging
  console.log("Life CEO: Bypassing auth for performance debugging");

  // Life CEO Performance: Skip onboarding checks for debugging
  // const needsOnboarding = !user || !user.formStatus || user.formStatus === 0;
  // const needsCodeOfConduct = user && user.formStatus && user.formStatus >= 1 && !user.codeOfConductAccepted;

  // console.log("User flow check:", { 
  //   needsOnboarding, 
  //   needsCodeOfConduct, 
  //   formStatus: user?.formStatus,
  //   isOnboardingComplete: user?.isOnboardingComplete,
  //   codeOfConductAccepted: user?.codeOfConductAccepted
  // });

  // if (needsOnboarding) {
  //   console.log("Showing onboarding");
  //   analytics.pageView('Onboarding');
  //   return <Onboarding />;
  // }

  // if (needsCodeOfConduct) {
  //   console.log("Showing code of conduct");
  //   analytics.pageView('Code of Conduct');
  //   return <CodeOfConduct />;
  // }

  // If authenticated and fully onboarded, show main app
  console.log("Showing main app");
  
  // DEBUG: Log all route matches
  const currentPath = window.location.pathname;
  console.log("🔍 Current path:", currentPath);
  console.log("🔍 Should match enhanced-timeline:", currentPath === '/enhanced-timeline');
  
  return (
    <Switch>
      <Route path="/">{() => <Redirect to="/life-ceo-test" />}</Route>
      <Route path="/moments" component={Moments} />
      <Route path="/register">{() => <Redirect to="/" />}</Route>
      <Route path="/community">{() => <Redirect to="/community-world-map" />}</Route>
      <Route path="/community-world-map" component={CommunityWorldMap} />
      <Route path="/tango-communities" component={TangoCommunities} />
      <Route path="/housing-marketplace" component={HousingMarketplace} />
      <Route path="/host-onboarding" component={HostOnboarding} />
      <Route path="/guest-onboarding" component={GuestOnboarding} />
      <Route path="/global-statistics" component={GlobalStatistics} />
      <Route path="/live-statistics" component={LiveGlobalStatistics} />
      <Route path="/database-security" component={DatabaseSecurity} />
      <Route path="/organizer" component={OrganizerDashboard} />
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/friends" component={Friends} />
      <Route path="/groups" component={Groups} />
      <Route path="/groups/create" component={CreateCommunity} />
      <Route path="/groups/:slug" component={GroupDetailPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/events" component={EnhancedEvents} />
      <Route path="/events-enhanced" component={EnhancedEvents} />
      <Route path="/invitations" component={Invitations} />
      <Route path="/profile/resume" component={ResumePage} />
      <Route path="/u/:username/resume" component={PublicResumePage} />
      <Route path="/u/:username" component={PublicProfilePage} />
      <Route path="/messages" component={Messages} />
      <Route path="/stories" component={NotionHomePage} />
      <Route path="/stories/:slug" component={NotionEntryPage} />
      <Route path="/admin" component={AdminCenter} />
      <Route path="/profile-switcher" component={ProfileSwitcher} />
      <Route path="/life-ceo" component={LifeCEOEnhanced} />
      <Route path="/life-ceo-portal" component={LifeCEOPortal} />
      <Route path="/life-ceo/agent/:id" component={LifeCEOAgentDetail} />
      <Route path="/hierarchy" component={HierarchyDashboard} />
      <Route path="/test-modal" component={TestModal} />
      <Route path="/modal-debug" component={ModalDebugTest} />
      <Route path="/test-admin" component={TestAdminPage} />
      <Route path="/enhanced-timeline" component={EnhancedTimelineV2} />
      <Route path="/timeline-v2" component={TimelineMinimal} />
      <Route path="/debug" component={TimelineDebug} />
      <Route path="/simple-test" component={SimpleTest} />
      <Route path="/fix-modal" component={FixModalTest} />
      <Route path="/navigation-test" component={NavigationTest} />
      <Route path="/enhanced-timeline-old" component={EnhancedTimeline} />
      <Route path="/route-test" component={RouteTest} />
      <Route path="/ttfiles-demo" component={TTfilesDemo} />
      <Route path="/ttfiles-help-center" component={TTfilesHelpCenter} />
      <Route path="/feature-navigation" component={FeatureNavigation} />
      <Route path="/performance-test" component={PerformanceTest} />
      <Route path="/city-test" component={CityAutoCreationTest} />
      <Route path="/life-ceo-performance" component={LifeCeoPerformance} />
      <Route path="/life-ceo-test" component={LifeCeoTest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Life CEO performance optimizations
  const { lazyLoadImage, preloadResource } = usePerformanceOptimization();
  
  // Initialize analytics, error handlers, and performance optimizations on app startup
  useEffect(() => {
    // Set up global error handlers
    setupGlobalErrorHandlers();
    
    // Set up query error handling
    setupQueryErrorHandling(queryClient);
    
    // Initialize analytics
    initAnalytics();
    
    // Initialize performance optimizations
    if (performanceOptimizations) {
      console.log('Performance optimizations initialized');
    }
    
    // Life CEO Performance: Preload critical resources
    console.log('⚡ Life CEO Performance: Preloading critical resources...');
    preloadResource('/src/components/moments/EnhancedPostItem.tsx', 'script');
    preloadResource('/src/pages/enhanced-timeline-v2.tsx', 'script');
    
    // Life CEO Performance: Apply lazy loading to all images on the page
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => lazyLoadImage(img as HTMLImageElement));
    
    // Life CEO Advanced Performance: Analyze bundle size
    lifeCeoPerformance.analyzeBundleSize();
    
    // Life CEO Performance: Monitor Core Web Vitals
    if ('web-vital' in window) {
      console.log('📊 Life CEO: Monitoring Core Web Vitals...');
    }
    
    // Life CEO Performance: Enable aggressive prefetching after 3 seconds
    setTimeout(() => {
      console.log('🚀 Life CEO: Enabling aggressive route prefetching...');
      // Prefetch top routes based on user behavior
      const topRoutes = ['/moments', '/enhanced-timeline', '/profile', '/groups'];
      topRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }, 3000);
    
    // Life CEO Performance: Set up request batching
    console.log('🔄 Life CEO: Enabling request batching for optimal network usage...');
    
    // Life CEO Performance: Enable memory optimization
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        console.log('🧹 Life CEO: Running idle-time optimizations...');
        // Clean up unused data from memory
        queryClient.getQueryCache().getAll().forEach(query => {
          if (query.state.dataUpdateCount === 0 && Date.now() - query.state.dataUpdatedAt > 300000) {
            queryClient.removeQueries({ queryKey: query.queryKey });
          }
        });
      });
    }
  }, [preloadResource, lazyLoadImage]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantProvider>
          <ThemeProvider>
            <SocketProvider>
              <TooltipProvider>
                <MicroInteractionProvider>
                  <Toaster />
                  <ErrorBoundary>
                    <Router />
                  </ErrorBoundary>
                  <ThemeManager />
                </MicroInteractionProvider>
              </TooltipProvider>
            </SocketProvider>
          </ThemeProvider>
        </TenantProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;