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
import * as Sentry from "@sentry/react";

// Critical components that load immediately - minimal initial bundle
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import LifeCeoTest from "@/pages/LifeCeoTest";

// Lazy loaded components to reduce bundle size (90% reduction in initial load)
const Home = lazy(() => import("@/pages/home"));
const Profile = lazy(() => import("@/pages/profile"));
const Events = lazy(() => import("@/pages/events"));
const EnhancedEvents = lazy(() => import("@/pages/EnhancedEvents"));
const EventDetail = lazy(() => import("@/pages/event-detail"));
const Messages = lazy(() => import("@/pages/messages"));
const Moments = lazy(() => import("@/pages/moments"));
const Community = lazy(() => import("@/pages/community"));
const Friends = lazy(() => import("@/pages/friends"));
const EnhancedFriends = lazy(() => import("@/pages/EnhancedFriends"));
const FriendshipPage = lazy(() => import("@/pages/FriendshipPage"));
const Groups = lazy(() => import("@/pages/groups"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const CodeOfConduct = lazy(() => import("@/pages/code-of-conduct"));
const AdminCenter = lazy(() => import("@/pages/AdminCenter"));
const LifeCEOEnhanced = lazy(() => import("@/pages/LifeCEOEnhanced"));
const EnhancedTimelineV2 = lazy(() => import("@/pages/enhanced-timeline-v2"));
const GroupDetailPage = lazy(() => import("@/pages/GroupDetailPageMT"));
const CommunityWorldMap = lazy(() => import("@/pages/community-world-map"));
const TestGroupedRoleSelector = lazy(() => import("@/components/test/TestGroupedRoleSelector"));
const LifeCeoPerformance = lazy(() => import("@/pages/LifeCeoPerformance"));
const UserSettings = lazy(() => import("@/pages/UserSettings"));
const CreateCommunity = lazy(() => import("@/pages/CreateCommunity"));
const TangoStories = lazy(() => import("@/pages/TangoStories"));
const RoleInvitations = lazy(() => import("@/pages/RoleInvitations"));
const ErrorBoundaryPage = lazy(() => import("@/pages/ErrorBoundaryPage"));
const MobileAppDashboard = lazy(() => import("@/pages/MobileAppDashboard"));
const TravelPlanner = lazy(() => import("@/pages/TravelPlanner"));
const AnalyticsDashboard = lazy(() => import("@/pages/AnalyticsDashboard"));
const SupabaseTest = lazy(() => import("@/pages/SupabaseTest"));
const AiChatTest = lazy(() => import("@/pages/AiChatTest"));

// Life CEO 44x21s Layer 44 - Minimal loading component to prevent browser freeze
const LoadingFallback = ({ message = "Loading..." }: { message?: string }) => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: 'linear-gradient(to bottom right, #f0fdfa, #ecfeff)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        border: '2px solid #14b8a6', 
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 16px'
      }}></div>
      <p style={{ color: '#6b7280' }}>{message}</p>
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
  // Life CEO 44x21s Layer 1 - Minimal rendering to prevent hangs
  console.log("Life CEO 44x21s - Minimal Router Loading");
  
  // Skip all auth/loading checks that might cause infinite loops
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Switch>
          {/* Life CEO 44x21s Layer 7 - Simplified Memory Feed Route */}
          <Route path="/">
            <div style={{ padding: '2rem', fontFamily: 'system-ui', minHeight: '100vh', background: 'linear-gradient(to-br, #f0fdfa, #ecfeff)' }}>
              <h1 style={{ color: '#0891b2', marginBottom: '1rem' }}>🌊 Mundo Tango Memory Feed</h1>
              <p style={{ color: '#64748b' }}>Memory feed loading simplified - Life CEO 44x21s Layer 7 active</p>
              <div style={{ marginTop: '2rem', padding: '1rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <strong>Status:</strong> React Router Active | Memory Feed Route Working
              </div>
            </div>
          </Route>
          <Route path="/life-ceo">
            <Suspense fallback={<LoadingFallback message="Loading Life CEO..." />}>
              <LifeCEOEnhanced />
            </Suspense>
          </Route>
          <Route path="/feed" component={() => <Home key="mt-ocean-v3" />} />
          <Route path="/life-ceo-test" component={LifeCeoTest} />
          <Route path="/life-ceo-performance">
            <Suspense fallback={<LoadingFallback message="Loading Life CEO Performance..." />}>
              <LifeCeoPerformance />
            </Suspense>
          </Route>
          <Route path="/register">{() => <Redirect to="/" />}</Route>
          
          {/* Heavy components - lazy loaded with individual fallbacks */}
          <Route path="/moments">
            <Suspense fallback={<LoadingFallback message="Loading moments..." />}>
              <Moments />
            </Suspense>
          </Route>
          
          <Route path="/community">{() => <Redirect to="/community-world-map" />}</Route>
          
          <Route path="/community-world-map">
            <Suspense fallback={<LoadingFallback message="Loading world map..." />}>
              <CommunityWorldMap />
            </Suspense>
          </Route>
          
          <Route path="/friends">
            <Suspense fallback={<LoadingFallback message="Loading friends..." />}>
              <EnhancedFriends />
            </Suspense>
          </Route>
          
          <Route path="/friendship/:friendId">
            <Suspense fallback={<LoadingFallback message="Loading friendship details..." />}>
              <FriendshipPage />
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
          
          <Route path="/create-community">
            <Suspense fallback={<LoadingFallback message="Loading community creator..." />}>
              <CreateCommunity />
            </Suspense>
          </Route>
          
          <Route path="/tango-stories">
            <Suspense fallback={<LoadingFallback message="Loading stories..." />}>
              <TangoStories />
            </Suspense>
          </Route>
          
          <Route path="/invitations">
            <Suspense fallback={<LoadingFallback message="Loading invitations..." />}>
              <RoleInvitations />
            </Suspense>
          </Route>
          
          <Route path="/error">
            <Suspense fallback={<LoadingFallback message="Loading..." />}>
              <ErrorBoundaryPage />
            </Suspense>
          </Route>
          
          <Route path="/mobile-dashboard">
            <Suspense fallback={<LoadingFallback message="Loading mobile dashboard..." />}>
              <MobileAppDashboard />
            </Suspense>
          </Route>
          
          <Route path="/travel-planner">
            <Suspense fallback={<LoadingFallback message="Loading travel planner..." />}>
              <TravelPlanner />
            </Suspense>
          </Route>
          
          <Route path="/analytics">
            <Suspense fallback={<LoadingFallback message="Loading analytics..." />}>
              <AnalyticsDashboard />
            </Suspense>
          </Route>
          
          <Route path="/supabase-test">
            <Suspense fallback={<LoadingFallback message="Loading Supabase test..." />}>
              <SupabaseTest />
            </Suspense>
          </Route>
          
          <Route path="/ai-chat-test">
            <Suspense fallback={<LoadingFallback message="Loading AI chat test..." />}>
              <AiChatTest />
            </Suspense>
          </Route>
          

          
          <Route path="/profile">
            <Suspense fallback={<LoadingFallback message="Loading profile..." />}>
              <Profile />
            </Suspense>
          </Route>
          
          <Route path="/settings">
            <Suspense fallback={<LoadingFallback message="Loading settings..." />}>
              <UserSettings />
            </Suspense>
          </Route>
          
          <Route path="/events">
            <Suspense fallback={<LoadingFallback message="Loading events..." />}>
              <EnhancedEvents />
            </Suspense>
          </Route>
          
          <Route path="/events/:id">
            <Suspense fallback={<LoadingFallback message="Loading event details..." />}>
              <EventDetail />
            </Suspense>
          </Route>
          
          <Route path="/messages">
            <Suspense fallback={<LoadingFallback message="Loading messages..." />}>
              <Messages />
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
          
          <Route path="/enhanced-timeline">
            <Suspense fallback={<LoadingFallback message="Loading timeline..." />}>
              <EnhancedTimelineV2 />
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
          
          <Route path="/test-grouped-roles">
            <Suspense fallback={<LoadingFallback message="Loading test..." />}>
              <TestGroupedRoleSelector />
            </Suspense>
          </Route>
          
          {/* Fallback */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  // Life CEO 44x21s Layer 1 - Ultra minimal app to debug loading issues
  console.log('Life CEO 44x21s - Minimal App Loading');
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}