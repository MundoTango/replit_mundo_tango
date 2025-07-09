import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from "@/contexts/socket-context";
import { useAuth } from "@/hooks/useAuth";
import { initAnalytics, analytics } from "@/lib/analytics";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import ThemeManager from "@/components/theme/ThemeManager";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import CodeOfConduct from "@/pages/code-of-conduct";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Events from "@/pages/events";
import Messages from "@/pages/messages";
import Moments from "@/pages/moments";
import Community from "@/pages/community";
import OrganizerDashboard from "@/pages/organizer";
import TeacherDashboard from "@/pages/teacher";
import Friends from "@/pages/friends";
import Groups from "@/pages/groups";
import GroupPage from "@/pages/group";
import GroupDetailPage from "@/pages/GroupDetailPage";
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
      <Route path="/" component={Moments} />
      <Route path="/moments" component={Moments} />
      <Route path="/community" component={Community} />
      <Route path="/organizer" component={OrganizerDashboard} />
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/friends" component={Friends} />
      <Route path="/groups" component={Groups} />
      <Route path="/groups/:slug" component={GroupDetailPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/events" component={Events} />
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
      <Route path="/timeline-v2" component={TimelineTest} />
      <Route path="/enhanced-timeline-old" component={EnhancedTimeline} />
      <Route path="/route-test" component={RouteTest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize analytics on app startup
  useEffect(() => {
    initAnalytics();
  }, []);

  // Remove debug mode - React is confirmed working

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;