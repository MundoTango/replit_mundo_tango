import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Calendar, Users, BarChart3, Settings } from 'lucide-react';

export default function OrganizerDashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="card">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-btn-color mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-black-text-color mb-4">Organizer Tools Coming Soon</h1>
            <p className="text-gray-text-color mb-8 max-w-2xl mx-auto">
              We're building powerful tools to help you organize unforgettable tango events. 
              Stay tuned for event management, attendee tracking, and promotional features.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="card bg-background-color">
                <div className="p-6 text-center">
                  <Users className="h-8 w-8 text-btn-color mx-auto mb-3" />
                  <h3 className="font-semibold text-black-text-color mb-2">Event Management</h3>
                  <p className="text-sm text-gray-text-color">Create and manage milongas, workshops, and festivals</p>
                </div>
              </div>
              
              <div className="card bg-background-color">
                <div className="p-6 text-center">
                  <BarChart3 className="h-8 w-8 text-btn-color mx-auto mb-3" />
                  <h3 className="font-semibold text-black-text-color mb-2">Analytics</h3>
                  <p className="text-sm text-gray-text-color">Track attendance and engagement metrics</p>
                </div>
              </div>
              
              <div className="card bg-background-color">
                <div className="p-6 text-center">
                  <Settings className="h-8 w-8 text-btn-color mx-auto mb-3" />
                  <h3 className="font-semibold text-black-text-color mb-2">Promotion Tools</h3>
                  <p className="text-sm text-gray-text-color">Reach your audience with targeted marketing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}