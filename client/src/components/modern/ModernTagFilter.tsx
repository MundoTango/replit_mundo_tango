import React, { useState } from 'react';
import { Search, Plus, X, Tag, Hash } from 'lucide-react';

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
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-100/50 p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-teal-400 to-cyan-500 p-3 rounded-2xl shadow-xl 
                        hover:shadow-teal-500/25 transform hover:scale-105 transition-all duration-300">
            <Hash className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              Filter by Media Tags
            </h3>
            <p className="text-blue-600/70 font-medium">Discover memories by content type</p>
          </div>
        </div>
        
        {activeTags.length > 0 && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-2 rounded-2xl border border-teal-200/50">
            <span className="text-teal-700 font-bold text-sm">
              {activeTags.length} active filter{activeTags.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Tag Input */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-400 w-6 h-6 
                          group-focus-within:text-teal-500 transition-colors duration-300" />
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter tag name and press Enter..."
            className="w-full pl-14 pr-6 py-5 bg-gradient-to-br from-blue-50/30 to-teal-50/30 
                     border-2 border-blue-200/50 rounded-2xl focus:outline-none focus:ring-4 
                     focus:ring-teal-200/50 focus:border-teal-300 text-blue-900 placeholder-blue-400/70 
                     font-medium text-lg hover:border-blue-300/70 transition-all duration-300"
          />
        </div>
        <button
          onClick={handleAddTag}
          disabled={!tagInput.trim() || activeTags.includes(tagInput.trim())}
          className="bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 
                   disabled:from-gray-300 disabled:to-gray-400 text-white px-8 py-5 rounded-2xl 
                   font-bold text-lg shadow-2xl hover:shadow-teal-500/30 transform hover:-translate-y-1 
                   disabled:transform-none disabled:shadow-lg transition-all duration-300 
                   flex items-center space-x-3 group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Add</span>
        </button>
      </div>

      {/* Active Tags */}
      {activeTags.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {activeTags.map((tag) => (
              <div
                key={tag}
                className="bg-gradient-to-r from-coral-100 to-pink-100 border-2 border-coral-200/50 
                         text-coral-700 px-5 py-3 rounded-2xl flex items-center space-x-3 
                         shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <Tag className="w-4 h-4" />
                <span className="font-bold text-lg">{tag}</span>
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="ml-2 p-2 rounded-xl text-coral-500 hover:text-red-500 
                           hover:bg-red-50 transition-all duration-300 hover:scale-110"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTags.length === 0 && (
        <div className="text-center py-8">
          <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-6 border-2 border-blue-100/50">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-teal-100 rounded-2xl 
                          flex items-center justify-center mx-auto mb-4">
              <Hash className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-blue-600 font-medium text-lg">
              No active filters. Add tags to discover specific content!
            </p>
            <p className="text-blue-500 text-sm mt-2">
              Try tags like "milonga", "performance", "class", or "social"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}