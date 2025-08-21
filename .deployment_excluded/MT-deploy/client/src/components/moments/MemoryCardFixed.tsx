import React, { useState } from 'react';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, MapPin, 
  Clock, Send, AlertCircle, X, Edit, Trash2, Flag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface MemoryCardProps {
  post: any;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function MemoryCardFixed({ post }: MemoryCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // ESA LIFE CEO 61x21 - CRITICAL DEBUG
  React.useEffect(() => {
    // Processing fixed card for post
  }, [post]);

  // Simplified media collection
  const getMediaUrls = () => {
    const urls: string[] = [];
    
    // Collect from all possible sources
    if (post.mediaEmbeds && Array.isArray(post.mediaEmbeds)) {
      urls.push(...post.mediaEmbeds);
    }
    if (post.mediaUrls && Array.isArray(post.mediaUrls)) {
      urls.push(...post.mediaUrls);
    }
    if (post.imageUrl) urls.push(post.imageUrl);
    if (post.videoUrl) urls.push(post.videoUrl);
    
    // Remove duplicates
    return [...new Set(urls.filter(url => url && url.length > 0))];
  };

  const mediaUrls = getMediaUrls();

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-semibold">
              {post.user?.profileImage ? (
                <img 
                  src={post.user.profileImage} 
                  alt={post.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (post.user?.name || 'U').substring(0, 2).toUpperCase()
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900">{post.user?.name || 'Unknown User'}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-3">
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          
          {/* ESA LIFE CEO 61x21 - FIXED MEDIA DISPLAY */}
          {mediaUrls.length > 0 && (
            <div className="mt-4">
              <div className="bg-yellow-100 p-2 rounded mb-2">
                <span className="text-xs">🎥 ESA: {mediaUrls.length} media items found</span>
              </div>
              
              <div className={`grid gap-2 ${
                mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}>
                {mediaUrls.map((url, index) => {
                  const isVideo = url.toLowerCase().match(/\.(mp4|mov|webm|avi|m4v)/);
                  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
                  const key = `${post.id}-media-${index}`;
                  
                  // Rendering media item
                  
                  if (isVideo) {
                    return (
                      <div key={key} className="relative bg-black rounded-lg overflow-hidden">
                        <video
                          src={fullUrl}
                          controls
                          className="w-full h-auto max-h-96"
                          preload="metadata"
                          playsInline
                          onLoadedMetadata={() => { /* Video loaded */ }}
                          onError={(e) => { /* Video error */ }}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div key={key} className="relative rounded-lg overflow-hidden">
                        <img
                          src={fullUrl}
                          alt={`Media ${index + 1}`}
                          className="w-full h-auto max-h-96 object-cover rounded-lg"
                          loading="lazy"
                          onLoad={() => { /* Image loaded */ }}
                          onError={(e) => { /* Image error */ }}
                        />
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-sm">{post.reactionCount || 0}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.commentCount || 0}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}