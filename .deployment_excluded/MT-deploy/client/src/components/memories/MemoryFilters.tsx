/**
 * ESA LIFE CEO 61x21 - Memory Filters Component
 * Layer 26 (Recommendation Engine) + Layer 36 (Memory Systems)
 * 
 * Provides filtering controls for the Memories Feed Algorithm:
 * - All Memories, Following, Nearby tabs
 * - Filter by Tags search functionality
 * - Post visibility controls
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Filter, 
  Globe, 
  Users, 
  MapPin, 
  Tag, 
  Plus,
  X
} from 'lucide-react';

interface MemoryFiltersProps {
  onFiltersChange: (filters: {
    filterType: 'all' | 'following' | 'nearby';
    tags: string[];
    visibility: 'all' | 'public' | 'friends' | 'private';
    location?: { lat: number; lng: number; radius: number };
  }) => void;
  initialFilters?: {
    filterType?: 'all' | 'following' | 'nearby';
    tags?: string[];
    visibility?: 'all' | 'public' | 'friends' | 'private';
  };
}

export function MemoryFilters({ onFiltersChange, initialFilters = {} }: MemoryFiltersProps) {
  const [filterType, setFilterType] = useState<'all' | 'following' | 'nearby'>(
    initialFilters.filterType || 'all'
  );
  const [tags, setTags] = useState<string[]>(initialFilters.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState<'all' | 'public' | 'friends' | 'private'>(
    initialFilters.visibility || 'all'
  );
  const [location, setLocation] = useState<{ lat: number; lng: number; radius: number }>();

  // Get user's location for nearby filter
  useEffect(() => {
    if (filterType === 'nearby' && !location) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            radius: 10 // Default 10km
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to a default location (could be user's city)
          setLocation({ lat: -34.6037, lng: -58.3816, radius: 10 }); // Buenos Aires default
        }
      );
    }
  }, [filterType]);

  // Notify parent of filter changes
  useEffect(() => {
    onFiltersChange({
      filterType,
      tags,
      visibility,
      location: filterType === 'nearby' ? location : undefined
    });
  }, [filterType, tags, visibility, location, onFiltersChange]);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Card className="mb-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50">
      <CardContent className="p-4">
        {/* Filter Memories Header */}
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filter Memories
          </h3>
        </div>

        {/* Main Filter Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterType('all')}
            className={`flex items-center gap-2 ${
              filterType === 'all' 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
            }`}
          >
            <Globe className="h-4 w-4" />
            All Posts
          </Button>
          
          <Button
            variant={filterType === 'following' ? 'default' : 'outline'}
            onClick={() => setFilterType('following')}
            className={`flex items-center gap-2 ${
              filterType === 'following' 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
            }`}
          >
            <Users className="h-4 w-4" />
            Following
          </Button>
          
          <Button
            variant={filterType === 'nearby' ? 'default' : 'outline'}
            onClick={() => setFilterType('nearby')}
            className={`flex items-center gap-2 ${
              filterType === 'nearby' 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
            }`}
          >
            <MapPin className="h-4 w-4" />
            Nearby
          </Button>
        </div>

        {/* Filter by Tags Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by Tags
            </span>
          </div>
          
          {/* Tag Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add tag to filter memories..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-white/70 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-400"
            />
            <Button
              onClick={handleAddTag}
              size="sm"
              variant="outline"
              className="px-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              Add
            </Button>
          </div>

          {/* Active Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                >
                  #{tag}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Location Info for Nearby */}
        {filterType === 'nearby' && location && (
          <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-indigo-800 dark:text-indigo-200">
                Showing memories within {location.radius}km of your location
              </span>
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {(tags.length > 0 || filterType !== 'all') && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Active filters: {filterType !== 'all' && (
                <span className="capitalize font-medium">{filterType}</span>
              )}
              {tags.length > 0 && (
                <span className="ml-2">
                  {tags.length} tag{tags.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}