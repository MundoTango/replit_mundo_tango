import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Clock, Send, Smile, ThumbsUp, Laugh, Frown, Angry } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';

interface Memory {
  id: string;
  content: string;
  userId: number;
  createdAt: string;
  emotionTags?: string[];
  location?: any;
  userName?: string;
  userUsername?: string;
  userProfileImage?: string;
  reactions?: Record<string, number>;
  userReaction?: string;
  commentCount?: number;
  shareCount?: number;
}

interface EnhancedMemoryCardProps {
  memory: Memory;
}

export default function EnhancedMemoryCard({ memory }: EnhancedMemoryCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareText, setShareText] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  // Facebook-style reactions
  const reactions = [
    { emoji: '👍', name: 'like', color: 'text-blue-600' },
    { emoji: '❤️', name: 'love', color: 'text-red-600' },
    { emoji: '😆', name: 'haha', color: 'text-yellow-600' },
    { emoji: '😮', name: 'wow', color: 'text-orange-600' },
    { emoji: '😢', name: 'sad', color: 'text-blue-500' },
    { emoji: '😠', name: 'angry', color: 'text-red-700' }
  ];

  // Get location display name
  const getLocationName = (location: any) => {
    if (!location) return null;
    if (typeof location === 'string') {
      try {
        const parsed = JSON.parse(location);
        return parsed.name || parsed.formatted_address;
      } catch {
        return location;
      }
    }
    return location.name || location.formatted_address;
  };

  // Get avatar initials
  const getAvatarInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Fetch comments
  const { data: commentsData } = useQuery({
    queryKey: [`/api/memories/${memory.id}/comments`],
    queryFn: async () => {
      const response = await fetch(`/api/memories/${memory.id}/comments`);
      return response.json();
    },
    enabled: showComments
  });

  // Add reaction mutation
  const reactionMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      const response = await apiRequest(`/api/memories/${memory.id}/reactions`, {
        method: 'POST',
        body: { type: reactionType }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      setShowReactionPicker(false);
    }
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/memories/${memory.id}/comments`, {
        method: 'POST',
        body: { content: commentText }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/memories/${memory.id}/comments`] });
      setCommentText('');
      toast({ title: "Comment added!" });
    }
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/memories/${memory.id}/share`, {
        method: 'POST',
        body: { text: shareText }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      setShowShareDialog(false);
      setShareText('');
      toast({ title: "Shared to your timeline!" });
    }
  });

  const handleReaction = (reactionType: string) => {
    reactionMutation.mutate(reactionType);
  };

  const handleComment = () => {
    if (commentText.trim()) {
      commentMutation.mutate();
    }
  };

  const handleShare = () => {
    shareMutation.mutate();
  };

  // Calculate total reactions
  const totalReactions = Object.values(memory.reactions || {}).reduce((sum, count) => sum + count, 0);

  return (
    <>
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              {memory.userProfileImage ? (
                <img 
                  src={memory.userProfileImage} 
                  alt={memory.userName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getAvatarInitials(memory.userName || 'User')
              )}
            </div>
            
            {/* User info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{memory.userName || 'Unknown User'}</h3>
                <span className="text-gray-500">·</span>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(memory.createdAt))} ago
                </span>
              </div>
              {getLocationName(memory.location) && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{getLocationName(memory.location)}</span>
                </div>
              )}
            </div>

            {/* Menu */}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <p className="text-gray-900 whitespace-pre-wrap">{memory.content}</p>
          
          {/* Emotion tags */}
          {memory.emotionTags && memory.emotionTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {memory.emotionTags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Reactions summary */}
        {totalReactions > 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex -space-x-1">
                {Object.entries(memory.reactions || {})
                  .filter(([_, count]) => count > 0)
                  .map(([type, _], idx) => {
                    const reaction = reactions.find(r => r.name === type);
                    return reaction ? (
                      <span key={idx} className="text-base">{reaction.emoji}</span>
                    ) : null;
                  })}
              </div>
              <span>{totalReactions}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-gray-100">
          <div className="flex items-center">
            {/* Reaction button */}
            <div className="relative flex-1">
              <Button
                variant="ghost"
                size="sm"
                onMouseEnter={() => setShowReactionPicker(true)}
                onMouseLeave={() => setShowReactionPicker(false)}
                className="w-full justify-center gap-2 text-gray-600 hover:text-gray-900"
              >
                {memory.userReaction ? (
                  reactions.find(r => r.name === memory.userReaction)?.emoji || <ThumbsUp className="h-4 w-4" />
                ) : (
                  <ThumbsUp className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {memory.userReaction || 'Like'}
                </span>
              </Button>

              {/* Reaction picker */}
              {showReactionPicker && (
                <div 
                  className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-gray-200 flex items-center gap-1 p-2"
                  onMouseEnter={() => setShowReactionPicker(true)}
                  onMouseLeave={() => setShowReactionPicker(false)}
                >
                  {reactions.map((reaction) => (
                    <button
                      key={reaction.name}
                      onClick={() => handleReaction(reaction.name)}
                      className="hover:scale-125 transition-transform p-1"
                      title={reaction.name}
                    >
                      <span className="text-2xl">{reaction.emoji}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Comment button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex-1 justify-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Comment</span>
              {memory.commentCount && memory.commentCount > 0 && (
                <span className="text-sm">({memory.commentCount})</span>
              )}
            </Button>

            {/* Share button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareDialog(true)}
              className="flex-1 justify-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm font-medium">Share</span>
            </Button>
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="border-t border-gray-100 p-4 space-y-4">
            {/* Comment input */}
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-semibold">
                {getAvatarInitials(user?.name || 'U')}
              </div>
              <div className="flex-1 flex gap-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 min-h-[36px] py-2 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleComment();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleComment}
                  disabled={!commentText.trim() || commentMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Comments list */}
            {commentsData?.data && commentsData.data.length > 0 && (
              <div className="space-y-3">
                {commentsData.data.map((comment: any) => (
                  <div key={comment.id} className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-semibold">
                      {getAvatarInitials(comment.userName || 'U')}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-2xl px-3 py-2">
                        <p className="font-semibold text-sm">{comment.userName}</p>
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
                        <button className="hover:underline">Like</button>
                        <button className="hover:underline">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </article>

      {/* Share dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share to your timeline</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              placeholder="Say something about this..."
              className="min-h-[100px]"
            />
            
            {/* Preview of the shared memory */}
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                  {getAvatarInitials(memory.userName || 'U')}
                </div>
                <span className="font-medium">{memory.userName}</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-3">{memory.content}</p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleShare} disabled={shareMutation.isPending}>
                Share
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}