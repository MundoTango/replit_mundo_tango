import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

export default function TimelineTest() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-green-100 border-2 border-green-500 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-green-800">
            🎉 Timeline V2 Route Test 🎉
          </h1>
          <p className="text-xl text-green-700 mt-4">
            If you can see this, the routing is working!
          </p>
          <p className="text-lg text-green-600 mt-2">
            The full EnhancedTimelineV2 component should also be working.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}