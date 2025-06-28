import React, { useState, useEffect } from 'react';
import { Users, Star, Calendar, MapPin, Filter } from 'lucide-react';

interface TrustedConnectionsFilterProps {
  userRole: string[];
  onFilterChange: (filters: FilterOptions) => void;
  connectionStats?: {
    close_friends: number;
    dance_partners: number;
    local_community: number;
    recent_interactions: number;
  };
}

interface FilterOptions {
  priority: 'all' | 'trusted' | 'active' | 'local';
  timeframe: 'today' | 'week' | 'month' | 'all';
  contentType: 'all' | 'events' | 'social' | 'educational';
}

const TrustedConnectionsFilter: React.FC<TrustedConnectionsFilterProps> = ({
  userRole = [],
  onFilterChange,
  connectionStats = {
    close_friends: 12,
    dance_partners: 28,
    local_community: 45,
    recent_interactions: 8
  }
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterOptions>({
    priority: 'all',
    timeframe: 'week',
    contentType: 'all'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Role-adaptive filter options
  const getPriorityOptions = () => {
    const baseOptions = [
      {
        id: 'all' as const,
        label: 'All Posts',
        icon: <Filter className="w-4 h-4" />,
        description: 'See everything in your feed',
        count: null
      },
      {
        id: 'trusted' as const,
        label: 'Close Connections',
        icon: <Star className="w-4 h-4" />,
        description: 'Posts from your trusted dance partners',
        count: connectionStats.close_friends
      },
      {
        id: 'active' as const,
        label: 'Active Community',
        icon: <Users className="w-4 h-4" />,
        description: 'Recent interactions and conversations',
        count: connectionStats.recent_interactions
      },
      {
        id: 'local' as const,
        label: 'Local Scene',
        icon: <MapPin className="w-4 h-4" />,
        description: 'Posts from your local tango community',
        count: connectionStats.local_community
      }
    ];

    return baseOptions;
  };

  const getContentTypeOptions = () => {
    const baseOptions = [
      { id: 'all' as const, label: 'All Content' },
      { id: 'events' as const, label: 'Events & Milongas' },
      { id: 'social' as const, label: 'Social Updates' }
    ];

    // Add role-specific content types
    if (userRole.includes('teacher') || userRole.includes('instructor')) {
      baseOptions.push({ id: 'educational' as const, label: 'Teaching & Tips' });
    }

    return baseOptions;
  };

  const priorityOptions = getPriorityOptions();
  const contentTypeOptions = getContentTypeOptions();

  const handleFilterChange = (updates: Partial<FilterOptions>) => {
    const newFilter = { ...activeFilter, ...updates };
    setActiveFilter(newFilter);
    onFilterChange(newFilter);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilter.priority !== 'all') count++;
    if (activeFilter.timeframe !== 'all') count++;
    if (activeFilter.contentType !== 'all') count++;
    return count;
  };

  return (
    <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
      {/* Main Filter Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900 text-sm">Feed Focus</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
              {getActiveFilterCount()} active
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
        >
          <Filter className="w-4 h-4" />
          {showAdvanced ? 'Less' : 'More'}
        </button>
      </div>

      {/* Priority Filter Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        {priorityOptions.map((option) => {
          const isActive = activeFilter.priority === option.id;
          return (
            <button
              key={option.id}
              onClick={() => handleFilterChange({ priority: option.id })}
              className={`p-3 rounded-lg border text-left transition-all hover:shadow-sm ${
                isActive 
                  ? 'bg-red-50 border-red-200 text-red-700' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={isActive ? 'text-red-600' : 'text-gray-500'}>
                  {option.icon}
                </span>
                <span className="font-medium text-sm">{option.label}</span>
                {option.count && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {option.count}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-tight">{option.description}</p>
            </button>
          );
        })}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-100 pt-3 space-y-3">
          {/* Timeframe Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">Timeframe</label>
            <div className="flex gap-2">
              {[
                { id: 'today' as const, label: 'Today' },
                { id: 'week' as const, label: 'This Week' },
                { id: 'month' as const, label: 'This Month' },
                { id: 'all' as const, label: 'All Time' }
              ].map((option) => {
                const isActive = activeFilter.timeframe === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleFilterChange({ timeframe: option.id })}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      isActive 
                        ? 'bg-red-50 border-red-200 text-red-700' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Type Filter */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-2 block">Content Type</label>
            <div className="flex gap-2 flex-wrap">
              {contentTypeOptions.map((option) => {
                const isActive = activeFilter.contentType === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleFilterChange({ contentType: option.id })}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      isActive 
                        ? 'bg-red-50 border-red-200 text-red-700' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex justify-end">
            <button
              onClick={() => handleFilterChange({ priority: 'all', timeframe: 'all', contentType: 'all' })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset all filters
            </button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {activeFilter.priority === 'trusted' && (
        <div className="bg-red-50 rounded-lg p-3 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">Your Trusted Circle</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-600">Dance Partners:</span>
              <span className="font-medium text-red-700 ml-1">{connectionStats.dance_partners}</span>
            </div>
            <div>
              <span className="text-gray-600">Close Friends:</span>
              <span className="font-medium text-red-700 ml-1">{connectionStats.close_friends}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustedConnectionsFilter;