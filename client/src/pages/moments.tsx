import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import TrangoTechPostComposer from '@/components/moments/TrangoTechPostComposer';
import PostFeed from '@/components/moments/PostFeed';
import EventsBoard from '@/components/events/EventsBoard';

export default function MomentsPage() {
  return (
    <DashboardLayout>
      {/* Clean, minimal layout with no unnecessary containers */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-teal-50/30">
        {/* Single container with precise width control */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Compact header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent mb-3">
              Memories
            </h1>
            <p className="text-lg text-slate-700 font-medium">
              Share your tango moments and connect with the community
            </p>
          </div>
          
          {/* Clean flexbox layout - 70/30 split */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main content area - 70% width on large screens */}
            <div className="flex-1 lg:w-0 lg:flex-[0_0_70%] max-w-none">
              <div className="space-y-6">
                <TrangoTechPostComposer />
                <PostFeed />
              </div>
            </div>
            
            {/* Events sidebar - 30% width on large screens */}
            <div className="lg:w-0 lg:flex-[0_0_30%] lg:min-w-0">
              <div className="sticky top-24">
                <EventsBoard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}