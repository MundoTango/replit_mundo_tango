import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from "@/contexts/socket-context";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import CodeOfConduct from "@/pages/code-of-conduct";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Events from "@/pages/events";
import Messages from "@/pages/messages";

import HomePage from "@/pages/home";
import FeedPage from "@/pages/feed";
import ProfilePage from "@/pages/profile";
import EventsPage from "@/pages/events";
import MessagesPage from "@/pages/messages";
import FriendsPage from "@/pages/friends";
import GroupsPage from "@/pages/groups";
import OnboardingPage from "@/pages/onboarding";
import CodeOfConductPage from "@/pages/code-of-conduct";
import NotFoundPage from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";

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
    return <Onboarding />;
  }

  if (needsCodeOfConduct) {
    console.log("Showing code of conduct");
    return <CodeOfConduct />;
  }

  // If authenticated and fully onboarded, show main app
  console.log("Showing main app");
  return (
    <Switch>
      {/* Protected Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/photos" component={PhotosPage} />
      <Route path="/videos" component={VideosPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/code-of-conduct" component={CodeOfConductPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function App() {
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