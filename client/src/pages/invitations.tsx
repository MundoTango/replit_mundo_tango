import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import EventInvitationManager from '@/components/events/EventInvitationManager';

export default function InvitationsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <EventInvitationManager />
      </div>
    </DashboardLayout>
  );
}