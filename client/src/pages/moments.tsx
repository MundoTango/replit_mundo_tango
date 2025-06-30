import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import TrangoTechPostComposer from '@/components/moments/TrangoTechPostComposer';
import PostFeed from '@/components/moments/PostFeed';
import EventsBoard from '@/components/events/EventsBoard';

export default function MomentsPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-teal-50/30 backdrop-blur-md">
        {/* Optimized container - full width utilization */}
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header section */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent mb-3 lg:mb-4 leading-relaxed">
              Memories
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-700 font-medium leading-relaxed">
              Share your tango moments and connect with the community
            </p>
          </div>
          
          {/* Optimized grid layout - 70/30 split with better spacing */}
          <div className="grid grid-cols-1 xl:grid-cols-10 gap-4 lg:gap-6">
            {/* Main content area - 70% width (7/10 columns) */}
            <div className="xl:col-span-7">
              <div className="w-full space-y-6 lg:space-y-8">
                <TrangoTechPostComposer />
                <PostFeed />
              </div>
            </div>
            
            {/* Events sidebar - 30% width (3/10 columns) */}
            <div className="xl:col-span-3">
              <div className="sticky top-20 w-full">
                <EventsBoard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}