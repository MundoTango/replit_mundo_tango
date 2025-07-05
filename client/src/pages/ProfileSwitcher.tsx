import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Globe, Brain, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/auth/useAuthContext';

export default function ProfileSwitcher() {
  const [, setLocation] = useLocation();
  const { user } = useAuthContext();
  const [activeProfile, setActiveProfile] = useState('mundo-tango');

  // Only show Life CEO for super admins
  const isSuperAdmin = user?.roles?.includes('super_admin') || user?.tangoRoles?.includes('super_admin');
  
  const profiles = [
    {
      id: 'mundo-tango',
      name: 'Mundo Tango',
      description: 'Global tango community platform',
      icon: '🌎',
      color: 'from-pink-500 to-blue-500',
      route: '/moments',
      active: true
    },
    ...(isSuperAdmin ? [{
      id: 'life-ceo',
      name: 'Life CEO',
      description: 'AI-powered life management system',
      icon: '🧠',
      color: 'from-purple-500 to-indigo-500',
      route: '/life-ceo',
      active: true
    }] : [])
  ];

  const handleProfileSwitch = (profile: any) => {
    setActiveProfile(profile.id);
    // Store active profile in localStorage
    localStorage.setItem('activeProfile', profile.id);
    // Navigate to the profile's main route
    setLocation(profile.route);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Switch Profile</h1>
        </div>
      </div>

      {/* Current User Info */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 flex items-center justify-center text-white font-bold">
              {user?.name?.[0] || 'S'}
            </div>
            <div>
              <p className="font-medium">{user?.name || 'Scott Boddye'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Options */}
      <div className="px-4 pb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">YOUR PROFILES</h2>
        <div className="space-y-3">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleProfileSwitch(profile)}
              className={`w-full bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${
                activeProfile === profile.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${profile.color} flex items-center justify-center text-2xl`}>
                    {profile.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{profile.name}</h3>
                    <p className="text-sm text-gray-500">{profile.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Create New Profile */}
      <div className="px-4 pb-6">
        <button className="w-full bg-gray-100 rounded-xl p-4 hover:bg-gray-200 transition-colors">
          <div className="flex items-center justify-center gap-3 text-gray-600">
            <Plus className="h-5 w-5" />
            <span className="font-medium">Create New Profile</span>
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-3">QUICK ACTIONS</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          {isSuperAdmin && (
            <button
              onClick={() => setLocation('/life-ceo')}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Brain className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-medium">Open Life CEO Voice Assistant</span>
            </button>
          )}
          <button
            onClick={() => setLocation('/moments')}
            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Globe className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Return to Mundo Tango</span>
          </button>
        </div>
      </div>
    </div>
  );
}