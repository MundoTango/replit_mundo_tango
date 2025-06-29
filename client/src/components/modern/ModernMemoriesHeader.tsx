import React from 'react';
import { Search, Plus, Filter, Sparkles } from 'lucide-react';

interface ModernMemoriesHeaderProps {
  onCreatePost: () => void;
}

export default function ModernMemoriesHeader({ onCreatePost }: ModernMemoriesHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-teal-50 border-b border-blue-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-3 rounded-2xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Memories
              </h1>
              <p className="text-blue-600/70 mt-1">Share your tango moments with the world</p>
            </div>
          </div>
          
          <button
            onClick={onCreatePost}
            className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 
                     text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl 
                     transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Memory</span>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search memories, tags, or people..."
              className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-blue-200 
                       rounded-2xl focus:outline-none focus:ring-3 focus:ring-orange-200 focus:border-orange-300
                       text-blue-900 placeholder-blue-400 transition-all duration-200"
            />
          </div>
          
          <button className="bg-white/80 backdrop-blur-sm border border-blue-200 hover:border-teal-300 
                           px-6 py-4 rounded-2xl text-blue-600 hover:text-teal-600 font-medium
                           transition-all duration-200 flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}