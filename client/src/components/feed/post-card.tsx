import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/authUtils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Send
} from "lucide-react";

interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaUrls?: string[]; // ESA LIFE CEO 61x21 - Support multiple media files
  mediaEmbeds?: string[]; // ESA LIFE CEO 61x21 - Support embedded media
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method,
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to update like');
      return response.json();
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive",
      });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/posts/${post.id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to add comment');
      return response.json();
    },
    onSuccess: (data) => {
      setComments(prev => [data.data, ...prev]);
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${post.user?.name}'s post`,
        text: post.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard.",
      });
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  return (
    <Card className="glassmorphic-card rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Post Header */}
      <div className="p-4 border-b border-turquoise-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12 ring-2 ring-turquoise-200">
              {/* ESA LIFE CEO 61x21 - Fixed profile image with fallback */}
              <AvatarImage src={post.user?.profileImage || '/images/default-avatar.svg'} alt={post.user?.name} />
              <AvatarFallback className="bg-gradient-to-br from-turquoise-400 to-cyan-500 text-white">{post.user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-gray-800">{post.user?.name || 'Unknown User'}</h4>
              <p className="text-sm text-turquoise-600">
                {formatTimeAgo(post.createdAt)} • @{post.user?.username}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-turquoise-400 hover:text-turquoise-600">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Post Content */}
      <CardContent className="p-4">
        {post.content && (
          <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
        )}
        
        {/* ESA LIFE CEO 61x21 - Display media files with proper video detection */}
        {(() => {
          // Check if we have any media to display from multiple sources
          const mediaToDisplay = post.mediaUrls || 
            (post.mediaEmbeds && Array.isArray(post.mediaEmbeds) ? post.mediaEmbeds : []) ||
            (post.imageUrl ? [post.imageUrl] : []) ||
            (post.videoUrl ? [post.videoUrl] : []);
          
          if (!mediaToDisplay || mediaToDisplay.length === 0) return null;
          
          // Display media based on count
          return (
            <div className={`grid gap-2 mb-4 ${
              mediaToDisplay.length === 1 ? 'grid-cols-1' : 
              mediaToDisplay.length === 2 ? 'grid-cols-2' : 
              'grid-cols-2'
            }`}>
              {mediaToDisplay.map((url: string, index: number) => {
                // ESA LIFE CEO 61x21 - Proper video detection
                const isVideo = url.toLowerCase().endsWith('.mp4') || 
                  url.toLowerCase().endsWith('.mov') || 
                  url.toLowerCase().endsWith('.webm') ||
                  url.toLowerCase().endsWith('.avi');
                
                return (
                  <div key={index} className="relative">
                    {isVideo ? (
                      <video
                        src={url}
                        controls
                        className="w-full rounded-lg object-cover max-h-64"
                        preload="metadata"
                        onError={(e) => {
                          console.error('Video load error:', url);
                        }}
                      />
                    ) : (
                      <img
                        src={url}
                        alt={`Media ${index + 1}`}
                        className="w-full rounded-lg object-cover max-h-64"
                        onError={(e) => {
                          console.error('Image load error:', url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
        {/* Removed duplicate media rendering code */}
      </CardContent>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-turquoise-100/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-sm text-turquoise-700">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {post.likesCount} likes
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {post.commentsCount} comments
            </span>
            <span className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              {post.sharesCount} shares
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={`flex items-center space-x-2 ${isLiked ? 'text-pink-500' : 'text-turquoise-600'} hover:text-pink-500 transition-colors`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>Like</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-turquoise-600 hover:text-cyan-600 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Comment</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2 text-turquoise-600 hover:text-cyan-600 transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-4">
            {/* Add Comment */}
            <div className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex space-x-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
                <Button
                  size="sm"
                  onClick={handleComment}
                  disabled={commentMutation.isPending || !newComment.trim()}
                  className="bg-tango-red hover:bg-tango-red/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.user?.profileImage} alt={comment.user?.name} />
                      <AvatarFallback>{comment.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <h5 className="font-medium text-sm text-tango-black">{comment.user?.name}</h5>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
