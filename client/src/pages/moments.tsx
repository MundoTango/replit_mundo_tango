import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import TrangoTechPostComposer from '@/components/moments/TrangoTechPostComposer';
import PostFeed from '@/components/moments/PostFeed';
import EventsBoard from '@/components/events/EventsBoard';

export default function MomentsPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-teal-50/30 backdrop-blur-md">
        {/* Refined container with enhanced spacing */}
        <div className="max-w-8xl mx-auto px-6 md:px-12 py-6 sm:py-8 lg:py-12">
          {/* Header section with improved spacing */}
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent mb-4 lg:mb-6 leading-relaxed">
              Memories
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-700 font-medium leading-relaxed">
              Share your tango moments and connect with the community
            </p>
          </div>
          
          {/* 12-column grid layout with enhanced spacing */}
          <div className="grid grid-cols-12 gap-x-10 gap-y-8">
            {/* Main content - Posts */}
            <div className="col-span-9 lg:col-span-8">
              <div className="space-y-10">
                <TrangoTechPostComposer />
                <PostFeed />
              </div>
            </div>
            
            {/* Right sidebar - Events */}
            <div className="col-span-3 lg:col-span-4">
              <div className="sticky top-6 lg:top-8">
                <div className="space-y-8">
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