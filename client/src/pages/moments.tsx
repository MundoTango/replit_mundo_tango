import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import PostComposer from '@/components/moments/PostComposer';
import PostFeed from '@/components/moments/PostFeed';

export default function MomentsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Tango Moments</h1>
        <p className="text-gray-500 mb-6">Share your tango journey with the community</p>
        <PostComposer />
        <PostFeed />
      </div>
    </DashboardLayout>
  );
}