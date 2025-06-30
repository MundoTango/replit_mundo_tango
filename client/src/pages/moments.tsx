import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import TrangoTechPostComposer from '@/components/moments/TrangoTechPostComposer';
import PostFeed from '@/components/moments/PostFeed';
import EventsBoard from '@/components/events/EventsBoard';

export default function MomentsPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-teal-50/30">
        {/* Enhanced container with better spacing */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-12">
          {/* Header section with improved spacing */}
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent mb-4 lg:mb-6">
              Memories
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-600/80 font-medium">
              Share your tango moments and connect with the community
            </p>
          </div>
          
          {/* Enhanced three-column layout with better proportions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12">
            {/* Main content - Posts with improved width */}
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="space-y-6 lg:space-y-8">
                <TrangoTechPostComposer />
                <PostFeed />
              </div>
            </div>
            
            {/* Right sidebar - Events with better proportions */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-6 lg:top-8">
                <div className="pl-0 lg:pl-4 xl:pl-6">
                  <EventsBoard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}