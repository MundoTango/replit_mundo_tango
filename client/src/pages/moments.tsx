import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import TrangoTechPostComposer from '@/components/moments/TrangoTechPostComposer';
import PostFeed from '@/components/moments/PostFeed';
import EventsBoard from '@/components/events/EventsBoard';

export default function MomentsPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-teal-50/30 backdrop-blur-md">
        {/* Optimized container for better width distribution */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 sm:py-8 lg:py-12">
          {/* Header section with improved spacing */}
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent mb-4 lg:mb-6 leading-relaxed">
              Memories
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-700 font-medium leading-relaxed">
              Share your tango moments and connect with the community
            </p>
          </div>
          
          {/* Optimized flex layout for 65-70% / 30-35% distribution */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 xl:gap-12">
            {/* Main content - Posts (65-70% width) */}
            <div className="flex-1 lg:w-[68%] lg:max-w-none">
              <div className="space-y-12 lg:space-y-16">
                <TrangoTechPostComposer />
                <PostFeed />
              </div>
            </div>
            
            {/* Right sidebar - Events (30-35% width) */}
            <div className="lg:w-[32%] lg:min-w-[320px] lg:max-w-[400px]">
              <div className="sticky top-6 lg:top-8">
                <EventsBoard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}