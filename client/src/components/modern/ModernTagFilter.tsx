import React, { useState } from 'react';
import { Search, Plus, X, Tag } from 'lucide-react';

interface ModernTagFilterProps {
  activeTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export default function ModernTagFilter({ activeTags, onAddTag, onRemoveTag }: ModernTagFilterProps) {
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !activeTags.includes(tagInput.trim())) {
      onAddTag(tagInput.trim());
      setTagInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-gradient-to-br from-teal-400 to-teal-500 p-2 rounded-xl">
          <Tag className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-blue-900">Filter by Tags</h3>
      </div>

      {/* Tag Input */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter tag name..."
            className="w-full pl-10 pr-4 py-3 bg-gradient-to-br from-blue-50/50 to-teal-50/50 
                     border border-blue-200 rounded-xl focus:outline-none focus:ring-3 
                     focus:ring-teal-200 focus:border-teal-300 text-blue-900 placeholder-blue-400 
                     transition-all duration-200"
          />
        </div>
        <button
          onClick={handleAddTag}
          disabled={!tagInput.trim() || activeTags.includes(tagInput.trim())}
          className="bg-gradient-to-r from-teal-400 to-teal-500 hover:from-teal-500 hover:to-teal-600 
                   disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-xl 
                   font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
                   disabled:transform-none disabled:shadow-md transition-all duration-200 
                   flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Active Tags */}
      {activeTags.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-blue-600">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {activeTags.map((tag) => (
              <div
                key={tag}
                className="bg-gradient-to-r from-orange-100 to-pink-100 border border-orange-200 
                         text-orange-700 px-4 py-2 rounded-xl flex items-center space-x-2 
                         shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Tag className="w-4 h-4" />
                <span className="font-medium">{tag}</span>
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="ml-1 p-1 rounded-lg text-orange-500 hover:text-red-500 
                           hover:bg-red-50 transition-all duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTags.length === 0 && (
        <div className="text-center py-4">
          <p className="text-blue-400 text-sm">No active filters. Add tags to filter memories.</p>
        </div>
      )}
    </div>
  );
}