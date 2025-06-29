import React, { useState } from 'react';
import { Image, Video, MapPin, Smile, X, Send } from 'lucide-react';

interface ModernPostComposerProps {
  onSubmit: (content: string, media?: File) => void;
  onClose?: () => void;
}

export default function ModernPostComposer({ onSubmit, onClose }: ModernPostComposerProps) {
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-4 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Share a Memory
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-blue-400 hover:text-blue-600 hover:bg-white/50 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* User Info */}
        <div className="flex items-center space-x-3 mb-4">
          <img
            src="/api/placeholder/48/48"
            alt="Your profile"
            className="w-12 h-12 rounded-2xl object-cover border-2 border-gradient-to-br from-orange-200 to-pink-200"
          />
          <div>
            <p className="font-semibold text-blue-900">Share your tango moment...</p>
            <p className="text-sm text-blue-500">What's happening in your tango world?</p>
          </div>
        </div>

        {/* Content Input */}
        <div className="mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Tell us about your tango experience, share a moment, or ask the community..."
            className="w-full px-4 py-4 bg-gradient-to-br from-blue-50/50 to-teal-50/50 border border-blue-200 
                     rounded-2xl resize-none focus:outline-none focus:ring-3 focus:ring-orange-200 
                     focus:border-orange-300 text-blue-900 placeholder-blue-400 transition-all duration-200"
            rows={isExpanded ? 4 : 2}
          />
        </div>

        {/* Selected Media Preview */}
        {selectedMedia && (
          <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
                  {selectedMedia.type.startsWith('image/') ? (
                    <Image className="w-6 h-6 text-white" />
                  ) : (
                    <Video className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-blue-900">{selectedMedia.name}</p>
                  <p className="text-sm text-blue-500">
                    {(selectedMedia.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-2 rounded-xl text-blue-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isExpanded && (
          <div className="flex items-center justify-between pt-4 border-t border-blue-100">
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaSelect}
                  className="hidden"
                />
                <div className="flex items-center space-x-2 px-4 py-2 rounded-xl text-blue-600 
                              hover:text-orange-500 hover:bg-orange-50 transition-all duration-200">
                  <Image className="w-5 h-5" />
                  <span className="font-medium">Photo</span>
                </div>
              </label>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleMediaSelect}
                  className="hidden"
                />
                <div className="flex items-center space-x-2 px-4 py-2 rounded-xl text-blue-600 
                              hover:text-teal-500 hover:bg-teal-50 transition-all duration-200">
                  <Video className="w-5 h-5" />
                  <span className="font-medium">Video</span>
                </div>
              </label>
              
              <button className="flex items-center space-x-2 px-4 py-2 rounded-xl text-blue-600 
                               hover:text-pink-500 hover:bg-pink-50 transition-all duration-200">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Location</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 rounded-xl text-blue-600 
                               hover:text-yellow-500 hover:bg-yellow-50 transition-all duration-200">
                <Smile className="w-5 h-5" />
                <span className="font-medium">Feeling</span>
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 
                       disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-3 rounded-2xl 
                       font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 
                       disabled:transform-none disabled:shadow-md transition-all duration-200 
                       flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Share Memory</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}