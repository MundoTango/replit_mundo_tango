import React, { useState, useEffect } from 'react';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, MapPin, 
  Clock, Send, AlertCircle, X, Edit, Trash2, Flag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';

interface VideoMemoryCardProps {
  post: any;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function VideoMemoryCard({ post }: VideoMemoryCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);
  const [mediaItems, setMediaItems] = useState<{url: string, isVideo: boolean}[]>([]);
  
  // ESA LIFE CEO 61x21 - Process media on mount and when post changes
  useEffect(() => {
    // Processing post for video memory card
    
    const items: {url: string, isVideo: boolean}[] = [];
    const seenUrls = new Set<string>();
    
    // Helper to detect video files
    const isVideoFile = (url: string): boolean => {
      if (!url) return false;
      const lower = url.toLowerCase();
      return lower.includes('.mp4') || lower.includes('.mov') || 
             lower.includes('.webm') || lower.includes('.avi') ||
             lower.includes('.m4v') || lower.includes('.mkv');
    };
    
    // Helper to add URL if not duplicate
    const addUrl = (url: string) => {
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        items.push({ url, isVideo: isVideoFile(url) });
        // Media added to display list
      }
    };
    
    // Collect from ALL possible sources
    // Priority 1: mediaEmbeds (primary source from backend)
    if (post.mediaEmbeds && Array.isArray(post.mediaEmbeds)) {
      post.mediaEmbeds.forEach(addUrl);
    }
    
    // Priority 2: mediaUrls (compatibility field)
    if (post.mediaUrls && Array.isArray(post.mediaUrls)) {
      post.mediaUrls.forEach(addUrl);
    }
    
    // Priority 3: Legacy single fields
    if (post.videoUrl) addUrl(post.videoUrl);
    if (post.imageUrl) addUrl(post.imageUrl);
    
    // Total media items processed
    setMediaItems(items);
  }, [post]);
  
  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/posts/${post.id}/like`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to like post",
        variant: "destructive",
      });
    },
  });
  
  // Comment state
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/api/posts/${post.id}/comments`, { 
        method: 'POST', 
        body: { content } 
      });
    },
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      toast({
        title: "Success",
        description: "Comment added",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
  });
  
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
                (post.user?.name || post.user?.username || 'U').substring(0, 2).toUpperCase()
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900">
                {post.user?.name || post.user?.username || 'Unknown User'}
              </h3>
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
          
          {/* Media Display - ESA LIFE CEO 61x21 FIXED */}
          {mediaItems.length > 0 && (
            <div className="mt-4">
              <div className={`grid gap-2 ${
                mediaItems.length === 1 ? 'grid-cols-1' : 
                mediaItems.length === 2 ? 'grid-cols-2' : 
                'grid-cols-2'
              }`}>
                {mediaItems.map((media, index) => {
                  const fullUrl = media.url.startsWith('http') ? 
                    media.url : `${window.location.origin}${media.url}`;
                  const key = `${post.id}-media-${index}`;
                  
                  if (media.isVideo) {
                    return (
                      <div key={key} className="relative bg-black rounded-lg overflow-hidden">
                        <video
                          src={fullUrl}
                          controls
                          className="w-full h-auto max-h-96"
                          preload="metadata"
                          playsInline
                        />
                      </div>
                    );
                  } else {
                    return (
                      <div key={key} className="relative rounded-lg overflow-hidden">
                        <img
                          src={fullUrl}
                          alt={`Memory ${index + 1}`}
                          className="w-full h-auto max-h-96 object-cover rounded-lg"
                          loading="lazy"
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
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => likeMutation.mutate()}
                className={`flex items-center gap-2 transition-colors ${
                  post.userHasLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                }`}
                disabled={likeMutation.isPending}
              >
                <Heart className={`w-5 h-5 ${post.userHasLiked ? 'fill-current' : ''}`} />
                <span className="text-sm">{post.reactionCount || 0}</span>
              </button>
              
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{post.commentCount || 0}</span>
              </button>
              
              <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 space-y-3">
              {/* Add Comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && commentText.trim()) {
                      addCommentMutation.mutate(commentText);
                    }
                  }}
                />
                <Button
                  onClick={() => commentText.trim() && addCommentMutation.mutate(commentText)}
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Display Comments */}
              {post.comments && post.comments.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {post.comments.map((comment: any) => (
                    <div key={comment.id} className="flex gap-2 text-sm">
                      <span className="font-semibold">{comment.user?.name || 'Unknown'}:</span>
                      <span className="text-gray-700">{comment.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}