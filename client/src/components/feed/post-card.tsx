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
    <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-turquoise-100/50 hover:shadow-xl transition-shadow">
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.user?.profileImage} alt={post.user?.name} />
              <AvatarFallback>{post.user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-gray-900">{post.user?.name || 'Unknown User'}</h4>
              <p className="text-sm text-gray-500">
                {formatTimeAgo(post.createdAt)} • @{post.user?.username}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Post Content */}
      <CardContent className="p-4">
        <p className="text-tango-black mb-4 whitespace-pre-wrap">{post.content}</p>
        
        {/* Media */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post content"
            className="w-full rounded-lg object-cover max-h-96 mb-4"
          />
        )}
        
        {post.videoUrl && (
          <video
            src={post.videoUrl}
            controls
            className="w-full rounded-lg max-h-96 mb-4"
          />
        )}
      </CardContent>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{post.likesCount} likes</span>
            <span>{post.commentsCount} comments</span>
            <span>{post.sharesCount} shares</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-gray-600'} hover:text-tango-red`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>Like</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-600 hover:text-tango-red"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Comment</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-600 hover:text-tango-red"
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
