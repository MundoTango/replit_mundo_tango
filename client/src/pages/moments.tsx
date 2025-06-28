import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import TrangoTechPostComposer from '@/components/moments/TrangoTechPostComposer';
import PostFeed from '@/components/moments/PostFeed';

export default function MomentsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <TrangoTechPostComposer />
        <PostFeed />
      </div>
    </DashboardLayout>
  );
}