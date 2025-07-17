import React, { useState, useCallback } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import UniversalPostCreator from '@/components/universal/UniversalPostCreator';
import EnhancedPostFeed from '@/components/moments/EnhancedPostFeed';
import EventsBoard from '@/components/events/EventsBoard';
import { Sparkles, Heart } from 'lucide-react';
import { withPerformance } from '@/lib/performance';
import { useAuth } from '@/hooks/useAuth';

function MomentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();
  
  const handlePostCreated = useCallback(() => {
    // Instead of reloading the page, just refresh the feed
    setRefreshKey(prev => prev + 1);
  }, []);
  return (
    <DashboardLayout>
      {/* Enhanced gradient background with brand colors */}
      <div className="min-h-screen bg-gradient-to-br from-turquoise-50/60 via-cyan-50/40 to-blue-50/30 relative overflow-hidden">
        {/* Floating background elements for visual interest */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-turquoise-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-32 w-80 h-80 bg-gradient-to-r from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-r from-blue-gray-200/15 to-turquoise-200/15 rounded-full blur-2xl"></div>
        </div>

        {/* Container with enhanced padding and spacing */}
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-6">
          {/* Beautiful header with enhanced typography and icons */}
          <div className="mb-10 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <div className="p-2 bg-gradient-to-r from-turquoise-500 to-blue-500 rounded-xl">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-turquoise-400 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Memories
              </h1>
              <Heart className="h-5 w-5 text-cyan-400 animate-bounce" />
            </div>
            <p className="text-xl text-blue-gray-600 font-medium max-w-2xl mx-auto lg:mx-0">
              Share your tango moments, connect with dancers, and create lasting memories together
            </p>
          </div>
          
          {/* Enhanced flexbox layout with better spacing */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Main content area with enhanced styling */}
            <div className="flex-1 lg:w-0 lg:flex-[0_0_68%] max-w-none">
              <div className="space-y-6">
                <UniversalPostCreator 
                  context={{ type: 'feed' }}
                  user={user}
                  onPostCreated={handlePostCreated} 
                />
                <EnhancedPostFeed key={refreshKey} />
              </div>
            </div>
            
            {/* Enhanced events sidebar */}
            <div className="lg:w-0 lg:flex-[0_0_32%] lg:min-w-0">
              <div className="sticky top-20">
                <EventsBoard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Export without performance wrapper for now to avoid breaking changes
export default MomentsPage;