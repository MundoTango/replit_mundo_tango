import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Search, Plus, Users, Globe, Lock, Star, MapPin, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

          {/* City Group Automation Demo Section */}
          {activeTab === 'all' && (
            <div className="border-b border-border-color p-6">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black-text-color">City Group Automation</h3>
                    <p className="text-sm text-gray-text-color">Automatically join or create city-based tango groups</p>
                  </div>
                </div>

                <CityGroupAutomationDemo />
              </div>
            </div>
          )}

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

// City Group Automation Demo Component
function CityGroupAutomationDemo() {
  const [cityInput, setCityInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleJoinCityGroup = async () => {
    if (!cityInput.trim()) {
      setError('Please enter a city name');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/user/city-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: cityInput.trim(),
          country: countryInput.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.message || 'Failed to join city group');
      }
    } catch (err) {
      setError('Unable to connect to server. Please make sure you are logged in.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCityInput('');
    setCountryInput('');
    setResult(null);
    setError('');
  };

  return (
    <div className="bg-white rounded-lg border border-border-color p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div>
          <h4 className="font-semibold text-black-text-color mb-3">Test City Group Assignment</h4>
          <p className="text-sm text-gray-text-color mb-4">
            Enter a city name to automatically join or create a local tango group. This demonstrates the automated city group assignment system.
          </p>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-black-text-color mb-1">
                City Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Buenos Aires"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="input-text w-full"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-black-text-color mb-1">
                Country (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Argentina"
                value={countryInput}
                onChange={(e) => setCountryInput(e.target.value)}
                className="input-text w-full"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleJoinCityGroup}
                disabled={isLoading || !cityInput.trim()}
                className="rounded-lg bg-btn-color text-white px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {isLoading ? 'Processing...' : 'Join City Group'}
              </button>
              
              {(result || error) && (
                <button
                  onClick={resetForm}
                  className="rounded-lg border border-btn-color text-btn-color px-4 py-2 text-sm font-medium"
                >
                  Try Another City
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Display */}
        <div>
          <h4 className="font-semibold text-black-text-color mb-3">Automation Result</h4>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700">
                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-3">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm font-medium">Success</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{result.group.emoji}</span>
                  <div>
                    <p className="font-medium text-black-text-color">{result.group.name}</p>
                    <p className="text-xs text-gray-text-color">
                      {result.group.slug} • {result.group.memberCount} members
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-text-color">
                  {result.group.description}
                </p>
                
                <div className="text-xs space-y-1">
                  <p><strong>Action:</strong> {result.action}</p>
                  <p><strong>Status:</strong> {result.isNewGroup ? 'New group created' : 'Joined existing group'}</p>
                  {result.group.city && result.group.country && (
                    <p><strong>Location:</strong> {result.group.city}, {result.group.country}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
              <p className="text-sm text-gray-text-color text-center">
                Enter a city name above to see the automation in action
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}