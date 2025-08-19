import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, Users, Calendar, MapPin, Heart, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import NewFeedEvents from "@/components/feed/NewFeedEvents";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { useState } from "react";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Show main app layout for authenticated users
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50">
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex">
          <Sidebar 
            isOpen={isSidebarOpen} 
            setIsOpen={setIsSidebarOpen}
            onClose={handleCloseSidebar}
          />
          
          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
              onClick={handleCloseSidebar}
            />
          )}
          
          <main className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? 'lg:ml-64' : ''
          }`}>
            <div className="max-w-7xl mx-auto p-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-8">
                  <div className="space-y-6">
                    {/* Welcome Header */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-turquoise-200 to-cyan-300 rounded-3xl blur-2xl opacity-30" />
                      <div className="relative p-8 rounded-3xl bg-gradient-to-r from-turquoise-50 via-cyan-50 to-blue-50 shadow-xl border-2 border-turquoise-200/50 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="p-3 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-xl animate-float shadow-lg">
                            <Music className="h-6 w-6 text-white" />
                          </div>
                          <h1 className="text-4xl font-bold bg-gradient-to-r from-turquoise-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            Welcome Back!
                          </h1>
                        </div>
                        <p className="text-gray-700 ml-[60px] font-medium">Ready to connect with your tango community?</p>
                      </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => window.location.href = '/memories'}>
                        <CardHeader className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-turquoise-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-6 h-6 text-white" />
                          </div>
                          <CardTitle className="text-xl text-gray-900">Share Memories</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-600 text-center">
                            Document and share your beautiful tango moments with the community.
                          </CardDescription>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => window.location.href = '/events'}>
                        <CardHeader className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <CardTitle className="text-xl text-gray-900">Find Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-600 text-center">
                            Discover milongas, workshops, and festivals in your city.
                          </CardDescription>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => window.location.href = '/community'}>
                        <CardHeader className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <CardTitle className="text-xl text-gray-900">Explore Community</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-600 text-center">
                            Connect with dancers worldwide and join local groups.
                          </CardDescription>
                        </CardContent>
                      </Card>

                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => window.location.href = '/life-ceo'}>
                        <CardHeader className="text-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Star className="w-6 h-6 text-white" />
                          </div>
                          <CardTitle className="text-xl text-gray-900">Life CEO</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-600 text-center">
                            Your AI-powered life management system with 16 specialized agents.
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar with Events */}
                <div className="lg:col-span-4">
                  <div className="sticky top-20">
                    <NewFeedEvents />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show marketing landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-gray-900 dark:via-blue-900 dark:to-teal-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mundo Tango</h1>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Join the Community
          </Button>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Welcome to the
            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent block">
              Global Tango Community
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with passionate tango dancers worldwide. Share your journey, discover events, 
            and immerse yourself in the beautiful world of Argentine Tango.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Your Tango Journey
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 px-8 py-3 rounded-lg font-medium text-lg transition-all duration-200"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">Connect & Share</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                Share your tango moments, follow dancers you admire, and build meaningful connections in our vibrant community.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">Discover Events</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                Find milongas, workshops, and festivals near you. Never miss an opportunity to dance and learn.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">Global Network</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                Connect with tango communities worldwide. From Buenos Aires to Tokyo, find your tribe anywhere.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">Share Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                Document your tango journey with photos and videos. Inspire others and celebrate the passion we all share.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Music className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">Learn & Grow</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                Access tutorials, tips from experienced dancers, and resources to improve your technique and musicality.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-gray-900 dark:text-white">Authentic Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-center">
                Join a respectful, passionate community that celebrates the art, culture, and emotion of tango.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-cyan-500/10 to-blue-600/10 dark:from-cyan-500/20 dark:to-blue-600/20 rounded-2xl p-12 backdrop-blur-sm">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Join the Movement?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Whether you're a beginner taking your first steps or a seasoned dancer, 
            Mundo Tango welcomes you with open arms.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Begin Your Journey Today
          </Button>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2025 Mundo Tango. Connecting hearts through dance.</p>
        </footer>
      </div>
    </div>
  );
}