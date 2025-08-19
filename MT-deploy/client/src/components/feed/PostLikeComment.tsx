"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal, 
  Send,
  Smile,
  Bookmark,
  Flag,
  Edit3,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaEmbeds?: string[]; // ESA LIFE CEO 61x21 - Support for media array
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  likes: number;
  isLiked: boolean;
  comments: number;
  shares: number;
  createdAt: string;
  visibility: string;
  isSaved?: boolean;
}

interface Comment {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  createdAt: string;
}

interface PostLikeCommentProps {
  post: Post;
  index: number;
  onEdit?: (post: Post) => void;
}

const PostLikeComment = ({ post, index, onEdit }: PostLikeCommentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [reportDialog, setReportDialog] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  
  const commentInputRef = useRef<HTMLInputElement>(null);

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async () => {
      if (localPost.isLiked) {
        return fetch(`/api/post/unlike/${localPost.id}`, { method: "DELETE" }).then(res => res.json());
      } else {
        return fetch(`/api/post/like/${localPost.id}`, { method: "POST" }).then(res => res.json());
      }
    },
    onSuccess: () => {
      setLocalPost(prev => ({
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return fetch("/api/post/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: localPost.id,
          comment: content
        })
      }).then(res => res.json());
    },
    onSuccess: () => {
      setCommentText("");
      loadComments();
      setLocalPost(prev => ({ ...prev, comments: prev.comments + 1 }));
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
    },
  });

  // Share post mutation
  const shareMutation = useMutation({
    mutationFn: async (content: string) => {
      return fetch("/api/post/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: localPost.id,
          content: content
        })
      }).then(res => res.json());
    },
    onSuccess: () => {
      setShareDialog(false);
      setLocalPost(prev => ({ ...prev, shares: prev.shares + 1 }));
      toast({ title: "Post shared successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
    },
  });

  // Save post mutation
  const savePostMutation = useMutation({
    mutationFn: async () => {
      if (localPost.isSaved) {
        return fetch(`/api/post/unsave/${localPost.id}`, { method: "DELETE" }).then(res => res.json());
      } else {
        return fetch(`/api/post/save/${localPost.id}`, { method: "POST" }).then(res => res.json());
      }
    },
    onSuccess: () => {
      setLocalPost(prev => ({ ...prev, isSaved: !prev.isSaved }));
      toast({ 
        title: localPost.isSaved ? "Post removed from saved" : "Post saved successfully!" 
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      return fetch(`/api/post/delete/${localPost.id}`, { method: "DELETE" }).then(res => res.json());
    },
    onSuccess: () => {
      toast({ title: "Post deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/posts/feed"] });
    },
  });

  // Load comments
  const loadComments = async () => {
    try {
      const response = await fetch(`/api/post/comments/${localPost.id}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const handleLike = () => {
    likePostMutation.mutate();
  };

  const handleComment = () => {
    if (!showComments) {
      setShowComments(true);
      loadComments();
    } else {
      setShowComments(false);
    }
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      commentMutation.mutate(commentText);
    }
  };

  const handleShare = (content: string) => {
    shareMutation.mutate(content);
  };

  const isOwnPost = user?.id === localPost.user.id;

  return (
    <Card className="mb-4 bg-white shadow-sm">
      <CardContent className="p-6">
        {/* Post header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={localPost.user.profileImage || "/images/user-placeholder.jpeg"} 
                className="object-cover"
              />
              <AvatarFallback className="bg-red-600 text-white">
                {localPost.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900">{localPost.user.name}</div>
              <div className="text-sm text-gray-500">
                @{localPost.user.username} • {formatDistanceToNow(new Date(localPost.createdAt))} ago
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => savePostMutation.mutate()}>
                <Bookmark className="mr-2 h-4 w-4" />
                {localPost.isSaved ? "Unsave" : "Save"} Post
              </DropdownMenuItem>
              {isOwnPost ? (
                <>
                  <DropdownMenuItem onClick={() => onEdit?.(localPost)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => deletePostMutation.mutate()}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => setReportDialog(true)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report Post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Post content */}
        <div className="mb-4">
          <p className="text-gray-900 whitespace-pre-wrap">{localPost.content}</p>
          
          {/* ESA LIFE CEO 61x21 - Enhanced media display with mediaEmbeds support */}
          {localPost.mediaEmbeds && localPost.mediaEmbeds.length > 0 ? (
            <div className="mt-3 space-y-2">
              {localPost.mediaEmbeds.map((url: string, index: number) => {
                const isVideo = url.includes('.mp4') || url.includes('.MP4') || url.includes('.mov') || url.includes('.webm');
                return isVideo ? (
                  <video 
                    key={index}
                    src={url}
                    controls
                    className="w-full rounded-lg max-h-96"
                  />
                ) : (
                  <img 
                    key={index}
                    src={url} 
                    alt={`Post media ${index + 1}`}
                    className="w-full rounded-lg max-h-96 object-cover"
                  />
                );
              })}
            </div>
          ) : (
            <>
              {localPost.imageUrl && !localPost.videoUrl && (
                <div className="mt-3">
                  <img 
                    src={localPost.imageUrl} 
                    alt="Post image"
                    className="w-full rounded-lg max-h-96 object-cover"
                  />
                </div>
              )}
              
              {localPost.videoUrl && (
                <div className="mt-3">
                  <video 
                    src={localPost.videoUrl}
                    controls
                    className="w-full rounded-lg max-h-96"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Post stats */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span>{localPost.likes} likes</span>
          <span>{localPost.comments} comments</span>
          <span>{localPost.shares} shares</span>
        </div>

        <hr className="my-3 border-gray-200" />

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`flex items-center gap-2 ${localPost.isLiked ? 'text-red-600' : 'text-gray-600'}`}
            >
              <Heart className={`h-4 w-4 ${localPost.isLiked ? 'fill-current' : ''}`} />
              Like
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleComment}
              className="flex items-center gap-2 text-gray-600"
            >
              <MessageCircle className="h-4 w-4" />
              Comment
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShareDialog(true)}
              className="flex items-center gap-2 text-gray-600"
            >
              <Share className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Comment input */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user?.profileImage || "/images/user-placeholder.jpeg"} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-red-600 text-white text-xs">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  ref={commentInputRef}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleCommentSubmit();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim() || commentMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={comment.user.profileImage || "/images/user-placeholder.jpeg"} 
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-400 text-white text-xs">
                      {comment.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <div className="font-semibold text-sm text-gray-900">
                        {comment.user.name}
                      </div>
                      <p className="text-gray-800 text-sm">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                      <button className="hover:text-red-600">Like</button>
                      <button className="hover:text-red-600">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Share Dialog */}
      <Dialog open={shareDialog} onOpenChange={setShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Add a comment about this post..."
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShareDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleShare("")} className="bg-red-600 hover:bg-red-700">
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PostLikeComment;