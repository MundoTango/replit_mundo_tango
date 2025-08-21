import React, { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, 
  Reply, Edit3, Trash2, Flag, Smile, AtSign,
  ThumbsUp, ThumbsDown, Gift, Image
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AuthContext } from '../../contexts/auth-context';
import { useContext } from 'react';

const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: number;
  userId: number;
  postId: number;
  parentId?: number;
  content: string;
  mentions: string[];
  gifUrl?: string;
  imageUrl?: string;
  likes: number;
  dislikes: number;
  isLiked: boolean;
  isDisliked: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    name: string;
    profileImage?: string;
  };
  replies?: Comment[];
  replyCount: number;
}

interface EnhancedCommentsSystemProps {
  postId: number;
  initialComments?: Comment[];
  allowNesting?: boolean;
  maxNestingLevel?: number;
  showGifPicker?: boolean;
  enableModeration?: boolean;
}

export default function EnhancedCommentsSystem({
  postId,
  initialComments = [],
  allowNesting = true,
  maxNestingLevel = 3,
  showGifPicker = true,
  enableModeration = true
}: EnhancedCommentsSystemProps) {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showGifs, setShowGifs] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
  const [moderationActions, setModerationActions] = useState<{[key: number]: boolean}>({});

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['/api/comments', postId],
    queryFn: async () => {
      const response = await fetch(`/api/comments?postId=${postId}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch comments');
      const result = await response.json();
      return result.data || [];
    },
    initialData: initialComments
  });

  // Popular GIFs for quick access
  const popularGifs = [
    'https://media.giphy.com/media/3o7TKz9XlXO3nGgVUs/giphy.gif', // Dancing
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif', // Tango
    'https://media.giphy.com/media/26BRpLTzQJiPyLnuo/giphy.gif', // Heart
    'https://media.giphy.com/media/l0MYGb8Q5nXOwWmUE/giphy.gif', // Clapping
    'https://media.giphy.com/media/3oz8xBwn8AU6Bp1hKM/giphy.gif', // Thumbs up
    'https://media.giphy.com/media/ZfK4cXKJTTay1Ava29/giphy.gif', // Fire
  ];

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (commentData: any) => {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(commentData),
      });
      if (!response.ok) throw new Error('Failed to create comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments', postId] });
      setNewComment('');
      setReplyingTo(null);
      setShowGifs(false);
    }
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: number, content: string }) => {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to update comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments', postId] });
      setEditingComment(null);
      setEditContent('');
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete comment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments', postId] });
    }
  });

  // Like/unlike comment mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ commentId, action }: { commentId: number, action: 'like' | 'unlike' | 'dislike' | 'undislike' }) => {
      const response = await fetch(`/api/comments/${commentId}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`Failed to ${action} comment`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/comments', postId] });
    }
  });

  // Report comment mutation
  const reportCommentMutation = useMutation({
    mutationFn: async ({ commentId, reason }: { commentId: number, reason: string }) => {
      const response = await fetch(`/api/comments/${commentId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to report comment');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment Reported",
        description: "Thank you for helping keep our community safe.",
      });
    }
  });

  // Extract mentions from text
  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return mentions;
  };

  // Handle comment submission
  const handleSubmitComment = useCallback(async (content: string, parentId?: number, gifUrl?: string) => {
    if (!content.trim() && !gifUrl) return;

    const mentions = extractMentions(content);
    
    await createCommentMutation.mutateAsync({
      postId,
      parentId,
      content: content.trim(),
      mentions,
      gifUrl
    });
  }, [postId, createCommentMutation]);

  // Handle comment editing
  const handleEditComment = useCallback(async (commentId: number, content: string) => {
    if (!content.trim()) return;
    await updateCommentMutation.mutateAsync({ commentId, content: content.trim() });
  }, [updateCommentMutation]);

  // Handle like/dislike
  const handleToggleLike = useCallback((commentId: number, isLiked: boolean, isDisliked: boolean, action: 'like' | 'dislike') => {
    let mutationAction: 'like' | 'unlike' | 'dislike' | 'undislike';
    
    if (action === 'like') {
      mutationAction = isLiked ? 'unlike' : 'like';
    } else {
      mutationAction = isDisliked ? 'undislike' : 'dislike';
    }
    
    toggleLikeMutation.mutate({ commentId, action: mutationAction });
  }, [toggleLikeMutation]);

  // Toggle replies visibility
  const toggleReplies = useCallback((commentId: number) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  // Render user avatar
  const renderAvatar = (user: Comment['user'], size = 'w-8 h-8') => (
    <div className={`${size} rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs`}>
      {user.profileImage ? (
        <img src={user.profileImage} alt={user.name} className={`${size} rounded-full object-cover`} />
      ) : (
        user.name.charAt(0).toUpperCase()
      )}
    </div>
  );

  // Render comment actions
  const renderCommentActions = (comment: Comment, nestingLevel: number) => (
    <div className="flex items-center space-x-4 mt-2">
      <button
        onClick={() => handleToggleLike(comment.id, comment.isLiked, comment.isDisliked, 'like')}
        className={`flex items-center space-x-1 text-sm transition-colors ${
          comment.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
        }`}
      >
        <Heart className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
        <span>{comment.likes}</span>
      </button>

      <button
        onClick={() => handleToggleLike(comment.id, comment.isLiked, comment.isDisliked, 'dislike')}
        className={`flex items-center space-x-1 text-sm transition-colors ${
          comment.isDisliked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
        }`}
      >
        <ThumbsDown className={`h-4 w-4 ${comment.isDisliked ? 'fill-current' : ''}`} />
        {comment.dislikes > 0 && <span>{comment.dislikes}</span>}
      </button>

      {allowNesting && nestingLevel < maxNestingLevel && (
        <button
          onClick={() => setReplyingTo(comment.id)}
          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors"
        >
          <Reply className="h-4 w-4" />
          <span>Reply</span>
        </button>
      )}

      {comment.userId === user?.id && (
        <>
          <button
            onClick={() => {
              setEditingComment(comment.id);
              setEditContent(comment.content);
            }}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-500 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => deleteCommentMutation.mutate(comment.id)}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </>
      )}

      {enableModeration && comment.userId !== user?.id && (
        <button
          onClick={() => reportCommentMutation.mutate({ commentId: comment.id, reason: 'inappropriate' })}
          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-orange-500 transition-colors"
        >
          <Flag className="h-4 w-4" />
          <span>Report</span>
        </button>
      )}

      {comment.replyCount > 0 && (
        <button
          onClick={() => toggleReplies(comment.id)}
          className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
        >
          {expandedReplies.has(comment.id) ? 'Hide' : 'Show'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
        </button>
      )}
    </div>
  );

  // Render comment form
  const renderCommentForm = (parentId?: number, placeholder = "Write a comment...") => {
    const isReply = parentId !== undefined;
    const currentContent = isReply ? newComment : newComment;
    const setCurrentContent = setNewComment;

    return (
      <div className="space-y-3">
        <div className="flex space-x-3">
          {renderAvatar(user as any)}
          <div className="flex-1">
            <textarea
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={3}
            />
            
            {showGifPicker && showGifs && (
              <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Popular GIFs:</p>
                <div className="grid grid-cols-3 gap-2">
                  {popularGifs.map((gifUrl, index) => (
                    <button
                      key={index}
                      onClick={() => handleSubmitComment(currentContent, parentId, gifUrl)}
                      className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-pink-500 transition-all"
                    >
                      <img src={gifUrl} alt="GIF" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowGifs(!showGifs)}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-pink-600 transition-colors"
                >
                  <Gift className="h-4 w-4" />
                  <span>GIF</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <Smile className="h-4 w-4" />
                  <span>Emoji</span>
                </button>
                <button className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-green-600 transition-colors">
                  <AtSign className="h-4 w-4" />
                  <span>Mention</span>
                </button>
              </div>
              
              <div className="flex space-x-2">
                {isReply && (
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => handleSubmitComment(currentContent, parentId)}
                  disabled={!currentContent.trim() || createCommentMutation.isPending}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                >
                  {createCommentMutation.isPending ? 'Posting...' : isReply ? 'Reply' : 'Comment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render single comment
  const renderComment = (comment: Comment, nestingLevel = 0) => {
    const isEditing = editingComment === comment.id;
    
    return (
      <div key={comment.id} className={`${nestingLevel > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
        <div className="flex space-x-3">
          {renderAvatar(comment.user)}
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">{comment.user.name}</span>
                  <span className="text-sm text-gray-500">@{comment.user.username}</span>
                  <span className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                  {comment.isEdited && (
                    <span className="text-xs text-gray-400">(edited)</span>
                  )}
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows={2}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment.id, editContent)}
                      disabled={!editContent.trim() || updateCommentMutation.isPending}
                      className="px-3 py-1 bg-pink-600 text-white rounded text-sm hover:bg-pink-700 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                      className="px-3 py-1 text-gray-600 rounded text-sm hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-800">{comment.content}</p>
                  {comment.gifUrl && (
                    <div className="mt-2">
                      <img src={comment.gifUrl} alt="GIF" className="max-w-xs rounded-lg" />
                    </div>
                  )}
                  {comment.imageUrl && (
                    <div className="mt-2">
                      <img src={comment.imageUrl} alt="Comment image" className="max-w-sm rounded-lg" />
                    </div>
                  )}
                </>
              )}
            </div>
            
            {!isEditing && renderCommentActions(comment, nestingLevel)}
            
            {replyingTo === comment.id && (
              <div className="mt-4">
                {renderCommentForm(comment.id, `Replying to @${comment.user.username}...`)}
              </div>
            )}
          </div>
        </div>
        
        {/* Render replies */}
        {comment.replies && expandedReplies.has(comment.id) && (
          <div className="mt-4 space-y-4">
            {comment.replies.map(reply => renderComment(reply, nestingLevel + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-16 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment form */}
      <div>
        {renderCommentForm()}
      </div>
      
      {/* Comments list */}
      <div className="space-y-6">
        {comments.map(comment => renderComment(comment))}
      </div>
      
      {comments.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
}