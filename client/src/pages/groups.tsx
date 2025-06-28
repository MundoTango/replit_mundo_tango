import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Search, Plus, Users, Globe, Lock, Star } from 'lucide-react';

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* TrangoTech Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black-text-color">Groups</h1>
            <p className="text-gray-text-color">Join communities and discover tango groups</p>
          </div>
          <button className="rounded-xl bg-btn-color text-sm font-bold text-white flex items-center justify-center gap-2 px-6 h-10">
            <Plus className="h-4 w-4" />
            Create Group
          </button>
        </div>

        {/* Search Bar - TT Style */}
        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-gray-color" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-text pl-10 w-full"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex border-b border-border-color">
            {['all', 'joined', 'suggested'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-btn-color border-b-2 border-btn-color'
                    : 'text-gray-text-color hover:text-black-text-color'
                }`}
              >
                {tab === 'all' ? 'All Groups' : tab === 'joined' ? 'Joined' : 'Suggested'}
              </button>
            ))}
          </div>

          {/* Empty State */}
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-light-gray-color mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black-text-color mb-2">
              {activeTab === 'joined' ? "You haven't joined any groups yet" : "Discover Tango Groups"}
            </h3>
            <p className="text-gray-text-color mb-6 max-w-md mx-auto">
              {activeTab === 'joined' 
                ? "Join groups to connect with dancers who share your interests and passion for tango."
                : "Find and join tango groups in your area or explore communities worldwide."
              }
            </p>

            {/* Sample Group Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mt-8">
              <div className="card bg-background-color">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-btn-color rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-black-text-color">Buenos Aires Tango</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-text-color">
                          <Globe className="h-3 w-3" />
                          <span>Public • 1,234 members</span>
                        </div>
                      </div>
                    </div>
                    <Star className="h-4 w-4 text-light-gray-color" />
                  </div>
                  <p className="text-sm text-gray-text-color mb-4">
                    Connect with tango dancers in Buenos Aires. Share events, find practice partners, and celebrate our passion for tango.
                  </p>
                  <button className="w-full rounded-lg bg-btn-color text-white py-2 text-sm font-medium">
                    Join Group
                  </button>
                </div>
              </div>

              <div className="card bg-background-color">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-secondary-red rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-black-text-color">Milonga Organizers</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-text-color">
                          <Lock className="h-3 w-3" />
                          <span>Private • 567 members</span>
                        </div>
                      </div>
                    </div>
                    <Star className="h-4 w-4 text-light-gray-color" />
                  </div>
                  <p className="text-sm text-gray-text-color mb-4">
                    A community for milonga organizers to share experiences, coordinate events, and support each other.
                  </p>
                  <button className="w-full rounded-lg border border-btn-color text-btn-color py-2 text-sm font-medium">
                    Request to Join
                  </button>
                </div>
              </div>

              <div className="card bg-background-color">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-tag-color rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-black-text-color">Tango Beginners</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-text-color">
                          <Globe className="h-3 w-3" />
                          <span>Public • 890 members</span>
                        </div>
                      </div>
                    </div>
                    <Star className="h-4 w-4 text-light-gray-color" />
                  </div>
                  <p className="text-sm text-gray-text-color mb-4">
                    Welcome new dancers! Ask questions, find practice partners, and get support on your tango journey.
                  </p>
                  <button className="w-full rounded-lg bg-btn-color text-white py-2 text-sm font-medium">
                    Join Group
                  </button>
                </div>
              </div>

              <div className="card bg-background-color">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-heart-color rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-black-text-color">Festival Travelers</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-text-color">
                          <Globe className="h-3 w-3" />
                          <span>Public • 445 members</span>
                        </div>
                      </div>
                    </div>
                    <Star className="h-4 w-4 text-light-gray-color" />
                  </div>
                  <p className="text-sm text-gray-text-color mb-4">
                    For dancers who love to travel to tango festivals worldwide. Share tips, coordinate trips, and make connections.
                  </p>
                  <button className="w-full rounded-lg bg-btn-color text-white py-2 text-sm font-medium">
                    Join Group
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}