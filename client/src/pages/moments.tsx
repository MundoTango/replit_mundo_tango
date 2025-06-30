import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import EnhancedPostComposer from '@/components/moments/EnhancedPostComposer';
import PostFeed from '@/components/moments/PostFeed';
import EventsBoard from '@/components/events/EventsBoard';

export default function MomentsPage() {
  return (
    <DashboardLayout>
      {/* Clean, minimal layout with no unnecessary containers */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-teal-50/30">
        {/* Single container with minimal padding for maximum content width */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
          {/* Compact header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent mb-3">
              Memories
            </h1>
            <p className="text-lg text-slate-700 font-medium">
              Share your tango moments and connect with the community
            </p>
          </div>
          
          {/* Optimized flexbox layout - 69/31 split */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main content area - 69% width on large screens */}
            <div className="flex-1 lg:w-0 lg:flex-[0_0_69%] max-w-none">
              <div className="space-y-4 pr-2">
                <EnhancedPostComposer />
                <PostFeed />
              </div>
            </div>
            
            {/* Events sidebar - 31% width on large screens (40% increase from 22%) */}
            <div className="lg:w-0 lg:flex-[0_0_31%] lg:min-w-0">
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