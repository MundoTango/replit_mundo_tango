import React, { useState } from 'react';
import { Image, Video, MapPin, Smile, X, Send, Globe, Users, Lock, Camera, FileImage } from 'lucide-react';

interface ModernPostComposerProps {
  onSubmit: (content: string, media?: File) => void;
  onClose?: () => void;
}

export default function ModernPostComposer({ onSubmit, onClose }: ModernPostComposerProps) {
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [visibility, setVisibility] = useState('public');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content, selectedMedia || undefined);
      setContent('');
      setSelectedMedia(null);
      setIsExpanded(false);
      onClose?.();
    }
  };

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedMedia(file);
    }
  };

  const visibilityOptions = [
    { value: 'public', icon: Globe, label: 'Public', color: 'text-green-600', bg: 'bg-green-50' },
    { value: 'followers', icon: Users, label: 'Followers', color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: 'private', icon: Lock, label: 'Private', color: 'text-gray-600', bg: 'bg-gray-50' }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100/50 overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral-50 via-blue-50 to-teal-50 px-8 py-6 border-b border-blue-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-coral-400 to-pink-500 p-3 rounded-2xl shadow-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                What's on your mind?
              </h3>
              <p className="text-blue-600/70 text-sm">Share your tango moment with the community</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-3 rounded-2xl text-blue-400 hover:text-red-500 hover:bg-red-50 
                       transition-all duration-300 hover:scale-110"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="p-8">
        {/* User Info */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <img
              src="/api/placeholder/56/56"
              alt="Scott Boddye"
              className="w-14 h-14 rounded-2xl object-cover border-3 border-gradient-to-br from-coral-200 to-pink-200 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-green-500 
                          rounded-full border-2 border-white shadow-lg"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <p className="font-bold text-blue-900 text-lg">Scott Boddye</p>
              <span className="text-blue-500 font-medium">@admin</span>
            </div>
            <div className="flex items-center gap-2">
              {visibilityOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setVisibility(option.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-medium text-sm
                              transition-all duration-200 border-2 ${
                                visibility === option.value
                                  ? `${option.bg} ${option.color} border-current shadow-md`
                                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                              }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Input */}
        <div className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full px-6 py-5 bg-gradient-to-br from-blue-50/30 to-teal-50/30 border-2 border-blue-200/50 
                     rounded-2xl resize-none focus:outline-none focus:ring-4 focus:ring-coral-200/50 
                     focus:border-coral-300 text-blue-900 placeholder-blue-400/80 font-medium text-lg
                     hover:border-blue-300/70 transition-all duration-300"
            rows={4}
          />
        </div>

        {/* Selected Media Preview */}
        {selectedMedia && (
          <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl border-2 border-blue-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-coral-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  {selectedMedia.type.startsWith('image/') ? (
                    <FileImage className="w-7 h-7 text-white" />
                  ) : (
                    <Video className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-blue-900 text-lg">{selectedMedia.name}</p>
                  <p className="text-blue-600 font-medium">
                    {(selectedMedia.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-3 rounded-2xl text-blue-400 hover:text-red-500 hover:bg-red-50 
                         transition-all duration-300 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-blue-100/50">
          <div className="flex items-center space-x-3">
            <label className="cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaSelect}
                className="hidden"
              />
              <div className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-coral-50 text-coral-600 
                            hover:bg-coral-100 hover:text-coral-700 font-bold transition-all duration-300 
                            transform hover:scale-105 shadow-lg hover:shadow-xl">
                <Image className="w-5 h-5" />
                <span>Image/Video</span>
              </div>
            </label>
            
            <button className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-teal-50 text-teal-600 
                             hover:bg-teal-100 hover:text-teal-700 font-bold transition-all duration-300 
                             transform hover:scale-105 shadow-lg hover:shadow-xl">
              <MapPin className="w-5 h-5" />
              <span>Location</span>
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="bg-gradient-to-r from-coral-400 to-pink-500 hover:from-coral-500 hover:to-pink-600 
                     disabled:from-gray-300 disabled:to-gray-400 text-white px-8 py-4 rounded-2xl 
                     font-bold text-lg shadow-2xl hover:shadow-coral-500/30 transform hover:-translate-y-1 
                     disabled:transform-none disabled:shadow-lg transition-all duration-300 
                     flex items-center space-x-3 group"
          >
            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            <span>Post</span>
          </button>
        </div>
      </div>
    </div>
  );
}