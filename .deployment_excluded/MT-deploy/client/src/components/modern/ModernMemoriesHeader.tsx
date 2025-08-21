import React from 'react';
import { Search, Plus, Filter, Sparkles, Users, MapPin, Heart } from 'lucide-react';

interface ModernMemoriesHeaderProps {
  onCreatePost: () => void;
}

export default function ModernMemoriesHeader({ onCreatePost }: ModernMemoriesHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-white via-blue-50/50 to-teal-50/80 border-b border-blue-100/60">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-coral-400 to-pink-500 p-4 rounded-3xl shadow-2xl 
                            hover:shadow-coral-500/25 transform hover:scale-105 hover:rotate-3 transition-all duration-500">
                <Sparkles className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-400 
                            rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-500 
                           bg-clip-text text-transparent drop-shadow-sm">
                New Feeds
              </h1>
              <p className="text-blue-600/80 mt-2 text-lg font-medium">
                Share your tango journey with the world ✨
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-2xl 
                          border border-blue-200/50 shadow-lg">
              <Users className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-semibold text-blue-900">3.2K Online</span>
            </div>
            
            <button
              onClick={onCreatePost}
              className="bg-gradient-to-r from-coral-400 to-pink-500 hover:from-coral-500 hover:to-pink-600 
                       text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-coral-500/30 
                       transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 
                       flex items-center space-x-3 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Create Memory</span>
            </button>
          </div>
        </div>

        {/* Enhanced Search Section */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-blue-400 w-6 h-6 
                            group-focus-within:text-coral-500 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search events, people, memories..."
              className="w-full pl-14 pr-6 py-5 bg-white/90 backdrop-blur-md border-2 border-blue-200/50 
                       rounded-2xl focus:outline-none focus:ring-4 focus:ring-coral-200/50 focus:border-coral-300
                       text-blue-900 placeholder-blue-400/70 font-medium text-lg shadow-xl
                       hover:shadow-2xl transition-all duration-300"
            />
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
              <kbd className="px-3 py-1 bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold text-blue-600">
                ⌘K
              </kbd>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="bg-white/90 backdrop-blur-md border-2 border-blue-200/50 hover:border-teal-300 
                             px-6 py-5 rounded-2xl text-blue-600 hover:text-teal-600 font-bold text-lg
                             shadow-xl hover:shadow-2xl hover:bg-teal-50 transform hover:-translate-y-0.5
                             transition-all duration-300 flex items-center space-x-3">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
            
            <button className="bg-white/90 backdrop-blur-md border-2 border-blue-200/50 hover:border-pink-300 
                             px-6 py-5 rounded-2xl text-blue-600 hover:text-pink-600 font-bold text-lg
                             shadow-xl hover:shadow-2xl hover:bg-pink-50 transform hover:-translate-y-0.5
                             transition-all duration-300 flex items-center space-x-3">
              <MapPin className="w-5 h-5" />
              <span>Nearby</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}