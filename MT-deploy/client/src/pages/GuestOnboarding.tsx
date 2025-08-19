import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { GuestOnboardingFlow } from '@/components/GuestOnboarding/GuestOnboardingFlow';

export default function GuestOnboarding() {
  return (
    <DashboardLayout>
      <GuestOnboardingFlow />
    </DashboardLayout>
  );
}