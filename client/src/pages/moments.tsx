import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import TrangoTechPostComposer from '@/components/moments/TrangoTechPostComposer';
import PostFeed from '@/components/moments/PostFeed';
import EventsBoard from '@/components/events/EventsBoard';

export default function MomentsPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-teal-50/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-12">
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent mb-3">
              Memories
            </h1>
            <p className="text-xl text-blue-600/80 font-medium">
              Share your tango moments and connect with the community
            </p>
          </div>
          
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content - Posts */}
            <div className="lg:col-span-2">
              <TrangoTechPostComposer />
              <PostFeed />
            </div>
            
            {/* Right sidebar - Events */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <EventsBoard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}