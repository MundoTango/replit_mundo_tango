import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { GraduationCap, BookOpen, Video, Users2 } from 'lucide-react';

export default function TeacherDashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="card">
          <div className="text-center py-12">
            <GraduationCap className="h-16 w-16 text-btn-color mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-black-text-color mb-4">Teaching Tools Coming Soon</h1>
            <p className="text-gray-text-color mb-8 max-w-2xl mx-auto">
              Empowering tango educators with comprehensive tools for student management, 
              curriculum planning, and progress tracking. Build your teaching legacy.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="card bg-background-color">
                <div className="p-6 text-center">
                  <BookOpen className="h-8 w-8 text-btn-color mx-auto mb-3" />
                  <h3 className="font-semibold text-black-text-color mb-2">Curriculum Builder</h3>
                  <p className="text-sm text-gray-text-color">Create structured lesson plans and sequences</p>
                </div>
              </div>
              
              <div className="card bg-background-color">
                <div className="p-6 text-center">
                  <Video className="h-8 w-8 text-btn-color mx-auto mb-3" />
                  <h3 className="font-semibold text-black-text-color mb-2">Online Classes</h3>
                  <p className="text-sm text-gray-text-color">Host virtual workshops and private lessons</p>
                </div>
              </div>
              
              <div className="card bg-background-color">
                <div className="p-6 text-center">
                  <Users2 className="h-8 w-8 text-btn-color mx-auto mb-3" />
                  <h3 className="font-semibold text-black-text-color mb-2">Student Progress</h3>
                  <p className="text-sm text-gray-text-color">Track development and provide feedback</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}