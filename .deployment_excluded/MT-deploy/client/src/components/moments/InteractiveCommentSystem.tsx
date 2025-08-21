import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, Reply, 
  Smile, AtSign, Image as ImageIcon, Flag, X, Send,
  ThumbsUp, Laugh, AlertTriangle, Heart as HeartFilled
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: number;
  userId: number;
  postId: number;
  parentId?: number;
  content: string;
  mentions?: string[];
  gifUrl?: string;
  imageUrl?: string;
  likes: number;
  dislikes: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    username: string;
    profileImage?: string;
  };
  replies?: Comment[];
}

interface Reaction {
  id: number;
  userId: number;
  postId?: number;
  commentId?: number;
  type: string;
  createdAt: string;
}

interface InteractiveCommentSystemProps {
  postId: number;
  postUserId: number;
}

const REACTION_EMOJIS = {
  like: { emoji: '👍', label: 'Like' },
  love: { emoji: '❤️', label: 'Love' },
  laugh: { emoji: '😂', label: 'Laugh' },
  wow: { emoji: '😮', label: 'Wow' },
  sad: { emoji: '😢', label: 'Sad' },
  angry: { emoji: '😠', label: 'Angry' }
};

export default function InteractiveCommentSystem({ postId, postUserId }: InteractiveCommentSystemProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<number | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<number | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch comments for the post
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['/api/posts', postId, 'comments'],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Fetch post reactions
  const { data: postReactions = [] } = useQuery({
    queryKey: ['/api/posts', postId, 'reactions'],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${postId}/reactions`);
      if (!response.ok) throw new Error('Failed to fetch reactions');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: number }) => {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          parentId,
          mentions: extractMentions(content),
          gifUrl: null,
          imageUrl: null
        })
      });
      
      if (!response.ok) throw new Error('Failed to create comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId, 'comments'] });
      setNewComment('');
      setReplyingTo(null);
      toast({
        title: "Comment posted!",
        description: "Your comment has been added successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to post comment",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create reaction mutation
  const createReactionMutation = useMutation({
    mutationFn: async ({ type, commentId }: { type: string; commentId?: number }) => {
      const url = commentId ? `/api/comments/${commentId}/reactions` : `/api/posts/${postId}/reactions`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      
      if (!response.ok) throw new Error('Failed to add reaction');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', postId, 'reactions'] });
      setShowReactionPicker(null);
      toast({
        title: "Reaction added!",
        description: "Your reaction has been recorded."
      });
    }
  });

  // Report content mutation
  const reportMutation = useMutation({
    mutationFn: async ({ reason, description }: { reason: string; description?: string }) => {
      const response = await fetch(`/api/posts/${postId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, description })
      });
      
      if (!response.ok) throw new Error('Failed to report content');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Content reported",
        description: "Thank you for helping keep our community safe."
      });
    }
  });

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches || [];
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    createCommentMutation.mutate({
      content: newComment.trim(),
      parentId: replyingTo || undefined
    });
  };

  const handleReaction = (type: string, commentId?: number) => {
    createReactionMutation.mutate({ type, commentId });
  };

  const handleReport = (reason: string) => {
    const description = prompt('Please provide additional details (optional):');
    reportMutation.mutate({ reason, description: description || undefined });
  };

  const toggleCommentExpansion = (commentId: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const renderComment = (comment: Comment, depth = 0) => {
    const isExpanded = expandedComments.has(comment.id);
    const hasReplies = comment.replies && comment.replies.length > 0;
    
    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 mb-3">
          {/* Comment header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                {comment.user.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{comment.user.name}</p>
                <p className="text-xs text-gray-500">@{comment.user.username}</p>
              </div>
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowReactionPicker(showReactionPicker === comment.id ? null : comment.id)}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
              >
                <Smile className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReport('inappropriate')}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Comment content */}
          <div className="mb-3">
            <p className="text-gray-800 text-sm leading-relaxed">
              {comment.content.split(/(@\w+)/g).map((part, index) => 
                part.startsWith('@') ? (
                  <span key={index} className="text-blue-600 font-medium hover:underline cursor-pointer">
                    {part}
                  </span>
                ) : part
              )}
            </p>
            
            {comment.gifUrl && (
              <div className="mt-2">
                <img src={comment.gifUrl} alt="GIF" className="max-w-xs rounded-lg" />
              </div>
            )}
            
            {comment.imageUrl && (
              <div className="mt-2">
                <img src={comment.imageUrl} alt="Image" className="max-w-sm rounded-lg" />
              </div>
            )}
          </div>

          {/* Comment actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleReaction('like', comment.id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs">{comment.likes}</span>
              </button>
              
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span className="text-xs">Reply</span>
              </button>
              
              {hasReplies && (
                <button
                  onClick={() => toggleCommentExpansion(comment.id)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {isExpanded ? 'Hide' : 'Show'} {comment.replies?.length} replies
                </button>
              )}
            </div>
            
            {/* Reaction picker */}
            {showReactionPicker === comment.id && (
              <div className="absolute z-10 bg-white rounded-lg shadow-lg border p-2 flex space-x-1">
                {Object.entries(REACTION_EMOJIS).map(([type, { emoji, label }]) => (
                  <button
                    key={type}
                    onClick={() => handleReaction(type, comment.id)}
                    className="p-2 hover:bg-gray-100 rounded text-lg"
                    title={label}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reply input */}
        {replyingTo === comment.id && (
          <div className="ml-8 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 border">
              <textarea
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`Reply to ${comment.user.name}...`}
                className="w-full p-2 border border-gray-200 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
                    <Smile className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
                    <AtSign className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || createCommentMutation.isPending}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {isExpanded && hasReplies && (
          <div className="space-y-2">
            {comment.replies?.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Post reactions summary */}
      {postReactions.length > 0 && (
        <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            {Object.entries(REACTION_EMOJIS).map(([type, { emoji }]) => {
              const count = postReactions.filter((r: Reaction) => r.type === type).length;
              if (count === 0) return null;
              return (
                <div key={type} className="flex items-center space-x-1">
                  <span>{emoji}</span>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="text-sm text-gray-500">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </div>
        </div>
      )}

      {/* Main comment input */}
      {!replyingTo && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
                    <Smile className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
                    <AtSign className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded text-gray-500">
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-blue-600 text-white rounded-lg hover:from-pink-700 hover:to-blue-700 disabled:opacity-50"
                >
                  {createCommentMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post reaction picker */}
      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowReactionPicker(showReactionPicker === 0 ? null : 0)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm">React</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Comment</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Share</span>
          </button>
        </div>
        
        {showReactionPicker === 0 && (
          <div className="absolute z-10 bg-white rounded-lg shadow-lg border p-2 flex space-x-1">
            {Object.entries(REACTION_EMOJIS).map(([type, { emoji, label }]) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className="p-2 hover:bg-gray-100 rounded text-lg"
                title={label}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.map((comment: Comment) => renderComment(comment))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}