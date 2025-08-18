import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface ModernLoadingStateProps {
  message?: string;
  type?: 'default' | 'posts' | 'upload';
}

export default function ModernLoadingState({ 
  message = 'Loading...', 
  type = 'default' 
}: ModernLoadingStateProps) {
  if (type === 'posts') {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-200 to-teal-200 rounded-2xl"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-blue-200 to-teal-200 rounded-lg w-32"></div>
                <div className="h-3 bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg w-24"></div>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <div className="h-4 bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg w-full"></div>
              <div className="h-4 bg-gradient-to-r from-blue-100 to-teal-100 rounded-lg w-3/4"></div>
            </div>
            <div className="h-48 bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl mb-4"></div>
            <div className="flex space-x-4">
              <div className="h-8 bg-gradient-to-r from-pink-100 to-orange-100 rounded-xl w-16"></div>
              <div className="h-8 bg-gradient-to-r from-teal-100 to-blue-100 rounded-xl w-16"></div>
              <div className="h-8 bg-gradient-to-r from-orange-100 to-pink-100 rounded-xl w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div className="absolute -inset-2">
          <div className="w-20 h-20 border-4 border-gradient-to-r from-blue-300 to-teal-300 rounded-2xl animate-spin opacity-75"></div>
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
          {message}
        </h3>
        <p className="text-blue-500">Creating amazing memories...</p>
      </div>
    </div>
  );
}