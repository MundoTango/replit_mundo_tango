import React, { useEffect, Suspense } from "react";
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
import { setupGlobalErrorHandlers, setupQueryErrorHandling } from "@/lib/global-error-handler";

// Loading spinner component for lazy loading
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 text-lg">Loading page...</p>
    </div>
  </div>
);

// Essential pages loaded immediately
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import CodeOfConduct from "@/pages/code-of-conduct";
import Home from "@/pages/home";

// Lazy load all other pages for better performance
const Profile = React.lazy(() => import("@/pages/profile"));
const Events = React.lazy(() => import("@/pages/events"));
const EnhancedEvents = React.lazy(() => import("@/pages/events-enhanced"));
const Messages = React.lazy(() => import("@/pages/messages"));
const Moments = React.lazy(() => import("@/pages/moments"));
const Community = React.lazy(() => import("@/pages/community"));
const OrganizerDashboard = React.lazy(() => import("@/pages/organizer"));
const TeacherDashboard = React.lazy(() => import("@/pages/teacher"));
const Friends = React.lazy(() => import("@/pages/friends"));
const Groups = React.lazy(() => import("@/pages/groups"));
const GroupPage = React.lazy(() => import("@/pages/group"));
const GroupDetailPage = React.lazy(() => import("@/pages/GroupDetailPageMT"));
const CreateCommunity = React.lazy(() => import("@/pages/create-community"));
const Invitations = React.lazy(() => import("@/pages/invitations"));
const ResumePage = React.lazy(() => import("@/pages/ResumePage"));
const PublicResumePage = React.lazy(() => import("@/pages/PublicResumePage"));
const PublicProfilePage = React.lazy(() => import("@/pages/PublicProfilePage"));
const NotionHomePage = React.lazy(() => import("@/pages/NotionHomePage").then(m => ({ default: m.NotionHomePage })));
const NotionEntryPage = React.lazy(() => import("@/pages/NotionEntryPage").then(m => ({ default: m.NotionEntryPage })));

// Heavy admin pages - lazy load these
const AdminCenter = React.lazy(() => import("@/pages/AdminCenter"));
const LifeCEOPortal = React.lazy(() => import("@/components/admin/LifeCEOPortal"));
const LifeCEOAgentDetail = React.lazy(() => import("@/components/admin/LifeCEOAgentDetail"));
const ProfileSwitcher = React.lazy(() => import("@/pages/ProfileSwitcher"));
const LifeCEO = React.lazy(() => import("@/pages/LifeCEO"));
const LifeCEOEnhanced = React.lazy(() => import("@/pages/LifeCEOEnhanced"));
const HierarchyDashboard = React.lazy(() => import("@/pages/HierarchyDashboard"));

