import React, { useEffect, lazy, Suspense } from "react";
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
import { setupGlobalErrorHandlers, setupQueryErrorHandling } from "@/lib/global-error-handler";

// Performance optimizations
import { measurePerformance, deferTask } from "@/lib/performance-optimizations";

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-pulse text-turquoise-600">Loading...</div>
  </div>
);

// Critical pages loaded immediately
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";

// Lazy load all other pages for better performance
const Onboarding = lazy(() => import("@/pages/onboarding"));
const CodeOfConduct = lazy(() => import("@/pages/code-of-conduct"));
const Profile = lazy(() => import("@/pages/profile"));
const Events = lazy(() => import("@/pages/events"));
const EnhancedEvents = lazy(() => import("@/pages/events-enhanced"));
const Messages = lazy(() => import("@/pages/messages"));
const Moments = lazy(() => import("@/pages/moments"));
const Community = lazy(() => import("@/pages/community"));
const OrganizerDashboard = lazy(() => import("@/pages/organizer"));
const TeacherDashboard = lazy(() => import("@/pages/teacher"));
const Friends = lazy(() => import("@/pages/friends"));
const Groups = lazy(() => import("@/pages/groups"));
const GroupPage = lazy(() => import("@/pages/group"));
const GroupDetailPage = lazy(() => import("@/pages/GroupDetailPageMT"));
const CreateCommunity = lazy(() => import("@/pages/create-community"));
const Invitations = lazy(() => import("@/pages/invitations"));
const ResumePage = lazy(() => import("@/pages/ResumePage"));
const PublicResumePage = lazy(() => import("@/pages/PublicResumePage"));
const PublicProfilePage = lazy(() => import("@/pages/PublicProfilePage"));
const NotionHomePage = lazy(() => import("@/pages/NotionHomePage").then(m => ({ default: m.NotionHomePage })));
const NotionEntryPage = lazy(() => import("@/pages/NotionEntryPage").then(m => ({ default: m.NotionEntryPage })));
const AdminCenter = lazy(() => import("@/pages/AdminCenter"));
const LifeCEOPortal = lazy(() => import("@/components/admin/LifeCEOPortal"));
const LifeCEOAgentDetail = lazy(() => import("@/components/admin/LifeCEOAgentDetail"));
const ProfileSwitcher = lazy(() => import("@/pages/ProfileSwitcher"));
const LifeCEO = lazy(() => import("@/pages/LifeCEO"));
const LifeCEOEnhanced = lazy(() => import("@/pages/LifeCEOEnhanced"));
const HierarchyDashboard = lazy(() => import("@/pages/HierarchyDashboard"));
const TestModal = lazy(() => import("@/pages/TestModal"));
const ModalDebugTest = lazy(() => import("@/pages/ModalDebugTest"));
const TestAdminPage = lazy(() => import("@/pages/TestAdminPage"));
const EnhancedTimeline = lazy(() => import("@/pages/enhanced-timeline"));
const EnhancedTimelineV2 = lazy(() => import("@/pages/enhanced-timeline-v2"));
const SimpleEnhancedTimeline = lazy(() => import("@/pages/simple-enhanced-timeline"));
const RouteTest = lazy(() => import("@/pages/route-test"));
const TimelineTest = lazy(() => import("@/pages/timeline-test"));
const TimelineMinimal = lazy(() => import("@/pages/timeline-minimal"));
const TimelineDebug = lazy(() => import("@/pages/timeline-debug"));
const SimpleTest = lazy(() => import("@/pages/simple-test"));
const FixModalTest = lazy(() => import("@/pages/fix-modal-test"));
const NavigationTest = lazy(() => import("@/pages/navigation-test"));
const TTfilesDemo = lazy(() => import("@/pages/TTfilesDemo"));
const TTfilesHelpCenter = lazy(() => import("@/pages/ttfiles-help-center"));
const TangoCommunities = lazy(() => import("@/pages/tango-communities"));
const CommunityWorldMap = lazy(() => import("@/pages/community-world-map"));
const HousingMarketplace = lazy(() => import("@/pages/housing-marketplace"));
const GlobalStatistics = lazy(() => import("@/pages/global-statistics"));
const DatabaseSecurity = lazy(() => import("@/pages/database-security"));
const TestApp = lazy(() => import("@/pages/test-app"));
const FeatureNavigation = lazy(() => import("@/pages/feature-navigation"));
const LiveGlobalStatistics = lazy(() => import("@/pages/LiveGlobalStatistics"));
const HostOnboarding = lazy(() => import("@/pages/HostOnboarding"));
const GuestOnboarding = lazy(() => import("@/pages/GuestOnboarding"));
const PerformanceTest = lazy(() => import("@/pages/PerformanceTest"));

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
    return <Suspense fallback={<PageLoader />}><Onboarding /></Suspense>;
  }

  if (needsCodeOfConduct) {
    console.log("Showing code of conduct");
    analytics.pageView('Code of Conduct');
    return <Suspense fallback={<PageLoader />}><CodeOfConduct /></Suspense>;
  }

  // If authenticated and fully onboarded, show main app
  console.log("Showing main app");
  
  // DEBUG: Log all route matches
  const currentPath = window.location.pathname;
  console.log("🔍 Current path:", currentPath);
  console.log("🔍 Should match enhanced-timeline:", currentPath === '/enhanced-timeline');
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/moments" component={Moments} />
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
        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
    
    // Performance optimizations initialized via lazy loading and Suspense boundaries
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