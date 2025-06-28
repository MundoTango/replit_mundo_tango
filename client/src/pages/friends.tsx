import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Search, UserPlus, Users, MessageCircle } from 'lucide-react';

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* TrangoTech Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black-text-color">Friends</h1>
            <p className="text-gray-text-color">Connect with dancers in your community</p>
          </div>
          <button className="rounded-xl bg-btn-color text-sm font-bold text-white flex items-center justify-center gap-2 px-6 h-10">
            <UserPlus className="h-4 w-4" />
            Add Friends
          </button>
        </div>

        {/* Search Bar - TT Style */}
        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-gray-color" />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-text pl-10 w-full"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex border-b border-border-color">
            {['all', 'online', 'requests'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-btn-color border-b-2 border-btn-color'
                    : 'text-gray-text-color hover:text-black-text-color'
                }`}
              >
                {tab === 'all' ? 'All Friends' : tab === 'online' ? 'Online' : 'Requests'}
              </button>
            ))}
          </div>

          {/* Empty State */}
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-light-gray-color mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-black-text-color mb-2">
              You haven't added any friends yet
            </h3>
            <p className="text-gray-text-color mb-6 max-w-md mx-auto">
              Start connecting with other tango dancers to build your community and 
              discover new milongas together.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
              <button className="card bg-background-color hover:shadow-md transition-shadow">
                <div className="p-4 text-center">
                  <Search className="h-8 w-8 text-btn-color mx-auto mb-2" />
                  <h4 className="font-medium text-black-text-color mb-1">Discover Dancers</h4>
                  <p className="text-sm text-gray-text-color">Find dancers near you</p>
                </div>
              </button>

              <button className="card bg-background-color hover:shadow-md transition-shadow">
                <div className="p-4 text-center">
                  <MessageCircle className="h-8 w-8 text-btn-color mx-auto mb-2" />
                  <h4 className="font-medium text-black-text-color mb-1">Join Events</h4>
                  <p className="text-sm text-gray-text-color">Meet people at milongas</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Friend Suggestions */}
        <div className="card mt-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-black-text-color mb-4">Suggested Friends</h3>
            <div className="text-center py-8">
              <p className="text-gray-text-color">
                Friend suggestions will appear here based on your location and interests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}