// Test pages - lazy load
const TestModal = React.lazy(() => import("@/pages/TestModal"));
const ModalDebugTest = React.lazy(() => import("@/pages/ModalDebugTest"));
const TestAdminPage = React.lazy(() => import("@/pages/TestAdminPage"));
const EnhancedTimeline = React.lazy(() => import("@/pages/enhanced-timeline"));
const EnhancedTimelineV2 = React.lazy(() => import("@/pages/enhanced-timeline-v2"));
const SimpleEnhancedTimeline = React.lazy(() => import("@/pages/simple-enhanced-timeline"));
const RouteTest = React.lazy(() => import("@/pages/route-test"));
const TimelineTest = React.lazy(() => import("@/pages/timeline-test"));
const TimelineMinimal = React.lazy(() => import("@/pages/timeline-minimal"));
const TimelineDebug = React.lazy(() => import("@/pages/timeline-debug"));
const SimpleTest = React.lazy(() => import("@/pages/simple-test"));
const FixModalTest = React.lazy(() => import("@/pages/fix-modal-test"));
const NavigationTest = React.lazy(() => import("@/pages/navigation-test"));
const TTfilesDemo = React.lazy(() => import("@/pages/TTfilesDemo"));
const TTfilesHelpCenter = React.lazy(() => import("@/pages/ttfiles-help-center"));
const TangoCommunities = React.lazy(() => import("@/pages/tango-communities"));
const CommunityWorldMap = React.lazy(() => import("@/pages/community-world-map"));
const HousingMarketplace = React.lazy(() => import("@/pages/housing-marketplace"));
const GlobalStatistics = React.lazy(() => import("@/pages/global-statistics"));
const DatabaseSecurity = React.lazy(() => import("@/pages/database-security"));
const TestApp = React.lazy(() => import("@/pages/test-app"));
const FeatureNavigation = React.lazy(() => import("@/pages/feature-navigation"));
const LiveGlobalStatistics = React.lazy(() => import("@/pages/LiveGlobalStatistics"));
const HostOnboarding = React.lazy(() => import("@/pages/HostOnboarding"));
const GuestOnboarding = React.lazy(() => import("@/pages/GuestOnboarding"));
const PerformanceTest = React.lazy(() => import("@/pages/PerformanceTest"));

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

  console.log("Router state:", { user, isLoading, isAuthenticated });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show landing page
  if (!isAuthenticated) {
    console.log("Not authenticated, showing landing");
    analytics.pageView('Landing');
    return <Landing />;
  }

  // Check if user needs to go through onboarding flow - use safe property access
  const needsOnboarding = !user || !user.formStatus || user.formStatus === 0;
  const needsCodeOfConduct = user && user.formStatus && user.formStatus >= 1 && !user.codeOfConductAccepted;

  console.log("User flow check:", { 
    needsOnboarding, 
    needsCodeOfConduct, 
    formStatus: user?.formStatus,
    isOnboardingComplete: user?.isOnboardingComplete,
    codeOfConductAccepted: user?.codeOfConductAccepted
  });

  if (needsOnboarding) {
    console.log("Showing onboarding");
    analytics.pageView('Onboarding');
    return <Onboarding />;
  }

  if (needsCodeOfConduct) {
    console.log("Showing code of conduct");
    analytics.pageView('Code of Conduct');
    return <CodeOfConduct />;
  }

  // If authenticated and fully onboarded, show main app
  console.log("Showing main app");
  
  // DEBUG: Log all route matches
  const currentPath = window.location.pathname;
  console.log("🔍 Current path:", currentPath);
  console.log("🔍 Should match enhanced-timeline:", currentPath === '/enhanced-timeline');
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/moments">
        <Suspense fallback={<LoadingSpinner />}>
          <Moments />
        </Suspense>
      </Route>
      <Route path="/community">{() => <Redirect to="/community-world-map" />}</Route>
      <Route path="/community-world-map">
        <Suspense fallback={<LoadingSpinner />}>
          <CommunityWorldMap />
        </Suspense>
      </Route>
      <Route path="/tango-communities">
        <Suspense fallback={<LoadingSpinner />}>
          <TangoCommunities />
        </Suspense>
      </Route>
      <Route path="/housing-marketplace">
        <Suspense fallback={<LoadingSpinner />}>
          <HousingMarketplace />
        </Suspense>
      </Route>
      <Route path="/host-onboarding">
        <Suspense fallback={<LoadingSpinner />}>
          <HostOnboarding />
        </Suspense>
      </Route>
      <Route path="/guest-onboarding">
        <Suspense fallback={<LoadingSpinner />}>
          <GuestOnboarding />
        </Suspense>
      </Route>
      <Route path="/global-statistics">
        <Suspense fallback={<LoadingSpinner />}>
          <GlobalStatistics />
        </Suspense>
      </Route>
      <Route path="/live-statistics">
        <Suspense fallback={<LoadingSpinner />}>
          <LiveGlobalStatistics />
        </Suspense>
      </Route>
      <Route path="/database-security">
        <Suspense fallback={<LoadingSpinner />}>
          <DatabaseSecurity />
        </Suspense>
      </Route>
      <Route path="/organizer">
        <Suspense fallback={<LoadingSpinner />}>
          <OrganizerDashboard />
        </Suspense>
      </Route>
      <Route path="/teacher">
        <Suspense fallback={<LoadingSpinner />}>
          <TeacherDashboard />
        </Suspense>
      </Route>
      <Route path="/friends">
        <Suspense fallback={<LoadingSpinner />}>
          <Friends />
        </Suspense>
      </Route>
      <Route path="/groups">
        <Suspense fallback={<LoadingSpinner />}>
          <Groups />
        </Suspense>
      </Route>
      <Route path="/groups/create">
        <Suspense fallback={<LoadingSpinner />}>
          <CreateCommunity />
        </Suspense>
      </Route>
      <Route path="/groups/:slug">
        <Suspense fallback={<LoadingSpinner />}>
          <GroupDetailPage />
        </Suspense>
      </Route>
      <Route path="/profile">
        <Suspense fallback={<LoadingSpinner />}>
          <Profile />
        </Suspense>
      </Route>
      <Route path="/events">
        <Suspense fallback={<LoadingSpinner />}>
          <EnhancedEvents />
        </Suspense>
      </Route>
      <Route path="/events-enhanced">
        <Suspense fallback={<LoadingSpinner />}>
          <EnhancedEvents />
        </Suspense>
      </Route>
      <Route path="/invitations">
        <Suspense fallback={<LoadingSpinner />}>
          <Invitations />
        </Suspense>
      </Route>
      <Route path="/profile/resume">
        <Suspense fallback={<LoadingSpinner />}>
          <ResumePage />
        </Suspense>
      </Route>
      <Route path="/u/:username/resume">
        <Suspense fallback={<LoadingSpinner />}>
          <PublicResumePage />
        </Suspense>
      </Route>
      <Route path="/u/:username">
        <Suspense fallback={<LoadingSpinner />}>
          <PublicProfilePage />
        </Suspense>
      </Route>
      <Route path="/messages">
        <Suspense fallback={<LoadingSpinner />}>
          <Messages />
        </Suspense>
      </Route>
      <Route path="/stories">
        <Suspense fallback={<LoadingSpinner />}>
          <NotionHomePage />
        </Suspense>
      </Route>
      <Route path="/stories/:slug">
        <Suspense fallback={<LoadingSpinner />}>
          <NotionEntryPage />
        </Suspense>
      </Route>
      <Route path="/admin">
        <Suspense fallback={<LoadingSpinner />}>
          <AdminCenter />
        </Suspense>
      </Route>
      <Route path="/profile-switcher">
        <Suspense fallback={<LoadingSpinner />}>
          <ProfileSwitcher />
        </Suspense>
      </Route>
      <Route path="/life-ceo">
        <Suspense fallback={<LoadingSpinner />}>
          <LifeCEOEnhanced />
        </Suspense>
      </Route>
      <Route path="/life-ceo-portal">
        <Suspense fallback={<LoadingSpinner />}>
          <LifeCEOPortal />
        </Suspense>
      </Route>
      <Route path="/life-ceo/agent/:id">
        <Suspense fallback={<LoadingSpinner />}>
          <LifeCEOAgentDetail />
        </Suspense>
      </Route>
      <Route path="/hierarchy">
        <Suspense fallback={<LoadingSpinner />}>
          <HierarchyDashboard />
        </Suspense>
      </Route>
      <Route path="/test-modal">
        <Suspense fallback={<LoadingSpinner />}>
          <TestModal />
        </Suspense>
      </Route>
      <Route path="/modal-debug">
        <Suspense fallback={<LoadingSpinner />}>
          <ModalDebugTest />
        </Suspense>
      </Route>
      <Route path="/test-admin">
        <Suspense fallback={<LoadingSpinner />}>
          <TestAdminPage />
        </Suspense>
      </Route>
      <Route path="/enhanced-timeline">
        <Suspense fallback={<LoadingSpinner />}>
          <EnhancedTimelineV2 />
        </Suspense>
      </Route>
      <Route path="/timeline-v2">
        <Suspense fallback={<LoadingSpinner />}>
          <TimelineMinimal />
        </Suspense>
      </Route>
      <Route path="/debug">
        <Suspense fallback={<LoadingSpinner />}>
          <TimelineDebug />
        </Suspense>
      </Route>
      <Route path="/simple-test">
        <Suspense fallback={<LoadingSpinner />}>
          <SimpleTest />
        </Suspense>
      </Route>
      <Route path="/fix-modal">
        <Suspense fallback={<LoadingSpinner />}>
          <FixModalTest />
        </Suspense>
      </Route>
      <Route path="/navigation-test">
        <Suspense fallback={<LoadingSpinner />}>
          <NavigationTest />
        </Suspense>
      </Route>
      <Route path="/enhanced-timeline-old">
        <Suspense fallback={<LoadingSpinner />}>
          <EnhancedTimeline />
        </Suspense>
      </Route>
      <Route path="/route-test">
        <Suspense fallback={<LoadingSpinner />}>
          <RouteTest />
        </Suspense>
      </Route>
      <Route path="/ttfiles-demo">
        <Suspense fallback={<LoadingSpinner />}>
          <TTfilesDemo />
        </Suspense>
      </Route>
      <Route path="/ttfiles-help-center">
        <Suspense fallback={<LoadingSpinner />}>
          <TTfilesHelpCenter />
        </Suspense>
      </Route>
      <Route path="/feature-navigation">
        <Suspense fallback={<LoadingSpinner />}>
          <FeatureNavigation />
        </Suspense>
      </Route>
      <Route path="/performance-test">
        <Suspense fallback={<LoadingSpinner />}>
          <PerformanceTest />
        </Suspense>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantProvider>
          <ThemeProvider>
            <SocketProvider>
              <TooltipProvider>
                <Toaster />
                <ErrorBoundary>
                  <Router />
                </ErrorBoundary>
                <ThemeManager />
              </TooltipProvider>
            </SocketProvider>
          </ThemeProvider>
        </TenantProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;