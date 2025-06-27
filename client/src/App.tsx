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

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

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
    return <Landing />;
  }

  // If authenticated but onboarding not complete, handle registration flow
  if (user && !(user as any).isOnboardingComplete) {
    // Check if basic onboarding is done but code of conduct not accepted
    if ((user as any).formStatus >= 1 && !(user as any).codeOfConductAccepted) {
      return <CodeOfConduct />;
    }
    // Otherwise show basic onboarding
    return <Onboarding />;
  }

  // If authenticated and onboarding complete, show main app
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/events" component={Events} />
      <Route path="/messages" component={Messages} />
      <Route component={NotFound} />
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
