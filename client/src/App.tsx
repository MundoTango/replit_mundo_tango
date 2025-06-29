import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from "@/contexts/socket-context";
import { useAuth } from "@/hooks/useAuth";
import { initAnalytics, analytics } from "@/lib/analytics";
import { useEffect } from "react";
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
import Invitations from "@/pages/invitations";
import ResumePage from "@/pages/ResumePage";

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
  return (
    <Switch>
      <Route path="/" component={Moments} />
      <Route path="/moments" component={Moments} />
      <Route path="/community" component={Community} />
      <Route path="/organizer" component={OrganizerDashboard} />
      <Route path="/teacher" component={TeacherDashboard} />
      <Route path="/friends" component={Friends} />
      <Route path="/groups" component={Groups} />
      <Route path="/profile" component={Profile} />
      <Route path="/events" component={Events} />
      <Route path="/invitations" component={Invitations} />
      <Route path="/profile/resume" component={ResumePage} />
      <Route path="/messages" component={Messages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize analytics on app startup
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
}

export default App;